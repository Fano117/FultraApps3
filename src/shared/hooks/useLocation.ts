import {useState, useEffect, useCallback, useRef} from 'react';
import {Platform, PermissionsAndroid, Alert} from 'react-native';
import Geolocation, {GeoPosition} from 'react-native-geolocation-service';
import {Coordinates, defaultCoordinates} from '../models/Location';

interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  watchPosition?: boolean;
  onLocationChange?: (location: Coordinates) => void;
}

interface UseLocationReturn {
  location: Coordinates | null;
  isLoading: boolean;
  error: string | null;
  hasPermission: boolean | null;
  requestPermission: () => Promise<boolean>;
  getCurrentLocation: () => Promise<Coordinates | null>;
  startWatching: () => void;
  stopWatching: () => void;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 10000,
    distanceFilter = 10,
    watchPosition = false,
    onLocationChange,
  } = options;

  const [location, setLocation] = useState<Coordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Request location permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'ios') {
        const status = await Geolocation.requestAuthorization('whenInUse');
        const granted = status === 'granted';
        setHasPermission(granted);
        return granted;
      }

      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Permiso de ubicación',
            message:
              'FultraApp necesita acceso a tu ubicación para mostrar tu posición en el mapa y calcular rutas.',
            buttonNeutral: 'Preguntar después',
            buttonNegative: 'Cancelar',
            buttonPositive: 'Aceptar',
          },
        );

        const isGranted = granted === PermissionsAndroid.RESULTS.GRANTED;
        setHasPermission(isGranted);
        return isGranted;
      }

      return false;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      setError('Error al solicitar permiso de ubicación');
      setHasPermission(false);
      return false;
    }
  }, []);

  // Check initial permission status
  useEffect(() => {
    const checkPermission = async () => {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        );
        setHasPermission(granted);
      } else if (Platform.OS === 'ios') {
        // iOS permission is checked when requesting
        setHasPermission(null);
      }
    };

    checkPermission();
  }, []);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<Coordinates | null> => {
    setIsLoading(true);
    setError(null);

    const permission = hasPermission ?? (await requestPermission());

    if (!permission) {
      setIsLoading(false);
      setError('Permiso de ubicación denegado');
      Alert.alert(
        'Permiso denegado',
        'Por favor, habilita el permiso de ubicación en la configuración de tu dispositivo.',
      );
      return null;
    }

    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        (position: GeoPosition) => {
          const coords: Coordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          setLocation(coords);
          setIsLoading(false);
          setError(null);
          resolve(coords);
        },
        err => {
          console.error('Error getting current location:', err);
          let errorMessage = 'Error al obtener la ubicación';

          switch (err.code) {
            case 1:
              errorMessage = 'Permiso de ubicación denegado';
              break;
            case 2:
              errorMessage = 'Ubicación no disponible';
              break;
            case 3:
              errorMessage = 'Tiempo de espera agotado';
              break;
          }

          setError(errorMessage);
          setIsLoading(false);
          resolve(null);
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        },
      );
    });
  }, [hasPermission, requestPermission, enableHighAccuracy, timeout, maximumAge]);

  // Start watching position
  const startWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      return; // Already watching
    }

    if (hasPermission === false) {
      setError('Permiso de ubicación denegado');
      return;
    }

    watchIdRef.current = Geolocation.watchPosition(
      (position: GeoPosition) => {
        const coords: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setLocation(coords);
        setError(null);

        if (onLocationChange) {
          onLocationChange(coords);
        }
      },
      err => {
        console.error('Error watching position:', err);
        setError('Error al rastrear ubicación');
      },
      {
        enableHighAccuracy,
        distanceFilter,
        interval: 5000,
        fastestInterval: 2000,
      },
    );
  }, [hasPermission, enableHighAccuracy, distanceFilter, onLocationChange]);

  // Stop watching position
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Auto-start watching if option is enabled
  useEffect(() => {
    if (watchPosition && hasPermission) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
  }, [watchPosition, hasPermission, startWatching, stopWatching]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopWatching();
    };
  }, [stopWatching]);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestPermission,
    getCurrentLocation,
    startWatching,
    stopWatching,
  };
};

// Hook for simpler one-time location access
export const useCurrentLocation = () => {
  const {location, isLoading, error, getCurrentLocation} = useLocation();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return {location, isLoading, error, refetch: getCurrentLocation};
};

// Hook for continuous location tracking
export const useLocationTracking = (
  onLocationChange?: (location: Coordinates) => void,
) => {
  return useLocation({
    watchPosition: true,
    onLocationChange,
    enableHighAccuracy: true,
    distanceFilter: 10,
  });
};

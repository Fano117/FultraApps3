import React, {useEffect, useCallback, useState, useRef} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {RouteProp} from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import {RouteMapView, Button, LoadingSpinner} from '../../shared/components';
import {useDeliveryDetails, useLocationTracking} from '../../shared/hooks';
import {useDeliveryStore} from '../../shared/store';
import {getDirections, decodePolyline, formatDistance, formatDuration} from '../../shared/services/mapService';
import {Coordinates} from '../../shared/models/Location';
import {colors} from '../../design-system/theme/colors';
import {typography} from '../../design-system/theme/typography';
import {spacing} from '../../design-system/theme/spacing';
import {shadows} from '../../design-system/theme/spacing';
import {RootStackParamList} from '../../navigation/types';

type DeliveryInProgressScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'DeliveryInProgress'
>;

type DeliveryInProgressScreenRouteProp = RouteProp<
  RootStackParamList,
  'DeliveryInProgress'
>;

interface DeliveryInProgressScreenProps {
  navigation: DeliveryInProgressScreenNavigationProp;
  route: DeliveryInProgressScreenRouteProp;
}

export const DeliveryInProgressScreen: React.FC<DeliveryInProgressScreenProps> = ({
  navigation,
  route,
}) => {
  const {deliveryId} = route.params;
  const {delivery, isLoading} = useDeliveryDetails(deliveryId);
  const {completeDelivery, updateLocation} = useDeliveryStore();

  const [routeCoordinates, setRouteCoordinates] = useState<Coordinates[]>([]);
  const [distance, setDistance] = useState<string>('');
  const [duration, setDuration] = useState<string>('');
  const [elapsedTime, setElapsedTime] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(Date.now());

  // Track location
  const {location} = useLocationTracking((newLocation) => {
    if (delivery) {
      updateLocation(deliveryId, newLocation);
    }
  });

  // Fetch route
  useEffect(() => {
    const fetchRoute = async () => {
      if (!delivery || !location) return;

      try {
        const response = await getDirections({
          origin: location,
          destination: delivery.destination,
          mode: 'driving',
        });

        if (response.status === 'OK' && response.routes.length > 0) {
          const route = response.routes[0];
          const decodedRoute = decodePolyline(route.polyline);
          setRouteCoordinates(decodedRoute);
          setDistance(route.distance.text);
          setDuration(route.duration.text);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [delivery, location]);

  // Elapsed time timer
  useEffect(() => {
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setElapsedTime(elapsed);
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const formatElapsedTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleFinishDelivery = useCallback(() => {
    Alert.alert(
      'Finalizar entrega',
      '¿Estás seguro de que deseas finalizar esta entrega?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Finalizar',
          onPress: async () => {
            const success = await completeDelivery(deliveryId);
            if (success) {
              navigation.replace('DeliveryCompleted', {deliveryId});
            } else {
              Alert.alert('Error', 'No se pudo completar la entrega.');
            }
          },
        },
      ],
    );
  }, [deliveryId, completeDelivery, navigation]);

  const handleEmergency = useCallback(() => {
    Alert.alert(
      'Emergencia',
      '¿Necesitas reportar un problema?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Llamar a soporte',
          onPress: () => {
            // Implement support call
            Alert.alert('Soporte', 'Llamando a soporte...');
          },
        },
        {
          text: 'Reportar problema',
          onPress: () => {
            Alert.alert('Problema reportado', 'Un agente se comunicará contigo pronto.');
          },
        },
      ],
    );
  }, []);

  if (isLoading || !delivery) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Cargando..." fullScreen />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Map */}
      <View style={styles.mapContainer}>
        <RouteMapView
          origin={delivery.origin}
          destination={delivery.destination}
          route={routeCoordinates}
          currentLocation={location || undefined}
        />

        {/* Emergency button */}
        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
          <Icon name="warning-outline" size={24} color={colors.error} />
        </TouchableOpacity>
      </View>

      {/* Bottom panel */}
      <View style={styles.bottomPanel}>
        {/* Progress info */}
        <View style={styles.progressRow}>
          <View style={styles.progressItem}>
            <Icon name="time-outline" size={24} color={colors.primary} />
            <View style={styles.progressText}>
              <Text style={styles.progressValue}>{duration || '--'}</Text>
              <Text style={styles.progressLabel}>Tiempo estimado</Text>
            </View>
          </View>
          <View style={styles.progressDivider} />
          <View style={styles.progressItem}>
            <Icon name="navigate-outline" size={24} color={colors.primary} />
            <View style={styles.progressText}>
              <Text style={styles.progressValue}>{distance || '--'}</Text>
              <Text style={styles.progressLabel}>Distancia</Text>
            </View>
          </View>
        </View>

        {/* Timer */}
        <View style={styles.timerContainer}>
          <Icon name="stopwatch-outline" size={20} color={colors.text.tertiary} />
          <Text style={styles.timerText}>
            Tiempo transcurrido: {formatElapsedTime(elapsedTime)}
          </Text>
        </View>

        {/* Destination info */}
        <View style={styles.destinationCard}>
          <View style={styles.destinationHeader}>
            <Icon name="location" size={20} color={colors.error} />
            <Text style={styles.destinationTitle}>Destino</Text>
          </View>
          <Text style={styles.destinationAddress} numberOfLines={2}>
            {delivery.destination.address}
          </Text>
          <Text style={styles.customerName}>
            {delivery.customer.name} - {delivery.customer.phone}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Alert.alert('Llamando...', delivery.customer.phone)}>
            <Icon name="call" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Button
            title="Finalizar entrega"
            onPress={handleFinishDelivery}
            size="large"
            style={styles.finishButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  mapContainer: {
    flex: 1,
  },
  emergencyButton: {
    position: 'absolute',
    top: spacing.base,
    right: spacing.base,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.md,
  },
  bottomPanel: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.base,
    paddingTop: spacing.xl,
    paddingBottom: spacing['2xl'],
    ...shadows.lg,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    marginBottom: spacing.lg,
  },
  progressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  progressDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border.light,
  },
  progressText: {
    alignItems: 'flex-start',
  },
  progressValue: {
    ...typography.textStyles.h5,
    color: colors.text.primary,
  },
  progressLabel: {
    ...typography.textStyles.caption,
    color: colors.text.tertiary,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    backgroundColor: colors.background.secondary,
    borderRadius: 8,
    marginBottom: spacing.base,
  },
  timerText: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  destinationCard: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.lg,
  },
  destinationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  destinationTitle: {
    ...typography.textStyles.label,
    color: colors.text.primary,
  },
  destinationAddress: {
    ...typography.textStyles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  customerName: {
    ...typography.textStyles.bodySmall,
    color: colors.text.tertiary,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  callButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  finishButton: {
    flex: 1,
  },
});

export default DeliveryInProgressScreen;

import React, {useRef, useCallback, useEffect} from 'react';
import {View, StyleSheet, Platform} from 'react-native';
import RNMapView, {
  Marker,
  Polyline,
  Region,
} from 'react-native-maps';
import {Coordinates, MapRegion, MapMarker, defaultMapRegion} from '../models/Location';
import {colors} from '../../design-system/theme/colors';

/**
 * MapView Components
 *
 * NOTE: These components use react-native-maps for native map rendering.
 * The map service layer (mapService.ts) has been migrated to use HERE Maps APIs
 * for geocoding, routing, and place search functionality.
 *
 * For full HERE Maps integration including map tiles, consider:
 * 1. Using react-native-webview with HERE Maps JavaScript API
 * 2. Integrating HERE Maps SDK directly (requires ejecting from Expo if used)
 *
 * Current implementation uses platform default maps for visual rendering
 * while HERE APIs power the location and routing services.
 */

interface MapViewProps {
  initialRegion?: MapRegion;
  markers?: MapMarker[];
  route?: Coordinates[];
  showUserLocation?: boolean;
  onRegionChange?: (region: MapRegion) => void;
  onMarkerPress?: (markerId: string) => void;
  onMapPress?: (coordinate: Coordinates) => void;
  style?: object;
  children?: React.ReactNode;
}

export const MapView: React.FC<MapViewProps> = ({
  initialRegion = defaultMapRegion,
  markers = [],
  route = [],
  showUserLocation = true,
  onRegionChange,
  onMarkerPress,
  onMapPress,
  style,
  children,
}) => {
  const mapRef = useRef<RNMapView>(null);

  // Fit map to markers - available for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fitToMarkers = useCallback(() => {
    if (markers.length > 0 && mapRef.current) {
      const coordinates = markers.map(m => m.coordinate);
      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  }, [markers]);

  // Fit to route - available for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fitToRoute = useCallback(() => {
    if (route.length > 0 && mapRef.current) {
      mapRef.current.fitToCoordinates(route, {
        edgePadding: {top: 50, right: 50, bottom: 50, left: 50},
        animated: true,
      });
    }
  }, [route]);

  // Animate to coordinate - available for future use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const animateToCoordinate = useCallback((coordinate: Coordinates, zoom?: number) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        ...coordinate,
        latitudeDelta: zoom || 0.01,
        longitudeDelta: zoom || 0.01,
      });
    }
  }, []);

  // Get marker color based on type
  const getMarkerColor = (type: MapMarker['type']): string => {
    switch (type) {
      case 'origin':
        return colors.map.markerOrigin;
      case 'destination':
        return colors.map.markerDestination;
      case 'current':
        return colors.primary;
      case 'delivery':
        return colors.warning;
      case 'waypoint':
        return colors.secondary;
      default:
        return colors.map.marker;
    }
  };

  // Handle region change
  const handleRegionChangeComplete = (region: Region) => {
    if (onRegionChange) {
      onRegionChange({
        latitude: region.latitude,
        longitude: region.longitude,
        latitudeDelta: region.latitudeDelta,
        longitudeDelta: region.longitudeDelta,
      });
    }
  };

  // Handle map press
  const handleMapPress = (event: any) => {
    if (onMapPress) {
      const {latitude, longitude} = event.nativeEvent.coordinate;
      onMapPress({latitude, longitude});
    }
  };

  // Handle marker press
  const handleMarkerPress = (markerId: string) => {
    if (onMarkerPress) {
      onMarkerPress(markerId);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        initialRegion={initialRegion}
        showsUserLocation={showUserLocation}
        showsMyLocationButton={false}
        showsCompass={false}
        showsScale={false}
        loadingEnabled
        loadingIndicatorColor={colors.primary}
        loadingBackgroundColor={colors.background.secondary}
        onRegionChangeComplete={handleRegionChangeComplete}
        onPress={handleMapPress}
        mapPadding={{top: 0, right: 0, bottom: 0, left: 0}}>
        {/* Render markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            identifier={marker.id}
            coordinate={marker.coordinate}
            title={marker.title}
            description={marker.description}
            pinColor={marker.color || getMarkerColor(marker.type)}
            onPress={() => handleMarkerPress(marker.id)}
          />
        ))}

        {/* Render route polyline */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor={colors.map.route}
            lineCap="round"
            lineJoin="round"
          />
        )}

        {/* Custom children (additional markers, overlays, etc.) */}
        {children}
      </RNMapView>
    </View>
  );
};

// Simplified map for displaying a single location
export const SimpleMapView: React.FC<{
  coordinate: Coordinates;
  title?: string;
  style?: object;
}> = ({coordinate, title, style}) => {
  return (
    <View style={[styles.simpleContainer, style]}>
      <RNMapView
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        initialRegion={{
          ...coordinate,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}>
        <Marker coordinate={coordinate} title={title} pinColor={colors.primary} />
      </RNMapView>
    </View>
  );
};

// Route map with origin and destination
export const RouteMapView: React.FC<{
  origin: Coordinates;
  destination: Coordinates;
  route?: Coordinates[];
  currentLocation?: Coordinates;
  style?: object;
}> = ({origin, destination, route = [], currentLocation, style}) => {
  const mapRef = useRef<RNMapView>(null);

  useEffect(() => {
    if (mapRef.current) {
      const coordinates = [origin, destination];
      if (currentLocation) {
        coordinates.push(currentLocation);
      }

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {top: 80, right: 50, bottom: 150, left: 50},
        animated: true,
      });
    }
  }, [origin, destination, currentLocation]);

  return (
    <View style={[styles.container, style]}>
      <RNMapView
        ref={mapRef}
        style={styles.map}
        provider={Platform.OS === 'android' ? 'google' : undefined}
        showsUserLocation={!!currentLocation}
        showsMyLocationButton={false}>
        {/* Origin marker */}
        <Marker
          coordinate={origin}
          title="Origen"
          pinColor={colors.map.markerOrigin}
        />

        {/* Destination marker */}
        <Marker
          coordinate={destination}
          title="Destino"
          pinColor={colors.map.markerDestination}
        />

        {/* Route polyline */}
        {route.length > 0 && (
          <Polyline
            coordinates={route}
            strokeWidth={4}
            strokeColor={colors.map.route}
            lineCap="round"
            lineJoin="round"
          />
        )}
      </RNMapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  simpleContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapView;

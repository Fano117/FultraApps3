import {
  Coordinates,
  Location,
  GeocodingResult,
  PlaceAutocompleteResult,
  DirectionsRequest,
  DirectionsResponse,
  RouteInfo,
  MapRegion,
  defaultMapRegion,
} from '../models/Location';

// Google Maps API Key (replace with your actual key)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY';

// API URLs
const GEOCODING_URL = 'https://maps.googleapis.com/maps/api/geocode/json';
const DIRECTIONS_URL = 'https://maps.googleapis.com/maps/api/directions/json';
const PLACES_AUTOCOMPLETE_URL =
  'https://maps.googleapis.com/maps/api/place/autocomplete/json';
const PLACES_DETAILS_URL = 'https://maps.googleapis.com/maps/api/place/details/json';

// Enable mock mode for development
const USE_MOCK = __DEV__;

/**
 * Geocode an address to coordinates
 */
export const geocodeAddress = async (address: string): Promise<GeocodingResult | null> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    // Return mock result
    return {
      placeId: 'mock-place-id',
      formattedAddress: address,
      coordinates: {
        latitude: 19.4326 + Math.random() * 0.05,
        longitude: -99.1332 + Math.random() * 0.05,
      },
      addressComponents: [
        {longName: address, shortName: address, types: ['street_address']},
      ],
    };
  }

  try {
    const response = await fetch(
      `${GEOCODING_URL}?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        coordinates: {
          latitude: result.geometry.location.lat,
          longitude: result.geometry.location.lng,
        },
        addressComponents: result.address_components.map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address
 */
export const reverseGeocode = async (
  coordinates: Coordinates,
): Promise<GeocodingResult | null> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 500));

    return {
      placeId: 'mock-place-id',
      formattedAddress: `Calle Ejemplo ${Math.floor(Math.random() * 1000)}, Ciudad de México`,
      coordinates,
      addressComponents: [],
    };
  }

  try {
    const response = await fetch(
      `${GEOCODING_URL}?latlng=${coordinates.latitude},${coordinates.longitude}&key=${GOOGLE_MAPS_API_KEY}`,
    );
    const data = await response.json();

    if (data.status === 'OK' && data.results.length > 0) {
      const result = data.results[0];
      return {
        placeId: result.place_id,
        formattedAddress: result.formatted_address,
        coordinates,
        addressComponents: result.address_components.map((component: any) => ({
          longName: component.long_name,
          shortName: component.short_name,
          types: component.types,
        })),
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Get place autocomplete suggestions
 */
export const getPlaceAutocomplete = async (
  input: string,
  sessionToken?: string,
): Promise<PlaceAutocompleteResult[]> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 300));

    // Return mock suggestions
    return [
      {
        placeId: 'mock-1',
        description: `${input}, Ciudad de México, CDMX, México`,
        mainText: input,
        secondaryText: 'Ciudad de México, CDMX, México',
        types: ['street_address'],
      },
      {
        placeId: 'mock-2',
        description: `${input} Norte, Ciudad de México, CDMX, México`,
        mainText: `${input} Norte`,
        secondaryText: 'Ciudad de México, CDMX, México',
        types: ['street_address'],
      },
      {
        placeId: 'mock-3',
        description: `${input} Sur, Ciudad de México, CDMX, México`,
        mainText: `${input} Sur`,
        secondaryText: 'Ciudad de México, CDMX, México',
        types: ['street_address'],
      },
    ];
  }

  try {
    let url = `${PLACES_AUTOCOMPLETE_URL}?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:mx&language=es`;

    if (sessionToken) {
      url += `&sessiontoken=${sessionToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK') {
      return data.predictions.map((prediction: any) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting?.main_text || prediction.description,
        secondaryText: prediction.structured_formatting?.secondary_text || '',
        types: prediction.types || [],
      }));
    }

    return [];
  } catch (error) {
    console.error('Place autocomplete error:', error);
    return [];
  }
};

/**
 * Get place details by place ID
 */
export const getPlaceDetails = async (
  placeId: string,
  sessionToken?: string,
): Promise<Location | null> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 400));

    return {
      latitude: 19.4326 + Math.random() * 0.05,
      longitude: -99.1332 + Math.random() * 0.05,
      address: 'Calle de Ejemplo 123',
      city: 'Ciudad de México',
      state: 'CDMX',
      postalCode: '06600',
      country: 'México',
      placeId,
      formattedAddress: 'Calle de Ejemplo 123, Col. Centro, Ciudad de México, CDMX 06600',
    };
  }

  try {
    let url = `${PLACES_DETAILS_URL}?place_id=${placeId}&fields=geometry,formatted_address,address_components&key=${GOOGLE_MAPS_API_KEY}`;

    if (sessionToken) {
      url += `&sessiontoken=${sessionToken}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      const result = data.result;
      const addressComponents = result.address_components || [];

      const getComponent = (type: string) =>
        addressComponents.find((c: any) => c.types.includes(type))?.long_name || '';

      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        address: result.formatted_address,
        city: getComponent('locality') || getComponent('administrative_area_level_2'),
        state: getComponent('administrative_area_level_1'),
        postalCode: getComponent('postal_code'),
        country: getComponent('country'),
        placeId,
        formattedAddress: result.formatted_address,
      };
    }

    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

/**
 * Get directions between two points
 */
export const getDirections = async (
  request: DirectionsRequest,
): Promise<DirectionsResponse> => {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 800));

    const origin =
      typeof request.origin === 'string'
        ? {latitude: 19.4326, longitude: -99.1332}
        : request.origin;
    const destination =
      typeof request.destination === 'string'
        ? {latitude: 19.4234, longitude: -99.1685}
        : request.destination;

    // Calculate mock distance and duration
    const distance = calculateDistance(origin, destination);
    const duration = Math.round(distance / 500); // Assume 500m/min average speed

    const mockRoute: RouteInfo = {
      origin,
      destination,
      distance: {
        value: Math.round(distance),
        text: formatDistance(distance),
      },
      duration: {
        value: duration * 60,
        text: formatDuration(duration * 60),
      },
      polyline: generateMockPolyline(origin, destination),
      steps: [],
    };

    return {
      routes: [mockRoute],
      status: 'OK',
    };
  }

  try {
    const originStr =
      typeof request.origin === 'string'
        ? request.origin
        : `${request.origin.latitude},${request.origin.longitude}`;
    const destStr =
      typeof request.destination === 'string'
        ? request.destination
        : `${request.destination.latitude},${request.destination.longitude}`;

    let url = `${DIRECTIONS_URL}?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}&key=${GOOGLE_MAPS_API_KEY}&mode=${request.mode || 'driving'}`;

    if (request.waypoints && request.waypoints.length > 0) {
      const waypointsStr = request.waypoints
        .map(wp => (typeof wp === 'string' ? wp : `${wp.latitude},${wp.longitude}`))
        .join('|');
      url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
    }

    if (request.avoidTolls) {url += '&avoid=tolls';}
    if (request.avoidHighways) {url += '&avoid=highways';}
    if (request.alternatives) {url += '&alternatives=true';}

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.routes.length > 0) {
      const routes: RouteInfo[] = data.routes.map((route: any) => {
        const leg = route.legs[0];
        return {
          origin:
            typeof request.origin === 'string'
              ? {
                  latitude: leg.start_location.lat,
                  longitude: leg.start_location.lng,
                }
              : request.origin,
          destination:
            typeof request.destination === 'string'
              ? {
                  latitude: leg.end_location.lat,
                  longitude: leg.end_location.lng,
                }
              : request.destination,
          distance: {
            value: leg.distance.value,
            text: leg.distance.text,
          },
          duration: {
            value: leg.duration.value,
            text: leg.duration.text,
          },
          polyline: route.overview_polyline.points,
          steps: leg.steps.map((step: any) => ({
            distance: {value: step.distance.value, text: step.distance.text},
            duration: {value: step.duration.value, text: step.duration.text},
            startLocation: {
              latitude: step.start_location.lat,
              longitude: step.start_location.lng,
            },
            endLocation: {
              latitude: step.end_location.lat,
              longitude: step.end_location.lng,
            },
            instruction: step.html_instructions.replace(/<[^>]*>/g, ''),
            maneuver: step.maneuver,
            polyline: step.polyline.points,
          })),
        };
      });

      return {routes, status: 'OK'};
    }

    return {
      routes: [],
      status: data.status,
      errorMessage: data.error_message,
    };
  } catch (error) {
    console.error('Directions error:', error);
    return {
      routes: [],
      status: 'UNKNOWN_ERROR',
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

/**
 * Decode a polyline string to coordinates
 * Uses bitwise operations as required by the polyline algorithm
 */
/* eslint-disable no-bitwise */
export const decodePolyline = (encoded: string): Coordinates[] => {
  const points: Coordinates[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
};
/* eslint-enable no-bitwise */

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (
  point1: Coordinates,
  point2: Coordinates,
): number => {
  const R = 6371e3; // Earth's radius in meters
  const lat1 = (point1.latitude * Math.PI) / 180;
  const lat2 = (point2.latitude * Math.PI) / 180;
  const deltaLat = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const deltaLng = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
};

/**
 * Format distance for display
 */
export const formatDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
};

/**
 * Format duration for display
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)} seg`;
  }
  if (seconds < 3600) {
    return `${Math.round(seconds / 60)} min`;
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.round((seconds % 3600) / 60);
  return `${hours} h ${mins} min`;
};

/**
 * Generate mock polyline for development
 */
const generateMockPolyline = (
  origin: Coordinates,
  destination: Coordinates,
): string => {
  // Simple mock - just connect origin to destination
  // In production, this would be the actual encoded polyline from Google
  const points = [origin, destination];
  return encodeMockPolyline(points);
};

/**
 * Encode coordinates to polyline (for mock data)
 */
const encodeMockPolyline = (coordinates: Coordinates[]): string => {
  let encoded = '';
  let prevLat = 0;
  let prevLng = 0;

  for (const coord of coordinates) {
    const lat = Math.round(coord.latitude * 1e5);
    const lng = Math.round(coord.longitude * 1e5);

    encoded += encodeNumber(lat - prevLat);
    encoded += encodeNumber(lng - prevLng);

    prevLat = lat;
    prevLng = lng;
  }

  return encoded;
};

/* eslint-disable no-bitwise */
const encodeNumber = (num: number): string => {
  let encoded = '';
  let value = num < 0 ? ~(num << 1) : num << 1;

  while (value >= 0x20) {
    encoded += String.fromCharCode((0x20 | (value & 0x1f)) + 63);
    value >>= 5;
  }

  encoded += String.fromCharCode(value + 63);
  return encoded;
};
/* eslint-enable no-bitwise */

/**
 * Get region that fits all coordinates
 */
export const getRegionForCoordinates = (
  coordinates: Coordinates[],
  padding: number = 1.2,
): MapRegion => {
  if (coordinates.length === 0) {
    return defaultMapRegion;
  }

  if (coordinates.length === 1) {
    return {
      ...coordinates[0],
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLng = coordinates[0].longitude;
  let maxLng = coordinates[0].longitude;

  for (const coord of coordinates) {
    minLat = Math.min(minLat, coord.latitude);
    maxLat = Math.max(maxLat, coord.latitude);
    minLng = Math.min(minLng, coord.longitude);
    maxLng = Math.max(maxLng, coord.longitude);
  }

  const latDelta = (maxLat - minLat) * padding;
  const lngDelta = (maxLng - minLng) * padding;

  return {
    latitude: (minLat + maxLat) / 2,
    longitude: (minLng + maxLng) / 2,
    latitudeDelta: Math.max(latDelta, 0.01),
    longitudeDelta: Math.max(lngDelta, 0.01),
  };
};

/**
 * Check if a coordinate is within a region
 */
export const isCoordinateInRegion = (
  coordinate: Coordinates,
  region: MapRegion,
): boolean => {
  const latMin = region.latitude - region.latitudeDelta / 2;
  const latMax = region.latitude + region.latitudeDelta / 2;
  const lngMin = region.longitude - region.longitudeDelta / 2;
  const lngMax = region.longitude + region.longitudeDelta / 2;

  return (
    coordinate.latitude >= latMin &&
    coordinate.latitude <= latMax &&
    coordinate.longitude >= lngMin &&
    coordinate.longitude <= lngMax
  );
};

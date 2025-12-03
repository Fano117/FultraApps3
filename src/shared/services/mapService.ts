import {decode as decodeFlexPolyline, encode as encodeFlexPolyline} from '@here/flexpolyline';
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
import {HERE_CONFIG, buildHereUrl, getTravelMode} from './hereConfig';

// Enable mock mode for development
const USE_MOCK = __DEV__;

/**
 * Geocode an address to coordinates using HERE Geocoding API
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
    const url = buildHereUrl(HERE_CONFIG.endpoints.geocode, {
      q: address,
      lang: HERE_CONFIG.searchConfig.lang,
      in: `countryCode:${HERE_CONFIG.searchConfig.country}`,
    });

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const result = data.items[0];
      const addr = result.address || {};

      return {
        placeId: result.id,
        formattedAddress: addr.label || address,
        coordinates: {
          latitude: result.position.lat,
          longitude: result.position.lng,
        },
        addressComponents: [
          {longName: addr.street || '', shortName: addr.street || '', types: ['route']},
          {longName: addr.city || '', shortName: addr.city || '', types: ['locality']},
          {longName: addr.state || '', shortName: addr.stateCode || '', types: ['administrative_area_level_1']},
          {longName: addr.postalCode || '', shortName: addr.postalCode || '', types: ['postal_code']},
          {longName: addr.countryName || '', shortName: addr.countryCode || '', types: ['country']},
        ].filter(c => c.longName),
      };
    }

    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
};

/**
 * Reverse geocode coordinates to address using HERE Reverse Geocoding API
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
    const url = buildHereUrl(HERE_CONFIG.endpoints.reverseGeocode, {
      at: `${coordinates.latitude},${coordinates.longitude}`,
      lang: HERE_CONFIG.searchConfig.lang,
    });

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      const result = data.items[0];
      const addr = result.address || {};

      return {
        placeId: result.id,
        formattedAddress: addr.label || '',
        coordinates,
        addressComponents: [
          {longName: addr.street || '', shortName: addr.street || '', types: ['route']},
          {longName: addr.city || '', shortName: addr.city || '', types: ['locality']},
          {longName: addr.state || '', shortName: addr.stateCode || '', types: ['administrative_area_level_1']},
          {longName: addr.postalCode || '', shortName: addr.postalCode || '', types: ['postal_code']},
          {longName: addr.countryName || '', shortName: addr.countryCode || '', types: ['country']},
        ].filter(c => c.longName),
      };
    }

    return null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
};

/**
 * Get place autocomplete suggestions using HERE Autosuggest API
 */
export const getPlaceAutocomplete = async (
  input: string,
  _sessionToken?: string,
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
    const url = buildHereUrl(HERE_CONFIG.endpoints.autosuggest, {
      q: input,
      at: `${HERE_CONFIG.defaultLocation.lat},${HERE_CONFIG.defaultLocation.lng}`,
      lang: HERE_CONFIG.searchConfig.lang,
      limit: String(HERE_CONFIG.searchConfig.limit),
      in: `countryCode:${HERE_CONFIG.searchConfig.country}`,
    });

    const response = await fetch(url);
    const data = await response.json();

    if (data.items) {
      return data.items.map((item: any) => {
        const addr = item.address || {};
        return {
          placeId: item.id,
          description: addr.label || item.title,
          mainText: item.title,
          secondaryText: addr.city ? `${addr.city}, ${addr.state || addr.countryName || ''}` : '',
          types: item.resultType ? [item.resultType] : [],
        };
      });
    }

    return [];
  } catch (error) {
    console.error('Place autocomplete error:', error);
    return [];
  }
};

/**
 * Get place details by place ID using HERE Lookup API
 */
export const getPlaceDetails = async (
  placeId: string,
  _sessionToken?: string,
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
    const url = buildHereUrl(HERE_CONFIG.endpoints.lookup, {
      id: placeId,
      lang: HERE_CONFIG.searchConfig.lang,
    });

    const response = await fetch(url);
    const data = await response.json();

    if (data && data.position) {
      const addr = data.address || {};

      return {
        latitude: data.position.lat,
        longitude: data.position.lng,
        address: addr.label || '',
        city: addr.city || '',
        state: addr.state || '',
        postalCode: addr.postalCode || '',
        country: addr.countryName || '',
        placeId: data.id,
        formattedAddress: addr.label || '',
      };
    }

    return null;
  } catch (error) {
    console.error('Place details error:', error);
    return null;
  }
};

/**
 * Get directions between two points using HERE Routing v8 API
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
    // Parse origin and destination
    const originCoords =
      typeof request.origin === 'string'
        ? await geocodeAddress(request.origin)
        : null;
    const destCoords =
      typeof request.destination === 'string'
        ? await geocodeAddress(request.destination)
        : null;

    const originLat =
      typeof request.origin === 'string'
        ? originCoords?.coordinates.latitude
        : request.origin.latitude;
    const originLng =
      typeof request.origin === 'string'
        ? originCoords?.coordinates.longitude
        : request.origin.longitude;
    const destLat =
      typeof request.destination === 'string'
        ? destCoords?.coordinates.latitude
        : request.destination.latitude;
    const destLng =
      typeof request.destination === 'string'
        ? destCoords?.coordinates.longitude
        : request.destination.longitude;

    if (originLat == null || originLng == null || destLat == null || destLng == null) {
      return {
        routes: [],
        status: 'NOT_FOUND',
        errorMessage: 'Could not resolve origin or destination coordinates',
      };
    }

    // Build HERE Routing URL
    const params: Record<string, string> = {
      transportMode: getTravelMode(request.mode),
      origin: `${originLat},${originLng}`,
      destination: `${destLat},${destLng}`,
      return: 'polyline,summary,actions,instructions',
      lang: HERE_CONFIG.searchConfig.lang,
    };

    // Add waypoints if present (HERE uses via parameter)
    if (request.waypoints && request.waypoints.length > 0) {
      const viaPoints = await Promise.all(
        request.waypoints.map(async wp => {
          if (typeof wp === 'string') {
            const result = await geocodeAddress(wp);
            return result
              ? `${result.coordinates.latitude},${result.coordinates.longitude}`
              : null;
          }
          return `${wp.latitude},${wp.longitude}`;
        }),
      );
      const validViaPoints = viaPoints.filter(Boolean) as string[];
      if (validViaPoints.length > 0) {
        validViaPoints.forEach((via, index) => {
          params[`via${index}`] = via;
        });
      }
    }

    // Add avoid options
    const avoidFeatures: string[] = [];
    if (request.avoidTolls) {
      avoidFeatures.push('tollRoad');
    }
    if (request.avoidHighways) {
      avoidFeatures.push('controlledAccessHighway');
    }
    if (avoidFeatures.length > 0) {
      params['avoid[features]'] = avoidFeatures.join(',');
    }

    // Request alternatives if needed
    if (request.alternatives) {
      params.alternatives = '3';
    }

    const url = buildHereUrl(HERE_CONFIG.endpoints.routing, params);
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      const routes: RouteInfo[] = data.routes.map((route: any) => {
        // HERE routes have sections, we combine them
        const sections = route.sections || [];
        const firstSection = sections[0] || {};
        const lastSection = sections[sections.length - 1] || firstSection;

        // Calculate total distance and duration
        const totalDuration = sections.reduce(
          (sum: number, s: any) => sum + (s.summary?.duration || 0),
          0,
        );
        const totalLength = sections.reduce(
          (sum: number, s: any) => sum + (s.summary?.length || 0),
          0,
        );

        // Decode and combine all polyline segments
        // Each section polyline is decoded separately and coordinates are combined
        const combinedCoordinates: Coordinates[] = sections.flatMap(
          (section: any) => {
            if (!section.polyline) {
              return [];
            }
            try {
              const decoded = decodeFlexPolyline(section.polyline);
              return decoded.polyline.map(([lat, lng]) => ({
                latitude: lat,
                longitude: lng,
              }));
            } catch {
              return [];
            }
          },
        );

        // Re-encode the combined coordinates as a single flexible polyline
        const combinedPolyline =
          combinedCoordinates.length > 0
            ? encodeFlexPolyline({
                polyline: combinedCoordinates.map(c => [
                  c.latitude,
                  c.longitude,
                ]),
                precision: 5,
              })
            : '';

        // Combine all steps/actions
        // Note: HERE doesn't provide per-action coordinates in the actions array
        const steps = sections.flatMap((section: any) =>
          (section.actions || []).map((action: any) => ({
            distance: {
              value: action.length || 0,
              text: formatDistance(action.length || 0),
            },
            duration: {
              value: action.duration || 0,
              text: formatDuration(action.duration || 0),
            },
            startLocation: {
              latitude: 0,
              longitude: 0,
            },
            endLocation: {
              latitude: 0,
              longitude: 0,
            },
            instruction: action.instruction || '',
            maneuver: action.action || '',
            polyline: '',
          })),
        );

        const originLocation = firstSection.departure?.place?.location || {};
        const destLocation = lastSection.arrival?.place?.location || {};

        return {
          origin: {
            latitude: originLocation.lat ?? originLat,
            longitude: originLocation.lng ?? originLng,
          },
          destination: {
            latitude: destLocation.lat ?? destLat,
            longitude: destLocation.lng ?? destLng,
          },
          distance: {
            value: totalLength,
            text: formatDistance(totalLength),
          },
          duration: {
            value: totalDuration,
            text: formatDuration(totalDuration),
          },
          polyline: combinedPolyline,
          steps,
        };
      });

      return {routes, status: 'OK'};
    }

    // Handle HERE API errors
    if (data.error) {
      return {
        routes: [],
        status: 'UNKNOWN_ERROR',
        errorMessage: data.error || 'HERE API error',
      };
    }

    return {
      routes: [],
      status: 'ZERO_RESULTS',
      errorMessage: 'No routes found',
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
 * Decode a HERE flexible polyline string to coordinates
 * Uses the @here/flexpolyline library for HERE's Flexible Polyline format
 */
export const decodePolyline = (encoded: string): Coordinates[] => {
  if (!encoded) {
    return [];
  }

  try {
    const decoded = decodeFlexPolyline(encoded);
    return decoded.polyline.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));
  } catch (error) {
    console.error('Error decoding polyline:', error);
    return [];
  }
};

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
 * Generate mock polyline for development using HERE's Flexible Polyline format
 */
const generateMockPolyline = (
  origin: Coordinates,
  destination: Coordinates,
): string => {
  // Simple mock - just connect origin to destination
  // Uses HERE's Flexible Polyline format
  const points = [origin, destination];
  return encodeMockPolyline(points);
};

/**
 * Encode coordinates to HERE Flexible Polyline format (for mock data)
 */
const encodeMockPolyline = (coordinates: Coordinates[]): string => {
  const polyline = coordinates.map(coord => [coord.latitude, coord.longitude]);
  return encodeFlexPolyline({polyline, precision: 5});
};

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

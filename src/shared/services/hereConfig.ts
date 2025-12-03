// HERE API Configuration
export const HERE_CONFIG = {
  apiKey: process.env.HERE_API_KEY || 'YOUR_HERE_API_KEY',

  endpoints: {
    geocode: 'https://geocode.search.hereapi.com/v1/geocode',
    reverseGeocode: 'https://revgeocode.search.hereapi.com/v1/revgeocode',
    autosuggest: 'https://autosuggest.search.hereapi.com/v1/autosuggest',
    lookup: 'https://lookup.search.hereapi.com/v1/lookup',
    routing: 'https://router.hereapi.com/v8/routes',
  },

  // Default location (Mexico City)
  defaultLocation: {
    lat: 19.4326,
    lng: -99.1332,
  },

  // Search configuration
  searchConfig: {
    limit: 10,
    lang: 'es',
    country: 'MEX',
  },
};

// Helper to build HERE API URLs
export const buildHereUrl = (
  endpoint: string,
  params: Record<string, string>,
): string => {
  const url = new URL(endpoint);
  url.searchParams.append('apiKey', HERE_CONFIG.apiKey);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  return url.toString();
};

// HERE travel mode mapping
export const getTravelMode = (
  mode?: 'driving' | 'walking' | 'bicycling' | 'transit',
): string => {
  switch (mode) {
    case 'walking':
      return 'pedestrian';
    case 'bicycling':
      return 'bicycle';
    case 'transit':
      return 'publicTransport';
    case 'driving':
    default:
      return 'car';
  }
};

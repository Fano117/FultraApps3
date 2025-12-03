export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Location extends Coordinates {
  address: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  placeId?: string;
  formattedAddress?: string;
}

export interface LocationWithDetails extends Location {
  name?: string;
  phone?: string;
  notes?: string;
  floor?: string;
  apartment?: string;
  reference?: string;
}

export interface GeocodingResult {
  placeId: string;
  formattedAddress: string;
  coordinates: Coordinates;
  addressComponents: AddressComponent[];
}

export interface AddressComponent {
  longName: string;
  shortName: string;
  types: string[];
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
  types: string[];
}

export interface RouteInfo {
  origin: Coordinates;
  destination: Coordinates;
  waypoints?: Coordinates[];
  distance: Distance;
  duration: Duration;
  polyline: string;
  steps?: RouteStep[];
}

export interface Distance {
  value: number; // in meters
  text: string; // formatted string
}

export interface Duration {
  value: number; // in seconds
  text: string; // formatted string
}

export interface RouteStep {
  distance: Distance;
  duration: Duration;
  startLocation: Coordinates;
  endLocation: Coordinates;
  instruction: string;
  maneuver?: string;
  polyline: string;
}

export interface DirectionsRequest {
  origin: Coordinates | string;
  destination: Coordinates | string;
  waypoints?: (Coordinates | string)[];
  mode?: TravelMode;
  alternatives?: boolean;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  departureTime?: Date;
}

export type TravelMode = 'driving' | 'walking' | 'bicycling' | 'transit';

export interface DirectionsResponse {
  routes: RouteInfo[];
  status: DirectionsStatus;
  errorMessage?: string;
}

export type DirectionsStatus =
  | 'OK'
  | 'NOT_FOUND'
  | 'ZERO_RESULTS'
  | 'MAX_WAYPOINTS_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'OVER_QUERY_LIMIT'
  | 'REQUEST_DENIED'
  | 'UNKNOWN_ERROR';

export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface MapMarker {
  id: string;
  coordinate: Coordinates;
  title?: string;
  description?: string;
  type: MarkerType;
  color?: string;
}

export type MarkerType = 'origin' | 'destination' | 'waypoint' | 'current' | 'delivery' | 'custom';

// Default values
export const defaultMapRegion: MapRegion = {
  latitude: 19.4326, // Mexico City
  longitude: -99.1332,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

export const defaultCoordinates: Coordinates = {
  latitude: 19.4326,
  longitude: -99.1332,
};

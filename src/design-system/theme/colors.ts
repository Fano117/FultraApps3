export const colors = {
  // Primary Colors
  primary: '#007AFF',
  primaryDark: '#0056B3',
  primaryLight: '#4DA3FF',

  // Secondary Colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#8A89E0',

  // Status Colors
  success: '#34C759',
  successDark: '#248A3D',
  successLight: '#A8F0BA',

  warning: '#FF9500',
  warningDark: '#C76F00',
  warningLight: '#FFD699',

  error: '#FF3B30',
  errorDark: '#C62828',
  errorLight: '#FFCDD2',

  info: '#5AC8FA',
  infoDark: '#0A84FF',
  infoLight: '#B3E5FC',

  // Neutral Colors
  black: '#000000',
  white: '#FFFFFF',

  // Gray Scale
  gray: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },

  // iOS System Colors
  systemGray: '#8E8E93',
  systemGray2: '#AEAEB2',
  systemGray3: '#C7C7CC',
  systemGray4: '#D1D1D6',
  systemGray5: '#E5E5EA',
  systemGray6: '#F2F2F7',

  // Background Colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F2F2F7',
    tertiary: '#E5E5EA',
  },

  // Text Colors
  text: {
    primary: '#000000',
    secondary: '#3C3C43',
    tertiary: '#8E8E93',
    quaternary: '#C7C7CC',
    inverse: '#FFFFFF',
  },

  // Border Colors
  border: {
    light: '#E5E5EA',
    medium: '#C7C7CC',
    dark: '#8E8E93',
  },

  // Delivery Status Colors
  delivery: {
    pending: '#FF9500',
    inProgress: '#007AFF',
    completed: '#34C759',
    cancelled: '#FF3B30',
  },

  // Map Colors
  map: {
    route: '#007AFF',
    routeAlternate: '#5856D6',
    marker: '#FF3B30',
    markerOrigin: '#34C759',
    markerDestination: '#FF3B30',
  },

  // Transparent
  transparent: 'transparent',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;

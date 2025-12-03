export const spacing = {
  // Base spacing unit: 4px
  // Using 8pt grid system

  // Spacing Scale
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
  '5xl': 64,
  '6xl': 80,
  '7xl': 96,
  '8xl': 128,

  // Semantic Spacing
  component: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },

  screen: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 24,
    paddingBottom: 32,
  },

  card: {
    padding: 16,
    margin: 8,
    borderRadius: 12,
  },

  input: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },

  button: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
  },

  list: {
    itemPadding: 16,
    itemGap: 8,
    sectionGap: 24,
  },

  modal: {
    padding: 24,
    borderRadius: 16,
  },

  // Layout
  layout: {
    containerPadding: 16,
    sectionGap: 24,
    elementGap: 16,
    inlineGap: 8,
  },
} as const;

export type Spacing = typeof spacing;

// Border Radius
export const borderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  base: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
} as const;

export type BorderRadius = typeof borderRadius;

// Shadows
export const shadows = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 8},
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 12},
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

export type Shadows = typeof shadows;

export {colors} from './colors';
export type {Colors, ColorKey} from './colors';

export {typography} from './typography';
export type {Typography} from './typography';

export {spacing, borderRadius, shadows} from './spacing';
export type {Spacing, BorderRadius, Shadows} from './spacing';

import {colors} from './colors';
import {typography} from './typography';
import {spacing, borderRadius, shadows} from './spacing';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
} as const;

export type Theme = typeof theme;

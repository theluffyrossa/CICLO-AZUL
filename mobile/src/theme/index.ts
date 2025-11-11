import { colors } from './colors';
import { typography } from './typography';
import { spacing, borderRadius, shadows } from './spacing';
import { standardStyles, combineStyles } from './standardStyles';
import { useDynamicStyles, SCALE_LABELS, SCALE_MULTIPLIERS } from './dynamicStyles';

export const theme = {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  standardStyles,
} as const;

export type Theme = typeof theme;

export {
  colors,
  typography,
  spacing,
  borderRadius,
  shadows,
  standardStyles,
  combineStyles,
  useDynamicStyles,
  SCALE_LABELS,
  SCALE_MULTIPLIERS,
};

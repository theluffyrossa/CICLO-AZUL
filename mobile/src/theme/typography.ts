export const typography = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
  },

  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  h1: {
    fontSize: 32,
    fontWeight: '700' as const,
    lineHeight: 1.2,
  },

  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.3,
  },

  h3: {
    fontSize: 24,
    fontWeight: '600' as const,
    lineHeight: 1.3,
  },

  body: {
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },

  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },
} as const;

export type Typography = typeof typography;

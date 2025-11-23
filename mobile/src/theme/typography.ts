export const typography = {
  // Família de fontes - System font para melhor performance e aparência nativa
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Escala de tamanhos moderna e responsiva
  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 17,
    xl: 19,
    '2xl': 22,
    '3xl': 28,
    '4xl': 34,
    '5xl': 42,
  },

  // Pesos de fonte
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },

  // Line heights otimizados para legibilidade
  lineHeight: {
    tight: 1.25,
    snug: 1.375,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2,
  },

  // Estilos de headings com melhor hierarquia visual
  h1: {
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 1.2,
    letterSpacing: -0.5,
  },

  h2: {
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 1.25,
    letterSpacing: -0.3,
  },

  h3: {
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 1.3,
    letterSpacing: -0.2,
  },

  h4: {
    fontSize: 19,
    fontWeight: '600' as const,
    lineHeight: 1.35,
  },

  h5: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 1.4,
  },

  // Estilos de corpo de texto
  body: {
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },

  bodyLarge: {
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 1.5,
  },

  bodySmall: {
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 1.4,
  },

  // Textos auxiliares
  caption: {
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 1.35,
  },

  label: {
    fontSize: 13,
    fontWeight: '500' as const,
    lineHeight: 1.3,
  },

  // Textos de botões
  button: {
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 1.2,
    letterSpacing: 0.3,
  },

  buttonLarge: {
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 1.2,
    letterSpacing: 0.3,
  },

  buttonSmall: {
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 1.2,
    letterSpacing: 0.2,
  },
} as const;

export type Typography = typeof typography;

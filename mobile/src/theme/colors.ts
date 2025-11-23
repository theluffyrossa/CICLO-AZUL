export const colors = {
  // Paleta principal - Tons de azul modernos inspirados no tema "CICLO AZUL"
  primary: {
    50: '#EBF5FF',
    100: '#D6EBFF',
    200: '#ADD6FF',
    300: '#7AB8FF',
    400: '#4A9EFF',
    500: '#2B87F5',
    600: '#1E6FDB',
    700: '#1557B0',
    800: '#0F4485',
    900: '#0A2E5C',
  },

  // Azul secundário - Tons complementares de azul
  secondary: {
    50: '#E0F2FE',
    100: '#BAE6FD',
    200: '#7DD3FC',
    300: '#38BDF8',
    400: '#0EA5E9',
    500: '#0284C7',
    600: '#0369A1',
    700: '#075985',
    800: '#0C4A6E',
    900: '#082F49',
  },

  // Cores de status - Todas em tons de azul
  success: {
    light: '#7DD3FC',
    main: '#0EA5E9',
    dark: '#0369A1',
  },

  error: {
    light: '#FCA5A5',
    main: '#EF4444',
    dark: '#DC2626',
  },

  warning: {
    light: '#FCD34D',
    main: '#F59E0B',
    dark: '#D97706',
  },

  info: {
    light: '#ADD6FF',
    main: '#2B87F5',
    dark: '#1557B0',
  },

  // Tons neutros refinados
  neutral: {
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
  },

  // Backgrounds modernos
  background: {
    default: '#F8FAFC',
    paper: '#FFFFFF',
    secondary: '#F1F5F9',
    dark: '#0F172A',
  },

  // Textos com melhor contraste
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    disabled: '#CBD5E1',
    white: '#FFFFFF',
    inverse: '#F8FAFC',
  },

  // Bordas e divisores sutis
  border: {
    light: '#E2E8F0',
    main: '#CBD5E1',
    dark: '#94A3B8',
  },

  divider: '#E2E8F0',

  // Cores base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

export type Colors = typeof colors;

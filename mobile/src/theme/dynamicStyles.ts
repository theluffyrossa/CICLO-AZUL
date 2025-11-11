import { TextStyle } from 'react-native';
import { colors } from './colors';
import { FontScale, useFontScale } from '@/store/settingsStore';

/**
 * Tamanhos base de fonte (valores atuais do standardStyles)
 */
export const BASE_FONT_SIZES = {
  fieldLabel: 32,
  fieldValue: 24,
  sectionTitle: 32,
  secondaryText: 24,
  highlightText: 24,
  buttonText: 24,
  titleEmoji: 32,
  selectEmoji: 30,
} as const;

/**
 * Multiplicadores para cada escala de fonte
 */
export const SCALE_MULTIPLIERS: Record<FontScale, number> = {
  small: 0.875,    // 87.5% - Para quem prefere fontes menores
  medium: 1.0,     // 100% - Tamanho padrão atual
  large: 1.125,    // 112.5% - Para melhor legibilidade
  xlarge: 1.25,    // 125% - Para necessidades de acessibilidade
} as const;

/**
 * Labels descritivos para cada escala
 */
export const SCALE_LABELS: Record<FontScale, string> = {
  small: 'Pequeno',
  medium: 'Padrão',
  large: 'Grande',
  xlarge: 'Extra Grande',
} as const;

/**
 * Cria os estilos padronizados com base na escala de fonte fornecida
 */
export function createStandardStyles(scale: FontScale = 'medium') {
  const multiplier = SCALE_MULTIPLIERS[scale];

  const fieldLabel: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.fieldLabel * multiplier),
    fontWeight: '700',
    color: colors.black,
    textAlign: 'left',
  };

  const fieldValue: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.fieldValue * multiplier),
    fontWeight: '600',
    color: '#000000',
  };

  const titleEmoji: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.titleEmoji * multiplier),
    textAlign: 'right',
  };

  const selectEmoji: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.selectEmoji * multiplier),
  };

  const sectionTitle: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.sectionTitle * multiplier),
    fontWeight: '700',
    color: colors.black,
  };

  const secondaryText: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.secondaryText * multiplier),
    fontWeight: '500',
    color: colors.neutral[700],
  };

  const highlightText: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.highlightText * multiplier),
    fontWeight: '700',
    color: colors.primary[600],
  };

  const buttonText: TextStyle = {
    fontSize: Math.round(BASE_FONT_SIZES.buttonText * multiplier),
    fontWeight: '600',
    color: colors.primary[600],
  };

  return {
    fieldLabel,
    sectionTitle,
    fieldValue,
    secondaryText,
    highlightText,
    titleEmoji,
    selectEmoji,
    buttonText,
  };
}

/**
 * Hook para obter os estilos padronizados baseados na preferência do usuário
 * Este hook deve ser usado em componentes que precisam reagir a mudanças de escala
 */
export function useDynamicStyles() {
  const fontScale = useFontScale();
  return createStandardStyles(fontScale);
}

/**
 * Helper para combinar estilos padrão com customizações
 */
export const combineStyles = (
  baseStyle: TextStyle,
  customStyle?: TextStyle
): TextStyle => {
  return { ...baseStyle, ...customStyle };
};

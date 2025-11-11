import { TextStyle } from 'react-native';
import { colors } from './colors';
import { createStandardStyles } from './dynamicStyles';

/**
 * Estilos padronizados para tipografia em todo o aplicativo
 *
 * NOTA: Este arquivo agora exporta estilos estáticos com tamanho 'medium' (padrão)
 * Para componentes que precisam reagir a mudanças de escala de fonte,
 * use o hook `useDynamicStyles()` de './dynamicStyles'
 *
 * Baseado nos padrões estabelecidos nas telas de Nova Coleta e Detalhe da Coleta
 */

// Gera os estilos padrões com escala 'medium'
const defaultStyles = createStandardStyles('medium');

/**
 * Estilo para labels/títulos de campos de formulário
 * Uso: Títulos acima de inputs, selects, etc.
 * Exemplo: "Data da Pesagem", "Cliente", "Peso (kg)"
 */
export const fieldLabel: TextStyle = defaultStyles.fieldLabel;

/**
 * Estilo para valores/conteúdo de campos
 * Uso: Texto dentro de inputs, valores exibidos em detalhes
 * Exemplo: Valores digitados pelo usuário, dados exibidos
 */
export const fieldValue: TextStyle = defaultStyles.fieldValue;

/**
 * Estilo para emojis de título (acima dos labels)
 * Uso: Emojis que identificam visualmente o tipo de campo
 * Exemplo: 📅 (data), ⚖️ (peso), 👤 (pessoa)
 */
export const titleEmoji: TextStyle = defaultStyles.titleEmoji;

/**
 * Estilo para emojis dentro de componentes Select
 * Uso: Emojis que aparecem ao lado das opções no select
 * Exemplo: ♻️ (reciclagem), 🏢 (empresa), 📍 (localização)
 */
export const selectEmoji: TextStyle = defaultStyles.selectEmoji;

/**
 * Estilo para títulos de seções
 * Uso: Títulos que dividem diferentes seções da tela
 * Exemplo: "Resumo Geral", "Dados Gravimétricos", "Observações"
 */
export const sectionTitle: TextStyle = defaultStyles.sectionTitle;

/**
 * Estilo para subtítulos ou textos secundários
 * Uso: Informações complementares, descrições
 */
export const secondaryText: TextStyle = defaultStyles.secondaryText;

/**
 * Estilo para textos de destaque (valores importantes)
 * Uso: Números, métricas, valores que precisam chamar atenção
 */
export const highlightText: TextStyle = defaultStyles.highlightText;

/**
 * Estilo para textos de botões
 * Uso: Texto dentro de botões de ação
 */
export const buttonText: TextStyle = defaultStyles.buttonText;

/**
 * Estilos padronizados organizados por categoria
 */
export const standardStyles = {
  // Labels e títulos
  fieldLabel,
  sectionTitle,

  // Valores e conteúdo
  fieldValue,
  secondaryText,
  highlightText,

  // Emojis
  titleEmoji,
  selectEmoji,

  // Botões
  buttonText,
};

/**
 * Helper para combinar estilos padrão com customizações
 * @param baseStyle - Estilo base da biblioteca standardStyles
 * @param customStyle - Estilos adicionais ou sobrescritas
 * @returns Estilo combinado
 *
 * @example
 * const myStyle = combineStyles(standardStyles.fieldLabel, { color: 'red' });
 */
export const combineStyles = (
  baseStyle: TextStyle,
  customStyle?: TextStyle
): TextStyle => {
  return { ...baseStyle, ...customStyle };
};

import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  AccessibilityProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';

interface NumericInputProps extends AccessibilityProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  unit?: string;
  min?: number;
  max?: number;
  decimals?: number;
  autoFocus?: boolean;
  emoji?: string;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  required = false,
  unit,
  min,
  max,
  decimals = 2,
  autoFocus = false,
  emoji,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const handleChangeText = (text: string): void => {
    // Permite string vazia
    if (text === '') {
      onChangeText('');
      return;
    }

    // Remove caracteres não numéricos, exceto vírgula
    let numericText = text.replace(/[^0-9,]/g, '');

    // Garante apenas uma vírgula decimal
    const parts = numericText.split(',');
    if (parts.length > 2) {
      numericText = parts[0] + ',' + parts.slice(1).join('');
    }

    // Remove zeros à esquerda desnecessários
    // Mas mantém "0" se for o único caractere ou "0," no início de decimal
    if (parts[0].length > 1 && parts[0].startsWith('0') && parts[0] !== '0') {
      parts[0] = parts[0].replace(/^0+/, '');
      if (parts[0] === '') {
        parts[0] = '0';
      }
      numericText = parts.join(',');
    }

    // Limita casas decimais
    if (parts.length === 2 && parts[1].length > decimals) {
      numericText = parts[0] + ',' + parts[1].substring(0, decimals);
    }

    // Valida min/max apenas para valores completos (converte vírgula para ponto para parseFloat)
    const numValue = parseFloat(numericText.replace(',', '.'));
    if (!isNaN(numValue) && numericText !== '' && !numericText.endsWith(',')) {
      if (max !== undefined && numValue > max) {
        return;
      }
      // Não valida mínimo durante digitação, apenas na validação final
    }

    onChangeText(numericText);
  };

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={handleChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[500]}
          keyboardType="decimal-pad"
          editable={!disabled}
          autoFocus={autoFocus}
          accessible={true}
          accessibilityLabel={
            accessibilityLabel ||
            `${label}${unit ? ` em ${unit}` : ''} - Campo numérico`
          }
          accessibilityHint={
            accessibilityHint ||
            `Digite um valor numérico${min !== undefined ? ` mínimo ${min}` : ''}${max !== undefined ? ` máximo ${max}` : ''}`
          }
          accessibilityState={{ disabled }}
          {...accessibilityProps}
        />
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>

      {error && (
        <Text
          style={styles.errorText}
          accessible={true}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {!error && (
        <Text style={styles.hint}>
          {min !== undefined || max !== undefined ? (
            min !== undefined && max !== undefined
              ? `Valor entre ${min} e ${max}${unit ? ` ${unit}` : ''}`
              : min !== undefined
              ? `Valor mínimo: ${min}${unit ? ` ${unit}` : ''}`
              : `Valor máximo: ${max}${unit ? ` ${unit}` : ''}`
          ) : (
            decimals === 2 ? 'Use vírgula para decimais. Ex: 3,75' : null
          )}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  emoji: {
    ...standardStyles.titleEmoji,
    marginBottom: spacing.xs,
  },
  label: {
    ...standardStyles.fieldLabel,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error.main,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 1,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    minHeight: 60,
  },
  inputContainerError: {
    borderColor: colors.error.main,
  },
  inputContainerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  input: {
    ...standardStyles.fieldValue,
    flex: 1,
    paddingVertical: spacing.sm + 4,
  },
  unit: {
    ...typography.body,
    color: colors.neutral[600],
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
});

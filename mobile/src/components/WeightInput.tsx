import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, AccessibilityInfo } from 'react-native';

interface WeightInputProps {
  value: string;
  onChangeValue: (value: string) => void;
  error?: string;
  label?: string;
  disabled?: boolean;
}

const COLORS = {
  surface: '#ffffff',
  text: '#333333',
  textSecondary: '#666666',
  border: '#ddd',
  error: '#f44336',
};

const formatWeight = (text: string): string => {
  const numbersOnly = text.replace(/[^\d]/g, '');

  if (numbersOnly.length === 0) {
    return '0,00';
  }

  if (numbersOnly.length === 1) {
    return `0,0${numbersOnly}`;
  }

  if (numbersOnly.length === 2) {
    return `0,${numbersOnly}`;
  }

  let integerPart = numbersOnly.slice(0, -2);
  const decimalPart = numbersOnly.slice(-2);

  integerPart = integerPart.replace(/^0+/, '') || '0';

  return `${integerPart},${decimalPart}`;
};

const parseWeight = (formattedValue: string): number => {
  const numbersOnly = formattedValue.replace(/[^\d]/g, '');

  if (numbersOnly.length === 0) {
    return 0;
  }

  return parseFloat(numbersOnly) / 100;
};

export const WeightInput: React.FC<WeightInputProps> = ({
  value,
  onChangeValue,
  error,
  label = 'Peso (kg)',
  disabled = false,
}) => {
  const [internalDigits, setInternalDigits] = useState('');
  const [displayValue, setDisplayValue] = useState('0,00');

  useEffect(() => {
    if (value && value !== '0,00') {
      setDisplayValue(value);
      const digits = value.replace(/[^\d]/g, '');
      setInternalDigits(digits);
    } else if (!value || value === '0,00') {
      setDisplayValue('0,00');
      setInternalDigits('');
    }
  }, [value]);

  const handleChange = (text: string): void => {
    const currentDigits = text.replace(/[^\d]/g, '');

    let newDigits = internalDigits;

    if (currentDigits.length > internalDigits.length) {
      const newChar = currentDigits.charAt(currentDigits.length - 1);
      newDigits = internalDigits + newChar;
    } else if (currentDigits.length < internalDigits.length) {
      newDigits = internalDigits.slice(0, -1);
    }

    if (newDigits.length > 10) {
      return;
    }

    setInternalDigits(newDigits);
    const formatted = formatWeight(newDigits);
    setDisplayValue(formatted);
    onChangeValue(formatted);

    if (error && formatted) {
      AccessibilityInfo.announceForAccessibility('Peso corrigido');
    }
  };

  const isValidWeight = (text: string): boolean => {
    if (!text) return true;
    const weight = parseWeight(text);
    return weight > 0 && weight <= 999999.99;
  };

  const inputStyles = [
    styles.input,
    {
      backgroundColor: COLORS.surface,
      color: COLORS.text,
      borderColor: error ? COLORS.error : COLORS.border,
    },
    disabled && styles.disabledInput,
  ];

  return (
    <View style={styles.container}>
      {label && (
        <Text
          style={[styles.label, { color: COLORS.text }]}
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyles}
          value={displayValue}
          onChangeText={handleChange}
          keyboardType="numeric"
          editable={!disabled}
          maxLength={12}
          accessibilityLabel={label}
          accessibilityHint="Digite o peso em quilogramas. Os números serão formatados automaticamente no padrão 0,00"
          accessibilityValue={{
            text: displayValue ? `${displayValue} quilogramas` : 'Não informado',
          }}
          accessibilityState={{
            disabled,
          }}
        />

        {displayValue && isValidWeight(displayValue) && parseWeight(displayValue) > 0 && (
          <Text
            style={[styles.helperText, { color: COLORS.textSecondary }]}
            accessibilityRole="text"
          >
            Peso: {parseWeight(displayValue).toFixed(2).replace('.', ',')} kg
          </Text>
        )}
      </View>

      {error && (
        <Text
          style={[styles.errorText, { color: COLORS.error }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}

      {!error && displayValue && !isValidWeight(displayValue) && (
        <Text
          style={[styles.errorText, { color: COLORS.error }]}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          Peso inválido. Digite um valor entre 0,01 e 999.999,99 kg
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  disabledInput: {
    opacity: 0.6,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
});

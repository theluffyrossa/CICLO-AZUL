import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  TouchableOpacity,
  AccessibilityInfo,
} from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

interface PinInputProps {
  length?: number;
  value: string;
  onChangeText: (text: string) => void;
  onComplete?: (pin: string) => void;
  error?: string;
  label?: string;
  autoFocus?: boolean;
}

export const PinInput: React.FC<PinInputProps> = ({
  length = 4,
  value,
  onChangeText,
  onComplete,
  error,
  label,
  autoFocus = false,
}) => {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const digits = value.split('');

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [autoFocus]);

  const handlePress = (): void => {
    inputRef.current?.focus();
  };

  const handleChangeText = (text: string): void => {
    const numericText = text.replace(/[^0-9]/g, '');
    if (numericText.length <= length) {
      onChangeText(numericText);

      if (numericText.length === length) {
        AccessibilityInfo.announceForAccessibility('PIN completo inserido');
        onComplete?.(numericText);
      }
    }
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label} accessibilityRole="header">
          {label}
        </Text>
      )}

      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={1}
        accessible={false}
      >
        <View style={styles.pinContainer}>
          {[...Array(length)].map((_, index) => {
            const digit = digits[index];
            const isFilled = digit !== undefined;
            const isActive = focused && index === digits.length;

            return (
              <View
                key={index}
                style={[
                  styles.pinBox,
                  isFilled && styles.pinBoxFilled,
                  isActive && styles.pinBoxActive,
                  error && styles.pinBoxError,
                ]}
              >
                {isFilled && <View style={styles.pinDot} />}
              </View>
            );
          })}
        </View>
      </TouchableOpacity>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="number-pad"
        maxLength={length}
        secureTextEntry={false}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label || 'Digite o PIN de 4 dígitos'}
        accessibilityHint="Use o teclado numérico para inserir seu PIN"
        accessibilityValue={{ text: `${value.length} de ${length} dígitos inseridos` }}
      />

      {error && (
        <Text
          style={styles.errorText}
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
    </View>
  );
};

const PIN_BOX_SIZE = 56;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
  },
  pinBox: {
    width: PIN_BOX_SIZE,
    height: PIN_BOX_SIZE,
    borderWidth: 2,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  pinBoxFilled: {
    borderColor: colors.primary[600],
    backgroundColor: colors.primary[50],
  },
  pinBoxActive: {
    borderColor: colors.primary[600],
    borderWidth: 3,
  },
  pinBoxError: {
    borderColor: colors.error.main,
    backgroundColor: colors.error.light + '20',
  },
  pinDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary[600],
  },
  hiddenInput: {
    position: 'absolute',
    width: 1,
    height: 1,
    opacity: 0,
  },
  errorText: {
    fontSize: 14,
    color: colors.error.main,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});

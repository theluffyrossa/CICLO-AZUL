import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  AccessibilityProps,
  TextInputProps,
} from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/theme';

interface TextAreaProps extends AccessibilityProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  numberOfLines?: number;
  autoFocus?: boolean;
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  required = false,
  maxLength,
  numberOfLines = 4,
  autoFocus = false,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const characterCount = value.length;
  const showCounter = maxLength !== undefined;

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={styles.label}>
          {label}
          {required && <Text style={styles.required}> *</Text>}
        </Text>
        {showCounter && (
          <Text style={styles.counter}>
            {characterCount}/{maxLength}
          </Text>
        )}
      </View>

      <TextInput
        style={[
          styles.textArea,
          error && styles.textAreaError,
          disabled && styles.textAreaDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral[500]}
        multiline={true}
        numberOfLines={numberOfLines}
        maxLength={maxLength}
        editable={!disabled}
        autoFocus={autoFocus}
        textAlignVertical="top"
        accessible={true}
        accessibilityLabel={accessibilityLabel || `${label} - Campo de texto`}
        accessibilityHint={
          accessibilityHint ||
          `Digite ${label.toLowerCase()}${maxLength ? `. Máximo ${maxLength} caracteres` : ''}`
        }
        accessibilityState={{ disabled }}
        {...accessibilityProps}
      />

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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.black,
  },
  required: {
    color: colors.error.main,
  },
  counter: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  textArea: {
    ...typography.body,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    minHeight: 100,
    color: colors.neutral[900],
  },
  textAreaError: {
    borderColor: colors.error.main,
  },
  textAreaDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});

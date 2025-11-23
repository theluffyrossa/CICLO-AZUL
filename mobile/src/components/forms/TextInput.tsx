import React from 'react';
import {
  View,
  Text,
  TextInput as RNTextInput,
  StyleSheet,
  AccessibilityProps,
  TextInputProps as RNTextInputProps,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';

interface TextInputProps extends AccessibilityProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  keyboardType?: RNTextInputProps['keyboardType'];
  autoCapitalize?: RNTextInputProps['autoCapitalize'];
  secureTextEntry?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  emoji?: string;
}

export const TextInput: React.FC<TextInputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  disabled = false,
  required = false,
  maxLength,
  autoFocus = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  secureTextEntry = false,
  icon,
  emoji,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const characterCount = value.length;
  const showCounter = maxLength !== undefined;

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
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

      <View
        style={[
          styles.inputContainer,
          error && styles.inputContainerError,
          disabled && styles.inputContainerDisabled,
        ]}
      >
        {icon && (
          <Ionicons
            name={icon}
            size={20}
            color={disabled ? colors.neutral[400] : colors.neutral[600]}
            style={styles.icon}
          />
        )}
        <RNTextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.neutral[500]}
          editable={!disabled}
          maxLength={maxLength}
          autoFocus={autoFocus}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          accessible={true}
          accessibilityLabel={accessibilityLabel || `${label} - Campo de texto`}
          accessibilityHint={
            accessibilityHint ||
            `Digite ${label.toLowerCase()}${maxLength ? `. Máximo ${maxLength} caracteres` : ''}`
          }
          accessibilityState={{ disabled }}
          {...accessibilityProps}
        />
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
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    ...standardStyles.fieldLabel,
  },
  required: {
    color: colors.error.main,
  },
  counter: {
    ...typography.caption,
    color: colors.neutral[500],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border.main,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing['4'],
    minHeight: 56,
  },
  inputContainerError: {
    borderColor: colors.error.main,
    backgroundColor: colors.error.light + '10',
  },
  inputContainerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    ...standardStyles.fieldValue,
    flex: 1,
    paddingVertical: spacing.sm + 4,
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});

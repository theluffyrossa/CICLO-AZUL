import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  AccessibilityProps,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';

export interface SelectOption {
  label: string;
  value: string | number;
  emoji?: string;
  description?: string;
}

interface SelectProps extends AccessibilityProps {
  label: string;
  placeholder?: string;
  value: string | number | null;
  options: SelectOption[];
  onValueChange: (value: string | number) => void;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  emoji?: string;
  centerLabel?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  placeholder = 'Selecione...',
  value,
  options,
  onValueChange,
  error,
  disabled = false,
  required = false,
  emoji,
  centerLabel = false,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const handleValueChange = (itemValue: string | number): void => {
    onValueChange(itemValue);
  };

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, centerLabel && styles.labelCentered]}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      <View
        style={[
          styles.pickerContainer,
          error && styles.pickerContainerError,
          disabled && styles.pickerContainerDisabled,
        ]}
      >
        <Picker
          selectedValue={value || ''}
          onValueChange={handleValueChange}
          enabled={!disabled}
          style={styles.picker}
          itemStyle={styles.pickerItem}
          accessible={true}
          accessibilityLabel={accessibilityLabel || label}
          accessibilityHint={accessibilityHint}
          {...accessibilityProps}
        >
          <Picker.Item
            label={placeholder}
            value=""
            color={colors.neutral[400]}
            style={styles.placeholderItem}
          />
          {options.map((option) => (
            <Picker.Item
              key={String(option.value)}
              label={option.emoji ? `${option.emoji} ${option.label}` : option.label}
              value={option.value}
              color={colors.text.primary}
            />
          ))}
        </Picker>
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
  label: {
    ...standardStyles.fieldLabel,
    marginBottom: spacing.sm,
  },
  labelCentered: {
    textAlign: 'center',
  },
  required: {
    color: colors.error.main,
  },
  pickerContainer: {
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.primary[300],
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    minHeight: 56,
    justifyContent: 'center',
  },
  pickerContainerError: {
    borderColor: colors.error.main,
    borderWidth: 2,
  },
  pickerContainerDisabled: {
    backgroundColor: colors.neutral[100],
    opacity: 0.6,
  },
  picker: {
    ...Platform.select({
      ios: {
        height: 180,
        marginVertical: -40,
      },
      android: {
        height: 56,
        color: colors.text.primary,
      },
    }),
  },
  pickerItem: {
    fontSize: 18,
    fontWeight: '500',
    color: colors.text.primary,
  },
  placeholderItem: {
    color: colors.neutral[400],
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
    fontSize: 14,
    fontWeight: '500',
  },
});

import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  AccessibilityProps,
} from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/theme';

interface ButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[`${variant}Button`],
        styles[`${size}Button`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabledButton,
        !isDisabled && shadows.sm,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint || `Toca para ${title.toLowerCase()}`}
      {...accessibilityProps}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? colors.primary[600] : colors.white}
          size={size === 'sm' ? 'small' : 'large'}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`${variant}Text`],
            styles[`${size}Text`],
          ]}
          accessibilityLabel={title}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  secondaryButton: {
    backgroundColor: colors.secondary[600], // Azul claro
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  dangerButton: {
    backgroundColor: colors.error.main,
  },
  disabledButton: {
    opacity: 0.5,
  },
  smButton: {
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    minHeight: 38,
  },
  mdButton: {
    paddingVertical: spacing['3'],
    paddingHorizontal: spacing['6'],
    minHeight: 48,
  },
  lgButton: {
    paddingVertical: spacing['4'],
    paddingHorizontal: spacing['8'],
    minHeight: 56,
  },
  text: {
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  primaryText: {
    color: colors.white,
  },
  secondaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.primary[600],
  },
  dangerText: {
    color: colors.white,
  },
  smText: {
    fontSize: 13,
  },
  mdText: {
    fontSize: 15,
  },
  lgText: {
    fontSize: 17,
  },
});

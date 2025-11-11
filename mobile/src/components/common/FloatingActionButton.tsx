import React from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  AccessibilityProps,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, shadows } from '@/theme';

interface FloatingActionButtonProps extends AccessibilityProps {
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  disabled?: boolean;
}

export const FloatingActionButton: React.FC<FloatingActionButtonProps> = ({
  onPress,
  icon = 'add',
  disabled = false,
  accessibilityLabel = 'Adicionar novo item',
  accessibilityHint = 'Toque duas vezes para adicionar',
  ...accessibilityProps
}) => {
  return (
    <TouchableOpacity
      style={[styles.fab, disabled && styles.fabDisabled]}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      {...accessibilityProps}
    >
      <Ionicons
        name={icon}
        size={28}
        color={colors.neutral[50]}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md + (Platform.OS === 'ios' ? 20 : 0),
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.lg,
    elevation: 8,
  },
  fabDisabled: {
    backgroundColor: colors.neutral[400],
    opacity: 0.6,
  },
});

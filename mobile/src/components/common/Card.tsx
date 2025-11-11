import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/theme';

interface CardProps extends ViewProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  elevated?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  elevated = true,
  style,
  ...props
}) => {
  return (
    <View
      style={[
        styles.card,
        { padding: spacing[padding] },
        elevated && shadows.base,
        style,
      ]}
      accessibilityRole="none"
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
});

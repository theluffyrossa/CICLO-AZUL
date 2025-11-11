import React from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  AccessibilityProps,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, borderRadius, shadows } from '@/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_SIZE = (SCREEN_WIDTH - spacing.md * 3) / 2;

interface ImagePreviewProps extends AccessibilityProps {
  uri: string;
  onPress?: () => void;
  onRemove?: () => void;
  size?: number;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  uri,
  onPress,
  onRemove,
  size = IMAGE_SIZE,
  accessibilityLabel = 'Imagem',
  accessibilityHint,
  ...accessibilityProps
}) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint || (onPress ? 'Toque duas vezes para visualizar' : undefined)}
        {...accessibilityProps}
      >
        <Image
          source={{ uri }}
          style={[styles.image, { width: size, height: size }]}
          resizeMode="cover"
        />
      </TouchableOpacity>

      {onRemove && (
        <TouchableOpacity
          style={styles.removeButton}
          onPress={onRemove}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Remover imagem"
          accessibilityHint="Toque duas vezes para remover"
        >
          <Ionicons
            name="close-circle"
            size={24}
            color={colors.error.main}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  image: {
    borderRadius: borderRadius.base,
    backgroundColor: colors.neutral[100],
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    ...shadows.sm,
    elevation: 2,
  },
});

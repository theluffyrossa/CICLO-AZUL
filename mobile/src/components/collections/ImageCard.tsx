import React from 'react';
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  AccessibilityInfo,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useImageDownload } from '@/hooks/useImageDownload';

interface ImageCardProps {
  imageUrl: string;
  consentGiven?: boolean;
  accessibilityLabel?: string;
}

export const ImageCard: React.FC<ImageCardProps> = ({
  imageUrl,
  consentGiven = true,
  accessibilityLabel,
}) => {
  const { downloadState, downloadImage } = useImageDownload();

  const handleDownload = async (): Promise<void> => {
    AccessibilityInfo.announceForAccessibility('Iniciando download da imagem');
    await downloadImage(imageUrl);
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        accessible={true}
        accessibilityLabel={accessibilityLabel || 'Foto da coleta'}
        accessibilityRole="image"
      />

      {downloadState.isDownloading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.neutral[50]} />
        </View>
      )}

      <TouchableOpacity
        style={styles.downloadButton}
        onPress={handleDownload}
        disabled={downloadState.isDownloading}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel="Baixar imagem"
        accessibilityHint="Toque duas vezes para baixar e salvar a imagem na galeria"
      >
        {downloadState.isDownloading ? (
          <ActivityIndicator size="small" color={colors.neutral[50]} />
        ) : (
          <Ionicons name="cloud-download-outline" size={24} color={colors.neutral[50]} />
        )}
      </TouchableOpacity>

      {consentGiven && (
        <View style={styles.consentBadge}>
          <Ionicons name="checkmark-circle" size={16} color={colors.secondary[600]} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: colors.neutral[200],
    position: 'relative',
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  consentBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary[50],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
});

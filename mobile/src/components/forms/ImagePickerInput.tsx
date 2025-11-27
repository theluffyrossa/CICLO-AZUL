import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  AccessibilityProps,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, borderRadius, typography, standardStyles } from '@/theme';

export interface SelectedImage {
  uri: string;
  width: number;
  height: number;
  type?: string;
}

interface ImagePickerInputProps extends AccessibilityProps {
  label: string;
  value: SelectedImage[];
  onChange: (images: SelectedImage[]) => void;
  maxImages?: number;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  emoji?: string;
}

export const ImagePickerInput: React.FC<ImagePickerInputProps> = ({
  label,
  value,
  onChange,
  maxImages = 5,
  error,
  required = false,
  disabled = false,
  emoji,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const requestPermissions = async (
    type: 'camera' | 'library'
  ): Promise<boolean> => {
    try {
      const permissionMethod =
        type === 'camera'
          ? ImagePicker.requestCameraPermissionsAsync
          : ImagePicker.requestMediaLibraryPermissionsAsync;

      const { status } = await permissionMethod();

      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          `É necessário permitir acesso ${type === 'camera' ? 'à câmera' : 'à galeria'} para adicionar imagens.`,
          [{ text: 'OK' }]
        );
        return false;
      }

      return true;
    } catch (err) {
      console.error('Erro ao solicitar permissões:', err);
      return false;
    }
  };

  const pickImageFromLibrary = async (): Promise<void> => {
    if (disabled || isProcessing) return;

    const hasPermission = await requestPermissions('library');
    if (!hasPermission) return;

    if (value.length >= maxImages) {
      Alert.alert(
        'Limite atingido',
        `Você pode adicionar no máximo ${maxImages} imagens.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: false,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newImages = result.assets.map(asset => ({
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type || 'image',
        }));

        const remainingSlots = maxImages - value.length;
        const imagesToAdd = newImages.slice(0, remainingSlots);

        onChange([...value, ...imagesToAdd]);
      }
    } catch (err) {
      console.error('Erro ao selecionar imagem:', err);
      Alert.alert('Erro', 'Não foi possível selecionar a imagem.', [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const takePhoto = async (): Promise<void> => {
    if (disabled || isProcessing) return;

    const hasPermission = await requestPermissions('camera');
    if (!hasPermission) return;

    if (value.length >= maxImages) {
      Alert.alert(
        'Limite atingido',
        `Você pode adicionar no máximo ${maxImages} imagens.`,
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setIsProcessing(true);

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const newImage: SelectedImage = {
          uri: asset.uri,
          width: asset.width,
          height: asset.height,
          type: asset.type || 'image',
        };

        onChange([...value, newImage]);
      }
    } catch (err) {
      console.error('Erro ao tirar foto:', err);
      Alert.alert('Erro', 'Não foi possível tirar a foto.', [{ text: 'OK' }]);
    } finally {
      setIsProcessing(false);
    }
  };

  const removeImage = (index: number): void => {
    const newImages = value.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const showOptions = (): void => {
    Alert.alert(
      'Adicionar Imagem',
      'Escolha uma opção',
      [
        { text: 'Câmera', onPress: takePhoto },
        { text: 'Galeria', onPress: pickImageFromLibrary },
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {value.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imagesContainer}
          accessible={true}
          accessibilityLabel={`${value.length} ${value.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}`}
        >
          {value.map((image, index) => (
            <View key={`${image.uri}-${index}`} style={styles.imageWrapper}>
              <Image source={{ uri: image.uri }} style={styles.image} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => removeImage(index)}
                accessible={true}
                accessibilityLabel={`Remover imagem ${index + 1}`}
                accessibilityRole="button"
                accessibilityHint="Toque duas vezes para remover esta imagem"
              >
                <Text style={styles.removeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          error && styles.addButtonError,
          disabled && styles.addButtonDisabled,
        ]}
        onPress={showOptions}
        disabled={disabled || isProcessing || value.length >= maxImages}
        accessible={true}
        accessibilityLabel={
          accessibilityLabel ||
          `${label} - ${value.length} de ${maxImages} imagens adicionadas`
        }
        accessibilityHint={
          accessibilityHint || 'Toque duas vezes para adicionar uma imagem'
        }
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || value.length >= maxImages }}
        {...accessibilityProps}
      >
        <Text style={styles.addButtonIcon}>📷</Text>
      </TouchableOpacity>

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

      {!error && (
        <Text style={styles.hint}>
          {`Você pode adicionar até ${maxImages} imagens. Toque para escolher entre câmera ou galeria.`}
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
  required: {
    color: colors.error.main,
  },
  imagesContainer: {
    marginBottom: spacing.sm,
  },
  imageWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: borderRadius.base,
    backgroundColor: colors.neutral[200],
  },
  removeButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: colors.error.main,
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  removeButtonText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: 'bold',
    lineHeight: 14,
  },
  addButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.primary[600],
    borderStyle: 'dashed',
    borderRadius: borderRadius.base,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    minHeight: 80,
  },
  addButtonError: {
    borderColor: colors.error.main,
  },
  addButtonDisabled: {
    borderColor: colors.neutral[300],
    opacity: 0.6,
  },
  addButtonIcon: {
    fontSize: 48,
  },
  addButtonText: {
    ...typography.body,
    color: colors.primary[600],
    fontWeight: '600',
  },
  errorText: {
    ...typography.caption,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
  hint: {
    ...typography.caption,
    color: colors.neutral[500],
    marginTop: spacing.xs,
  },
});

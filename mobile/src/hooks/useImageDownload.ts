import { useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import * as MediaLibrary from 'expo-media-library';
import { Alert, Platform, Linking } from 'react-native';

interface DownloadState {
  isDownloading: boolean;
  progress: number;
  error: string | null;
}

interface UseImageDownloadReturn {
  downloadState: DownloadState;
  downloadImage: (imageUrl: string, filename?: string) => Promise<void>;
}

export const useImageDownload = (): UseImageDownloadReturn => {
  const [downloadState, setDownloadState] = useState<DownloadState>({
    isDownloading: false,
    progress: 0,
    error: null,
  });

  const requestPermissions = async (): Promise<boolean> => {
    const { status: existingStatus, canAskAgain } = await MediaLibrary.getPermissionsAsync();

    let finalStatus = existingStatus;
    let canAskAgainFinal = canAskAgain;

    if (existingStatus !== 'granted') {
      const { status, canAskAgain: newCanAskAgain } = await MediaLibrary.requestPermissionsAsync();
      finalStatus = status;
      canAskAgainFinal = newCanAskAgain;
    }

    if (finalStatus !== 'granted') {
      if (canAskAgainFinal === false) {
        Alert.alert(
          'Permissão Negada',
          'Você negou o acesso à galeria anteriormente. Para salvar imagens, é necessário habilitar a permissão nas configurações do aplicativo.',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Abrir Configurações',
              onPress: () => {
                if (Platform.OS === 'ios') {
                  Linking.openURL('app-settings:');
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      } else {
        Alert.alert(
          'Permissão Necessária',
          'É necessário permitir acesso à galeria para salvar imagens.',
          [{ text: 'OK' }]
        );
      }
      return false;
    }

    return true;
  };

  const downloadImage = async (imageUrl: string, filename?: string): Promise<void> => {
    try {
      setDownloadState({ isDownloading: true, progress: 0, error: null });

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        setDownloadState({ isDownloading: false, progress: 0, error: 'Permissão negada' });
        return;
      }

      const finalFilename = filename || `ciclo-azul-${Date.now()}.jpg`;
      const fileUri = `${FileSystem.documentDirectory}${finalFilename}`;

      await FileSystem.downloadAsync(imageUrl, fileUri);

      const asset = await MediaLibrary.createAssetAsync(fileUri);

      if (Platform.OS === 'android') {
        await MediaLibrary.createAlbumAsync('Ciclo Azul', asset, false);
      } else {
        const album = await MediaLibrary.getAlbumAsync('Ciclo Azul');
        if (album) {
          await MediaLibrary.addAssetsToAlbumAsync([asset], album, false);
        } else {
          await MediaLibrary.createAlbumAsync('Ciclo Azul', asset, false);
        }
      }

      setDownloadState({ isDownloading: false, progress: 100, error: null });

      Alert.alert(
        'Sucesso',
        'Imagem salva na galeria com sucesso!',
        [{ text: 'OK' }]
      );

      await FileSystem.deleteAsync(fileUri, { idempotent: true });

    } catch (error) {
      console.error('Erro ao fazer download da imagem:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      setDownloadState({
        isDownloading: false,
        progress: 0,
        error: errorMessage
      });

      Alert.alert(
        'Erro',
        'Não foi possível salvar a imagem. Tente novamente.',
        [{ text: 'OK' }]
      );
    }
  };

  return {
    downloadState,
    downloadImage,
  };
};

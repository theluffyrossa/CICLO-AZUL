import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  AccessibilityInfo,
  Alert,
  ScrollView,
} from 'react-native';
import { Camera, CameraType, FlashMode } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Device from 'expo-device';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { Button, Loading, Toast } from '@/components/common';
import { StageSelector } from '@/components/collections/StageSelector';
import { imagesService } from '@/services/images.service';
import { useOfflineStore } from '@/store/offlineStore';
import { offlineService } from '@/services/offline.service';
import { ImageStage } from '@/types';
import { colors, spacing, typography } from '@/theme';

type RouteParams = {
  Camera: {
    collectionId: number;
  };
};

export const CameraScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'Camera'>>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { isOnline } = useOfflineStore();

  const { collectionId } = route.params;
  const cameraRef = useRef<Camera>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [cameraType, setCameraType] = useState(CameraType.back);
  const [flashMode, setFlashMode] = useState(FlashMode.off);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);
  const [imageStage, setImageStage] = useState<ImageStage>(ImageStage.COLLECTION);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async (): Promise<void> => {
    const { status: cameraStatus } = await Camera.requestCameraPermissionsAsync();
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();

    setHasPermission(cameraStatus === 'granted');

    if (cameraStatus !== 'granted') {
      Alert.alert(
        'Permissão Necessária',
        'É necessário permitir acesso à câmera para tirar fotos.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePicture = async (): Promise<void> => {
    if (!cameraRef.current) return;

    try {
      AccessibilityInfo.announceForAccessibility('Capturando foto');

      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      setCapturedImage(photo.uri);
      AccessibilityInfo.announceForAccessibility('Foto capturada. Revise e confirme o upload');
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      setToast({ message: 'Erro ao capturar foto', type: 'error' });
    }
  };

  const pickImage = async (): Promise<void> => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        allowsEditing: true,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets[0].uri);
        AccessibilityInfo.announceForAccessibility('Imagem selecionada da galeria');
      }
    } catch (error) {
      console.error('Erro ao selecionar imagem:', error);
      setToast({ message: 'Erro ao selecionar imagem', type: 'error' });
    }
  };

  const uploadMutation = useMutation({
    mutationFn: imagesService.uploadImage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['images', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });

      setToast({ message: 'Foto enviada com sucesso!', type: 'success' });
      AccessibilityInfo.announceForAccessibility('Foto enviada com sucesso');

      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Erro ao enviar foto';
      setToast({ message, type: 'error' });
      AccessibilityInfo.announceForAccessibility(`Erro: ${message}`);
    },
  });

  const requestLgpdConsent = (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        'Consentimento LGPD',
        'Para fazer upload desta imagem, precisamos do seu consentimento para:\n\n' +
          '• Armazenar a foto no servidor\n' +
          '• Coletar localização (GPS)\n' +
          '• Armazenar metadados do dispositivo\n\n' +
          'Os dados serão usados apenas para fins de registro da coleta e conforme a LGPD.',
        [
          {
            text: 'Não Autorizo',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Autorizo',
            onPress: () => resolve(true),
          },
        ],
        { cancelable: false }
      );
    });
  };

  const handleUpload = async (): Promise<void> => {
    if (!capturedImage) return;

    // Solicitar consentimento LGPD se ainda não foi dado
    if (!lgpdConsent) {
      const consent = await requestLgpdConsent();
      if (!consent) {
        setToast({
          message: 'Upload cancelado. Consentimento LGPD necessário.',
          type: 'error',
        });
        return;
      }
      setLgpdConsent(true);
    }

    try {
      // Obter localização
      let location = null;
      try {
        const loc = await Location.getCurrentPositionAsync({});
        location = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
        };
      } catch (error) {
        console.log('Não foi possível obter localização');
      }

      // Obter informações do dispositivo
      const deviceInfo = JSON.stringify({
        deviceModel: Device.modelName || 'Unknown',
        deviceManufacturer: Device.manufacturer || 'Unknown',
        osVersion: Device.osVersion || 'Unknown',
      });

      const uploadData = {
        uri: capturedImage,
        collectionId: String(collectionId),
        consentGiven: true,
        latitude: location?.latitude,
        longitude: location?.longitude,
        capturedAt: new Date(),
        deviceInfo,
        description: `Imagem capturada via app - Etapa: ${imageStage}`,
      };

      if (isOnline) {
        uploadMutation.mutate(uploadData);
      } else {
        await offlineService.addOfflineAction('image', 'CREATE', uploadData);
        setToast({
          message: 'Foto salva. Será enviada quando estiver online.',
          type: 'success',
        });
        setTimeout(() => navigation.goBack(), 1500);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      setToast({ message: 'Erro ao processar foto', type: 'error' });
    }
  };

  const toggleCameraType = (): void => {
    setCameraType((current) =>
      current === CameraType.back ? CameraType.front : CameraType.back
    );
    AccessibilityInfo.announceForAccessibility(
      `Câmera ${cameraType === CameraType.back ? 'frontal' : 'traseira'} ativada`
    );
  };

  const toggleFlash = (): void => {
    setFlashMode((current) => (current === FlashMode.off ? FlashMode.on : FlashMode.off));
    AccessibilityInfo.announceForAccessibility(
      `Flash ${flashMode === FlashMode.off ? 'ligado' : 'desligado'}`
    );
  };

  const retake = (): void => {
    setCapturedImage(null);
    setLgpdConsent(false);
    setImageStage(ImageStage.COLLECTION);
    AccessibilityInfo.announceForAccessibility('Foto descartada. Tire uma nova foto');
  };

  if (hasPermission === null) {
    return <Loading message="Solicitando permissões..." />;
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.noPermissionText}>
          Sem acesso à câmera. Por favor, permita nas configurações.
        </Text>
      </View>
    );
  }

  if (capturedImage) {
    return (
      <View style={styles.container}>
        <Image source={{ uri: capturedImage }} style={styles.preview} />

        <ScrollView style={styles.controls} contentContainerStyle={styles.controlsContent}>
          <StageSelector
            value={imageStage}
            onChange={setImageStage}
            accessibilityLabel="Etapa da coleta"
          />

          {lgpdConsent && (
            <View style={styles.consentContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.secondary[600]} />
              <Text style={styles.consentText}>Consentimento LGPD concedido</Text>
            </View>
          )}

          <View style={styles.infoContainer}>
            <Ionicons name="information-circle-outline" size={20} color={colors.neutral[400]} />
            <Text style={styles.infoText}>
              Ao enviar, você autoriza o armazenamento da foto, localização e metadados do dispositivo conforme LGPD.
            </Text>
          </View>

          <View style={styles.buttonRow}>
            <Button
              title="Descartar"
              variant="outline"
              onPress={retake}
              accessibilityLabel="Descartar foto"
              accessibilityHint="Toque duas vezes para descartar e tirar nova foto"
            />
            <View style={styles.buttonSpacer} />
            <Button
              title={isOnline ? 'Enviar' : 'Salvar Offline'}
              variant="primary"
              onPress={handleUpload}
              loading={uploadMutation.isPending}
              accessibilityLabel={isOnline ? 'Enviar foto' : 'Salvar foto offline'}
              accessibilityHint="Toque duas vezes para confirmar e autorizar"
            />
          </View>
        </ScrollView>

        {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={cameraType}
        flashMode={flashMode}
      >
        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleFlash}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`Flash ${flashMode === FlashMode.off ? 'desligado' : 'ligado'}`}
            accessibilityHint="Toque duas vezes para alternar flash"
          >
            <Ionicons
              name={flashMode === FlashMode.off ? 'flash-off' : 'flash'}
              size={32}
              color={colors.neutral[50]}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={toggleCameraType}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Alternar câmera"
            accessibilityHint="Toque duas vezes para trocar entre câmera frontal e traseira"
          >
            <Ionicons name="camera-reverse" size={32} color={colors.neutral[50]} />
          </TouchableOpacity>
        </View>
      </Camera>

      <View style={styles.bottomControls}>
        <TouchableOpacity
          style={styles.galleryButton}
          onPress={pickImage}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Selecionar da galeria"
          accessibilityHint="Toque duas vezes para escolher foto da galeria"
        >
          <Ionicons name="images" size={32} color={colors.neutral[50]} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.captureButton}
          onPress={takePicture}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="Tirar foto"
          accessibilityHint="Toque duas vezes para capturar foto"
        >
          <View style={styles.captureButtonInner} />
        </TouchableOpacity>

        <View style={styles.galleryButton} />
      </View>

      {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[900],
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  iconButton: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
  },
  bottomControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  galleryButton: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.neutral[50],
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: colors.neutral[300],
  },
  captureButtonInner: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.neutral[50],
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  controls: {
    maxHeight: 400,
    backgroundColor: colors.neutral[900],
  },
  controlsContent: {
    padding: spacing.md,
  },
  consentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.secondary[900],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondary[700],
  },
  consentText: {
    ...typography.caption,
    color: colors.secondary[50],
    marginLeft: spacing.sm,
    flex: 1,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.neutral[800],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral[700],
  },
  infoText: {
    ...typography.caption,
    color: colors.neutral[400],
    marginLeft: spacing.sm,
    flex: 1,
    lineHeight: 18,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  buttonSpacer: {
    width: spacing.md,
  },
  noPermissionText: {
    ...typography.body,
    color: colors.neutral[50],
    textAlign: 'center',
    padding: spacing.xl,
  },
});

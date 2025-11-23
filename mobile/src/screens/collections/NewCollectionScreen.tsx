import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  AccessibilityInfo,
  Platform,
  TextInput,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Location from 'expo-location';

import { collectionsService } from '@/services/collections.service';
import { gravimetricDataService } from '@/services/gravimetricData.service';
import { unitsService } from '@/services/units.service';
import { recipientsService } from '@/services/recipients.service';
import { clientsService } from '@/services/clients.service';
import { imagesService } from '@/services/images.service';
import { useAuthStore } from '@/store/authStore';
import { useOfflineStore } from '@/store/offlineStore';
import { offlineService } from '@/services/offline.service';
import { WeightInput } from '@/components/WeightInput';
import { CustomSelect } from '@/components/CustomSelect';
import { CollectionStatus, GravimetricDataSource, TreatmentType, UserRole } from '@/types';
import { translateTreatmentType } from '@/utils/translations.util';

const TREATMENT_TYPE_EMOJIS: Record<TreatmentType, string> = {
  [TreatmentType.RECYCLING]: '♻️',
  [TreatmentType.COMPOSTING]: '🍃',
  [TreatmentType.REUSE]: '🔄',
  [TreatmentType.LANDFILL]: '🗑️',
  [TreatmentType.ANIMAL_FEEDING]: '🐄',
};

const getWasteTypeEmoji = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('papel') || lowerName.includes('papelão') || lowerName.includes('papelao'))
    return '📄';
  if (lowerName.includes('plástico') || lowerName.includes('plastico') || lowerName.includes('pet'))
    return '♻️';
  if (
    lowerName.includes('metal') ||
    lowerName.includes('alumínio') ||
    lowerName.includes('aluminio') ||
    lowerName.includes('lata')
  )
    return '🔩';
  if (lowerName.includes('vidro')) return '🪟';
  if (
    lowerName.includes('orgânico') ||
    lowerName.includes('organico') ||
    lowerName.includes('compostável') ||
    lowerName.includes('compostavel')
  )
    return '🍃';
  if (
    lowerName.includes('eletrônico') ||
    lowerName.includes('eletronico') ||
    lowerName.includes('bateria') ||
    lowerName.includes('pilha')
  )
    return '📱';
  if (lowerName.includes('madeira')) return '🪵';
  if (
    lowerName.includes('têxtil') ||
    lowerName.includes('textil') ||
    lowerName.includes('tecido') ||
    lowerName.includes('roupa')
  )
    return '👕';
  if (lowerName.includes('óleo') || lowerName.includes('oleo')) return '🛢️';
  if (lowerName.includes('perigoso') || lowerName.includes('tóxico') || lowerName.includes('toxico'))
    return '☢️';
  return '🗑️';
};

const COLORS = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#4CAF50',
  primaryLight: '#E8F5E9',
  text: '#333333',
  textSecondary: '#666666',
  border: '#ddd',
  error: '#f44336',
};

export const NewCollectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isOnline } = useOfflineStore();

  const isAdmin = user?.role === UserRole.ADMIN;
  const clientIdFromUser = user?.role === UserRole.CLIENT ? user.clientId : null;

  const [selectedClientId, setSelectedClientId] = useState<string>(clientIdFromUser || '');
  const [unitId, setUnitId] = useState<string>('');
  const [wasteTypeId, setWasteTypeId] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');
  const [treatmentType, setTreatmentType] = useState<TreatmentType | null>(null);
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weightKg, setWeightKg] = useState('');
  const [notes, setNotes] = useState<string>('');
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [imageUris, setImageUris] = useState<string[]>([]);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    getLocation();
    AccessibilityInfo.announceForAccessibility('Nova Coleta - Preencha os dados da pesagem');
  }, []);

  const getLocation = async (): Promise<void> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permissão de localização negada');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Erro ao obter localização:', error);
    }
  };

  const { data: clientsData, isLoading: loadingClients } = useQuery({
    queryKey: ['clients', 'active'],
    queryFn: () => clientsService.getClients({ active: true, limit: 100 }),
    enabled: isAdmin,
  });

  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['units', 'active', selectedClientId],
    queryFn: () =>
      unitsService.getUnits({
        active: true,
        clientId: selectedClientId || undefined,
        limit: 100,
      }),
    enabled: !!selectedClientId,
  });

  const { data: wasteTypesData, isLoading: loadingWasteTypes } = useQuery({
    queryKey: ['wasteTypes', 'client', selectedClientId],
    queryFn: () => {
      if (selectedClientId) {
        return clientsService.getClientWasteTypes(selectedClientId);
      }
      return [];
    },
    enabled: !!selectedClientId,
  });

  const { data: recipientsData, isLoading: loadingRecipients } = useQuery({
    queryKey: ['recipients', 'active'],
    queryFn: () => recipientsService.getActiveRecipients(),
  });

  const handleClientChange = (clientId: string): void => {
    setSelectedClientId(clientId);
    setUnitId('');
    setWasteTypeId('');
    setErrors((prev) => ({ ...prev, selectedClientId: '' }));
  };

  const handleDateChange = (event: unknown, selectedDate?: Date): void => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      setCollectionDate(selectedDate);
      setErrors((prev) => ({ ...prev, collectionDate: '' }));
    }
  };

  const setToday = (): void => {
    setCollectionDate(new Date());
    setErrors((prev) => ({ ...prev, collectionDate: '' }));
    AccessibilityInfo.announceForAccessibility('Data definida para hoje');
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permissão necessária',
        'É necessário permitir o acesso à câmera para tirar fotos.'
      );
      return false;
    }
    return true;
  };

  const handleTakePhoto = async (): Promise<void> => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao tirar foto:', error);
      Alert.alert('Erro', 'Não foi possível tirar a foto. Tente novamente.');
    }
  };

  const handleSelectFromGallery = async (): Promise<void> => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o acesso à galeria para selecionar fotos.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        exif: true,
      });

      if (!result.canceled && result.assets[0]) {
        await processImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Erro ao selecionar foto:', error);
      Alert.alert('Erro', 'Não foi possível selecionar a foto. Tente novamente.');
    }
  };

  const processImage = async (uri: string): Promise<void> => {
    try {
      if (imageUris.length >= 6) {
        Alert.alert('Limite atingido', 'Você pode adicionar no máximo 6 fotos.');
        return;
      }

      const manipulatedImage = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1920 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImageUris((prev) => [...prev, manipulatedImage.uri]);
      setErrors((prev) => ({ ...prev, image: '' }));
      AccessibilityInfo.announceForAccessibility(
        `Foto ${imageUris.length + 1} adicionada com sucesso`
      );
    } catch (error) {
      console.error('Erro ao processar imagem:', error);
      Alert.alert('Erro', 'Não foi possível processar a imagem. Tente novamente.');
    }
  };

  const handleRemoveImage = (index: number): void => {
    setImageUris((prev) => prev.filter((_, i) => i !== index));
    AccessibilityInfo.announceForAccessibility(`Foto ${index + 1} removida`);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (isAdmin && !selectedClientId) {
      newErrors.selectedClientId = 'Selecione um cliente';
    }
    if (!unitId) {
      newErrors.unitId = 'Selecione uma unidade';
    }
    if (!wasteTypeId) {
      newErrors.wasteTypeId = 'Selecione um tipo de resíduo';
    }
    if (!recipientId) {
      newErrors.recipientId = 'Selecione um destinatário';
    }
    if (!treatmentType) {
      newErrors.treatmentType = 'Selecione o tipo de tratamento';
    }
    if (!responsibleName || responsibleName.trim() === '') {
      newErrors.responsibleName = 'Informe o responsável pela pesagem';
    }
    if (!collectionDate) {
      newErrors.collectionDate = 'Selecione a data da coleta';
    }
    if (!weightKg || weightKg.trim() === '') {
      newErrors.weightKg = 'Informe o peso da coleta';
    } else {
      const weight = parseFloat(weightKg.replace(',', '.'));
      if (isNaN(weight) || weight <= 0) {
        newErrors.weightKg = 'Peso deve ser maior que zero';
      }
    }
    if (imageUris.length === 0) {
      newErrors.image = 'É obrigatório adicionar pelo menos uma foto da coleta';
    } else if (imageUris.length > 6) {
      newErrors.image = 'Máximo de 6 fotos permitido';
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (collectionDate < thirtyDaysAgo) {
      AccessibilityInfo.announceForAccessibility('Atenção: Data de coleta com mais de 30 dias atrás');
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const errorMessage = Object.values(newErrors).join('. ');
      AccessibilityInfo.announceForAccessibility(`Erros no formulário: ${errorMessage}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    const finalClientId = selectedClientId || clientIdFromUser;

    if (!finalClientId) {
      Alert.alert('Erro', 'Cliente não identificado');
      setIsSubmitting(false);
      return;
    }

    const collectionData = {
      clientId: finalClientId,
      unitId,
      wasteTypeId,
      recipientId,
      treatmentType: treatmentType!,
      userId: user?.id,
      collectionDate: collectionDate.toISOString(),
      latitude: location?.latitude,
      longitude: location?.longitude,
      metadata: {
        responsibleName,
      },
      notes: notes.trim() || undefined,
    };

    try {
      if (isOnline) {
        if (imageUris.length === 0) {
          Alert.alert('Erro', 'É necessário adicionar pelo menos uma foto da coleta');
          setIsSubmitting(false);
          return;
        }

        AccessibilityInfo.announceForAccessibility('Criando coleta...');

        const collection = await collectionsService.createCollection(collectionData);

        AccessibilityInfo.announceForAccessibility(
          `Coleta criada. Enviando ${imageUris.length} foto(s)...`
        );
        setIsUploadingImage(true);

        const uploadedImages = await imagesService.uploadMultipleImages(imageUris, {
          collectionId: collection.id,
          consentGiven: true,
          latitude: location?.latitude,
          longitude: location?.longitude,
        });

        setUploadedImageIds(uploadedImages.map((img) => img.id));
        setIsUploadingImage(false);

        AccessibilityInfo.announceForAccessibility('Salvando peso...');
        await gravimetricDataService.create({
          collectionId: collection.id,
          weightKg: parseFloat(weightKg.replace(',', '.')),
          source: GravimetricDataSource.MANUAL,
          deviceId: Platform.OS,
          metadata: {
            appVersion: '1.0.0',
            platform: Platform.OS,
          },
        });

        AccessibilityInfo.announceForAccessibility('Coleta criada com sucesso');

        Alert.alert('Sucesso', 'Coleta registrada com sucesso!', [
          {
            text: 'OK',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['collections'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              navigation.goBack();
            },
          },
        ]);
      } else {
        await offlineService.addOfflineAction('collection', 'CREATE', {
          ...collectionData,
          weightKg: parseFloat(weightKg.replace(',', '.')),
          imageUris,
        });

        Alert.alert('Salvo', 'Coleta salva. Será sincronizada quando estiver online.', [
          {
            text: 'OK',
            onPress: () => {
              queryClient.invalidateQueries({ queryKey: ['collections'] });
              queryClient.invalidateQueries({ queryKey: ['dashboard'] });
              navigation.goBack();
            },
          },
        ]);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar coleta';
      Alert.alert('Erro', message);
      AccessibilityInfo.announceForAccessibility(`Erro: ${message}`);
      setIsUploadingImage(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loadingRecipients || (isAdmin && loadingClients)) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: COLORS.background }]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.text }]}>Carregando...</Text>
      </View>
    );
  }

  const clients = clientsData?.data || [];
  const units = unitsData?.data || [];
  const wasteTypes = Array.isArray(wasteTypesData) ? wasteTypesData : [];
  const recipients = recipientsData || [];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: COLORS.background }]}
      contentContainerStyle={styles.contentContainer}
      accessibilityRole="scrollbar"
      accessibilityLabel="Formulário de nova coleta"
    >
      {isAdmin && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Cliente *</Text>

          <CustomSelect
            options={clients.map((client) => ({
              label: client.name,
              value: client.id,
              emoji: '🏢',
            }))}
            value={selectedClientId}
            onValueChange={(value) => handleClientChange(value)}
            placeholder="Selecione o cliente..."
            error={!!errors.selectedClientId}
            accessibilityLabel="Selecionar cliente"
          />

          {errors.selectedClientId && (
            <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
              {errors.selectedClientId}
            </Text>
          )}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Data da Pesagem *</Text>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[
              styles.dateButton,
              { backgroundColor: COLORS.surface, borderColor: COLORS.border },
            ]}
            onPress={() => setShowDatePicker(true)}
            accessibilityRole="button"
            accessibilityLabel="Selecionar data"
            accessibilityHint="Abre o seletor de data"
          >
            <Text style={[styles.dateButtonText, { color: COLORS.text }]}>
              {collectionDate.toLocaleDateString('pt-BR')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.todayButton, { backgroundColor: COLORS.primary }]}
            onPress={setToday}
            accessibilityRole="button"
            accessibilityLabel="Definir data de hoje"
          >
            <Text style={styles.todayButtonText}>Hoje</Text>
          </TouchableOpacity>
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={collectionDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
            maximumDate={new Date()}
          />
        )}

        {errors.collectionDate && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.collectionDate}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Categoria do Material *</Text>

        {isAdmin && !selectedClientId ? (
          <Text style={[styles.helperText, { color: COLORS.textSecondary }]}>
            Primeiro selecione o cliente
          </Text>
        ) : (
          <CustomSelect
            options={wasteTypes.map((wt) => ({
              label: wt.name,
              value: wt.id,
              emoji: getWasteTypeEmoji(wt.name),
            }))}
            value={wasteTypeId}
            onValueChange={(value) => {
              setWasteTypeId(value);
              setErrors((prev) => ({ ...prev, wasteTypeId: '' }));
            }}
            placeholder="Selecione a categoria do material..."
            error={!!errors.wasteTypeId}
            disabled={isAdmin && !selectedClientId}
            accessibilityLabel="Selecionar categoria do material"
          />
        )}

        {errors.wasteTypeId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.wasteTypeId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <WeightInput
          value={weightKg}
          onChangeValue={(value) => {
            setWeightKg(value);
            setErrors((prev) => ({ ...prev, weightKg: '' }));
          }}
          error={errors.weightKg}
          label="Pesagem (kg) *"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Responsável pela Pesagem *</Text>

        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: COLORS.surface,
              borderColor: errors.responsibleName ? COLORS.error : COLORS.border,
              color: COLORS.text,
            },
          ]}
          value={responsibleName}
          onChangeText={(value) => {
            setResponsibleName(value);
            setErrors((prev) => ({ ...prev, responsibleName: '' }));
          }}
          placeholder="Digite o nome do responsável"
          placeholderTextColor={COLORS.textSecondary}
          autoCapitalize="words"
          accessibilityLabel="Responsável pela pesagem"
          accessibilityHint="Digite o nome de quem foi responsável pela pesagem"
        />

        {errors.responsibleName && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.responsibleName}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Unidade *</Text>

        {isAdmin && !selectedClientId ? (
          <Text style={[styles.helperText, { color: COLORS.textSecondary }]}>
            Primeiro selecione o cliente
          </Text>
        ) : (
          <CustomSelect
            options={units.map((unit) => ({
              label: unit.name,
              value: unit.id,
              emoji: '🏭',
            }))}
            value={unitId}
            onValueChange={(value) => {
              setUnitId(value);
              setErrors((prev) => ({ ...prev, unitId: '' }));
            }}
            placeholder="Selecione a unidade..."
            error={!!errors.unitId}
            disabled={isAdmin && !selectedClientId}
            accessibilityLabel="Selecionar unidade"
          />
        )}

        {errors.unitId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.unitId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Tipo de Tratamento *</Text>

        <CustomSelect
          options={Object.values(TreatmentType).map((value) => ({
            label: translateTreatmentType(value),
            value,
            emoji: TREATMENT_TYPE_EMOJIS[value],
          }))}
          value={treatmentType || ''}
          onValueChange={(value) => {
            setTreatmentType(value as TreatmentType);
            setErrors((prev) => ({ ...prev, treatmentType: '' }));
          }}
          placeholder="Selecione o tipo de tratamento..."
          error={!!errors.treatmentType}
          accessibilityLabel="Selecionar tipo de tratamento"
        />

        {errors.treatmentType && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.treatmentType}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Destinatário *</Text>

        <CustomSelect
          options={recipients.map((recipient) => ({
            label: recipient.name,
            value: recipient.id,
            emoji: '📍',
          }))}
          value={recipientId}
          onValueChange={(value) => {
            setRecipientId(value);
            setErrors((prev) => ({ ...prev, recipientId: '' }));
          }}
          placeholder="Selecione o destinatário..."
          error={!!errors.recipientId}
          accessibilityLabel="Selecionar destinatário"
        />

        {errors.recipientId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.recipientId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Fotos da Coleta * ({imageUris.length}/6)
        </Text>

        {imageUris.length > 0 && (
          <View style={styles.imagesGrid}>
            {imageUris.map((uri, index) => (
              <View key={index} style={styles.imageGridItem}>
                <Image
                  source={{ uri }}
                  style={styles.imageGridPreview}
                  resizeMode="cover"
                  accessibilityLabel={`Foto ${index + 1} da coleta`}
                />
                <TouchableOpacity
                  style={[styles.removeImageIconButton, { backgroundColor: COLORS.error }]}
                  onPress={() => handleRemoveImage(index)}
                  accessibilityRole="button"
                  accessibilityLabel={`Remover foto ${index + 1}`}
                >
                  <Text style={styles.removeImageIcon}>❌</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {imageUris.length < 6 && (
          <View style={styles.imageButtonsContainer}>
            <TouchableOpacity
              style={[styles.imageButton, { backgroundColor: COLORS.primary }]}
              onPress={handleTakePhoto}
              accessibilityRole="button"
              accessibilityLabel="Tirar foto com a câmera"
            >
              <Text style={styles.imageButtonIcon}>📷</Text>
              <Text style={styles.imageButtonText}>Tirar Foto</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.imageButton, { backgroundColor: COLORS.primary }]}
              onPress={handleSelectFromGallery}
              accessibilityRole="button"
              accessibilityLabel="Selecionar foto da galeria"
            >
              <Text style={styles.imageButtonIcon}>🖼️</Text>
              <Text style={styles.imageButtonText}>Galeria</Text>
            </TouchableOpacity>
          </View>
        )}

        {errors.image && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.image}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>Observações (opcional)</Text>

        <TextInput
          style={[
            styles.textArea,
            { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text },
          ]}
          value={notes}
          onChangeText={setNotes}
          placeholder="Digite observações sobre a coleta"
          placeholderTextColor={COLORS.textSecondary}
          multiline
          numberOfLines={4}
          accessibilityLabel="Observações"
          accessibilityHint="Campo opcional para observações adicionais"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            { backgroundColor: isSubmitting ? COLORS.border : COLORS.primary },
          ]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Salvar coleta"
          accessibilityState={{ disabled: isSubmitting }}
        >
          {isSubmitting ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitButtonText}>Salvar Coleta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: COLORS.border }]}
          onPress={() => navigation.goBack()}
          disabled={isSubmitting}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
          accessibilityState={{ disabled: isSubmitting }}
        >
          <Text style={[styles.cancelButtonText, { color: COLORS.text }]}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  helperText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dateButtonText: {
    fontSize: 16,
  },
  todayButton: {
    height: 56,
    paddingHorizontal: 24,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  imageButton: {
    flex: 1,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  imageButtonIcon: {
    fontSize: 28,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  imageGridItem: {
    width: '31%',
    aspectRatio: 1,
    position: 'relative',
  },
  imageGridPreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageIconButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageIcon: {
    fontSize: 16,
  },
  textInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
  },
  buttonContainer: {
    marginTop: 16,
    marginBottom: 32,
    gap: 12,
  },
  submitButton: {
    height: 56,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

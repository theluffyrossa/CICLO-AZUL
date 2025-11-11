import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  AccessibilityInfo,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';

import {
  Select,
  SelectOption,
  TextArea,
  DateTimePickerInput,
  NumericInput,
  ImagePickerInput,
  SelectedImage,
  TextInput,
} from '@/components/forms';
import { Button, Loading, Toast } from '@/components/common';
import { collectionsService } from '@/services/collections.service';
import { gravimetricDataService } from '@/services/gravimetricData.service';
import { imagesService } from '@/services/images.service';
import { unitsService } from '@/services/units.service';
import { wasteTypesService } from '@/services/wasteTypes.service';
import { recipientsService } from '@/services/recipients.service';
import { useAuthStore } from '@/store/authStore';
import { useOfflineStore } from '@/store/offlineStore';
import { offlineService } from '@/services/offline.service';
import { CollectionStatus, GravimetricDataSource, ImageStage } from '@/types';
import { colors, spacing } from '@/theme';

export const NewCollectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const { isOnline } = useOfflineStore();

  // Form state
  const [unitId, setUnitId] = useState<string | null>(null);
  const [wasteTypeId, setWasteTypeId] = useState<string | null>(null);
  const [recipientId, setRecipientId] = useState<string | null>(null);
  const [responsibleName, setResponsibleName] = useState<string>('');
  const [collectionDate, setCollectionDate] = useState<Date>(new Date());
  const [weightKg, setWeightKg] = useState('');
  const [selectedImages, setSelectedImages] = useState<SelectedImage[]>([]);
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Toast state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Buscar localização ao montar o componente
  useEffect(() => {
    getLocation();
    AccessibilityInfo.announceForAccessibility(
      'Nova Coleta - Preencha os dados da pesagem'
    );
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

  // Queries
  const { data: unitsData, isLoading: loadingUnits } = useQuery({
    queryKey: ['units', 'active'],
    queryFn: () => unitsService.getUnits({ active: true, limit: 100 }),
  });

  const { data: wasteTypesData, isLoading: loadingWasteTypes } = useQuery({
    queryKey: ['wasteTypes', 'active'],
    queryFn: () => wasteTypesService.getWasteTypes({ isActive: true, limit: 100 }),
  });

  const { data: recipientsData, isLoading: loadingRecipients } = useQuery({
    queryKey: ['recipients', 'active'],
    queryFn: () => recipientsService.getActiveRecipients(),
  });


  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!unitId) {
      newErrors.unitId = 'Selecione uma unidade';
    }
    if (!wasteTypeId) {
      newErrors.wasteTypeId = 'Selecione um tipo de resíduo';
    }
    if (!recipientId) {
      newErrors.recipientId = 'Selecione um destinatário';
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
      const weight = parseFloat(weightKg);
      if (isNaN(weight) || weight <= 0) {
        newErrors.weightKg = 'Peso deve ser maior que zero';
      }
    }

    // Warning for retroactive dates (more than 30 days old)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    if (collectionDate < thirtyDaysAgo) {
      AccessibilityInfo.announceForAccessibility(
        'Atenção: Data de coleta com mais de 30 dias atrás'
      );
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      AccessibilityInfo.announceForAccessibility(`Erro de validação: ${firstError}`);
      return false;
    }

    return true;
  };

  const handleSubmit = async (): Promise<void> => {
    if (!validate()) return;
    if (!user || isSubmitting) return;

    setIsSubmitting(true);

    // Pegar o clientId da unidade selecionada
    const selectedUnit = unitsData?.data.find((u) => u.id === unitId);
    if (!selectedUnit) {
      setToast({ message: 'Erro: Unidade não encontrada', type: 'error' });
      setIsSubmitting(false);
      return;
    }

    const collectionData = {
      clientId: selectedUnit.clientId,
      unitId,
      wasteTypeId,
      recipientId,
      userId: user?.id,
      collectionDate: collectionDate.toISOString(),
      status: CollectionStatus.COMPLETED,
      latitude: location?.latitude,
      longitude: location?.longitude,
      metadata: {
        responsibleName,
      },
    };

    try {
      if (isOnline) {
        // Online - fluxo em 3 etapas
        AccessibilityInfo.announceForAccessibility('Criando coleta...');

        // Etapa 1: Criar Collection
        const collection = await collectionsService.createCollection(collectionData);

        // Etapa 2: Criar GravimetricData
        AccessibilityInfo.announceForAccessibility('Salvando peso...');
        await gravimetricDataService.create({
          collectionId: collection.id,
          weightKg: parseFloat(weightKg),
          source: GravimetricDataSource.MANUAL,
          deviceId: Platform.OS,
          metadata: {
            appVersion: '1.0.0',
            platform: Platform.OS,
          },
        });

        // Etapa 3: Upload de imagens (se houver)
        if (selectedImages.length > 0) {
          AccessibilityInfo.announceForAccessibility(
            `Enviando ${selectedImages.length} ${selectedImages.length === 1 ? 'imagem' : 'imagens'}...`
          );

          const uploadPromises = selectedImages.map((image) =>
            imagesService.uploadImage({
              uri: image.uri,
              collectionId: collection.id,
              consentGiven: true,
              latitude: location?.latitude,
              longitude: location?.longitude,
            })
          );

          await Promise.all(uploadPromises);
        }

        // Invalidar cache e mostrar sucesso
        queryClient.invalidateQueries({ queryKey: ['collections'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });

        setToast({ message: 'Coleta criada com sucesso!', type: 'success' });
        AccessibilityInfo.announceForAccessibility('Coleta criada com sucesso');

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        // Offline - adicionar à fila
        await offlineService.addOfflineAction('collection', 'CREATE', {
          ...collectionData,
          weightKg: parseFloat(weightKg),
          images: selectedImages,
        });
        setToast({
          message: 'Coleta salva. Será sincronizada quando estiver online.',
          type: 'success',
        });

        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar coleta';
      setToast({ message, type: 'error' });
      AccessibilityInfo.announceForAccessibility(`Erro: ${message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Função para mapear emoji baseado no nome do tipo de resíduo
  const getWasteTypeEmoji = (name: string): string => {
    const lowerName = name.toLowerCase();

    // Papel e papelão
    if (lowerName.includes('papel') || lowerName.includes('papelão') || lowerName.includes('papelao')) {
      return '📄';
    }
    // Plástico
    if (lowerName.includes('plástico') || lowerName.includes('plastico') || lowerName.includes('pet')) {
      return '♻️';
    }
    // Metal
    if (lowerName.includes('metal') || lowerName.includes('alumínio') || lowerName.includes('aluminio') || lowerName.includes('lata')) {
      return '🔩';
    }
    // Vidro
    if (lowerName.includes('vidro')) {
      return '🪟';
    }
    // Orgânico
    if (lowerName.includes('orgânico') || lowerName.includes('organico') || lowerName.includes('compostável') || lowerName.includes('compostavel')) {
      return '🍃';
    }
    // Eletrônico
    if (lowerName.includes('eletrônico') || lowerName.includes('eletronico') || lowerName.includes('bateria') || lowerName.includes('pilha')) {
      return '📱';
    }
    // Madeira
    if (lowerName.includes('madeira')) {
      return '🪵';
    }
    // Têxtil
    if (lowerName.includes('têxtil') || lowerName.includes('textil') || lowerName.includes('tecido') || lowerName.includes('roupa')) {
      return '👕';
    }
    // Óleo
    if (lowerName.includes('óleo') || lowerName.includes('oleo')) {
      return '🛢️';
    }
    // Perigoso/Tóxico
    if (lowerName.includes('perigoso') || lowerName.includes('tóxico') || lowerName.includes('toxico')) {
      return '☢️';
    }
    // Default para resíduos gerais
    return '🗑️';
  };

  // Preparar opções para os selects
  const unitOptions: SelectOption[] = unitsData?.data.map((unit) => ({
    label: unit.name,
    value: unit.id,
  })) || [];

  const wasteTypeOptions: SelectOption[] = wasteTypesData?.data.map((type) => ({
    label: type.name,
    value: type.id,
    emoji: getWasteTypeEmoji(type.name),
  })) || [];

  const recipientOptions: SelectOption[] = recipientsData?.map((recipient) => ({
    label: recipient.name,
    value: recipient.id,
  })) || [];

  if (loadingUnits || loadingWasteTypes || loadingRecipients) {
    return <Loading message="Carregando dados..." />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
        accessible={true}
        accessibilityLabel="Formulário de nova coleta"
      >
        <DateTimePickerInput
          label="Data da Pesagem"
          value={collectionDate}
          onChange={setCollectionDate}
          mode="datetime"
          error={errors.collectionDate}
          required
          emoji="📅"
          accessibilityLabel="Data da pesagem"
          accessibilityHint="Selecione a data e hora da pesagem"
        />

        <Select
          label="Categoria do Material"
          placeholder="Selecione a categoria do material"
          value={wasteTypeId}
          options={wasteTypeOptions}
          onValueChange={(value) => setWasteTypeId(String(value))}
          error={errors.wasteTypeId}
          required
          emoji="♻️"
          accessibilityLabel="Categoria do material"
          accessibilityHint="Selecione a categoria do material coletado"
        />

        <NumericInput
          label="Peso (kg)"
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="0.00"
          unit="kg"
          min={0}
          decimals={2}
          error={errors.weightKg}
          required
          emoji="⚖️"
          accessibilityLabel="Peso em quilogramas"
          accessibilityHint="Digite o peso total do material em kg"
        />

        <TextInput
          label="Responsável pela Pesagem"
          value={responsibleName}
          onChangeText={setResponsibleName}
          placeholder="Digite o nome do responsável"
          error={errors.responsibleName}
          required
          autoCapitalize="words"
          emoji="👤"
          accessibilityLabel="Responsável pela pesagem"
          accessibilityHint="Digite o nome de quem foi responsável pela pesagem"
        />

        <Select
          label="Unidade de Origem"
          placeholder="Selecione a unidade de origem"
          value={unitId}
          options={unitOptions}
          onValueChange={(value) => setUnitId(String(value))}
          error={errors.unitId}
          disabled={loadingUnits}
          required
          emoji="🏢"
          accessibilityLabel="Unidade de origem"
          accessibilityHint="Selecione a unidade de onde o material foi coletado"
        />

        <Select
          label="Destinatário Final"
          placeholder="Selecione o destinatário final"
          value={recipientId}
          options={recipientOptions}
          onValueChange={(value) => setRecipientId(String(value))}
          error={errors.recipientId}
          required
          emoji="📍"
          accessibilityLabel="Destinatário final"
          accessibilityHint="Selecione para onde o material será enviado"
        />

        <ImagePickerInput
          label="Anexo de Imagem"
          value={selectedImages}
          onChange={setSelectedImages}
          maxImages={5}
          accessibilityLabel="Anexo de imagem - opcional"
          accessibilityHint="Adicione até 5 imagens. Você pode usar a câmera ou escolher da galeria"
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Concluído"
            variant="primary"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={isSubmitting}
            fullWidth
            accessibilityLabel="Concluir coleta"
            accessibilityHint="Toque duas vezes para concluir e salvar a coleta"
          />
        </View>
      </ScrollView>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onHide={() => setToast(null)}
        />
      )}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  buttonContainer: {
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
  },
});

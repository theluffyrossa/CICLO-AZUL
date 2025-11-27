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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { clientService } from '../../services/client.service';
import { recipientService } from '../../services/recipient.service';
import { collectionsService } from '../../services/collections.service';
import { wasteTypesService } from '../../services/wasteTypes.service';
import { WeightInput } from '../../components/WeightInput';
import { TreatmentType, Collection, UserRole } from '../../types';
import { WasteType } from '../../services/wasteTypes.service';
import { Recipient } from '../../services/recipient.service';
import DateTimePicker from '@react-native-community/datetimepicker';

interface EditCollectionScreenProps {
  navigation: {
    goBack: () => void;
  };
  route: {
    params: {
      collectionId: string;
    };
  };
}

const TREATMENT_TYPE_LABELS: Record<TreatmentType, string> = {
  [TreatmentType.RECYCLING]: 'Reciclagem',
  [TreatmentType.COMPOSTING]: 'Compostagem',
  [TreatmentType.REUSE]: 'Reaproveitamento',
  [TreatmentType.LANDFILL]: 'Disposição em aterro',
  [TreatmentType.ANIMAL_FEEDING]: 'Alimentação Animal',
};

const COLORS = {
  background: '#f5f5f5',
  surface: '#ffffff',
  primary: '#2B87F5',
  text: '#333333',
  textSecondary: '#666666',
  border: '#ddd',
  error: '#f44336',
};

export const EditCollectionScreen: React.FC<EditCollectionScreenProps> = ({ navigation, route }) => {
  const { collectionId } = route.params;
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [collectionDate, setCollectionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string>('');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [treatmentType, setTreatmentType] = useState<TreatmentType>(TreatmentType.RECYCLING);
  const [weight, setWeight] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showWasteTypeModal, setShowWasteTypeModal] = useState(false);
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);

  const isAdmin = user?.role === UserRole.ADMIN;

  const { data: collection, isLoading: loadingData } = useQuery({
    queryKey: ['collection', collectionId],
    queryFn: () => collectionsService.getCollectionById(collectionId),
  });

  const { data: wasteTypes = [] } = useQuery<WasteType[]>({
    queryKey: isAdmin ? ['wasteTypes', 'all'] : ['wasteTypes', 'client'],
    queryFn: async () => {
      const data = isAdmin ? await wasteTypesService.getAll() : await clientService.getMyWasteTypes();
      return data as WasteType[];
    },
  });

  const { data: recipients = [] } = useQuery<Recipient[]>({
    queryKey: ['recipients', 'active'],
    queryFn: async () => {
      const data = await recipientService.getActive();
      return data as Recipient[];
    },
  });

  const updateCollectionMutation = useMutation({
    mutationFn: (data: Partial<Collection>) => collectionsService.updateCollection(collectionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collection', collectionId] });
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      queryClient.invalidateQueries({ queryKey: ['clientCollections'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });

      AccessibilityInfo.announceForAccessibility('Coleta atualizada com sucesso');

      Alert.alert(
        'Sucesso',
        'Coleta atualizada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    },
    onError: (error: unknown) => {
      console.error('Error updating collection:', error);
      const errorMessage = (error as { message?: string })?.message || 'Erro ao atualizar coleta';
      Alert.alert('Erro', errorMessage);
      AccessibilityInfo.announceForAccessibility(`Erro: ${errorMessage}`);
    },
  });

  useEffect(() => {
    if (collection) {
      setCollectionDate(new Date(collection.collectionDate));
      setSelectedWasteTypeId(collection.wasteTypeId);
      setSelectedUnitId(collection.unitId);
      setSelectedRecipientId(collection.recipientId);
      setTreatmentType(collection.treatmentType);
      setNotes(collection.notes || '');

      if (collection.gravimetricData && collection.gravimetricData.length > 0) {
        const totalWeight = collection.gravimetricData.reduce((sum, data) => sum + Number(data.weightKg), 0);
        setWeight(totalWeight.toString().replace('.', ','));
      }

      AccessibilityInfo.announceForAccessibility('Dados carregados com sucesso');
    }
  }, [collection]);

  const handleDateChange = (_event: unknown, selectedDate?: Date): void => {
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

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!selectedWasteTypeId) {
      newErrors.wasteTypeId = 'Selecione a categoria do material';
    }

    if (!selectedUnitId) {
      newErrors.unitId = 'Selecione a unidade';
    }

    if (!selectedRecipientId) {
      newErrors.recipientId = 'Selecione o destinatário';
    }

    if (!weight) {
      newErrors.weight = 'Informe o peso';
    } else {
      const weightValue = parseFloat(weight.replace(',', '.'));
      if (isNaN(weightValue) || weightValue <= 0) {
        newErrors.weight = 'Peso inválido';
      }
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
    if (!validateForm()) {
      return;
    }

    if (!collection) {
      Alert.alert('Erro', 'Dados da coleta não encontrados');
      return;
    }

    const updateData = {
      unitId: selectedUnitId,
      wasteTypeId: selectedWasteTypeId,
      recipientId: selectedRecipientId,
      collectionDate: collectionDate.toISOString(),
      treatmentType,
      notes: notes.trim() || undefined,
    };

    updateCollectionMutation.mutate(updateData);
  };

  if (loadingData) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: COLORS.background }]} edges={['bottom']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={[styles.loadingText, { color: COLORS.text }]}>
          Carregando...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: COLORS.background }]} edges={['bottom']}>
      <ScrollView
        contentContainerStyle={styles.contentContainer}
        accessibilityRole="scrollbar"
        accessibilityLabel="Formulário de edição de coleta"
      >
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Data da Pesagem
        </Text>

        <View style={styles.dateContainer}>
          <TouchableOpacity
            style={[styles.dateButton, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
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
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Categoria do Material
        </Text>

        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: COLORS.surface, borderColor: errors.wasteTypeId ? COLORS.error : COLORS.border }
          ]}
          onPress={() => setShowWasteTypeModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Selecionar categoria do material"
        >
          <Text style={[styles.selectButtonText, { color: selectedWasteTypeId ? COLORS.text : COLORS.textSecondary }]}>
            {selectedWasteTypeId
              ? wasteTypes.find(wt => wt.id === selectedWasteTypeId)?.name
              : 'Selecione...'}
          </Text>
          <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {errors.wasteTypeId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.wasteTypeId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Unidade
        </Text>

        <View style={[styles.infoDisplay, { backgroundColor: '#f5f5f5', borderColor: COLORS.border }]}>
          <Text style={[styles.infoDisplayText, { color: COLORS.text }]}>
            {collection?.unit?.name || 'Carregando...'}
          </Text>
        </View>

        <Text style={[styles.helperText, { color: COLORS.textSecondary }]}>
          A unidade não pode ser alterada
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Tipo de Tratamento
        </Text>

        <TouchableOpacity
          style={[styles.selectButton, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}
          onPress={() => setShowTreatmentModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Selecionar tipo de tratamento"
        >
          <Text style={[styles.selectButtonText, { color: COLORS.text }]}>
            {TREATMENT_TYPE_LABELS[treatmentType]}
          </Text>
          <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Destinatário
        </Text>

        <TouchableOpacity
          style={[
            styles.selectButton,
            { backgroundColor: COLORS.surface, borderColor: errors.recipientId ? COLORS.error : COLORS.border }
          ]}
          onPress={() => setShowRecipientModal(true)}
          accessibilityRole="button"
          accessibilityLabel="Selecionar destinatário"
        >
          <Text style={[styles.selectButtonText, { color: selectedRecipientId ? COLORS.text : COLORS.textSecondary }]}>
            {selectedRecipientId
              ? recipients.find(r => r.id === selectedRecipientId)?.name
              : 'Selecione...'}
          </Text>
          <Ionicons name="chevron-down" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {errors.recipientId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.recipientId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <WeightInput
          value={weight}
          onChangeValue={(value) => {
            setWeight(value);
            setErrors((prev) => ({ ...prev, weight: '' }));
          }}
          error={errors.weight}
          label="Pesagem (kg)"
        />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Observações (opcional)
        </Text>

        <TextInput
          style={[styles.textArea, { backgroundColor: COLORS.surface, borderColor: COLORS.border, color: COLORS.text }]}
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
            { backgroundColor: updateCollectionMutation.isPending ? COLORS.border : COLORS.primary },
          ]}
          onPress={handleSubmit}
          disabled={updateCollectionMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Atualizar coleta"
          accessibilityState={{ disabled: updateCollectionMutation.isPending }}
        >
          {updateCollectionMutation.isPending ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitButtonText}>Atualizar Coleta</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: COLORS.border }]}
          onPress={() => navigation.goBack()}
          disabled={updateCollectionMutation.isPending}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
          accessibilityState={{ disabled: updateCollectionMutation.isPending }}
        >
          <Text style={[styles.cancelButtonText, { color: COLORS.text }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>

      <Modal
        visible={showWasteTypeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowWasteTypeModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: COLORS.border }]}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                Selecionar Categoria
              </Text>
              <TouchableOpacity onPress={() => setShowWasteTypeModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {wasteTypes.map((wt) => (
                <TouchableOpacity
                  key={wt.id}
                  style={[
                    styles.modalItem,
                    selectedWasteTypeId === wt.id && { backgroundColor: COLORS.primary + '20' }
                  ]}
                  onPress={() => {
                    setSelectedWasteTypeId(wt.id);
                    setErrors((prev) => ({ ...prev, wasteTypeId: '' }));
                    setShowWasteTypeModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedWasteTypeId === wt.id ? COLORS.primary : COLORS.text }
                  ]}>
                    {wt.name}
                  </Text>
                  {selectedWasteTypeId === wt.id && (
                    <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showTreatmentModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTreatmentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: COLORS.border }]}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                Selecionar Tipo de Tratamento
              </Text>
              <TouchableOpacity onPress={() => setShowTreatmentModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
                <TouchableOpacity
                  key={value}
                  style={[
                    styles.modalItem,
                    treatmentType === value && { backgroundColor: COLORS.primary + '20' }
                  ]}
                  onPress={() => {
                    setTreatmentType(value as TreatmentType);
                    setShowTreatmentModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: treatmentType === value ? COLORS.primary : COLORS.text }
                  ]}>
                    {label}
                  </Text>
                  {treatmentType === value && (
                    <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        visible={showRecipientModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRecipientModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: COLORS.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: COLORS.border }]}>
              <Text style={[styles.modalTitle, { color: COLORS.text }]}>
                Selecionar Destinatário
              </Text>
              <TouchableOpacity onPress={() => setShowRecipientModal(false)}>
                <Ionicons name="close" size={28} color={COLORS.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {recipients.map((recipient) => (
                <TouchableOpacity
                  key={recipient.id}
                  style={[
                    styles.modalItem,
                    selectedRecipientId === recipient.id && { backgroundColor: COLORS.primary + '20' }
                  ]}
                  onPress={() => {
                    setSelectedRecipientId(recipient.id);
                    setErrors((prev) => ({ ...prev, recipientId: '' }));
                    setShowRecipientModal(false);
                  }}
                >
                  <Text style={[
                    styles.modalItemText,
                    { color: selectedRecipientId === recipient.id ? COLORS.primary : COLORS.text }
                  ]}>
                    {recipient.name}
                  </Text>
                  {selectedRecipientId === recipient.id && (
                    <Ionicons name="checkmark" size={24} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
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
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  selectButtonText: {
    fontSize: 16,
    flex: 1,
  },
  infoDisplay: {
    height: 56,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  infoDisplayText: {
    fontSize: 16,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 16,
    fontStyle: 'italic',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalScroll: {
    maxHeight: 400,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalItemText: {
    fontSize: 16,
    flex: 1,
  },
});

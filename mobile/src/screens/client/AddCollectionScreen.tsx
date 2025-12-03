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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../store/authStore';
import { clientService } from '../../services/client.service';
import { recipientService } from '../../services/recipient.service';
import { WeightInput } from '../../components/WeightInput';
import { WasteType, Unit, Recipient, TreatmentType, CreateCollectionInput } from '../../types';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface AddCollectionScreenProps {
  navigation: {
    goBack: () => void;
    navigate: (screen: string, params?: Record<string, unknown>) => void;
  };
  route: {
    params?: {
      photoData?: {
        uri: string;
        latitude: number;
        longitude: number;
        capturedAt: string;
      };
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

export const AddCollectionScreen: React.FC<AddCollectionScreenProps> = ({ navigation, route }) => {
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  const [collectionDate, setCollectionDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [wasteTypes, setWasteTypes] = useState<WasteType[]>([]);
  const [selectedWasteTypeId, setSelectedWasteTypeId] = useState<string>('');

  const [units, setUnits] = useState<Unit[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('');

  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');

  const [treatmentType, setTreatmentType] = useState<TreatmentType>(TreatmentType.RECYCLING);

  const [weight, setWeight] = useState<string>('');

  const [notes, setNotes] = useState<string>('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  const photoData = route.params?.photoData;

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async (): Promise<void> => {
    try {
      setLoadingData(true);

      const [wasteTypesData, unitsData, recipientsData] = await Promise.all([
        clientService.getMyWasteTypes(),
        clientService.getMyUnits(),
        recipientService.getActive(),
      ]);

      setWasteTypes(wasteTypesData);
      setUnits(unitsData);
      setRecipients(recipientsData);

      if (wasteTypesData.length === 0) {
        Alert.alert(
          'Atenção',
          'Não há tipos de resíduos configurados para seu cliente. Entre em contato com o administrador.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

      if (unitsData.length === 0) {
        Alert.alert(
          'Atenção',
          'Não há unidades configuradas para seu cliente. Entre em contato com o administrador.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

      if (recipientsData.length === 0) {
        Alert.alert(
          'Atenção',
          'Não há destinatários configurados no sistema. Entre em contato com o administrador.',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      }

      AccessibilityInfo.announceForAccessibility('Dados carregados com sucesso');
    } catch (error) {
      console.error('Error loading initial data:', error);
      Alert.alert('Erro', 'Falha ao carregar dados iniciais. Tente novamente.');
      navigation.goBack();
    } finally {
      setLoadingData(false);
    }
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

    if (!user?.clientId || !user?.id) {
      Alert.alert('Erro', 'Dados do usuário não encontrados');
      return;
    }

    try {
      setLoading(true);

      const collectionData: CreateCollectionInput = {
        clientId: user.clientId,
        unitId: selectedUnitId,
        wasteTypeId: selectedWasteTypeId,
        userId: user.id,
        recipientId: selectedRecipientId,
        collectionDate: collectionDate.toISOString(),
        treatmentType,
        notes: notes.trim() || undefined,
        latitude: photoData?.latitude,
        longitude: photoData?.longitude,
      };

      const collection = await clientService.createCollection(collectionData);

      AccessibilityInfo.announceForAccessibility('Pesagem criada com sucesso');

      Alert.alert(
        'Sucesso',
        'Pesagem registrada com sucesso!',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error: unknown) {
      console.error('Error creating collection:', error);
      const errorMessage = (error as { message?: string })?.message || 'Erro ao criar pesagem';
      Alert.alert('Erro', errorMessage);
      AccessibilityInfo.announceForAccessibility(`Erro: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
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
        accessibilityLabel="Formulário de nova pesagem"
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

        <View style={[styles.pickerContainer, { backgroundColor: COLORS.surface, borderColor: errors.wasteTypeId ? COLORS.error : COLORS.border }]}>
          <Picker
            selectedValue={selectedWasteTypeId}
            onValueChange={(value) => {
              setSelectedWasteTypeId(value);
              setErrors((prev) => ({ ...prev, wasteTypeId: '' }));
            }}
            style={[styles.picker, { color: COLORS.text }]}
            accessibilityLabel="Selecionar categoria do material"
          >
            <Picker.Item label="Selecione..." value="" />
            {wasteTypes.map((wt) => (
              <Picker.Item key={wt.id} label={wt.name} value={wt.id} />
            ))}
          </Picker>
        </View>

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

        <View style={[styles.pickerContainer, { backgroundColor: COLORS.surface, borderColor: errors.unitId ? COLORS.error : COLORS.border }]}>
          <Picker
            selectedValue={selectedUnitId}
            onValueChange={(value) => {
              setSelectedUnitId(value);
              setErrors((prev) => ({ ...prev, unitId: '' }));
            }}
            style={[styles.picker, { color: COLORS.text }]}
            accessibilityLabel="Selecionar unidade"
          >
            <Picker.Item label="Selecione..." value="" />
            {units.map((unit) => (
              <Picker.Item key={unit.id} label={unit.name} value={unit.id} />
            ))}
          </Picker>
        </View>

        {errors.unitId && (
          <Text style={[styles.errorText, { color: COLORS.error }]} accessibilityRole="alert">
            {errors.unitId}
          </Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Tipo de Tratamento
        </Text>

        <View style={[styles.pickerContainer, { backgroundColor: COLORS.surface, borderColor: COLORS.border }]}>
          <Picker
            selectedValue={treatmentType}
            onValueChange={(value) => setTreatmentType(value as TreatmentType)}
            style={[styles.picker, { color: COLORS.text }]}
            accessibilityLabel="Selecionar tipo de tratamento"
          >
            {Object.entries(TREATMENT_TYPE_LABELS).map(([value, label]) => (
              <Picker.Item key={value} label={label} value={value} />
            ))}
          </Picker>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: COLORS.text }]}>
          Destinatário
        </Text>

        <View style={[styles.pickerContainer, { backgroundColor: COLORS.surface, borderColor: errors.recipientId ? COLORS.error : COLORS.border }]}>
          <Picker
            selectedValue={selectedRecipientId}
            onValueChange={(value) => {
              setSelectedRecipientId(value);
              setErrors((prev) => ({ ...prev, recipientId: '' }));
            }}
            style={[styles.picker, { color: COLORS.text }]}
            accessibilityLabel="Selecionar destinatário"
          >
            <Picker.Item label="Selecione..." value="" />
            {recipients.map((recipient) => (
              <Picker.Item key={recipient.id} label={recipient.name} value={recipient.id} />
            ))}
          </Picker>
        </View>

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
          placeholder="0,00"
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
          placeholder="Digite observações sobre a pesagem"
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
            { backgroundColor: loading ? COLORS.border : COLORS.primary },
          ]}
          onPress={handleSubmit}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Salvar pesagem"
          accessibilityState={{ disabled: loading }}
        >
          {loading ? (
            <ActivityIndicator color={COLORS.background} />
          ) : (
            <Text style={styles.submitButtonText}>Salvar Pesagem</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: COLORS.border }]}
          onPress={() => navigation.goBack()}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Cancelar"
          accessibilityState={{ disabled: loading }}
        >
          <Text style={[styles.cancelButtonText, { color: COLORS.text }]}>
            Cancelar
          </Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
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
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  picker: {
    height: 56,
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

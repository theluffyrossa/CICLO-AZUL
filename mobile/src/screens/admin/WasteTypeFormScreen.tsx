import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, standardStyles } from '@/theme';
import {
  wasteTypeService,
  WasteType,
  CreateWasteTypeDto,
} from '@/services/wasteType.service';
import { TextInput } from '@/components/forms/TextInput';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Props {
  route: {
    params?: {
      wasteTypeId?: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const WASTE_CATEGORIES = [
  { label: 'Reciclável', value: 'recyclable' },
  { label: 'Orgânico', value: 'organic' },
  { label: 'Eletrônico', value: 'electronic' },
  { label: 'Perigoso', value: 'hazardous' },
  { label: 'Construção Civil', value: 'construction' },
  { label: 'Rejeito', value: 'waste' },
];

const UNITS = [
  { label: 'Quilograma (kg)', value: 'kg' },
  { label: 'Tonelada (t)', value: 't' },
  { label: 'Metro Cúbico (m³)', value: 'm³' },
  { label: 'Litro (L)', value: 'L' },
  { label: 'Unidade', value: 'unidade' },
];

export const WasteTypeFormScreen = ({ route, navigation }: Props): React.JSX.Element => {
  const wasteTypeId = route.params?.wasteTypeId;
  const isEditing = !!wasteTypeId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [category, setCategory] = useState('recyclable');
  const [description, setDescription] = useState('');
  const [unit, setUnit] = useState('kg');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isEditing && wasteTypeId) {
      loadWasteType(wasteTypeId);
    }
  }, [wasteTypeId]);

  const loadWasteType = async (id: string): Promise<void> => {
    try {
      const wasteType = await wasteTypeService.getById(id);
      setName(wasteType.name);
      setCategory(wasteType.category);
      setDescription(wasteType.description || '');
      setUnit(wasteType.unit);
      setActive(wasteType.active);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o tipo de resíduo');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!name.trim()) {
      Alert.alert('Atenção', 'O nome é obrigatório');
      return false;
    }

    if (!category) {
      Alert.alert('Atenção', 'A categoria é obrigatória');
      return false;
    }

    if (!unit) {
      Alert.alert('Atenção', 'A unidade é obrigatória');
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const data: CreateWasteTypeDto = {
        name: name.trim(),
        category,
        description: description.trim() || undefined,
        unit,
        active,
      };

      if (isEditing && wasteTypeId) {
        await wasteTypeService.update(wasteTypeId, data);
        Alert.alert('Sucesso', 'Tipo de resíduo atualizado com sucesso');
      } else {
        await wasteTypeService.create(data);
        Alert.alert('Sucesso', 'Tipo de resíduo criado com sucesso');
      }

      navigation.goBack();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Não foi possível salvar o tipo de resíduo';
      Alert.alert('Erro', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.neutral[900]} />
        </TouchableOpacity>
        <Text style={styles.title}>
          {isEditing ? 'Editar Tipo de Resíduo' : 'Novo Tipo de Resíduo'}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
            placeholder="Ex: Papel e Papelão"
            required
            editable={!saving}
            accessibilityLabel="Nome do tipo de resíduo"
          />

          <Select
            label="Categoria"
            value={category}
            options={WASTE_CATEGORIES}
            onValueChange={(value) => setCategory(String(value))}
            required
            editable={!saving}
          />

          <Select
            label="Unidade"
            value={unit}
            options={UNITS}
            onValueChange={(value) => setUnit(String(value))}
            required
            editable={!saving}
          />

          <TextInput
            label="Descrição"
            value={description}
            onChangeText={setDescription}
            placeholder="Breve descrição do tipo de resíduo"
            multiline
            numberOfLines={3}
            editable={!saving}
            accessibilityLabel="Descrição do tipo de resíduo"
          />

          <Switch
            label="Ativo"
            value={active}
            onValueChange={setActive}
            disabled={saving}
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Cancelar"
          onPress={() => navigation.goBack()}
          variant="outline"
          disabled={saving}
        />
        <Button
          title={isEditing ? 'Atualizar' : 'Criar'}
          onPress={handleSave}
          loading={saving}
          disabled={saving}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: spacing.xs,
  },
  title: {
    ...standardStyles.h2,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: spacing.lg,
  },
  form: {
    gap: spacing.lg,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
});

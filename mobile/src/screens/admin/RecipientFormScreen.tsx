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
  recipientService,
  Recipient,
  CreateRecipientDto,
} from '@/services/recipient.service';
import { TextInput } from '@/components/forms/TextInput';
import { Select } from '@/components/forms/Select';
import { Switch } from '@/components/forms/Switch';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

interface Props {
  route: {
    params?: {
      recipientId?: string;
    };
  };
  navigation: {
    goBack: () => void;
  };
}

const RECIPIENT_TYPES = [
  { label: 'Centro de Compostagem', value: 'composting_center' },
  { label: 'Aterro Sanitário', value: 'landfill' },
  { label: 'Associação de Reciclagem', value: 'recycling_association' },
  { label: 'Cooperativa', value: 'cooperative' },
  { label: 'Indústria', value: 'industry' },
  { label: 'Pessoa Física', value: 'individual' },
  { label: 'Outro', value: 'other' },
];

export const RecipientFormScreen = ({ route, navigation }: Props): React.JSX.Element => {
  const recipientId = route.params?.recipientId;
  const isEditing = !!recipientId;

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState('other');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  useEffect(() => {
    if (isEditing && recipientId) {
      loadRecipient(recipientId);
    }
  }, [recipientId]);

  const loadRecipient = async (id: string): Promise<void> => {
    try {
      const recipient = await recipientService.getById(id);
      setName(recipient.name);
      setType(recipient.type);
      setDocument(recipient.document || '');
      setPhone(recipient.phone || '');
      setEmail(recipient.email || '');
      setAddress(recipient.address || '');
      setCity(recipient.city || '');
      setState(recipient.state || '');
      setNotes(recipient.notes || '');
      setActive(recipient.active);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o destinatário');
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

    if (!type) {
      Alert.alert('Atenção', 'O tipo é obrigatório');
      return false;
    }

    return true;
  };

  const handleSave = async (): Promise<void> => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const data: CreateRecipientDto = {
        name: name.trim(),
        type,
        document: document.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        notes: notes.trim() || undefined,
        active,
      };

      if (isEditing && recipientId) {
        await recipientService.update(recipientId, data);
        Alert.alert('Sucesso', 'Destinatário atualizado com sucesso');
      } else {
        await recipientService.create(data);
        Alert.alert('Sucesso', 'Destinatário criado com sucesso');
      }

      navigation.goBack();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : 'Não foi possível salvar o destinatário';
      Alert.alert('Erro', errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
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
          {isEditing ? 'Editar Destinatário' : 'Novo Destinatário'}
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
            placeholder="Ex: Associação de Recicladores"
            required
            editable={!saving}
          />

          <Select
            label="Tipo"
            value={type}
            options={RECIPIENT_TYPES}
            onValueChange={(value) => setType(String(value))}
            required
            editable={!saving}
          />

          <TextInput
            label="CPF/CNPJ"
            value={document}
            onChangeText={setDocument}
            placeholder="000.000.000-00 ou 00.000.000/0000-00"
            keyboardType="numeric"
            editable={!saving}
          />

          <TextInput
            label="Telefone"
            value={phone}
            onChangeText={setPhone}
            placeholder="(00) 00000-0000"
            keyboardType="phone-pad"
            editable={!saving}
          />

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="contato@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!saving}
          />

          <TextInput
            label="Endereço"
            value={address}
            onChangeText={setAddress}
            placeholder="Rua, Número, Complemento"
            editable={!saving}
          />

          <View style={styles.row}>
            <View style={styles.flex1}>
              <TextInput
                label="Cidade"
                value={city}
                onChangeText={setCity}
                placeholder="Cidade"
                editable={!saving}
              />
            </View>
            <View style={styles.stateInput}>
              <TextInput
                label="UF"
                value={state}
                onChangeText={(text) => setState(text.toUpperCase())}
                placeholder="UF"
                maxLength={2}
                autoCapitalize="characters"
                editable={!saving}
              />
            </View>
          </View>

          <TextInput
            label="Observações"
            value={notes}
            onChangeText={setNotes}
            placeholder="Informações adicionais"
            multiline
            numberOfLines={3}
            editable={!saving}
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
  row: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  flex1: {
    flex: 1,
  },
  stateInput: {
    width: 80,
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

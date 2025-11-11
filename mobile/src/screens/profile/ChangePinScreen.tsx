import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { PinInput } from '@/components/common';
import { Button, Toast } from '@/components/common';
import { colors, spacing, typography } from '@/theme';

export const ChangePinScreen: React.FC = () => {
  const navigation = useNavigation();

  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentPin.length !== 4) newErrors.currentPin = 'Digite o PIN atual';
    if (newPin.length !== 4) newErrors.newPin = 'Digite o novo PIN';
    if (confirmPin.length !== 4) newErrors.confirmPin = 'Confirme o novo PIN';
    else if (newPin !== confirmPin) newErrors.confirmPin = 'PINs não conferem';
    else if (newPin === currentPin) newErrors.newPin = 'Novo PIN deve ser diferente do atual';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validate()) return;

    // TODO: Implementar chamada à API
    setToast({ message: 'PIN atualizado!', type: 'success' });
    AccessibilityInfo.announceForAccessibility('PIN atualizado com sucesso');

    setTimeout(() => navigation.goBack(), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.description}>
          Digite seu PIN atual e escolha um novo PIN de 4 dígitos numéricos
        </Text>

        <PinInput
          label="PIN Atual"
          value={currentPin}
          onChangeText={setCurrentPin}
          error={errors.currentPin}
          autoFocus
        />

        <PinInput
          label="Novo PIN"
          value={newPin}
          onChangeText={setNewPin}
          error={errors.newPin}
        />

        <PinInput
          label="Confirmar Novo PIN"
          value={confirmPin}
          onChangeText={setConfirmPin}
          error={errors.confirmPin}
        />

        <View style={styles.buttons}>
          <Button
            title="Concluído"
            variant="outline"
            onPress={() => navigation.goBack()}
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <Button title="Alterar PIN" variant="primary" onPress={handleSave} fullWidth />
        </View>
      </ScrollView>

      {toast && <Toast message={toast.message} type={toast.type} onHide={() => setToast(null)} />}
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
  content: {
    padding: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.neutral[600],
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  buttonSpacer: {
    width: spacing.md,
  },
});

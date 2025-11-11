import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, AccessibilityInfo } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation } from '@tanstack/react-query';

import { TextInput } from '@/components/forms';
import { Button, Toast } from '@/components/common';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing } from '@/theme';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!email.trim()) newErrors.email = 'Email é obrigatório';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email inválido';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (): Promise<void> => {
    if (!validate()) return;

    // TODO: Implementar chamada à API de atualização
    setToast({ message: 'Perfil atualizado!', type: 'success' });
    AccessibilityInfo.announceForAccessibility('Perfil atualizado com sucesso');

    setTimeout(() => navigation.goBack(), 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <TextInput
          label="Nome"
          value={name}
          onChangeText={setName}
          placeholder="Seu nome completo"
          error={errors.name}
          required
          autoCapitalize="words"
          icon="person-outline"
        />

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          placeholder="seu@email.com"
          error={errors.email}
          required
          keyboardType="email-address"
          autoCapitalize="none"
          icon="mail-outline"
        />

        <View style={styles.buttons}>
          <Button
            title="Concluído"
            variant="outline"
            onPress={() => navigation.goBack()}
            fullWidth
          />
          <View style={styles.buttonSpacer} />
          <Button title="Salvar" variant="primary" onPress={handleSave} fullWidth />
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
  buttons: {
    flexDirection: 'row',
    marginTop: spacing.lg,
  },
  buttonSpacer: {
    width: spacing.md,
  },
});

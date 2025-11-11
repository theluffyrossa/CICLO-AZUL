import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  AccessibilityInfo,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PinInput } from '@/components/common/PinInput';
import { Select } from '@/components/forms/Select';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, standardStyles } from '@/theme';

interface DemoUser {
  id: string;
  email: string;
  pin: string;
  role: string;
  name: string;
}

const DEMO_USERS: DemoUser[] = [
  {
    id: '1',
    email: 'admin@cicloazul.com',
    pin: '1234',
    role: 'Admin',
    name: 'Administrador'
  },
  {
    id: '2',
    email: 'operator@cicloazul.com',
    pin: '5678',
    role: 'Operador',
    name: 'João Silva'
  },
];

export const LoginScreen = (): JSX.Element => {
  const [selectedUserId, setSelectedUserId] = useState<string>('1');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const { login, isLoading } = useAuthStore();

  const selectedUser = DEMO_USERS.find(u => u.id === selectedUserId) || DEMO_USERS[0];

  const handlePinComplete = async (completedPin: string): Promise<void> => {
    try {
      setError('');
      await login(selectedUser.email, completedPin);
      AccessibilityInfo.announceForAccessibility('Login realizado com sucesso');
    } catch (err) {
      const errorMsg = 'PIN incorreto. Tente novamente.';
      setError(errorMsg);
      setPin('');
      AccessibilityInfo.announceForAccessibility(errorMsg);
      Alert.alert(
        'Erro no Login',
        errorMsg,
        [{ text: 'OK', onPress: () => AccessibilityInfo.setAccessibilityFocus }]
      );
    }
  };

  const handleUserChange = (userId: string | number): void => {
    const newUser = DEMO_USERS.find(u => u.id === String(userId));
    if (!newUser) return;

    setSelectedUserId(String(userId));
    setPin('');
    setError('');
    AccessibilityInfo.announceForAccessibility(
      `Usuário selecionado: ${newUser.name} - ${newUser.role}`
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View
              style={styles.iconContainer}
              accessible={true}
              accessibilityLabel="Logo CICLO AZUL"
              accessibilityRole="image"
            >
              <Ionicons name="leaf" size={64} color={colors.primary[600]} />
            </View>

            <Text
              style={styles.title}
              accessible={true}
              accessibilityRole="header"
              accessibilityLabel="CICLO AZUL"
            >
              CICLO AZUL
            </Text>

            <Text
              style={styles.subtitle}
              accessibilityLabel="Sistema de Gestão de Resíduos Sólidos"
            >
              Gestão de Resíduos Sólidos
            </Text>
          </View>

          <View style={styles.form}>
            <Select
              label="Selecione o Usuário"
              value={selectedUserId}
              options={DEMO_USERS.map(user => ({
                label: `${user.name} (${user.role})`,
                value: user.id,
              }))}
              onValueChange={handleUserChange}
              required
              placeholder="Escolha um usuário"
              centerLabel
            />

            <View style={styles.pinSection}>
              <PinInput
                length={4}
                value={pin}
                onChangeText={setPin}
                onComplete={handlePinComplete}
                error={error}
                label="Digite seu PIN"
                autoFocus={false}
              />
            </View>
          </View>

          <View
            style={styles.footer}
            accessible={true}
            accessibilityRole="text"
          >
            <Ionicons name="information-circle" size={20} color={colors.primary[600]} />
            <Text style={styles.footerText}>
              App acessível com suporte a leitores de tela
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['2xl'],
  },
  iconContainer: {
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...standardStyles.secondaryText,
    textAlign: 'center',
  },
  form: {
    gap: spacing.xl,
  },
  pinSection: {
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
  footerText: {
    ...standardStyles.secondaryText,
    fontSize: 12,
  },
});

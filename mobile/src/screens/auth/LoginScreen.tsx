import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  AccessibilityInfo,
  Image,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { PinInput } from '@/components/common/PinInput';
import { TextInput } from '@/components/forms/TextInput';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing, borderRadius, shadows } from '@/theme';

const { width } = Dimensions.get('window');

export const LoginScreen = (): React.JSX.Element => {
  const [username, setUsername] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const { login, isLoading } = useAuthStore();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePinComplete = async (completedPin: string): Promise<void> => {
    if (!username.trim()) {
      const errorMsg = 'Por favor, digite seu usuário.';
      setError(errorMsg);
      AccessibilityInfo.announceForAccessibility(errorMsg);
      Alert.alert('Usuário Obrigatório', errorMsg);
      return;
    }

    try {
      setError('');
      await login(username.trim(), completedPin);
      AccessibilityInfo.announceForAccessibility('Login realizado com sucesso');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao fazer login. Verifique suas credenciais.';
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

  const handleUsernameChange = (text: string): void => {
    setUsername(text);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.backgroundPattern}>
        <View style={[styles.circle, styles.circleTop]} />
        <View style={[styles.circle, styles.circleBottom]} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.header,
              {
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }]
              }
            ]}
          >
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible={true}
                accessibilityLabel="Logo CICLO AZUL - Meio Ambiente e Sustentabilidade"
                accessibilityRole="image"
              />
            </View>
            <Text style={styles.welcomeText}>Bem-vindo de volta</Text>
            <Text style={styles.subtitleText}>Entre com suas credenciais para continuar</Text>
          </Animated.View>

          <Animated.View
            style={[
              styles.formCard,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <View style={styles.labelContainer}>
                  <Ionicons name="person-outline" size={18} color={colors.primary[600]} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Usuário</Text>
                </View>
                <TextInput
                  label=""
                  value={username}
                  onChangeText={handleUsernameChange}
                  placeholder="Seu nome de usuário"
                  autoCapitalize="none"
                  textContentType="username"
                  editable={!isLoading}
                  accessibilityLabel="Campo de usuário"
                  accessibilityHint="Digite seu nome de usuário para acessar o sistema"
                />
              </View>

              <View style={styles.pinSection}>
                <View style={styles.labelContainer}>
                  <Ionicons name="lock-closed-outline" size={18} color={colors.primary[600]} style={styles.labelIcon} />
                  <Text style={styles.inputLabel}>Código de Acesso</Text>
                </View>
                <PinInput
                  length={4}
                  value={pin}
                  onChangeText={setPin}
                  onComplete={handlePinComplete}
                  error={error}
                  label=""
                  autoFocus={false}
                />
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.footer,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.securityBadge}>
              <Ionicons name="shield-checkmark" size={16} color={colors.primary[600]} />
              <Text style={styles.securityText}>Conexão segura</Text>
            </View>
            <View style={styles.accessibilityBadge}>
              <Ionicons name="accessibility" size={16} color={colors.text.tertiary} />
              <Text style={styles.footerText}>
                Suporte a leitores de tela
              </Text>
            </View>
          </Animated.View>
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
  backgroundPattern: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  circle: {
    position: 'absolute',
    borderRadius: 9999,
    opacity: 0.03,
  },
  circleTop: {
    width: width * 1.2,
    height: width * 1.2,
    backgroundColor: colors.primary[500],
    top: -width * 0.6,
    right: -width * 0.3,
  },
  circleBottom: {
    width: width * 0.8,
    height: width * 0.8,
    backgroundColor: colors.secondary[400],
    bottom: -width * 0.4,
    left: -width * 0.2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing['6'],
    paddingVertical: spacing['8'],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing['8'],
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing['6'],
  },
  logo: {
    width: 240,
    height: 100,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
    marginTop: spacing['4'],
    marginBottom: spacing['2'],
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 15,
    fontWeight: '400',
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  formCard: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.xl,
    padding: spacing['6'],
    ...shadows.md,
    marginBottom: spacing['6'],
  },
  form: {
    gap: spacing['6'],
  },
  inputGroup: {
    gap: 1,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingHorizontal: spacing['1'],
    marginBottom: 1,
  },
  labelIcon: {
    marginBottom: 1,
  },
  inputLabel: {
    fontSize: 22,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.6,
  },
  pinSection: {
    gap: spacing['5'],
  },
  footer: {
    alignItems: 'center',
    gap: spacing['4'],
    marginTop: spacing['8'],
    paddingHorizontal: spacing['4'],
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['2'],
    paddingHorizontal: spacing['4'],
    backgroundColor: colors.primary[50],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  securityText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary[700],
  },
  accessibilityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing['2'],
    paddingVertical: spacing['4'],
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.text.tertiary,
    textAlign: 'center',
  },
});

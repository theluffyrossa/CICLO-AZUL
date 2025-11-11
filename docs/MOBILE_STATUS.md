# 📱 CICLO AZUL - Status do Aplicativo Mobile

## ✅ O QUE FOI CRIADO

### **1. Estrutura do Projeto Expo**
- ✅ `package.json` - Configurado com todas as dependências
- ✅ `app.json` - Configuração do Expo com permissões
- ✅ `tsconfig.json` - TypeScript configurado com paths
- ✅ `.env.example` - Template de variáveis de ambiente

### **2. Sistema de Design (Theme)**
- ✅ `src/theme/colors.ts` - Paleta completa de cores
- ✅ `src/theme/typography.ts` - Tipografia e tamanhos
- ✅ `src/theme/spacing.ts` - Espaçamentos e shadows
- ✅ `src/theme/index.ts` - Exportação unificada

### **3. TypeScript Types**
- ✅ `src/types/index.ts` - Todas as interfaces:
  - User, AuthResponse
  - Client, Unit, WasteType
  - Collection, GravimetricData, Image
  - DashboardData
  - Enums (UserRole, CollectionStatus, WasteCategory)

### **4. Camada de Serviços (API)**
- ✅ `src/services/api.service.ts` - Axios com interceptors
  - Refresh token automático
  - Storage seguro (SecureStore)
  - Timeout e retries
- ✅ `src/services/auth.service.ts` - Login, logout, getMe
- ✅ `src/services/collections.service.ts` - CRUD de coletas
- ✅ `src/services/clients.service.ts` - Listar clientes

---

## 📦 Dependências Instaladas

O `package.json` já inclui:

### **Core**
- `expo` ~50.0.17
- `react` 18.2.0
- `react-native` 0.73.6

### **Navegação**
- `@react-navigation/native`
- `@react-navigation/stack`
- `@react-navigation/bottom-tabs`
- `react-native-screens`
- `react-native-safe-area-context`

### **State & Data**
- `zustand` - State management
- `@tanstack/react-query` - Server state
- `axios` - HTTP client

### **Câmera & Localização**
- `expo-camera`
- `expo-image-picker`
- `expo-location`
- `expo-file-system`

### **UI & Charts**
- `react-native-chart-kit` - Gráficos
- `react-native-svg` - SVG support
- `@expo/vector-icons` - Ícones

### **Forms**
- `react-hook-form` - Gerenciamento de forms
- `zod` - Validação
- `@hookform/resolvers` - Integração

### **Utils**
- `date-fns` - Manipulação de datas
- `expo-secure-store` - Storage seguro

---

## 🚀 Próximos Passos

### **Passo 1: Instalar Dependências**

```bash
cd mobile
npm install
```

### **Passo 2: Configurar Variável de Ambiente**

```bash
cp .env.example .env
```

Editar `.env` com o IP da sua máquina (se testar em dispositivo físico):
```env
API_URL=http://192.168.1.100:3000/api
```

### **Passo 3: Criar Componentes Base**

Criar em `src/components/`:

#### `Button.tsx` - Botão reutilizável
```typescript
import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  loading,
  disabled,
  variant = 'primary',
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryButton,
        variant === 'secondary' && styles.secondaryButton,
        variant === 'outline' && styles.outlineButton,
        (disabled || loading) && styles.disabledButton,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator color={colors.white} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  primaryButton: {
    backgroundColor: colors.primary[600],
  },
  secondaryButton: {
    backgroundColor: colors.secondary[600],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary[600],
  },
  disabledButton: {
    opacity: 0.5,
  },
  text: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: colors.primary[600],
  },
});
```

#### `Input.tsx` - Campo de texto
```typescript
import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius } from '@/theme';

interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric';
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        placeholderTextColor={colors.gray[400]}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray[300],
    borderRadius: borderRadius.base,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: 16,
    color: colors.text.primary,
    backgroundColor: colors.white,
    minHeight: 48,
  },
  inputError: {
    borderColor: colors.error.main,
  },
  errorText: {
    fontSize: 12,
    color: colors.error.main,
    marginTop: spacing.xs,
  },
});
```

### **Passo 4: Criar Store com Zustand**

Criar `src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  login: async (email, password) => {
    const { user } = await authService.login(email, password);
    set({ user, isAuthenticated: true });
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  checkAuth: async () => {
    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getMe();
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
```

### **Passo 5: Criar Navegação**

Criar `src/navigation/AppNavigator.tsx`:

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';

// Importar screens (criar depois)
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { DashboardScreen } from '@/screens/dashboard/DashboardScreen';
import { CollectionsScreen } from '@/screens/collections/CollectionsScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Collections') {
            iconName = focused ? 'list' : 'list-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary[600],
        tabBarInactiveTintColor: colors.gray[500],
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Collections" component={CollectionsScreen} />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
```

### **Passo 6: Criar Tela de Login**

Criar `src/screens/auth/LoginScreen.tsx`:

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuthStore } from '@/store/authStore';
import { colors, spacing } from '@/theme';

export const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      Alert.alert('Erro', 'Email ou senha inválidos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.content}>
        <Text style={styles.title}>CICLO AZUL</Text>
        <Text style={styles.subtitle}>Gestão de Resíduos Sólidos</Text>

        <View style={styles.form}>
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            keyboardType="email-address"
          />

          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
          />

          <Button
            title="Entrar"
            onPress={handleLogin}
            loading={loading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.default,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary[700],
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['2xl'],
  },
  form: {
    marginTop: spacing.lg,
  },
});
```

### **Passo 7: Criar App.tsx**

Criar `App.tsx` na raiz de `mobile/`:

```typescript
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuthStore } from './src/store/authStore';

const queryClient = new QueryClient();

export default function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <AppNavigator />
    </QueryClientProvider>
  );
}
```

---

## 🧪 Testar o App

```bash
# Iniciar o app
cd mobile
npm start

# Ou diretamente no Android/iOS
npm run android
npm run ios
```

**Credenciais de teste:**
- Email: `operator@cicloazul.com`
- Senha: `operator123`

---

## 📋 Checklist do Mobile

### ✅ Criado
- [x] Estrutura do projeto
- [x] Sistema de tema
- [x] TypeScript types
- [x] Serviços de API
- [x] Guia de implementação

### 🚧 Próximo
- [ ] Componentes base (Button, Input, Card)
- [ ] Store de autenticação
- [ ] Navegação
- [ ] Tela de login
- [ ] Tela de dashboard
- [ ] Tela de coletas
- [ ] Integração com câmera
- [ ] Upload de imagens

---

## 📚 Recursos Úteis

- [Expo Docs](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [React Native](https://reactnative.dev/)
- [Zustand](https://zustand-demo.pmnd.rs/)
- [React Query](https://tanstack.com/query/latest)

---

**Status:** Estrutura base criada, pronto para desenvolvimento das telas! 🚀

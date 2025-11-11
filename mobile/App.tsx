import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import { useSettingsStore } from './src/store/settingsStore';
import { AccessibilityInfo, Platform } from 'react-native';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30000,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App(): JSX.Element {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loadSettings = useSettingsStore((state) => state.loadFromStorage);

  useEffect(() => {
    checkAuth();
    loadSettings();

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      AccessibilityInfo.announceForAccessibility(
        'CICLO AZUL - Aplicativo iniciado. Sistema de Gestão de Resíduos Sólidos'
      );
    }
  }, [checkAuth, loadSettings]);

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style="auto" />
      <AppNavigator />
    </QueryClientProvider>
  );
}

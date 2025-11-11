import Constants from 'expo-constants';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  isProduction: boolean;
}

const getApiBaseUrl = (): string => {
  const expoExtra = Constants.expoConfig?.extra;

  // Em produção, usa a URL configurada
  if (expoExtra?.nodeEnv === 'production' && expoExtra?.apiUrl) {
    return expoExtra.apiUrl;
  }

  // Em desenvolvimento, usa detecção automática
  // Expo fornece o IP do servidor através de debuggerHost
  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    // Remove a porta do debugger e usa porta 3000 do backend
    const host = debuggerHost.split(':')[0];
    const backendUrl = `http://${host}:3000/api`;

    console.log('[API Config] Auto-detected backend URL:', backendUrl);
    return backendUrl;
  }

  // Fallback para configuração manual
  if (expoExtra?.apiUrl) {
    return expoExtra.apiUrl;
  }

  // Último fallback: localhost (funciona em simulador iOS)
  const fallbackUrl = 'http://localhost:3000/api';
  console.warn('[API Config] Using fallback URL:', fallbackUrl);
  return fallbackUrl;
};

const isProductionEnv = (): boolean => {
  return Constants.expoConfig?.extra?.nodeEnv === 'production';
};

export const apiConfig: ApiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  isProduction: isProductionEnv(),
};

// Log em desenvolvimento para debugging
if (__DEV__) {
  console.log('[API Config] Configuration:', {
    baseURL: apiConfig.baseURL,
    isProduction: apiConfig.isProduction,
    hostUri: Constants.expoConfig?.hostUri,
  });
}

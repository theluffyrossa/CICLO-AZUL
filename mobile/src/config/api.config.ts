import Constants from 'expo-constants';
import { logger } from '../utils/logger.util';

interface ApiConfig {
  baseURL: string;
  timeout: number;
  isProduction: boolean;
}

const getApiBaseUrl = (): string => {
  const expoExtra = Constants.expoConfig?.extra;

  logger.info('Iniciando configuração de API', {
    nodeEnv: expoExtra?.nodeEnv,
    hasApiUrl: !!expoExtra?.apiUrl,
    hostUri: Constants.expoConfig?.hostUri,
  });

  if (expoExtra?.nodeEnv === 'production' && expoExtra?.apiUrl) {
    logger.info('Usando URL de produção', { url: expoExtra.apiUrl });
    return expoExtra.apiUrl;
  }

  const debuggerHost = Constants.expoConfig?.hostUri;

  if (debuggerHost) {
    const host = debuggerHost.split(':')[0];
    const backendUrl = `http://${host}:3000/api`;
    logger.info('URL auto-detectada', { url: backendUrl, debuggerHost });
    return backendUrl;
  }

  if (expoExtra?.apiUrl) {
    logger.info('Usando API_URL do .env', { url: expoExtra.apiUrl });
    return expoExtra.apiUrl;
  }

  const fallbackUrl = 'http://localhost:3000/api';
  logger.warn('Usando URL fallback', { url: fallbackUrl });
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

logger.info('API Config inicializada', {
  baseURL: apiConfig.baseURL,
  isProduction: apiConfig.isProduction,
  timeout: apiConfig.timeout,
});

import axios, { AxiosInstance, AxiosError } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { apiConfig } from '@/config/api.config';
import { logger } from '@/utils/logger.util';

const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    logger.info('Inicializando ApiService', { baseURL: apiConfig.baseURL });

    this.api = axios.create({
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    this.api.interceptors.request.use(
      async (config) => {
        const token = await SecureStore.getItemAsync(TOKEN_KEY);
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        logger.debug('Request', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          hasToken: !!token,
        });

        return config;
      },
      (error) => {
        logger.error('Request Error', {
          message: error.message,
          code: error.code,
        });
        return Promise.reject(error);
      }
    );

    this.api.interceptors.response.use(
      (response) => {
        logger.debug('Response Success', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      async (error: AxiosError<{ message?: string; error?: string }>) => {
        const originalRequest = error.config as any;

        const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;

        logger.error('Response Error', {
          status: error.response?.status,
          message: errorMessage,
          code: error.code,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });

        if (error.response?.status === 401 && !originalRequest._retry) {
          const isLoginRequest = error.config?.url?.includes('/auth/login');

          if (isLoginRequest) {
            const customError = new Error(errorMessage);
            (customError as any).response = error.response;
            return Promise.reject(customError);
          }

          originalRequest._retry = true;
          logger.info('Tentando refresh token');

          try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (refreshToken) {
              const response = await axios.post(`${apiConfig.baseURL}/auth/refresh`, {
                refreshToken,
              });

              const { accessToken, refreshToken: newRefreshToken } = response.data.data;

              await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
              await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, newRefreshToken);

              logger.info('Token refreshed com sucesso');

              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            logger.error('Erro ao fazer refresh do token', refreshError);
            await this.clearTokens();
            return Promise.reject(refreshError);
          }
        }

        const customError = new Error(errorMessage);
        (customError as any).response = error.response;
        return Promise.reject(customError);
      }
    );
  }

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
  }

  async clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
  }

  async getToken(): Promise<string | null> {
    return SecureStore.getItemAsync(TOKEN_KEY);
  }

  getApi(): AxiosInstance {
    return this.api;
  }

  getApiUrl(): string {
    return apiConfig.baseURL;
  }
}

export const apiService = new ApiService();
export const api = apiService.getApi();

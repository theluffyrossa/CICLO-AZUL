import { api, apiService } from './api.service';
import { AuthResponse, User, ApiResponse } from '@/types';
import { logger } from '@/utils/logger.util';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    logger.info('Tentando fazer login', { username });

    try {
      const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
        username,
        password,
      });

      logger.info('Resposta de login recebida', {
        status: response.status,
        hasData: !!response.data.data,
      });

      const { data } = response.data;
      if (!data) {
        logger.error('Resposta inválida do servidor', response.data);
        throw new Error('Invalid response');
      }

      await apiService.saveTokens(data.accessToken, data.refreshToken);
      logger.info('Login realizado com sucesso', { userId: data.user.id });
      return data;
    } catch (error) {
      logger.error('Erro no login', {
        error: error instanceof Error ? error.message : 'Unknown error',
        username,
      });
      throw error;
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      await apiService.clearTokens();
    }
  },

  async getMe(): Promise<User> {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getToken();
    return !!token;
  },
};

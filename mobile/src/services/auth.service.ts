import { api, apiService } from './api.service';
import { AuthResponse, User, ApiResponse } from '@/types';

export const authService = {
  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      username,
      password,
    });

    const { data } = response.data;
    if (!data) throw new Error('Invalid response');

    await apiService.saveTokens(data.accessToken, data.refreshToken);
    return data;
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

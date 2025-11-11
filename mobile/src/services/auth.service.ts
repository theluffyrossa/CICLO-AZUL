import { api, apiService } from './api.service';
import { AuthResponse, User, ApiResponse } from '@/types';

// Demo users for development
const DEMO_USERS = [
  {
    id: '1',
    email: 'admin@cicloazul.com',
    password: '1234',
    role: 'admin',
    name: 'Administrador'
  },
  {
    id: '2',
    email: 'operator@cicloazul.com',
    password: '5678',
    role: 'operator',
    name: 'João Silva'
  },
];

const USE_MOCK_AUTH = false; // Set to false when backend is ready

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    // Mock authentication for development
    if (USE_MOCK_AUTH) {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password);

      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      const mockTokens = {
        accessToken: `mock_access_token_${user.id}`,
        refreshToken: `mock_refresh_token_${user.id}`,
      };

      await apiService.saveTokens(mockTokens.accessToken, mockTokens.refreshToken);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        accessToken: mockTokens.accessToken,
        refreshToken: mockTokens.refreshToken,
      };
    }

    // Real API authentication
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
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

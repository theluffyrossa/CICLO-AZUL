import api from './api.service';
import type { ApiResponse, PaginatedResponse, User, UserRole } from '../types';

export interface GetUsersFilters {
  role?: UserRole;
  search?: string;
  page?: number;
  limit?: number;
}

export const usersService = {
  async getUsers(filters?: GetUsersFilters): Promise<PaginatedResponse<User>> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: filters,
    });
    return response.data.data!;
  },

  async getOperators(): Promise<User[]> {
    const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/users', {
      params: {
        role: 'OPERATOR',
        limit: 100,
      },
    });
    return response.data.data?.items || [];
  },

  async getUserById(id: string): Promise<User> {
    const response = await api.get<ApiResponse<User>>(`/users/${id}`);
    return response.data.data!;
  },

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
    return response.data.data!;
  },

  async deleteUser(id: string): Promise<void> {
    await api.delete(`/users/${id}`);
  },
};

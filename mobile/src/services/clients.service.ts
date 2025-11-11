import { api } from './api.service';
import { Client, PaginatedResponse, ApiResponse } from '@/types';

interface ClientFilters {
  search?: string;
  active?: boolean;
  page?: number;
  limit?: number;
}

export const clientsService = {
  async getClients(filters?: ClientFilters): Promise<PaginatedResponse<Client>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Client>>>('/clients', {
      params: filters,
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getClientById(id: string): Promise<Client> {
    const response = await api.get<ApiResponse<Client>>(`/clients/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },
};

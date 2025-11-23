import { api } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface WasteType {
  id: string;
  name: string;
  category: string;
  description?: string;
  unit: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWasteTypeDto {
  name: string;
  category: string;
  description?: string;
  unit: string;
  active?: boolean;
}

export interface UpdateWasteTypeDto {
  name?: string;
  category?: string;
  description?: string;
  unit?: string;
  active?: boolean;
}

export interface WasteTypeFilters {
  page?: number;
  limit?: number;
  active?: boolean;
  category?: string;
  search?: string;
}

export const wasteTypeService = {
  async getAll(filters?: WasteTypeFilters): Promise<PaginatedResponse<WasteType>> {
    const response = await api.get<ApiResponse<PaginatedResponse<WasteType>>>('/waste-types', {
      params: filters,
    });

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getAllActive(): Promise<WasteType[]> {
    const response = await api.get<ApiResponse<WasteType[]>>('/waste-types/active');

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getById(id: string): Promise<WasteType> {
    const response = await api.get<ApiResponse<WasteType>>(`/waste-types/${id}`);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async create(data: CreateWasteTypeDto): Promise<WasteType> {
    const response = await api.post<ApiResponse<WasteType>>('/waste-types', data);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async update(id: string, data: UpdateWasteTypeDto): Promise<WasteType> {
    const response = await api.put<ApiResponse<WasteType>>(`/waste-types/${id}`, data);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/waste-types/${id}`);
  },
};

import { api } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface WasteType {
  id: string;
  name: string;
  description?: string;
  category: string;
  unit?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWasteTypeData {
  name: string;
  description?: string;
  category: string;
  unit?: string;
}

export interface UpdateWasteTypeData extends Partial<CreateWasteTypeData> {
  active?: boolean;
}

export interface WasteTypesFilters {
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class WasteTypesService {
  async getWasteTypes(filters?: WasteTypesFilters): Promise<PaginatedResponse<WasteType>> {
    const response = await api.get<ApiResponse<PaginatedResponse<WasteType>>>('/waste-types', { params: filters });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async getWasteTypeById(id: string): Promise<WasteType> {
    const response = await api.get<ApiResponse<WasteType>>(`/waste-types/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async createWasteType(data: CreateWasteTypeData): Promise<WasteType> {
    const response = await api.post<ApiResponse<WasteType>>('/waste-types', data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async updateWasteType(id: string, data: UpdateWasteTypeData): Promise<WasteType> {
    const response = await api.put<ApiResponse<WasteType>>(`/waste-types/${id}`, data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async deleteWasteType(id: string): Promise<void> {
    await api.delete(`/waste-types/${id}`);
  }
}

export const wasteTypesService = new WasteTypesService();

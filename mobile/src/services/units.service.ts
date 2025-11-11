import { api } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface Unit {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  clientId: string;
  client?: {
    id: string;
    name: string;
  };
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUnitData {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  clientId: string;
}

export interface UpdateUnitData extends Partial<CreateUnitData> {
  active?: boolean;
}

export interface UnitsFilters {
  clientId?: string;
  active?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

class UnitsService {
  async getUnits(filters?: UnitsFilters): Promise<PaginatedResponse<Unit>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Unit>>>('/units', { params: filters });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async getUnitById(id: string): Promise<Unit> {
    const response = await api.get<ApiResponse<Unit>>(`/units/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async createUnit(data: CreateUnitData): Promise<Unit> {
    const response = await api.post<ApiResponse<Unit>>('/units', data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async updateUnit(id: string, data: UpdateUnitData): Promise<Unit> {
    const response = await api.put<ApiResponse<Unit>>(`/units/${id}`, data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  async deleteUnit(id: string): Promise<void> {
    await api.delete(`/units/${id}`);
  }
}

export const unitsService = new UnitsService();

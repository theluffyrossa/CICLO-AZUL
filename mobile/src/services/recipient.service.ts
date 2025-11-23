import { api } from './api.service';
import { ApiResponse, PaginatedResponse } from '@/types';

export interface Recipient {
  id: string;
  name: string;
  type: string;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  acceptedWasteTypes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecipientDto {
  name: string;
  type: string;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  acceptedWasteTypes?: string;
  active?: boolean;
}

export interface UpdateRecipientDto {
  name?: string;
  type?: string;
  document?: string;
  secondaryDocument?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  notes?: string;
  acceptedWasteTypes?: string;
  active?: boolean;
}

export interface RecipientFilters {
  page?: number;
  limit?: number;
  active?: boolean;
  type?: string;
  search?: string;
  city?: string;
  state?: string;
}

export const recipientService = {
  async getAll(filters?: RecipientFilters): Promise<PaginatedResponse<Recipient>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Recipient>>>('/recipients', {
      params: filters,
    });

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getActive(): Promise<Recipient[]> {
    const response = await api.get<ApiResponse<Recipient[]>>('/recipients/active');

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getById(id: string): Promise<Recipient> {
    const response = await api.get<ApiResponse<Recipient>>(`/recipients/${id}`);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async create(data: CreateRecipientDto): Promise<Recipient> {
    const response = await api.post<ApiResponse<Recipient>>('/recipients', data);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async update(id: string, data: UpdateRecipientDto): Promise<Recipient> {
    const response = await api.put<ApiResponse<Recipient>>(`/recipients/${id}`, data);

    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/recipients/${id}`);
  },
};

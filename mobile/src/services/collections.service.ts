import { api } from './api.service';
import { Collection, PaginatedResponse, ApiResponse, CollectionStatus } from '@/types';

interface CreateCollectionData {
  clientId: string;
  unitId: string;
  wasteTypeId: string;
  userId: string;
  recipientId: string;
  collectionDate: string;
  status?: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

interface CollectionFilters {
  clientId?: string;
  unitId?: string;
  wasteTypeId?: string;
  status?: CollectionStatus;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export const collectionsService = {
  async getCollections(filters?: CollectionFilters): Promise<PaginatedResponse<Collection>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Collection>>>('/collections', {
      params: filters,
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async getCollectionById(id: string): Promise<Collection> {
    const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async createCollection(data: CreateCollectionData): Promise<Collection> {
    const response = await api.post<ApiResponse<Collection>>('/collections', data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async updateCollection(id: string, data: Partial<CreateCollectionData>): Promise<Collection> {
    const response = await api.put<ApiResponse<Collection>>(`/collections/${id}`, data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async deleteCollection(id: string): Promise<void> {
    await api.delete(`/collections/${id}`);
  },
};

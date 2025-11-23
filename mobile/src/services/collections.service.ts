import { api } from './api.service';
import { Collection, PaginatedResponse, ApiResponse, CollectionStatus, ApprovalStatus } from '@/types';

interface CreateCollectionData {
  clientId: string;
  unitId: string;
  wasteTypeId: string;
  userId: string;
  recipientId: string;
  treatmentType: string;
  collectionDate: string;
  status?: CollectionStatus;
  notes?: string;
  latitude?: number;
  longitude?: number;
  metadata?: Record<string, unknown>;
}

interface CollectionFilters {
  clientId?: string;
  unitId?: string;
  wasteTypeId?: string;
  status?: CollectionStatus;
  approvalStatus?: ApprovalStatus;
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

  async getPendingCollections(page?: number, limit?: number): Promise<PaginatedResponse<Collection>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Collection>>>('/collections/pending/list', {
      params: { page, limit },
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async approveCollection(id: string): Promise<Collection> {
    const response = await api.patch<ApiResponse<Collection>>(`/collections/${id}/approve`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },

  async rejectCollection(id: string, rejectionReason: string): Promise<Collection> {
    const response = await api.patch<ApiResponse<Collection>>(`/collections/${id}/reject`, {
      rejectionReason,
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  },
};

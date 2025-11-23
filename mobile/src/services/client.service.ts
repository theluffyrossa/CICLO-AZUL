import { api } from './api.service';
import { Client, Collection, PaginatedResponse, DashboardData, WasteType, CreateCollectionInput, ApiResponse } from '../types';

export interface ClientStatistics {
  totalCollections: number;
  totalWeightKg: number;
  monthlyAverage: number;
  wasteTypeDistribution: {
    wasteTypeName: string;
    category: string;
    totalWeightKg: number;
    percentage: number;
  }[];
}

class ClientService {
  /**
   * Get logged-in client's profile
   */
  async getMyProfile(): Promise<Client> {
    const response = await api.get<ApiResponse<Client>>('/clients/me');
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Get logged-in client's collections with pagination and filters
   */
  async getMyCollections(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    wasteTypeId?: string;
    status?: string;
  }): Promise<PaginatedResponse<Collection>> {
    const response = await api.get<ApiResponse<PaginatedResponse<Collection>>>('/collections', {
      params,
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Get a specific collection by ID
   */
  async getCollectionById(id: string): Promise<Collection> {
    const response = await api.get<ApiResponse<Collection>>(`/collections/${id}`);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Get logged-in client's statistics
   */
  async getMyStatistics(params?: {
    startDate?: string;
    endDate?: string;
  }): Promise<DashboardData> {
    const response = await api.get<ApiResponse<DashboardData>>('/dashboard', {
      params,
    });
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Get logged-in client's collection points (units)
   */
  async getMyUnits(): Promise<any[]> {
    const response = await api.get<ApiResponse<PaginatedResponse<any>>>('/units');
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data.data;
  }

  /**
   * Update client profile (limited fields)
   */
  async updateMyProfile(data: {
    phone?: string;
    email?: string;
  }): Promise<Client> {
    const response = await api.patch<ApiResponse<Client>>('/clients/me/profile', data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Get waste types assigned to logged-in client
   */
  async getMyWasteTypes(): Promise<WasteType[]> {
    const response = await api.get<ApiResponse<WasteType[]>>('/dashboard/my-waste-types');
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }

  /**
   * Create a new collection
   */
  async createCollection(data: CreateCollectionInput): Promise<Collection> {
    const response = await api.post<ApiResponse<Collection>>('/collections', data);
    if (!response.data.data) throw new Error('Invalid response');
    return response.data.data;
  }
}

export const clientService = new ClientService();

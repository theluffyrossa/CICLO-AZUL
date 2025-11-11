import { api } from './api.service';
import {
  ApiResponse,
  GravimetricData,
  CreateGravimetricDataInput,
} from '@/types';
import { toNumber } from '@/utils/numbers';

interface UpdateGravimetricDataInput {
  weightKg?: number;
  source?: string;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

class GravimetricDataService {
  async getByCollection(collectionId: string): Promise<GravimetricData[]> {
    const response = await api.get<ApiResponse<GravimetricData[]>>(
      `/gravimetric-data/collection/${collectionId}`
    );
    const data = response.data.data || [];

    return data.map(item => ({
      ...item,
      weightKg: toNumber(item.weightKg, 0),
    }));
  }

  async create(data: CreateGravimetricDataInput): Promise<GravimetricData> {
    const response = await api.post<ApiResponse<GravimetricData>>('/gravimetric-data', data);

    if (!response.data.data) {
      throw new Error('Falha ao criar dados gravimétricos');
    }

    const result = response.data.data;

    return {
      ...result,
      weightKg: toNumber(result.weightKg, 0),
    };
  }

  async update(
    id: string,
    data: UpdateGravimetricDataInput
  ): Promise<GravimetricData> {
    const response = await api.put<ApiResponse<GravimetricData>>(
      `/gravimetric-data/${id}`,
      data
    );

    if (!response.data.data) {
      throw new Error('Falha ao atualizar dados gravimétricos');
    }

    const result = response.data.data;

    return {
      ...result,
      weightKg: toNumber(result.weightKg, 0),
    };
  }

  async delete(id: string): Promise<void> {
    await api.delete(`/gravimetric-data/${id}`);
  }
}

export const gravimetricDataService = new GravimetricDataService();

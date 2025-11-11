import api from './api.service';
import type { ApiResponse } from '../types';

export interface ScaleWeightData {
  weightKg: number;
  timestamp: string;
  deviceId?: string;
  unit?: string;
}

export interface ScaleConnectionInfo {
  deviceId: string;
  deviceName: string;
  connected: boolean;
  lastReading?: ScaleWeightData;
}

export const scalesService = {
  /**
   * Send weight data from a connected scale
   * This endpoint receives real-time weight data from digital scales
   */
  async sendWeightData(data: {
    weightKg: number;
    deviceId?: string;
    collectionId?: number;
  }): Promise<ScaleWeightData> {
    const response = await api.post<ApiResponse<ScaleWeightData>>('/scales/weight', {
      ...data,
      timestamp: new Date().toISOString(),
    });
    return response.data.data!;
  },

  /**
   * Get connected scales status
   */
  async getConnectedScales(): Promise<ScaleConnectionInfo[]> {
    const response = await api.get<ApiResponse<ScaleConnectionInfo[]>>('/scales/connected');
    return response.data.data || [];
  },

  /**
   * Register a new scale device
   */
  async registerScale(deviceId: string, deviceName: string): Promise<ScaleConnectionInfo> {
    const response = await api.post<ApiResponse<ScaleConnectionInfo>>('/scales/register', {
      deviceId,
      deviceName,
    });
    return response.data.data!;
  },

  /**
   * Get latest reading from a specific scale
   */
  async getLatestReading(deviceId: string): Promise<ScaleWeightData | null> {
    try {
      const response = await api.get<ApiResponse<ScaleWeightData>>(
        `/scales/${deviceId}/latest`
      );
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching latest reading:', error);
      return null;
    }
  },

  /**
   * Poll for new weight data from a scale
   * Used for WebSocket alternative
   */
  async pollScaleData(deviceId: string, lastTimestamp?: string): Promise<ScaleWeightData[]> {
    const response = await api.get<ApiResponse<ScaleWeightData[]>>(
      `/scales/${deviceId}/poll`,
      {
        params: { since: lastTimestamp },
      }
    );
    return response.data.data || [];
  },
};

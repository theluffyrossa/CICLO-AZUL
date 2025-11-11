import { api } from './api.service';
import { ApiResponse } from '@/types';

export interface UploadImageData {
  uri: string;
  collectionId: string;
  consentGiven: boolean;
  latitude?: number;
  longitude?: number;
  capturedAt?: Date;
  deviceInfo?: string;
  description?: string;
}

export interface ImageResponse {
  id: string;
  url: string;
  collectionId: string;
  uploadedAt: string;
  latitude?: number;
  longitude?: number;
}

class ImagesService {
  async uploadImage(data: UploadImageData): Promise<ImageResponse> {
    const formData = new FormData();

    // Criar objeto de arquivo para upload
    const uriParts = data.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri: data.uri,
      name: `photo.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    formData.append('collectionId', String(data.collectionId));
    formData.append('consentGiven', String(data.consentGiven));

    if (data.latitude !== undefined) {
      formData.append('latitude', String(data.latitude));
    }

    if (data.longitude !== undefined) {
      formData.append('longitude', String(data.longitude));
    }

    if (data.capturedAt) {
      formData.append('capturedAt', data.capturedAt.toISOString());
    }

    if (data.deviceInfo) {
      formData.append('deviceInfo', data.deviceInfo);
    }

    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post<ApiResponse<ImageResponse>>('/images/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data.data!;
  }

  async deleteImage(imageId: string): Promise<void> {
    await api.delete(`/images/${imageId}`);
  }

  async getImagesByCollection(collectionId: string): Promise<ImageResponse[]> {
    const response = await api.get<ApiResponse<ImageResponse[]>>(`/images/collection/${collectionId}`);
    return response.data.data || [];
  }
}

export const imagesService = new ImagesService();

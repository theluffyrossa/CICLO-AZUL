import { api } from './api.service';
import { ApiResponse } from '@/types';
import { retryableUpload } from '@/utils/retry.util';

export interface UploadImageData {
  uri: string;
  collectionId?: string;
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
  urlMedium?: string;
  urlSmall?: string;
  urlThumbnail?: string;
  storageKey?: string;
  collectionId?: string;
  filename: string;
  mimeType?: string;
  fileSize?: number;
  width?: number;
  height?: number;
  uploadedAt: string;
  latitude?: number;
  longitude?: number;
  capturedAt?: string;
  deviceInfo?: string;
  consentGiven: boolean;
  description?: string;
}

export interface UpdateImageData {
  collectionId?: string;
  description?: string;
}

class ImagesService {
  private createFormData(data: UploadImageData): FormData {
    const formData = new FormData();

    // Criar objeto de arquivo para upload
    const uriParts = data.uri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('image', {
      uri: data.uri,
      name: `photo-${Date.now()}.${fileType}`,
      type: `image/${fileType}`,
    } as any);

    formData.append('consentGiven', String(data.consentGiven));

    if (data.collectionId) {
      formData.append('collectionId', String(data.collectionId));
    }

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

    return formData;
  }

  /**
   * Upload de múltiplas imagens (até 6)
   */
  async uploadMultipleImages(
    uris: string[],
    commonData: Omit<UploadImageData, 'uri'>,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<ImageResponse[]> {
    if (uris.length === 0) {
      throw new Error('Pelo menos uma imagem é necessária');
    }

    if (uris.length > 6) {
      throw new Error('Máximo de 6 imagens permitido');
    }

    return retryableUpload(
      async () => {
        const formData = new FormData();

        // Adiciona cada imagem ao FormData
        for (let i = 0; i < uris.length; i++) {
          const uri = uris[i];
          const uriParts = uri.split('.');
          const fileType = uriParts[uriParts.length - 1];

          formData.append('images', {
            uri,
            name: `photo-${Date.now()}-${i}.${fileType}`,
            type: `image/${fileType}`,
          } as any);
        }

        // Adiciona dados comuns
        formData.append('consentGiven', String(commonData.consentGiven));

        if (commonData.collectionId) {
          formData.append('collectionId', String(commonData.collectionId));
        }

        if (commonData.latitude !== undefined) {
          formData.append('latitude', String(commonData.latitude));
        }

        if (commonData.longitude !== undefined) {
          formData.append('longitude', String(commonData.longitude));
        }

        if (commonData.capturedAt) {
          formData.append('capturedAt', commonData.capturedAt.toISOString());
        }

        if (commonData.deviceInfo) {
          formData.append('deviceInfo', commonData.deviceInfo);
        }

        if (commonData.description) {
          formData.append('description', commonData.description);
        }

        const response = await api.post<ApiResponse<ImageResponse[]>>(
          '/images/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 120000, // 2 minutos para múltiplos uploads
          }
        );

        if (!response.data.data) {
          throw new Error('Resposta inválida do servidor');
        }

        return response.data.data;
      },
      onRetry
    );
  }

  /**
   * Upload de imagem com retry automático usando objeto tipado
   */
  async uploadImage(
    data: UploadImageData,
    onRetry?: (attempt: number, error: Error) => void
  ): Promise<ImageResponse> {
    // Usa retry automático com exponential backoff
    return retryableUpload(
      async () => {
        const formData = this.createFormData(data);

        const response = await api.post<ApiResponse<ImageResponse>>(
          '/images/upload-single',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
            timeout: 60000, // 60 segundos para uploads
          }
        );

        if (!response.data.data) {
          throw new Error('Resposta inválida do servidor');
        }

        return response.data.data;
      },
      onRetry
    );
  }

  /**
   * Upload de imagem simples usando FormData diretamente
   * Usado quando você já tem um FormData pronto
   */
  async uploadImageFormData(formData: FormData): Promise<ImageResponse> {
    const response = await api.post<ApiResponse<ImageResponse>>(
      '/images/upload-single',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 segundos para uploads
      }
    );

    if (!response.data.data) {
      throw new Error('Resposta inválida do servidor');
    }

    return response.data.data;
  }

  /**
   * Atualiza informações de uma imagem existente
   */
  async updateImage(imageId: string, data: UpdateImageData): Promise<ImageResponse> {
    const response = await api.put<ApiResponse<ImageResponse>>(`/images/${imageId}`, data);

    if (!response.data.data) {
      throw new Error('Resposta inválida do servidor');
    }

    return response.data.data;
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

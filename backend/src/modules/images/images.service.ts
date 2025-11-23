import { Image, Collection } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { uploadBuffer, deleteFile } from '@shared/utils/storage.util';
import {
  processImageWithThumbnails,
  validateImageDimensions,
  removeTempFile,
} from '@shared/utils/image-processor.util';
import { CreateImageDto, UpdateImageDto } from './images.types';

export class ImagesService {
  async createMultiple(files: Express.Multer.File[], data: Partial<CreateImageDto>): Promise<Image[]> {
    if (!data.consentGiven) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'LGPD consent is required for image upload'
      );
    }

    if (!data.collectionId) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Collection ID is required for image upload'
      );
    }

    if (files.length > 6) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Maximum 6 images allowed');
    }

    await this.validateCollectionExists(data.collectionId);

    const uploadedImages: Image[] = [];
    const errors: string[] = [];

    // Processa cada imagem
    for (let i = 0; i < files.length; i++) {
      try {
        const image = await this.create(files[i], data);
        uploadedImages.push(image);
      } catch (error) {
        errors.push(`Image ${i + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        // Continua processando outras imagens
      }
    }

    if (uploadedImages.length === 0) {
      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to upload all images: ${errors.join(', ')}`
      );
    }

    return uploadedImages;
  }

  async create(file: Express.Multer.File, data: Partial<CreateImageDto>): Promise<Image> {
    if (!data.consentGiven) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'LGPD consent is required for image upload'
      );
    }

    if (!data.collectionId) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'Collection ID is required for image upload'
      );
    }

    await this.validateCollectionExists(data.collectionId);

    let imageData: Partial<CreateImageDto> | undefined;

    try {
      // Valida dimensões mínimas
      await validateImageDimensions(file.path);

      // Processa imagem e gera thumbnails
      const processed = await processImageWithThumbnails(file.path, {
        text: process.env.WATERMARK_TEXT || 'CICLO AZUL',
        timestamp: data.capturedAt || new Date(),
        latitude: data.latitude,
        longitude: data.longitude,
      });

      // Upload imagem original
      const originalUpload = await uploadBuffer(processed.original.buffer, {
        filename: `original-${Date.now()}-${file.originalname}`,
        mimeType: 'image/jpeg',
        metadata: {
          ...(data.collectionId && { collectionId: data.collectionId }),
          latitude: String(data.latitude || ''),
          longitude: String(data.longitude || ''),
          capturedAt: (data.capturedAt || new Date()).toISOString(),
          deviceInfo: data.deviceInfo || '',
        },
        makePublic: true,
      });

      // Prepara dados da imagem
      const imageData: Partial<CreateImageDto> = {
        collectionId: data.collectionId,
        url: originalUpload.url,
        storageKey: originalUpload.key,
        filename: file.originalname,
        mimeType: 'image/jpeg',
        fileSize: processed.original.size,
        width: processed.original.width,
        height: processed.original.height,
        latitude: data.latitude,
        longitude: data.longitude,
        capturedAt: data.capturedAt || new Date(),
        deviceInfo: data.deviceInfo,
        consentGiven: data.consentGiven,
        description: data.description,
      };

      // Upload thumbnails se disponíveis
      if (processed.medium) {
        const mediumUpload = await uploadBuffer(processed.medium.buffer, {
          filename: `medium-${Date.now()}-${file.originalname}`,
          mimeType: 'image/jpeg',
          makePublic: true,
        });
        imageData.urlMedium = mediumUpload.url;
      }

      if (processed.small) {
        const smallUpload = await uploadBuffer(processed.small.buffer, {
          filename: `small-${Date.now()}-${file.originalname}`,
          mimeType: 'image/jpeg',
          makePublic: true,
        });
        imageData.urlSmall = smallUpload.url;
      }

      if (processed.thumbnail) {
        const thumbnailUpload = await uploadBuffer(processed.thumbnail.buffer, {
          filename: `thumb-${Date.now()}-${file.originalname}`,
          mimeType: 'image/jpeg',
          makePublic: true,
        });
        imageData.urlThumbnail = thumbnailUpload.url;
      }

      // Limpa arquivo temporário
      await removeTempFile(file.path);

      console.log('[Image Service] Creating image in database with data:', {
        ...imageData,
        url: imageData.url?.substring(0, 50) + '...',
      });

      const createdImage = await Image.create(imageData as any);

      console.log('[Image Service] Image created successfully in DB:', {
        id: createdImage.id,
        collectionId: createdImage.collectionId,
        url: createdImage.url?.substring(0, 50) + '...',
      });

      return createdImage;
    } catch (error) {
      console.error('[Image Service] Error during image creation:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        imageData: imageData ? {
          ...imageData,
          url: imageData.url?.substring(0, 50) + '...',
        } : 'Image data not yet created',
      });

      await removeTempFile(file.path);

      if (error instanceof AppError) {
        throw error;
      }

      throw new AppError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        `Failed to process image: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async findByCollection(collectionId: string): Promise<Image[]> {
    return Image.findAll({
      where: { collectionId },
      order: [['capturedAt', 'DESC']],
    });
  }

  async findById(id: string): Promise<Image> {
    const image = await Image.findByPk(id);

    if (!image) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Image not found');
    }

    return image;
  }

  async update(id: string, data: UpdateImageDto): Promise<Image> {
    const image = await this.findById(id);

    // Apenas permite atualizar metadados, não a imagem em si
    const allowedUpdates: (keyof UpdateImageDto)[] = [
      'description',
      'latitude',
      'longitude',
      'consentGiven',
    ];

    const updateData: Partial<UpdateImageDto> = {};
    allowedUpdates.forEach((key) => {
      if (key in data && data[key] !== undefined) {
        updateData[key] = data[key] as any;
      }
    });

    await image.update(updateData);
    return image;
  }

  async delete(id: string): Promise<void> {
    const image = await this.findById(id);

    try {
      // Deleta do storage (S3 ou local)
      if (image.storageKey) {
        await deleteFile(image.storageKey);

        // Deleta thumbnails se existirem
        if (image.urlMedium) {
          const mediumKey = this.extractKeyFromUrl(image.urlMedium);
          if (mediumKey) await deleteFile(mediumKey);
        }

        if (image.urlSmall) {
          const smallKey = this.extractKeyFromUrl(image.urlSmall);
          if (smallKey) await deleteFile(smallKey);
        }

        if (image.urlThumbnail) {
          const thumbnailKey = this.extractKeyFromUrl(image.urlThumbnail);
          if (thumbnailKey) await deleteFile(thumbnailKey);
        }
      }
    } catch (error) {
      // Log error mas continua com soft delete
      console.error('Failed to delete image from storage:', error);
    }

    // Soft delete do banco
    await image.destroy();
  }

  private extractKeyFromUrl(url: string): string | null {
    try {
      // Extrai key de URL do storage
      // Para local: /uploads/images/...
      // Para S3: https://bucket.s3.region.amazonaws.com/images/...
      const match = url.match(/images\/[^?]+/);
      return match ? match[0] : null;
    } catch {
      return null;
    }
  }

  private async validateCollectionExists(collectionId: string): Promise<void> {
    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }
  }
}

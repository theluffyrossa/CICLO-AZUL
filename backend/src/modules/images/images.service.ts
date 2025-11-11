import path from 'path';
import { Image, Collection } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { processImage, deleteImage } from '@shared/utils/image.util';
import { CreateImageDto, UpdateImageDto } from './images.types';

export class ImagesService {
  async create(file: Express.Multer.File, data: Partial<CreateImageDto>): Promise<Image> {
    if (!data.collectionId) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Collection ID is required');
    }

    await this.validateCollectionExists(data.collectionId);

    if (!data.consentGiven) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        'LGPD consent is required for image upload'
      );
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const processed = await processImage(file.path, filename);

    const imageData: CreateImageDto = {
      collectionId: data.collectionId,
      url: `/uploads/${filename}`,
      filename,
      mimeType: file.mimetype,
      fileSize: processed.metadata.size,
      width: processed.metadata.width,
      height: processed.metadata.height,
      latitude: data.latitude,
      longitude: data.longitude,
      capturedAt: data.capturedAt || new Date(),
      deviceInfo: data.deviceInfo,
      consentGiven: data.consentGiven,
      description: data.description,
    };

    return Image.create(imageData as any);
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
    await image.update(data);
    return image;
  }

  async delete(id: string): Promise<void> {
    const image = await this.findById(id);

    const filename = path.basename(image.url);
    const filePath = path.join(process.cwd(), 'uploads', filename);
    await deleteImage(filePath);

    await image.destroy();
  }

  private async validateCollectionExists(collectionId: string): Promise<void> {
    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }
  }
}

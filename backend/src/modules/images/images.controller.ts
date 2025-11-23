import { Response, NextFunction } from 'express';
import { ImagesService } from './images.service';
import { UpdateImageDto } from './images.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent, sendBadRequest } from '@shared/utils/response.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class ImagesController {
  private imagesService: ImagesService;

  constructor() {
    this.imagesService = new ImagesService();
  }

  upload = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        sendBadRequest(res, 'No files uploaded');
        return;
      }

      if (files.length > 6) {
        sendBadRequest(res, 'Maximum 6 images allowed');
        return;
      }

      const data = {
        collectionId: req.body.collectionId,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
        capturedAt: req.body.capturedAt ? new Date(req.body.capturedAt) : undefined,
        deviceInfo: req.body.deviceInfo,
        consentGiven: req.body.consentGiven === 'true' || req.body.consentGiven === true,
        description: req.body.description,
      };

      const images = await this.imagesService.createMultiple(files, data);

      sendCreated(res, images, `${images.length} image(s) uploaded successfully`);
    } catch (error) {
      next(error);
    }
  };

  uploadSingle = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        sendBadRequest(res, 'No file uploaded');
        return;
      }

      console.log('[Upload Single] Body received:', {
        collectionId: req.body.collectionId,
        consentGiven: req.body.consentGiven,
        latitude: req.body.latitude,
        longitude: req.body.longitude,
      });

      const data = {
        collectionId: req.body.collectionId,
        latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
        longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
        capturedAt: req.body.capturedAt ? new Date(req.body.capturedAt) : undefined,
        deviceInfo: req.body.deviceInfo,
        consentGiven: req.body.consentGiven === 'true' || req.body.consentGiven === true,
        description: req.body.description,
      };

      const image = await this.imagesService.create(req.file, data);

      sendCreated(res, image, 'Image uploaded successfully');
    } catch (error) {
      next(error);
    }
  };

  findByCollection = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { collectionId } = req.params;
      const images = await this.imagesService.findByCollection(collectionId);

      sendSuccess(res, images);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const image = await this.imagesService.findById(id);

      sendSuccess(res, image);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateImageDto = req.body;

      const image = await this.imagesService.update(id, data);

      sendSuccess(res, image, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.imagesService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

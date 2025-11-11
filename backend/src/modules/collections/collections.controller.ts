import { Response, NextFunction } from 'express';
import { CollectionsService } from './collections.service';
import { CreateCollectionDto, UpdateCollectionDto, CollectionFilters } from './collections.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { getPaginationParams } from '@shared/utils/pagination.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class CollectionsController {
  private collectionsService: CollectionsService;

  constructor() {
    this.collectionsService = new CollectionsService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateCollectionDto = req.body;
      const collection = await this.collectionsService.create(data);

      sendCreated(res, collection, SUCCESS_MESSAGES.CREATED);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: CollectionFilters = req.query;
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);
      const userRole = req.user!.role;
      const userId = req.user!.id;

      const result = await this.collectionsService.findAll(filters, pagination, userRole, userId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const collection = await this.collectionsService.findById(id);

      sendSuccess(res, collection);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateCollectionDto = req.body;

      const collection = await this.collectionsService.update(id, data);

      sendSuccess(res, collection, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.collectionsService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

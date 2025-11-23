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
      const userRole = req.user!.role;
      const userClientId = req.user!.clientId;

      const collection = await this.collectionsService.create(data, userRole, userClientId);

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
      const userClientId = req.user!.clientId;

      console.log('[CollectionsController.findAll] Request params:', {
        userRole,
        userClientId,
        filters,
        pagination,
      });

      const result = await this.collectionsService.findAll(filters, pagination, userRole, userClientId);

      console.log('[CollectionsController.findAll] Response data:', {
        dataLength: result.data.length,
        paginationTotal: result.pagination.total,
        firstItem: result.data[0] ? { id: result.data[0].id, clientId: result.data[0].clientId } : null,
      });

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = req.user!.role;
      const userClientId = req.user!.clientId;

      const collection = await this.collectionsService.findById(id, userRole, userClientId);

      sendSuccess(res, collection);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateCollectionDto = req.body;
      const userRole = req.user!.role;
      const userClientId = req.user!.clientId;

      const collection = await this.collectionsService.update(id, data, userRole, userClientId);

      sendSuccess(res, collection, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const userRole = req.user!.role;
      const userClientId = req.user!.clientId;

      await this.collectionsService.delete(id, userRole, userClientId);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };

  approveCollection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const adminId = req.user!.id;

      const collection = await this.collectionsService.approveCollection(id, adminId);

      sendSuccess(res, collection, 'Collection approved successfully');
    } catch (error) {
      next(error);
    }
  };

  rejectCollection = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { rejectionReason } = req.body;
      const adminId = req.user!.id;

      const collection = await this.collectionsService.rejectCollection(id, adminId, rejectionReason);

      sendSuccess(res, collection, 'Collection rejected successfully');
    } catch (error) {
      next(error);
    }
  };

  getPendingCollections = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);

      const result = await this.collectionsService.getPendingCollections(pagination);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };
}

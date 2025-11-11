import { Response, NextFunction } from 'express';
import { WasteTypesService } from './waste-types.service';
import { CreateWasteTypeDto, UpdateWasteTypeDto, WasteTypeFilters } from './waste-types.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { getPaginationParams } from '@shared/utils/pagination.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class WasteTypesController {
  private wasteTypesService: WasteTypesService;

  constructor() {
    this.wasteTypesService = new WasteTypesService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateWasteTypeDto = req.body;
      const wasteType = await this.wasteTypesService.create(data);

      sendCreated(res, wasteType, SUCCESS_MESSAGES.CREATED);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: WasteTypeFilters = req.query;
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);

      const result = await this.wasteTypesService.findAll(filters, pagination);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findAllActive = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const wasteTypes = await this.wasteTypesService.findAllActive();
      sendSuccess(res, wasteTypes);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const wasteType = await this.wasteTypesService.findById(id);

      sendSuccess(res, wasteType);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateWasteTypeDto = req.body;

      const wasteType = await this.wasteTypesService.update(id, data);

      sendSuccess(res, wasteType, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.wasteTypesService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import { UnitsService } from './units.service';
import { CreateUnitDto, UpdateUnitDto, UnitFilters } from './units.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { getPaginationParams } from '@shared/utils/pagination.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class UnitsController {
  private unitsService: UnitsService;

  constructor() {
    this.unitsService = new UnitsService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateUnitDto = req.body;
      const unit = await this.unitsService.create(data);

      sendCreated(res, unit, SUCCESS_MESSAGES.CREATED);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: UnitFilters = req.query;
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);

      const result = await this.unitsService.findAll(filters, pagination);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const unit = await this.unitsService.findById(id);

      sendSuccess(res, unit);
    } catch (error) {
      next(error);
    }
  };

  findByClient = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { clientId } = req.params;
      const units = await this.unitsService.findByClient(clientId);

      sendSuccess(res, units);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateUnitDto = req.body;

      const unit = await this.unitsService.update(id, data);

      sendSuccess(res, unit, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.unitsService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

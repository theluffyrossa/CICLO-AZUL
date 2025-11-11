import { Response, NextFunction } from 'express';
import { GravimetricDataService } from './gravimetric-data.service';
import {
  CreateGravimetricDataDto,
  UpdateGravimetricDataDto,
  CsvImportRow,
} from './gravimetric-data.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class GravimetricDataController {
  private gravimetricDataService: GravimetricDataService;

  constructor() {
    this.gravimetricDataService = new GravimetricDataService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateGravimetricDataDto = req.body;
      const gravimetricData = await this.gravimetricDataService.create(data);

      sendCreated(res, gravimetricData, SUCCESS_MESSAGES.CREATED);
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
      const data = await this.gravimetricDataService.findByCollection(collectionId);

      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data = await this.gravimetricDataService.findById(id);

      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateGravimetricDataDto = req.body;

      const gravimetricData = await this.gravimetricDataService.update(id, data);

      sendSuccess(res, gravimetricData, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.gravimetricDataService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };

  importCsv = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rows: CsvImportRow[] = req.body.rows;
      const importedData = await this.gravimetricDataService.importFromCsv(rows);

      sendSuccess(res, importedData, `Successfully imported ${importedData.length} records`);
    } catch (error) {
      next(error);
    }
  };

  createFromApi = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { collectionId, weightKg, deviceId } = req.body;
      const data = await this.gravimetricDataService.createFromApi(
        collectionId,
        weightKg,
        deviceId
      );

      sendCreated(res, data, 'Data received from API');
    } catch (error) {
      next(error);
    }
  };
}

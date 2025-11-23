import { Response, NextFunction } from 'express';
import { ClientsService } from './clients.service';
import { CreateClientDto, UpdateClientDto, ClientFilters } from './clients.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { getPaginationParams } from '@shared/utils/pagination.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class ClientsController {
  private clientsService: ClientsService;

  constructor() {
    this.clientsService = new ClientsService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateClientDto = req.body;
      const client = await this.clientsService.create(data);

      sendCreated(res, client, SUCCESS_MESSAGES.CREATED);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ClientFilters = req.query;
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);
      const userRole = req.user!.role;
      const userClientId = req.user!.clientId;

      const result = await this.clientsService.findAll(filters, pagination, userRole, userClientId);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const client = await this.clientsService.findById(id);

      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  };

  getMyProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const client = await this.clientsService.findClientByUserId(userId);

      sendSuccess(res, client);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateClientDto = req.body;

      const client = await this.clientsService.update(id, data);

      sendSuccess(res, client, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.clientsService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };

  getClientWasteTypes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const wasteTypes = await this.clientsService.getClientWasteTypes(id);

      sendSuccess(res, wasteTypes);
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import { RecipientsService } from './recipients.service';
import { CreateRecipientDto, UpdateRecipientDto, RecipientFilters } from './recipients.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess, sendCreated, sendNoContent } from '@shared/utils/response.util';
import { getPaginationParams } from '@shared/utils/pagination.util';
import { SUCCESS_MESSAGES } from '@shared/constants';

export class RecipientsController {
  private recipientsService: RecipientsService;

  constructor() {
    this.recipientsService = new RecipientsService();
  }

  create = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data: CreateRecipientDto = req.body;
      const recipient = await this.recipientsService.create(data);

      sendCreated(res, recipient, SUCCESS_MESSAGES.CREATED);
    } catch (error) {
      next(error);
    }
  };

  findAll = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: RecipientFilters = req.query;
      const page = req.query.page as string | number | undefined;
      const limit = req.query.limit as string | number | undefined;
      const pagination = getPaginationParams(page, limit);

      const result = await this.recipientsService.findAll(filters, pagination);

      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  };

  findActive = async (_req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const recipients = await this.recipientsService.findActive();

      sendSuccess(res, recipients);
    } catch (error) {
      next(error);
    }
  };

  findById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const recipient = await this.recipientsService.findById(id);

      sendSuccess(res, recipient);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const data: UpdateRecipientDto = req.body;

      const recipient = await this.recipientsService.update(id, data);

      sendSuccess(res, recipient, SUCCESS_MESSAGES.UPDATED);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.recipientsService.delete(id);

      sendNoContent(res);
    } catch (error) {
      next(error);
    }
  };
}

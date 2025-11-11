import { Op, WhereOptions, CreationAttributes } from 'sequelize';
import { Recipient } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateRecipientDto, UpdateRecipientDto, RecipientFilters } from './recipients.types';

export class RecipientsService {
  async create(data: CreateRecipientDto): Promise<Recipient> {
    const recipientData: CreationAttributes<Recipient> = {
      name: data.name,
      type: data.type,
      document: data.document ?? null,
      secondaryDocument: data.secondaryDocument ?? null,
      address: data.address ?? null,
      city: data.city ?? null,
      state: data.state ?? null,
      zipCode: data.zipCode ?? null,
      phone: data.phone ?? null,
      email: data.email ?? null,
      responsibleName: data.responsibleName ?? null,
      responsiblePhone: data.responsiblePhone ?? null,
      notes: data.notes ?? null,
      acceptedWasteTypes: data.acceptedWasteTypes ?? null,
    };

    return Recipient.create(recipientData);
  }

  async findAll(
    filters: RecipientFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Recipient>> {
    const whereConditions = this.buildWhereConditions(filters);

    const { count, rows } = await Recipient.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['name', 'ASC']],
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findActive(): Promise<Recipient[]> {
    return Recipient.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'type', 'document', 'active'],
    });
  }

  async findById(id: string): Promise<Recipient> {
    const recipient = await Recipient.findByPk(id);

    if (!recipient) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Recipient not found');
    }

    return recipient;
  }

  async update(id: string, data: UpdateRecipientDto): Promise<Recipient> {
    const recipient = await this.findById(id);
    await recipient.update(data);
    return recipient;
  }

  async delete(id: string): Promise<void> {
    const recipient = await this.findById(id);
    await recipient.destroy();
  }

  private buildWhereConditions(filters: RecipientFilters): WhereOptions<Recipient> {
    const conditions: Record<string | symbol, unknown> = {};

    if (filters.search) {
      conditions[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { document: { [Op.iLike]: `%${filters.search}%` } },
        { secondaryDocument: { [Op.iLike]: `%${filters.search}%` } },
        { address: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    if (filters.type) {
      conditions.type = filters.type;
    }

    if (filters.active !== undefined) {
      conditions.active = filters.active;
    }

    if (filters.city) {
      conditions.city = { [Op.iLike]: `%${filters.city}%` };
    }

    if (filters.state) {
      conditions.state = filters.state;
    }

    return conditions as WhereOptions<Recipient>;
  }
}

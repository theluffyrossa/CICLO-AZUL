import { Op, WhereOptions } from 'sequelize';
import { Client, Unit } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateClientDto, UpdateClientDto, ClientFilters } from './clients.types';

export class ClientsService {
  async create(data: CreateClientDto): Promise<Client> {
    const existingClient = await this.findByDocument(data.document);
    if (existingClient) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Client with this document already exists');
    }

    return Client.create(data as any);
  }

  async findAll(
    filters: ClientFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Client>> {
    const whereConditions = this.buildWhereConditions(filters);

    const { count, rows } = await Client.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Unit,
          as: 'units',
          attributes: ['id', 'name', 'active'],
        },
      ],
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findById(id: string): Promise<Client> {
    const client = await Client.findByPk(id, {
      include: [
        {
          model: Unit,
          as: 'units',
          where: { active: true },
          required: false,
        },
      ],
    });

    if (!client) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Client not found');
    }

    return client;
  }

  async update(id: string, data: UpdateClientDto): Promise<Client> {
    const client = await this.findById(id);

    if (data.document && data.document !== client.document) {
      const existingClient = await this.findByDocument(data.document);
      if (existingClient && existingClient.id !== id) {
        throw new AppError(HTTP_STATUS.CONFLICT, 'Document already in use by another client');
      }
    }

    await client.update(data);
    return client;
  }

  async delete(id: string): Promise<void> {
    const client = await this.findById(id);
    await client.destroy();
  }

  private async findByDocument(document: string): Promise<Client | null> {
    return Client.findOne({ where: { document } });
  }

  private buildWhereConditions(filters: ClientFilters): WhereOptions<Client> {
    const conditions: Record<string | symbol, unknown> = {};

    if (filters.search) {
      conditions[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { document: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
      ];
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

    return conditions as WhereOptions<Client>;
  }
}

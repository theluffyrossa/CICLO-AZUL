import { Op, WhereOptions } from 'sequelize';
import { Client, Unit, WasteType, ClientWasteType, User } from '@database/models';
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
    pagination: PaginationParams,
    userRole?: string,
    userClientId?: string
  ): Promise<PaginatedResponse<Client>> {
    const whereConditions = this.buildWhereConditions(filters, userRole, userClientId);

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

  async findClientByUserId(userId: string): Promise<Client> {
    const client = await Client.findOne({
      include: [
        {
          model: User,
          as: 'clientUsers',
          where: { id: userId },
          attributes: [],
          required: true,
        },
        {
          model: Unit,
          as: 'units',
          where: { active: true },
          required: false,
        },
      ],
    });

    if (!client) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Client not found for this user');
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

  async getClientWasteTypes(clientId: string): Promise<WasteType[]> {
    const client = await Client.findByPk(clientId);

    if (!client) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Client not found');
    }

    const clientWasteTypes = await ClientWasteType.findAll({
      where: {
        clientId,
        active: true,
      },
      include: [
        {
          model: WasteType,
          as: 'wasteType',
          where: { active: true },
          required: true,
        },
      ],
    });

    return clientWasteTypes.map((cwt: ClientWasteType) => cwt.wasteType).filter((wt: WasteType | undefined): wt is WasteType => wt !== undefined);
  }

  private async findByDocument(document: string): Promise<Client | null> {
    return Client.findOne({ where: { document } });
  }

  private buildWhereConditions(
    filters: ClientFilters,
    userRole?: string,
    userClientId?: string
  ): WhereOptions<Client> {
    const conditions: Record<string | symbol, unknown> = {};

    if (userRole === 'CLIENT' && userClientId) {
      conditions.id = userClientId;
    }

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

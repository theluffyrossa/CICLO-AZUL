import { Op, WhereOptions } from 'sequelize';
import { Unit, Client } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateUnitDto, UpdateUnitDto, UnitFilters } from './units.types';

export class UnitsService {
  async create(data: CreateUnitDto): Promise<Unit> {
    await this.validateClientExists(data.clientId);
    return Unit.create(data as any);
  }

  async findAll(
    filters: UnitFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Unit>> {
    const whereConditions = this.buildWhereConditions(filters);

    const { count, rows } = await Unit.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'document'],
        },
      ],
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findById(id: string): Promise<Unit> {
    const unit = await Unit.findByPk(id, {
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'document', 'phone', 'email'],
        },
      ],
    });

    if (!unit) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Unit not found');
    }

    return unit;
  }

  async findByClient(clientId: string): Promise<Unit[]> {
    await this.validateClientExists(clientId);

    return Unit.findAll({
      where: { clientId, active: true },
      order: [['name', 'ASC']],
    });
  }

  async update(id: string, data: UpdateUnitDto): Promise<Unit> {
    const unit = await this.findById(id);
    await unit.update(data);
    return unit;
  }

  async delete(id: string): Promise<void> {
    const unit = await this.findById(id);
    await unit.destroy();
  }

  private async validateClientExists(clientId: string): Promise<void> {
    const client = await Client.findByPk(clientId);
    if (!client) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Client not found');
    }
  }

  private buildWhereConditions(filters: UnitFilters): WhereOptions<Unit> {
    const conditions: Record<string | symbol, unknown> = {};

    if (filters.clientId) {
      conditions.clientId = filters.clientId;
    }

    if (filters.search) {
      conditions[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { type: { [Op.iLike]: `%${filters.search}%` } },
        { address: { [Op.iLike]: `%${filters.search}%` } },
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

    return conditions as WhereOptions<Unit>;
  }
}

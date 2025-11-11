import { Op, WhereOptions } from 'sequelize';
import { WasteType } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateWasteTypeDto, UpdateWasteTypeDto, WasteTypeFilters } from './waste-types.types';

export class WasteTypesService {
  async create(data: CreateWasteTypeDto): Promise<WasteType> {
    const existingType = await this.findByName(data.name);
    if (existingType) {
      throw new AppError(HTTP_STATUS.CONFLICT, 'Waste type with this name already exists');
    }

    return WasteType.create(data as any);
  }

  async findAll(
    filters: WasteTypeFilters,
    pagination: PaginationParams
  ): Promise<PaginatedResponse<WasteType>> {
    const whereConditions = this.buildWhereConditions(filters);

    const { count, rows } = await WasteType.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['name', 'ASC']],
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findAllActive(): Promise<WasteType[]> {
    return WasteType.findAll({
      where: { active: true },
      order: [['name', 'ASC']],
    });
  }

  async findById(id: string): Promise<WasteType> {
    const wasteType = await WasteType.findByPk(id);

    if (!wasteType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Waste type not found');
    }

    return wasteType;
  }

  async update(id: string, data: UpdateWasteTypeDto): Promise<WasteType> {
    const wasteType = await this.findById(id);

    if (data.name && data.name !== wasteType.name) {
      const existingType = await this.findByName(data.name);
      if (existingType && existingType.id !== id) {
        throw new AppError(HTTP_STATUS.CONFLICT, 'Waste type name already in use');
      }
    }

    await wasteType.update(data);
    return wasteType;
  }

  async delete(id: string): Promise<void> {
    const wasteType = await this.findById(id);
    await wasteType.destroy();
  }

  private async findByName(name: string): Promise<WasteType | null> {
    return WasteType.findOne({ where: { name } });
  }

  private buildWhereConditions(filters: WasteTypeFilters): WhereOptions<WasteType> {
    const conditions: Record<string | symbol, unknown> = {};

    if (filters.category) {
      conditions.category = filters.category;
    }

    if (filters.active !== undefined) {
      conditions.active = filters.active;
    }

    if (filters.search) {
      conditions[Op.or] = [
        { name: { [Op.iLike]: `%${filters.search}%` } },
        { description: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    return conditions as WhereOptions<WasteType>;
  }
}

import { Op, WhereOptions } from 'sequelize';
import { Collection, Client, Unit, WasteType, User, GravimetricData, Image, Recipient } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse, UserRole } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateCollectionDto, UpdateCollectionDto, CollectionFilters } from './collections.types';

export class CollectionsService {
  async create(data: CreateCollectionDto): Promise<Collection> {
    await this.validateRelations(data);
    return Collection.create(data as any);
  }

  async findAll(
    filters: CollectionFilters,
    pagination: PaginationParams,
    userRole: UserRole,
    userId?: string
  ): Promise<PaginatedResponse<Collection>> {
    const whereConditions = this.buildWhereConditions(filters, userRole, userId);

    const { count, rows } = await Collection.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['collectionDate', 'DESC']],
      include: this.getIncludeOptions(),
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findById(id: string): Promise<Collection> {
    const collection = await Collection.findByPk(id, {
      include: this.getIncludeOptions(true),
    });

    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }

    return collection;
  }

  async update(id: string, data: UpdateCollectionDto): Promise<Collection> {
    const collection = await this.findById(id);

    if (data.wasteTypeId) {
      await this.validateWasteTypeExists(data.wasteTypeId);
    }

    if (data.recipientId) {
      await this.validateRecipientExists(data.recipientId);
    }

    await collection.update(data);
    return this.findById(id);
  }

  async delete(id: string): Promise<void> {
    const collection = await this.findById(id);
    await collection.destroy();
  }

  private async validateRelations(data: CreateCollectionDto): Promise<void> {
    const [client, unit, wasteType, user, recipient] = await Promise.all([
      Client.findByPk(data.clientId),
      Unit.findByPk(data.unitId),
      WasteType.findByPk(data.wasteTypeId),
      User.findByPk(data.userId),
      Recipient.findByPk(data.recipientId),
    ]);

    if (!client) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Client not found');
    }

    if (!unit) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Unit not found');
    }

    if (unit.clientId !== data.clientId) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Unit does not belong to the specified client');
    }

    if (!wasteType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Waste type not found');
    }

    if (!user) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'User not found');
    }

    if (!recipient) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Recipient not found');
    }
  }

  private async validateWasteTypeExists(wasteTypeId: string): Promise<void> {
    const wasteType = await WasteType.findByPk(wasteTypeId);
    if (!wasteType) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Waste type not found');
    }
  }

  private async validateRecipientExists(recipientId: string): Promise<void> {
    const recipient = await Recipient.findByPk(recipientId);
    if (!recipient) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Recipient not found');
    }
  }

  private buildWhereConditions(
    filters: CollectionFilters,
    userRole: UserRole,
    userId?: string
  ): WhereOptions<Collection> {
    const conditions: Record<string | symbol, unknown> = {};

    if (userRole === UserRole.OPERATOR && userId) {
      conditions.userId = userId;
    }

    if (filters.clientId) {
      conditions.clientId = filters.clientId;
    }

    if (filters.unitId) {
      conditions.unitId = filters.unitId;
    }

    if (filters.wasteTypeId) {
      conditions.wasteTypeId = filters.wasteTypeId;
    }

    if (filters.userId) {
      conditions.userId = filters.userId;
    }

    if (filters.recipientId) {
      conditions.recipientId = filters.recipientId;
    }

    if (filters.status) {
      conditions.status = filters.status;
    }

    if (filters.startDate || filters.endDate) {
      const dateConditions: Record<symbol, Date> = {};
      if (filters.startDate) {
        dateConditions[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateConditions[Op.lte] = new Date(filters.endDate);
      }
      conditions.collectionDate = dateConditions;
    }

    return conditions as WhereOptions<Collection>;
  }

  private getIncludeOptions(includeDetails: boolean = false) {
    const baseIncludes = [
      {
        model: Client,
        as: 'client',
        attributes: ['id', 'name', 'document'],
      },
      {
        model: Unit,
        as: 'unit',
        attributes: ['id', 'name', 'address', 'city'],
      },
      {
        model: WasteType,
        as: 'wasteType',
        attributes: ['id', 'name', 'category', 'unit'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'name', 'email'],
      },
      {
        model: Recipient,
        as: 'recipient',
        attributes: ['id', 'name', 'type', 'document'],
      },
    ];

    if (includeDetails) {
      baseIncludes.push(
        {
          model: GravimetricData,
          as: 'gravimetricData',
        } as never,
        {
          model: Image,
          as: 'images',
          attributes: ['id', 'url', 'filename', 'capturedAt', 'consentGiven'],
        } as never
      );
    }

    return baseIncludes;
  }
}

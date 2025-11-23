import { Op, WhereOptions } from 'sequelize';
import { Collection, Client, Unit, WasteType, User, GravimetricData, Image, Recipient } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { PaginationParams, PaginatedResponse, UserRole, ApprovalStatus, CollectionStatus } from '@shared/types';
import { createPaginatedResponse } from '@shared/utils/pagination.util';
import { CreateCollectionDto, UpdateCollectionDto, CollectionFilters } from './collections.types';
import { logger } from '@config/logger.config';

export class CollectionsService {
  async create(
    data: CreateCollectionDto,
    userRole?: UserRole,
    userClientId?: string
  ): Promise<Collection> {
    logger.info('[CollectionsService.create] Creating collection', {
      userRole,
      userClientId,
      dataClientId: data.clientId,
    });

    if (userRole === UserRole.CLIENT && userClientId) {
      data.clientId = userClientId;
      logger.info('[CollectionsService.create] Forced clientId from token for CLIENT user', {
        clientId: userClientId,
      });
    }

    await this.validateRelations(data, userRole, userClientId);

    logger.info('[CollectionsService.create] Creating collection in database', {
      clientId: data.clientId,
      unitId: data.unitId,
      userId: data.userId,
    });

    const collection = await Collection.create(data as never);

    logger.info('[CollectionsService.create] Collection created successfully', {
      collectionId: collection.id,
      clientId: collection.clientId,
    });

    return collection;
  }

  async findAll(
    filters: CollectionFilters,
    pagination: PaginationParams,
    userRole: UserRole,
    userClientId?: string
  ): Promise<PaginatedResponse<Collection>> {
    logger.info('[CollectionsService.findAll] Fetching collections', {
      userRole,
      userClientId,
      filters,
      pagination,
    });

    const whereConditions = this.buildWhereConditions(filters, userRole, userClientId);

    logger.info('[CollectionsService.findAll] Built where conditions', {
      conditions: whereConditions,
    });

    const { count, rows } = await Collection.findAndCountAll({
      where: whereConditions,
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['collectionDate', 'DESC']],
      include: this.getIncludeOptions(),
    });

    logger.info('[CollectionsService.findAll] Collections fetched', {
      count,
      returnedRows: rows.length,
      clientIds: rows.map(r => r.clientId),
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  async findById(
    id: string,
    userRole?: string,
    userClientId?: string
  ): Promise<Collection> {
    const collection = await Collection.findByPk(id, {
      include: this.getIncludeOptions(true),
    });

    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }

    if (userRole === UserRole.CLIENT && userClientId && collection.clientId !== userClientId) {
      throw new AppError(HTTP_STATUS.FORBIDDEN, 'You can only access collections from your client');
    }

    return collection;
  }

  async update(
    id: string,
    data: UpdateCollectionDto,
    userRole?: UserRole,
    userClientId?: string
  ): Promise<Collection> {
    const collection = await this.findById(id, userRole, userClientId);

    if (userRole === UserRole.CLIENT && userClientId) {
      if (collection.clientId !== userClientId) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          'You can only update collections from your own client'
        );
      }
    }

    if (data.wasteTypeId) {
      await this.validateWasteTypeExists(data.wasteTypeId);
    }

    if (data.recipientId) {
      await this.validateRecipientExists(data.recipientId);
    }

    await collection.update(data);
    return this.findById(id, userRole, userClientId);
  }

  async delete(
    id: string,
    userRole?: UserRole,
    userClientId?: string
  ): Promise<void> {
    const collection = await this.findById(id, userRole, userClientId);

    if (userRole === UserRole.CLIENT && userClientId) {
      if (collection.clientId !== userClientId) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          'You can only delete collections from your own client'
        );
      }
    }

    await collection.destroy();
  }

  async approveCollection(
    collectionId: string,
    adminId: string
  ): Promise<Collection> {
    logger.info('[CollectionsService.approveCollection] Approving collection', {
      collectionId,
      adminId,
    });

    const collection = await Collection.findByPk(collectionId, {
      include: this.getIncludeOptions(true),
    });

    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }

    if (collection.approvalStatus === ApprovalStatus.APPROVED) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Collection is already approved');
    }

    if (collection.approvalStatus === ApprovalStatus.REJECTED) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Cannot approve a rejected collection');
    }

    await collection.update({
      status: CollectionStatus.COMPLETED,
      approvalStatus: ApprovalStatus.APPROVED,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason: null,
    });

    logger.info('[CollectionsService.approveCollection] Collection approved successfully', {
      collectionId: collection.id,
      approvedBy: adminId,
    });

    return this.findById(collectionId);
  }

  async rejectCollection(
    collectionId: string,
    adminId: string,
    rejectionReason: string
  ): Promise<Collection> {
    logger.info('[CollectionsService.rejectCollection] Rejecting collection', {
      collectionId,
      adminId,
    });

    const collection = await Collection.findByPk(collectionId, {
      include: this.getIncludeOptions(true),
    });

    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }

    if (collection.approvalStatus === ApprovalStatus.APPROVED) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Cannot reject an approved collection');
    }

    if (collection.approvalStatus === ApprovalStatus.REJECTED) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Collection is already rejected');
    }

    await collection.update({
      approvalStatus: ApprovalStatus.REJECTED,
      approvedBy: adminId,
      approvedAt: new Date(),
      rejectionReason,
    });

    logger.info('[CollectionsService.rejectCollection] Collection rejected successfully', {
      collectionId: collection.id,
      rejectedBy: adminId,
    });

    return this.findById(collectionId);
  }

  async getPendingCollections(
    pagination: PaginationParams
  ): Promise<PaginatedResponse<Collection>> {
    logger.info('[CollectionsService.getPendingCollections] Fetching pending collections', {
      pagination,
    });

    const { count, rows } = await Collection.findAndCountAll({
      where: {
        approvalStatus: ApprovalStatus.PENDING_APPROVAL,
      },
      limit: pagination.limit,
      offset: pagination.offset,
      order: [['collectionDate', 'DESC']],
      include: this.getIncludeOptions(true),
    });

    logger.info('[CollectionsService.getPendingCollections] Pending collections fetched', {
      count,
      returnedRows: rows.length,
    });

    return createPaginatedResponse(rows, count, pagination);
  }

  private async validateRelations(
    data: CreateCollectionDto,
    userRole?: UserRole,
    userClientId?: string
  ): Promise<void> {
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

    if (userRole === UserRole.CLIENT && userClientId) {
      if (unit.clientId !== userClientId) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          'You can only create collections for units belonging to your client'
        );
      }

      if (user && user.clientId !== userClientId) {
        throw new AppError(
          HTTP_STATUS.FORBIDDEN,
          'You can only assign collections to users from your client'
        );
      }
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
    userClientId?: string
  ): WhereOptions<Collection> {
    const conditions: Record<string | symbol, unknown> = {};

    if (userRole === UserRole.CLIENT && userClientId) {
      conditions.clientId = userClientId;
      logger.info('[CollectionsService.buildWhereConditions] Applied CLIENT filter', {
        clientId: userClientId,
      });
    } else if (filters.clientId) {
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

    if (filters.approvalStatus) {
      conditions.approvalStatus = filters.approvalStatus;
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
      {
        model: User,
        as: 'approver',
        attributes: ['id', 'name', 'email'],
        required: false,
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

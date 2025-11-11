import { Op, fn, col, literal } from 'sequelize';
import {
  Collection,
  Client,
  Unit,
  WasteType,
  GravimetricData,
} from '@database/models';
import {
  DashboardData,
  DashboardSummary,
  WasteTypeDistribution,
  TopUnit,
  DashboardFilters,
} from './dashboard.types';

const TOP_UNITS_LIMIT = 5;

export class DashboardService {
  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    const dateFilter = this.buildDateFilter(filters);

    const [summary, wasteTypeDistribution, topUnits] = await Promise.all([
      this.getSummary(dateFilter, filters.clientId),
      this.getWasteTypeDistribution(dateFilter, filters.clientId),
      this.getTopUnits(dateFilter, filters.clientId),
    ]);

    return {
      summary,
      wasteTypeDistribution,
      collectionsByPeriod: [],
      weightEvolution: [],
      topUnits,
    };
  }

  private async getSummary(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<DashboardSummary> {
    const whereConditions = { ...dateFilter };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const [collections, totalWeight, activeClients, activeUnits] = await Promise.all([
      Collection.count({ where: whereConditions }),
      this.getTotalWeight(whereConditions),
      Client.count({ where: { active: true } }),
      Unit.count({ where: { active: true } }),
    ]);

    return {
      totalCollections: collections,
      totalWeightKg: totalWeight,
      activeClients,
      activeUnits,
    };
  }

  private async getTotalWeight(whereConditions: Record<string, unknown>): Promise<number> {
    const collections = await Collection.findAll({
      where: whereConditions,
      attributes: ['id'],
    });

    const collectionIds = collections.map((c) => c.id);

    if (collectionIds.length === 0) {
      return 0;
    }

    const result = (await GravimetricData.findOne({
      where: { collectionId: { [Op.in]: collectionIds } },
      attributes: [[fn('SUM', col('weight_kg')), 'total']],
      raw: true,
    })) as unknown as { total: number | null };

    return result?.total || 0;
  }

  private async getWasteTypeDistribution(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<WasteTypeDistribution[]> {
    const whereConditions = { ...dateFilter };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const collections = await Collection.findAll({
      where: whereConditions,
      attributes: [
        'wasteTypeId',
        [fn('COUNT', col('Collection.id')), 'count'],
      ],
      include: [
        {
          model: WasteType,
          as: 'wasteType',
          attributes: ['name', 'category'],
        },
        {
          model: GravimetricData,
          as: 'gravimetricData',
          attributes: [],
        },
      ],
      group: ['Collection.waste_type_id', 'wasteType.id', 'wasteType.name', 'wasteType.category'],
      raw: false,
    });

    const totalCollections = collections.reduce(
      (sum, c) => sum + (c.get('count') as number || 0),
      0
    );

    const distribution: WasteTypeDistribution[] = await Promise.all(
      collections.map(async (collection) => {
        const wasteType = collection.wasteType!;
        const count = collection.get('count') as number;

        const weights = await GravimetricData.findAll({
          where: {
            collectionId: {
              [Op.in]: await Collection.findAll({
                where: {
                  ...whereConditions,
                  wasteTypeId: collection.wasteTypeId,
                },
                attributes: ['id'],
                raw: true,
              }).then(rows => rows.map(r => r.id as string)),
            },
          },
          attributes: [[fn('SUM', col('weight_kg')), 'total']],
          raw: true,
        }) as unknown as { total: number | null }[];

        const totalWeight = weights[0]?.total || 0;

        return {
          wasteTypeId: collection.wasteTypeId,
          wasteTypeName: wasteType.name,
          category: wasteType.category,
          count,
          totalWeightKg: totalWeight,
          percentage: totalCollections > 0 ? (count / totalCollections) * 100 : 0,
        };
      })
    );

    return distribution.sort((a, b) => b.count - a.count);
  }

  private async getTopUnits(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<TopUnit[]> {
    const whereConditions = { ...dateFilter };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const collections = await Collection.findAll({
      where: whereConditions,
      attributes: [
        'unitId',
        [fn('COUNT', col('Collection.id')), 'totalCollections'],
      ],
      include: [
        {
          model: Unit,
          as: 'unit',
          attributes: ['name'],
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['name'],
            },
          ],
        },
      ],
      group: ['Collection.unit_id', 'unit.id', 'unit.name', 'unit->client.id', 'unit->client.name'],
      order: [[literal('COUNT(*)'), 'DESC']],
      limit: TOP_UNITS_LIMIT,
      raw: false,
    });

    const topUnits: TopUnit[] = await Promise.all(
      collections.map(async (collection) => {
        const unit = collection.unit!;
        const totalCollections = collection.get('totalCollections') as number;

        const weights = await GravimetricData.findAll({
          where: {
            collectionId: {
              [Op.in]: await Collection.findAll({
                where: {
                  ...whereConditions,
                  unitId: collection.unitId,
                },
                attributes: ['id'],
                raw: true,
              }).then(rows => rows.map(r => r.id as string)),
            },
          },
          attributes: [[fn('SUM', col('weight_kg')), 'total']],
          raw: true,
        }) as unknown as { total: number | null }[];

        const totalWeight = weights[0]?.total || 0;

        return {
          unitId: collection.unitId,
          unitName: unit.name,
          clientName: unit.client?.name || '',
          totalCollections,
          totalWeightKg: totalWeight,
        };
      })
    );

    return topUnits;
  }

  private buildDateFilter(filters: DashboardFilters): Record<string, unknown> {
    const dateFilter: Record<string, unknown> = {};

    if (filters.startDate || filters.endDate) {
      const dateConditions: Record<symbol, Date> = {};
      if (filters.startDate) {
        dateConditions[Op.gte] = new Date(filters.startDate);
      }
      if (filters.endDate) {
        dateConditions[Op.lte] = new Date(filters.endDate);
      }
      dateFilter.collectionDate = dateConditions;
    }

    return dateFilter;
  }
}

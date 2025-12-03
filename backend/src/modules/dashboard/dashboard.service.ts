import { Op, fn, col, literal } from 'sequelize';
import {
  Collection,
  Client,
  Unit,
  WasteType,
  GravimetricData,
} from '@database/models';
import { ApprovalStatus } from '@shared/types';
import {
  DashboardData,
  DashboardSummary,
  WasteTypeDistribution,
  TreatmentTypeDistribution,
  TopUnit,
  DashboardFilters,
} from './dashboard.types';

const TOP_UNITS_LIMIT = 5;

export class DashboardService {
  async getDashboardData(filters: DashboardFilters): Promise<DashboardData> {
    const dateFilter = this.buildDateFilter(filters);

    const [summary, wasteTypeDistribution, treatmentTypeDistribution, topUnits] = await Promise.all([
      this.getSummary(dateFilter, filters.clientId),
      this.getWasteTypeDistribution(dateFilter, filters.clientId),
      this.getTreatmentTypeDistribution(dateFilter, filters.clientId),
      this.getTopUnits(dateFilter, filters.clientId),
    ]);

    return {
      summary,
      wasteTypeDistribution,
      treatmentTypeDistribution,
      collectionsByPeriod: [],
      weightEvolution: [],
      topUnits,
    };
  }

  private async getSummary(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<DashboardSummary> {
    const whereConditions: Record<string, unknown> = {
      ...dateFilter,
      approvalStatus: ApprovalStatus.APPROVED,
    };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const clientFilter = clientId ? { active: true, id: clientId } : { active: true };
    const unitFilter = clientId ? { active: true, clientId } : { active: true };

    const [collectionsCount, totalWeightResult, activeClients, activeUnits] = await Promise.all([
      Collection.count({ where: whereConditions }),
      this.getTotalWeightOptimized(whereConditions),
      Client.count({ where: clientFilter }),
      Unit.count({ where: unitFilter }),
    ]);

    return {
      totalCollections: collectionsCount,
      totalWeightKg: totalWeightResult,
      activeClients,
      activeUnits,
    };
  }

  private async getTotalWeightOptimized(whereConditions: Record<string, unknown>): Promise<number> {
    const result = await GravimetricData.findOne({
      attributes: [
        [fn('COALESCE', fn('SUM', col('weight_kg')), 0), 'totalWeight']
      ],
      include: [
        {
          model: Collection,
          as: 'collection',
          attributes: [],
          where: whereConditions,
          required: true,
        },
      ],
      raw: true,
    }) as unknown as { totalWeight: string } | null;

    return result ? parseFloat(result.totalWeight) : 0;
  }

  private async getWasteTypeDistribution(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<WasteTypeDistribution[]> {
    const whereConditions: Record<string, unknown> = {
      ...dateFilter,
      approvalStatus: ApprovalStatus.APPROVED,
    };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const countResults = await Collection.findAll({
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
          required: true,
        },
      ],
      group: [
        'Collection.waste_type_id',
        'wasteType.id',
        'wasteType.name',
        'wasteType.category',
      ],
      raw: true,
    }) as unknown as Array<{
      wasteTypeId: string;
      count: string;
      'wasteType.name': string;
      'wasteType.category': string;
    }>;

    const totalWeight = await this.getTotalWeightOptimized(whereConditions);

    const distribution: WasteTypeDistribution[] = await Promise.all(
      countResults.map(async (result) => {
        const weightResult = await GravimetricData.findOne({
          attributes: [[fn('COALESCE', fn('SUM', col('weight_kg')), 0), 'total']],
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: [],
              where: {
                ...whereConditions,
                wasteTypeId: result.wasteTypeId,
              },
              required: true,
            },
          ],
          raw: true,
        }) as unknown as { total: string } | null;

        const itemWeight = weightResult ? parseFloat(weightResult.total) : 0;

        return {
          wasteTypeId: result.wasteTypeId,
          wasteTypeName: result['wasteType.name'],
          category: result['wasteType.category'],
          count: parseInt(result.count),
          totalWeightKg: itemWeight,
          percentage: totalWeight > 0 ? (itemWeight / totalWeight) * 100 : 0,
        };
      })
    );

    return distribution.sort((a, b) => b.totalWeightKg - a.totalWeightKg);
  }

  private async getTreatmentTypeDistribution(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<TreatmentTypeDistribution[]> {
    const whereConditions: Record<string, unknown> = {
      ...dateFilter,
      approvalStatus: ApprovalStatus.APPROVED,
    };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const countResults = await Collection.findAll({
      where: whereConditions,
      attributes: [
        'treatmentType',
        [fn('COUNT', col('Collection.id')), 'count'],
      ],
      group: ['Collection.treatment_type'],
      raw: true,
    }) as unknown as Array<{
      treatmentType: string;
      count: string;
    }>;

    const totalWeight = await this.getTotalWeightOptimized(whereConditions);

    const distribution: TreatmentTypeDistribution[] = await Promise.all(
      countResults.map(async (result) => {
        const weightResult = await GravimetricData.findOne({
          attributes: [[fn('COALESCE', fn('SUM', col('weight_kg')), 0), 'total']],
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: [],
              where: {
                ...whereConditions,
                treatmentType: result.treatmentType,
              },
              required: true,
            },
          ],
          raw: true,
        }) as unknown as { total: string } | null;

        const itemWeight = weightResult ? parseFloat(weightResult.total) : 0;

        return {
          treatmentType: result.treatmentType,
          count: parseInt(result.count),
          totalWeightKg: itemWeight,
          percentage: totalWeight > 0 ? (itemWeight / totalWeight) * 100 : 0,
        };
      })
    );

    return distribution.sort((a, b) => b.totalWeightKg - a.totalWeightKg);
  }

  private async getTopUnits(
    dateFilter: Record<string, unknown>,
    clientId?: string
  ): Promise<TopUnit[]> {
    const whereConditions: Record<string, unknown> = {
      ...dateFilter,
      approvalStatus: ApprovalStatus.APPROVED,
    };
    if (clientId) {
      whereConditions.clientId = clientId;
    }

    const countResults = await Collection.findAll({
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
          required: true,
          include: [
            {
              model: Client,
              as: 'client',
              attributes: ['name'],
              required: true,
            },
          ],
        },
      ],
      group: [
        'Collection.unit_id',
        'unit.id',
        'unit.name',
        'unit->client.id',
        'unit->client.name',
      ],
      order: [[literal('COUNT("Collection"."id")'), 'DESC']],
      limit: TOP_UNITS_LIMIT,
      raw: true,
    }) as unknown as Array<{
      unitId: string;
      totalCollections: string;
      'unit.name': string;
      'unit.client.name': string;
    }>;

    const topUnits: TopUnit[] = await Promise.all(
      countResults.map(async (result) => {
        const weightResult = await GravimetricData.findOne({
          attributes: [[fn('COALESCE', fn('SUM', col('weight_kg')), 0), 'total']],
          include: [
            {
              model: Collection,
              as: 'collection',
              attributes: [],
              where: {
                ...whereConditions,
                unitId: result.unitId,
              },
              required: true,
            },
          ],
          raw: true,
        }) as unknown as { total: string } | null;

        return {
          unitId: result.unitId,
          unitName: result['unit.name'],
          clientName: result['unit.client.name'],
          totalCollections: parseInt(result.totalCollections),
          totalWeightKg: weightResult ? parseFloat(weightResult.total) : 0,
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

export interface DashboardSummary {
  totalCollections: number;
  totalWeightKg: number;
  activeClients: number;
  activeUnits: number;
}

export interface WasteTypeDistribution {
  wasteTypeId: string;
  wasteTypeName: string;
  category: string;
  count: number;
  totalWeightKg: number;
  percentage: number;
}

export interface CollectionByPeriod {
  period: string;
  count: number;
  totalWeightKg: number;
}

export interface WeightEvolution {
  date: string;
  totalWeightKg: number;
  collections: number;
}

export interface TopUnit {
  unitId: string;
  unitName: string;
  clientName: string;
  totalCollections: number;
  totalWeightKg: number;
}

export interface TreatmentTypeDistribution {
  treatmentType: string;
  count: number;
  totalWeightKg: number;
  percentage: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  wasteTypeDistribution: WasteTypeDistribution[];
  treatmentTypeDistribution: TreatmentTypeDistribution[];
  collectionsByPeriod: CollectionByPeriod[];
  weightEvolution: WeightEvolution[];
  topUnits: TopUnit[];
}

export interface DashboardFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
}

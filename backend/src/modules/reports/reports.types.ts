export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  unitId?: string;
  wasteTypeId?: string;
  status?: string;
}

export type ExportFormat = 'csv' | 'xlsx';

export interface ExportRequest {
  format: ExportFormat;
  filters: ReportFilters;
}

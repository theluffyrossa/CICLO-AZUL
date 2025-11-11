import { GravimetricDataSource } from '@shared/types';

export interface CreateGravimetricDataDto {
  collectionId: string;
  weightKg: number;
  source: GravimetricDataSource;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateGravimetricDataDto {
  weightKg?: number;
  source?: GravimetricDataSource;
  deviceId?: string;
  metadata?: Record<string, unknown>;
}

export interface CsvImportRow {
  collectionId: string;
  weightKg: number;
  deviceId?: string;
}

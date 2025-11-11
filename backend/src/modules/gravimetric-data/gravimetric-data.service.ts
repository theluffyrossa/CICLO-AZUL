import { GravimetricData, Collection } from '@database/models';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';
import { GravimetricDataSource } from '@shared/types';
import {
  CreateGravimetricDataDto,
  UpdateGravimetricDataDto,
  CsvImportRow,
} from './gravimetric-data.types';

export class GravimetricDataService {
  async create(data: CreateGravimetricDataDto): Promise<GravimetricData> {
    await this.validateCollectionExists(data.collectionId);
    return GravimetricData.create(data as any);
  }

  async findByCollection(collectionId: string): Promise<GravimetricData[]> {
    return GravimetricData.findAll({
      where: { collectionId },
      order: [['createdAt', 'DESC']],
    });
  }

  async findById(id: string): Promise<GravimetricData> {
    const data = await GravimetricData.findByPk(id);

    if (!data) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Gravimetric data not found');
    }

    return data;
  }

  async update(id: string, data: UpdateGravimetricDataDto): Promise<GravimetricData> {
    const gravimetricData = await this.findById(id);
    await gravimetricData.update(data);
    return gravimetricData;
  }

  async delete(id: string): Promise<void> {
    const gravimetricData = await this.findById(id);
    await gravimetricData.destroy();
  }

  async importFromCsv(rows: CsvImportRow[]): Promise<GravimetricData[]> {
    const validatedRows = await this.validateCsvRows(rows);

    const dataToCreate = validatedRows.map((row) => ({
      collectionId: row.collectionId,
      weightKg: row.weightKg,
      source: GravimetricDataSource.CSV_IMPORT,
      deviceId: row.deviceId,
      metadata: { importedAt: new Date().toISOString() },
    }));

    return GravimetricData.bulkCreate(dataToCreate);
  }

  async createFromApi(
    collectionId: string,
    weightKg: number,
    deviceId?: string
  ): Promise<GravimetricData> {
    await this.validateCollectionExists(collectionId);

    return GravimetricData.create({
      collectionId,
      weightKg,
      source: GravimetricDataSource.API,
      deviceId,
      metadata: { receivedAt: new Date().toISOString() },
    });
  }

  private async validateCollectionExists(collectionId: string): Promise<void> {
    const collection = await Collection.findByPk(collectionId);
    if (!collection) {
      throw new AppError(HTTP_STATUS.NOT_FOUND, 'Collection not found');
    }
  }

  private async validateCsvRows(rows: CsvImportRow[]): Promise<CsvImportRow[]> {
    if (!rows || rows.length === 0) {
      throw new AppError(HTTP_STATUS.BAD_REQUEST, 'CSV file is empty');
    }

    const validRows: CsvImportRow[] = [];
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const rowNumber = i + 2;

      if (!row.collectionId) {
        errors.push(`Row ${rowNumber}: Missing collectionId`);
        continue;
      }

      if (!row.weightKg || row.weightKg < 0) {
        errors.push(`Row ${rowNumber}: Invalid weight`);
        continue;
      }

      const collection = await Collection.findByPk(row.collectionId);
      if (!collection) {
        errors.push(`Row ${rowNumber}: Collection not found`);
        continue;
      }

      validRows.push(row);
    }

    if (errors.length > 0) {
      throw new AppError(
        HTTP_STATUS.BAD_REQUEST,
        `CSV validation failed:\n${errors.join('\n')}`
      );
    }

    return validRows;
  }
}

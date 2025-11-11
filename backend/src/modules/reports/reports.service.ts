import { Op, WhereOptions } from 'sequelize';
import ExcelJS from 'exceljs';
import { Collection, Client, Unit, WasteType, User, GravimetricData } from '@database/models';
import { ReportFilters, ExportFormat } from './reports.types';
import { format } from 'date-fns';

interface CollectionReportData {
  id: string;
  collectionDate: Date;
  clientName: string;
  unitName: string;
  wasteTypeName: string;
  userName: string;
  status: string;
  totalWeight: number;
  notes: string | null;
}

export class ReportsService {
  async generateReport(filters: ReportFilters, exportFormat: ExportFormat): Promise<Buffer> {
    const data = await this.getCollectionsData(filters);

    if (exportFormat === 'csv') {
      return this.generateCsv(data, filters);
    }

    return this.generateExcel(data, filters);
  }

  private async getCollectionsData(filters: ReportFilters): Promise<CollectionReportData[]> {
    const whereConditions = this.buildWhereConditions(filters);

    const collections = await Collection.findAll({
      where: whereConditions,
      order: [['collectionDate', 'DESC']],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name'],
        },
        {
          model: Unit,
          as: 'unit',
          attributes: ['name'],
        },
        {
          model: WasteType,
          as: 'wasteType',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name'],
        },
        {
          model: GravimetricData,
          as: 'gravimetricData',
        },
      ],
    });

    return collections.map((collection) => ({
      id: collection.id,
      collectionDate: collection.collectionDate,
      clientName: collection.client?.name || '',
      unitName: collection.unit?.name || '',
      wasteTypeName: collection.wasteType?.name || '',
      userName: collection.user?.name || '',
      status: collection.status,
      totalWeight: this.calculateTotalWeight(collection.gravimetricData || []),
      notes: collection.notes,
    }));
  }

  private calculateTotalWeight(gravimetricData: GravimetricData[]): number {
    return gravimetricData.reduce((sum, data) => {
      const weight = typeof data.weightKg === 'number' ? data.weightKg : parseFloat(String(data.weightKg));
      return sum + (isNaN(weight) ? 0 : weight);
    }, 0);
  }

  private async generateCsv(
    data: CollectionReportData[],
    filters: ReportFilters
  ): Promise<Buffer> {
    const lines: string[] = [];

    lines.push('RELATÓRIO DE COLETAS - CICLO AZUL');
    lines.push(`Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`);

    if (filters.startDate || filters.endDate) {
      const period = `${filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy') : ''} - ${
        filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy') : ''
      }`;
      lines.push(`Período: ${period}`);
    }

    lines.push('');

    const headers = [
      'Data',
      'Cliente',
      'Unidade',
      'Tipo de Resíduo',
      'Responsável',
      'Status',
      'Peso Total (kg)',
      'Observações',
    ];
    lines.push(headers.join(';'));

    data.forEach((row) => {
      const values = [
        format(row.collectionDate, 'dd/MM/yyyy HH:mm'),
        row.clientName,
        row.unitName,
        row.wasteTypeName,
        row.userName,
        row.status,
        typeof row.totalWeight === 'number' ? row.totalWeight.toFixed(2) : '0.00',
        row.notes || '',
      ];
      lines.push(values.join(';'));
    });

    lines.push('');
    lines.push(`Total de coletas: ${data.length}`);
    const totalWeight = data.reduce((sum, row) => sum + (typeof row.totalWeight === 'number' ? row.totalWeight : 0), 0);
    lines.push(`Peso total: ${totalWeight.toFixed(2)} kg`);

    return Buffer.from(lines.join('\n'), 'utf-8');
  }

  private async generateExcel(
    data: CollectionReportData[],
    filters: ReportFilters
  ): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Coletas');

    worksheet.mergeCells('A1:H1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = 'RELATÓRIO DE COLETAS - CICLO AZUL';
    titleCell.font = { bold: true, size: 16 };
    titleCell.alignment = { horizontal: 'center' };

    worksheet.getCell('A2').value = `Gerado em: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`;

    if (filters.startDate || filters.endDate) {
      const period = `${filters.startDate ? format(new Date(filters.startDate), 'dd/MM/yyyy') : ''} - ${
        filters.endDate ? format(new Date(filters.endDate), 'dd/MM/yyyy') : ''
      }`;
      worksheet.getCell('A3').value = `Período: ${period}`;
    }

    const headerRow = worksheet.getRow(5);
    headerRow.values = [
      'Data',
      'Cliente',
      'Unidade',
      'Tipo de Resíduo',
      'Responsável',
      'Status',
      'Peso Total (kg)',
      'Observações',
    ];
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF4472C4' },
    };
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    data.forEach((row, index) => {
      const excelRow = worksheet.getRow(6 + index);
      excelRow.values = [
        format(row.collectionDate, 'dd/MM/yyyy HH:mm'),
        row.clientName,
        row.unitName,
        row.wasteTypeName,
        row.userName,
        row.status,
        row.totalWeight,
        row.notes || '',
      ];
    });

    worksheet.columns = [
      { width: 18 },
      { width: 25 },
      { width: 25 },
      { width: 20 },
      { width: 20 },
      { width: 15 },
      { width: 18 },
      { width: 35 },
    ];

    const summaryRow = worksheet.getRow(6 + data.length + 1);
    summaryRow.values = [`Total de coletas: ${data.length}`];
    summaryRow.font = { bold: true };

    const totalWeight = data.reduce((sum, row) => sum + (typeof row.totalWeight === 'number' ? row.totalWeight : 0), 0);
    const weightRow = worksheet.getRow(6 + data.length + 2);
    weightRow.values = [`Peso total: ${totalWeight.toFixed(2)} kg`];
    weightRow.font = { bold: true };

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  private buildWhereConditions(filters: ReportFilters): WhereOptions<Collection> {
    const conditions: Record<string | symbol, unknown> = {};

    if (filters.clientId) {
      conditions.clientId = filters.clientId;
    }

    if (filters.unitId) {
      conditions.unitId = filters.unitId;
    }

    if (filters.wasteTypeId) {
      conditions.wasteTypeId = filters.wasteTypeId;
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
}

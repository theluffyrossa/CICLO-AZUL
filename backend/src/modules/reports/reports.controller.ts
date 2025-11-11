import { Response, NextFunction } from 'express';
import { ReportsService } from './reports.service';
import { ReportFilters, ExportFormat } from './reports.types';
import { AuthRequest } from '@shared/types';
import { format } from 'date-fns';

export class ReportsController {
  private reportsService: ReportsService;

  constructor() {
    this.reportsService = new ReportsService();
  }

  export = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: ReportFilters = req.query;
      const exportFormat: ExportFormat = (req.query.format as ExportFormat) || 'xlsx';

      const buffer = await this.reportsService.generateReport(filters, exportFormat);

      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `relatorio_coletas_${timestamp}.${exportFormat}`;

      if (exportFormat === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      } else {
        res.setHeader(
          'Content-Type',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      }

      res.send(buffer);
    } catch (error) {
      next(error);
    }
  };
}

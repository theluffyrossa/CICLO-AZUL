import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardExportService } from './dashboard-export.service';
import { DashboardFilters } from './dashboard.types';
import { AuthRequest, UserRole } from '@shared/types';
import { sendSuccess } from '@shared/utils/response.util';
import { ClientsService } from '../clients/clients.service';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS } from '@shared/constants';

export class DashboardController {
  private dashboardService: DashboardService;
  private exportService: DashboardExportService;
  private clientsService: ClientsService;

  constructor() {
    this.dashboardService = new DashboardService();
    this.exportService = new DashboardExportService();
    this.clientsService = new ClientsService();
  }

  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryClientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
      const filters: DashboardFilters = {
        ...req.query,
        // If user is CLIENT, force filter by their clientId
        clientId: req.user?.role === 'CLIENT' ? req.user.clientId : queryClientId,
      };
      const data = await this.dashboardService.getDashboardData(filters);

      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };

  getMyWasteTypes = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (req.user?.role !== UserRole.CLIENT) {
        throw new AppError(HTTP_STATUS.FORBIDDEN, 'Only CLIENT users can access this endpoint');
      }

      if (!req.user.clientId) {
        throw new AppError(HTTP_STATUS.BAD_REQUEST, 'Client ID not found in user data');
      }

      const wasteTypes = await this.clientsService.getClientWasteTypes(req.user.clientId);

      sendSuccess(res, wasteTypes);
    } catch (error) {
      next(error);
    }
  };

  exportPDF = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryClientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
      const filters: DashboardFilters = {
        ...req.query,
        clientId: req.user?.role === 'CLIENT' ? req.user.clientId : queryClientId,
      };

      const pdfBuffer = await this.exportService.generatePDF(filters);

      const filename = `relatorio-coletas-${new Date().toISOString().split('T')[0]}.pdf`;

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  };

  exportCSV = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const queryClientId = typeof req.query.clientId === 'string' ? req.query.clientId : undefined;
      const filters: DashboardFilters = {
        ...req.query,
        clientId: req.user?.role === 'CLIENT' ? req.user.clientId : queryClientId,
      };

      const csvBuffer = await this.exportService.generateCSV(filters);

      const filename = `relatorio-coletas-${new Date().toISOString().split('T')[0]}.csv`;

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Length', csvBuffer.length);

      res.send(csvBuffer);
    } catch (error) {
      next(error);
    }
  };
}

import { Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardFilters } from './dashboard.types';
import { AuthRequest } from '@shared/types';
import { sendSuccess } from '@shared/utils/response.util';

export class DashboardController {
  private dashboardService: DashboardService;

  constructor() {
    this.dashboardService = new DashboardService();
  }

  getDashboard = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters: DashboardFilters = req.query;
      const data = await this.dashboardService.getDashboardData(filters);

      sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  };
}

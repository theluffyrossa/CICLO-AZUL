import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { LoginRequest, RefreshTokenRequest } from './auth.types';
import { sendSuccess } from '@shared/utils/response.util';
import { SUCCESS_MESSAGES, HTTP_STATUS } from '@shared/constants';
import { AuthRequest } from '@shared/types';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const loginData: LoginRequest = req.body;
      const ipAddress = req.ip;

      const result = await this.authService.login(loginData, ipAddress);

      sendSuccess(res, result, SUCCESS_MESSAGES.LOGIN_SUCCESS);
    } catch (error) {
      next(error);
    }
  };

  refreshToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { refreshToken }: RefreshTokenRequest = req.body;

      const result = await this.authService.refreshToken(refreshToken);

      sendSuccess(res, result, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  };

  logout = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      const ipAddress = req.ip;

      if (userId) {
        await this.authService.logout(userId, ipAddress);
      }

      res.status(HTTP_STATUS.NO_CONTENT).send();
    } catch (error) {
      next(error);
    }
  };

  me = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      sendSuccess(res, req.user, 'User retrieved successfully');
    } catch (error) {
      next(error);
    }
  };
}

import { User } from '@database/models';
import { AuditLog } from '@database/models/AuditLog.model';
import { comparePassword } from '@shared/utils/password.util';
import { generateTokenPair, verifyRefreshToken } from '@shared/utils/jwt.util';
import { AppError } from '@shared/middleware/error.middleware';
import { HTTP_STATUS, ERROR_MESSAGES } from '@shared/constants';
import { AuditAction, UserRole } from '@shared/types';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from './auth.types';

export class AuthService {
  async login(loginData: LoginRequest, ipAddress?: string): Promise<LoginResponse> {
    const user = await this.findUserByEmail(loginData.email);

    await this.validateUserCredentials(user, loginData.password);
    await this.updateLastLogin(user.id);
    await this.createLoginAuditLog(user.id, ipAddress);

    const tokens = this.generateUserTokens(user);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(token: string): Promise<RefreshTokenResponse> {
    try {
      const payload = verifyRefreshToken(token);

      const user = await User.findByPk(payload.id);
      if (!user || !user.active) {
        throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_TOKEN);
      }

      const tokens = this.generateUserTokens(user);

      return {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_TOKEN);
    }
  }

  async logout(userId: string, ipAddress?: string): Promise<void> {
    await AuditLog.create({
      userId,
      action: AuditAction.LOGOUT,
      tableName: 'users',
      recordId: userId,
      ipAddress,
    });
  }

  private async findUserByEmail(email: string): Promise<User> {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
    return user;
  }

  private async validateUserCredentials(user: User, password: string): Promise<void> {
    if (!user.active) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, 'User account is inactive');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.INVALID_CREDENTIALS);
    }
  }

  private async updateLastLogin(userId: string): Promise<void> {
    await User.update(
      { lastLoginAt: new Date() },
      { where: { id: userId } }
    );
  }

  private async createLoginAuditLog(userId: string, ipAddress?: string): Promise<void> {
    await AuditLog.create({
      userId,
      action: AuditAction.LOGIN,
      tableName: 'users',
      recordId: userId,
      ipAddress,
    });
  }

  private generateUserTokens(user: User): { accessToken: string; refreshToken: string } {
    return generateTokenPair({
      id: user.id,
      email: user.email,
      role: user.role as UserRole,
      name: user.name,
    });
  }
}

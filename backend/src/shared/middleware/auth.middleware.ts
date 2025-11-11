import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authConfig } from '@config/auth.config';
import { AuthRequest, AuthUser, UserRole } from '../types';
import { sendUnauthorized, sendForbidden } from '../utils/response.util';
import { ERROR_MESSAGES } from '../constants';
import { AppError } from './error.middleware';
import { HTTP_STATUS } from '../constants';

interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

const extractTokenFromHeader = (authorization?: string): string | null => {
  if (!authorization) return null;
  if (!authorization.startsWith('Bearer ')) return null;
  return authorization.substring(7);
};

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      sendUnauthorized(res, ERROR_MESSAGES.UNAUTHORIZED);
      return;
    }

    const decoded = jwt.verify(token, authConfig.jwtSecret) as JwtPayload;

    const user: AuthUser = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      name: decoded.name,
    };

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendUnauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
      return;
    }
    if (error instanceof jwt.JsonWebTokenError) {
      sendUnauthorized(res, ERROR_MESSAGES.INVALID_TOKEN);
      return;
    }
    next(error);
  }
};

export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError(HTTP_STATUS.UNAUTHORIZED, ERROR_MESSAGES.UNAUTHORIZED);
    }

    if (!allowedRoles.includes(req.user.role)) {
      sendForbidden(res, ERROR_MESSAGES.FORBIDDEN);
      return;
    }

    next();
  };
};

export const isAdmin = authorize(UserRole.ADMIN);
export const isOperatorOrAdmin = authorize(UserRole.OPERATOR, UserRole.ADMIN);

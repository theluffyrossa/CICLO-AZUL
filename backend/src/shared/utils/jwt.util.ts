import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { authConfig } from '@config/auth.config';
import { UserRole } from '../types';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  name: string;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: authConfig.jwtExpiresIn as StringValue,
  };
  return jwt.sign(payload, authConfig.jwtSecret as Secret, options);
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  const options: SignOptions = {
    expiresIn: authConfig.jwtRefreshExpiresIn as StringValue,
  };
  return jwt.sign(payload, authConfig.jwtRefreshSecret as Secret, options);
};

export const generateTokenPair = (payload: TokenPayload): TokenPair => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
  };
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, authConfig.jwtSecret as Secret) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, authConfig.jwtRefreshSecret as Secret) as TokenPayload;
};

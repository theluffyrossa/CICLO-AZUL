import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_JWT_EXPIRES_IN = '24h';
const DEFAULT_REFRESH_EXPIRES_IN = '7d';
const DEFAULT_SESSION_TIMEOUT = 30;
const MIN_JWT_SECRET_LENGTH = 32;

interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  jwtRefreshSecret: string;
  jwtRefreshExpiresIn: string;
  sessionTimeoutMinutes: number;
  passwordMinLength: number;
  passwordRequireLetters: boolean;
  passwordRequireNumbers: boolean;
}

const validateJwtSecret = (secret: string | undefined, name: string): string => {
  if (!secret) {
    throw new Error(`${name} is required in environment variables`);
  }
  if (secret.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`${name} must be at least ${MIN_JWT_SECRET_LENGTH} characters long`);
  }
  return secret;
};

const parseNumber = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

export const authConfig: AuthConfig = {
  jwtSecret: validateJwtSecret(process.env.JWT_SECRET, 'JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || DEFAULT_JWT_EXPIRES_IN,
  jwtRefreshSecret: validateJwtSecret(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || DEFAULT_REFRESH_EXPIRES_IN,
  sessionTimeoutMinutes: parseNumber(process.env.SESSION_TIMEOUT_MINUTES, DEFAULT_SESSION_TIMEOUT),
  passwordMinLength: 8,
  passwordRequireLetters: true,
  passwordRequireNumbers: true,
};

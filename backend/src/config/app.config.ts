import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const DEFAULT_PORT = 3000;
const DEFAULT_API_PREFIX = '/api';
const DEFAULT_BCRYPT_ROUNDS = 10;
const DEFAULT_RATE_LIMIT_WINDOW = 900000;
const DEFAULT_RATE_LIMIT_MAX = 100;

interface AppConfig {
  env: string;
  port: number;
  apiPrefix: string;
  corsOrigin: string[] | boolean;
  bcryptSaltRounds: number;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
  uploadDir: string;
  uploadTempDir: string;
}

const parsePort = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseCorsOrigin = (value: string | undefined): string[] | boolean => {
  if (!value) return ['http://localhost:19006'];
  if (value === '*') return true;
  return value.split(',').map((origin) => origin.trim());
};

export const appConfig: AppConfig = {
  env: process.env.NODE_ENV || 'development',
  port: parsePort(process.env.PORT, DEFAULT_PORT),
  apiPrefix: process.env.API_PREFIX || DEFAULT_API_PREFIX,
  corsOrigin: parseCorsOrigin(process.env.CORS_ORIGIN),
  bcryptSaltRounds: parsePort(process.env.BCRYPT_SALT_ROUNDS, DEFAULT_BCRYPT_ROUNDS),
  rateLimitWindowMs: parsePort(process.env.RATE_LIMIT_WINDOW_MS, DEFAULT_RATE_LIMIT_WINDOW),
  rateLimitMaxRequests: parsePort(process.env.RATE_LIMIT_MAX_REQUESTS, DEFAULT_RATE_LIMIT_MAX),
  uploadDir: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  uploadTempDir: process.env.UPLOAD_TEMP_DIR || path.join(__dirname, '../../uploads/temp'),
};

export const isProduction = (): boolean => appConfig.env === 'production';
export const isDevelopment = (): boolean => appConfig.env === 'development';
export const isTest = (): boolean => appConfig.env === 'test';

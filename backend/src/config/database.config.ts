import { Dialect } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const DEFAULT_DB_POOL_MAX = 20;
const DEFAULT_DB_POOL_MIN = 5;
const DEFAULT_DB_POOL_ACQUIRE = 30000;
const DEFAULT_DB_POOL_IDLE = 10000;

interface DatabaseConfig {
  development: DatabaseEnvironmentConfig;
  test: DatabaseEnvironmentConfig;
  production: DatabaseEnvironmentConfig;
}

interface DatabaseEnvironmentConfig {
  username: string;
  password: string;
  database: string;
  host: string;
  port: number;
  dialect: Dialect;
  logging: boolean | ((sql: string) => void);
  pool: {
    max: number;
    min: number;
    acquire: number;
    idle: number;
  };
  dialectOptions?: {
    ssl?: {
      require: boolean;
      rejectUnauthorized: boolean;
    };
  };
}

const parsePort = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const parseDatabaseUrl = (url: string | undefined): Partial<DatabaseEnvironmentConfig> | null => {
  if (!url) return null;

  try {
    const dbUrl = new URL(url);
    return {
      username: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      host: dbUrl.hostname,
      port: parseInt(dbUrl.port) || 5432,
    };
  } catch {
    return null;
  }
};

const createDatabaseConfig = (logging: boolean | ((sql: string) => void)): DatabaseEnvironmentConfig => {
  const urlConfig = parseDatabaseUrl(process.env.DATABASE_URL);

  return {
    username: urlConfig?.username || process.env.DB_USER || 'cicloazul',
    password: urlConfig?.password || process.env.DB_PASSWORD || 'cicloazul123',
    database: urlConfig?.database || process.env.DB_NAME || 'cicloazul',
    host: urlConfig?.host || process.env.DB_HOST || 'localhost',
    port: urlConfig?.port || parsePort(process.env.DB_PORT, 5432),
    dialect: 'postgres' as Dialect,
    logging,
    pool: {
      max: parsePort(process.env.DB_POOL_MAX, DEFAULT_DB_POOL_MAX),
      min: parsePort(process.env.DB_POOL_MIN, DEFAULT_DB_POOL_MIN),
      acquire: DEFAULT_DB_POOL_ACQUIRE,
      idle: DEFAULT_DB_POOL_IDLE,
    },
  };
};

export const databaseConfig: DatabaseConfig = {
  development: createDatabaseConfig(console.log),
  test: createDatabaseConfig(false),
  production: {
    ...createDatabaseConfig(false),
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};

export const getCurrentDatabaseConfig = (): DatabaseEnvironmentConfig => {
  const env = (process.env.NODE_ENV || 'development') as keyof DatabaseConfig;
  return databaseConfig[env];
};

import { Sequelize } from 'sequelize-typescript';
import { getCurrentDatabaseConfig } from '@config/database.config';
import { logger } from '@config/logger.config';
import {
  User,
  Client,
  Unit,
  WasteType,
  Collection,
  GravimetricData,
  Image,
  AuditLog,
  LgpdConsent,
  Recipient,
  ClientWasteType,
} from './models';

const dbConfig = getCurrentDatabaseConfig();

export const sequelize = new Sequelize({
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  host: dbConfig.host,
  port: dbConfig.port,
  dialect: dbConfig.dialect,
  logging: dbConfig.logging,
  pool: dbConfig.pool,
  dialectOptions: dbConfig.dialectOptions,
  models: [User, Client, Unit, WasteType, Collection, GravimetricData, Image, AuditLog, LgpdConsent, Recipient, ClientWasteType],
  define: {
    timestamps: true,
    underscored: true, // Converte camelCase para snake_case no banco
    freezeTableName: true,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    throw error;
  }
};

export const syncDatabase = async (force: boolean = false): Promise<void> => {
  try {
    await sequelize.sync({ force });
    logger.info(`Database synchronized successfully${force ? ' (forced)' : ''}`);
  } catch (error) {
    logger.error('Error synchronizing database:', error);
    throw error;
  }
};

export const closeDatabase = async (): Promise<void> => {
  try {
    await sequelize.close();
    logger.info('Database connection closed');
  } catch (error) {
    logger.error('Error closing database connection:', error);
    throw error;
  }
};

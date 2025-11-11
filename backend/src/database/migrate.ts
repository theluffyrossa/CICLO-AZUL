import { connectDatabase, syncDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';

const runMigrations = async (): Promise<void> => {
  try {
    logger.info('Starting database migration...');

    await connectDatabase();
    await syncDatabase(false);

    logger.info('Database migration completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

runMigrations();

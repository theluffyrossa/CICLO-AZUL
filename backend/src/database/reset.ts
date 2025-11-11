import { connectDatabase, syncDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';

const resetDatabase = async (): Promise<void> => {
  try {
    logger.warn('⚠️  WARNING: This will delete all data in the database!');

    await connectDatabase();
    await syncDatabase(true);

    logger.info('Database reset completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Database reset failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

resetDatabase();

import { connectDatabase, syncDatabase, closeDatabase, sequelize } from './connection';
import { logger } from '@config/logger.config';
import { promises as fs } from 'fs';
import path from 'path';

interface Migration {
  up: (queryInterface: ReturnType<typeof sequelize.getQueryInterface>) => Promise<void>;
  down: (queryInterface: ReturnType<typeof sequelize.getQueryInterface>) => Promise<void>;
}

const runMigrationFiles = async (): Promise<void> => {
  const migrationsDir = path.join(__dirname, 'migrations');

  try {
    const files = await fs.readdir(migrationsDir);
    const migrationFiles = files
      .filter((file: string) => (file.endsWith('.ts') || file.endsWith('.js')) && !file.endsWith('.d.ts'))
      .sort();

    logger.info(`Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      try {
        logger.info(`Running migration: ${file}`);
        const migrationPath = path.join(migrationsDir, file);
        const migration = await import(migrationPath) as Migration;

        if (typeof migration.up === 'function') {
          await migration.up(sequelize.getQueryInterface());
          logger.info(`Migration ${file} completed successfully`);
        } else {
          logger.warn(`Migration ${file} does not have an 'up' function`);
        }
      } catch (error) {
        logger.error(`Failed to run migration ${file}:`, error);
        throw error;
      }
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      logger.info('No migrations directory found, skipping migrations');
    } else {
      throw error;
    }
  }
};

const runMigrations = async (): Promise<void> => {
  try {
    logger.info('Starting database migration...');

    await connectDatabase();
    await syncDatabase(false);
    await runMigrationFiles();

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

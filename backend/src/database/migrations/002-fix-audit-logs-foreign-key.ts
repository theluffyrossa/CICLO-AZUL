import { QueryInterface } from 'sequelize';
import { logger } from '@config/logger.config';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  logger.info('Running migration: fix audit_logs foreign key constraint');

  try {
    // Drop the existing foreign key constraint if it exists
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_logs
      DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    `);

    // Re-add the foreign key constraint with proper settings
    // This allows the userId to be NULL or reference a valid user
    // It also allows the audit log to remain even if the user is deleted
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_logs
      ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE SET NULL
      ON UPDATE CASCADE;
    `);

    logger.info('Migration completed: audit_logs foreign key constraint fixed');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  logger.info('Reverting migration: restore original audit_logs foreign key');

  try {
    // Drop the modified constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_logs
      DROP CONSTRAINT IF EXISTS audit_logs_user_id_fkey;
    `);

    // Restore the original constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE audit_logs
      ADD CONSTRAINT audit_logs_user_id_fkey
      FOREIGN KEY (user_id)
      REFERENCES users(id);
    `);

    logger.info('Migration reverted: audit_logs foreign key constraint restored');
  } catch (error) {
    logger.error('Migration revert failed:', error);
    throw error;
  }
};

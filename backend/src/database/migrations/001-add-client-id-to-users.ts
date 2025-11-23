import { QueryInterface, DataTypes } from 'sequelize';
import { logger } from '@config/logger.config';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  logger.info('Running migration: add client_id to users table');

  try {
    // Check if column already exists
    const tableDescription = await queryInterface.describeTable('users');

    if (!tableDescription.client_id) {
      // Add client_id column to users table
      await queryInterface.addColumn('users', 'client_id', {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });

      // Add index for better query performance
      await queryInterface.addIndex('users', ['client_id'], {
        name: 'idx_users_client_id',
      });

      logger.info('Migration completed: client_id column added to users table');
    } else {
      logger.info('Migration skipped: client_id column already exists');
    }
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  logger.info('Reverting migration: remove client_id from users table');

  try {
    // Remove index
    await queryInterface.removeIndex('users', 'idx_users_client_id');

    // Remove client_id column
    await queryInterface.removeColumn('users', 'client_id');

    logger.info('Migration reverted: client_id column removed from users table');
  } catch (error) {
    logger.error('Migration revert failed:', error);
    throw error;
  }
};

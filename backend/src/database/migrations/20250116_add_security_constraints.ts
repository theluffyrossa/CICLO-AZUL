import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.addColumn(
      'recipients',
      'client_id',
      {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      { transaction }
    );

    await queryInterface.addIndex('recipients', ['client_id'], {
      name: 'idx_recipients_client_id',
      transaction,
    });

    await queryInterface.addIndex('collections', ['client_id'], {
      name: 'idx_collections_client_id',
      transaction,
    });

    await queryInterface.addIndex(
      'collections',
      ['client_id', 'collection_date'],
      {
        name: 'idx_collections_client_date',
        transaction,
      }
    );

    await queryInterface.addIndex('units', ['client_id'], {
      name: 'idx_units_client_id',
      transaction,
    });

    await queryInterface.addIndex('lgpd_consents', ['client_id'], {
      name: 'idx_lgpd_consents_client_id',
      transaction,
    });

    await queryInterface.addIndex('images', ['collection_id'], {
      name: 'idx_images_collection_id',
      transaction,
    });

    await queryInterface.addIndex('gravimetric_data', ['collection_id'], {
      name: 'idx_gravimetric_data_collection_id',
      transaction,
    });

    await queryInterface.addIndex('audit_logs', ['user_id'], {
      name: 'idx_audit_logs_user_id',
      transaction,
    });

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ADD CONSTRAINT check_client_role_has_client_id
      CHECK (
        (role = 'ADMIN') OR
        (role = 'CLIENT' AND client_id IS NOT NULL)
      );
    `,
      { transaction }
    );

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  const transaction = await queryInterface.sequelize.transaction();

  try {
    await queryInterface.sequelize.query(
      'ALTER TABLE users DROP CONSTRAINT IF EXISTS check_client_role_has_client_id;',
      { transaction }
    );

    await queryInterface.removeIndex('audit_logs', 'idx_audit_logs_user_id', {
      transaction,
    });
    await queryInterface.removeIndex(
      'gravimetric_data',
      'idx_gravimetric_data_collection_id',
      { transaction }
    );
    await queryInterface.removeIndex('images', 'idx_images_collection_id', {
      transaction,
    });
    await queryInterface.removeIndex(
      'lgpd_consents',
      'idx_lgpd_consents_client_id',
      { transaction }
    );
    await queryInterface.removeIndex('units', 'idx_units_client_id', {
      transaction,
    });
    await queryInterface.removeIndex(
      'collections',
      'idx_collections_client_date',
      { transaction }
    );
    await queryInterface.removeIndex('collections', 'idx_collections_client_id', {
      transaction,
    });
    await queryInterface.removeIndex('recipients', 'idx_recipients_client_id', {
      transaction,
    });

    await queryInterface.removeColumn('recipients', 'client_id', { transaction });

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

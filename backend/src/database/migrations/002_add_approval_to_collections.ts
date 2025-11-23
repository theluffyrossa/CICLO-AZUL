import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.addColumn('collections', 'approval_status', {
    type: DataTypes.ENUM('PENDING_APPROVAL', 'APPROVED', 'REJECTED'),
    allowNull: false,
    defaultValue: 'PENDING_APPROVAL',
    comment: 'Approval status for collection validation',
  });

  await queryInterface.addColumn('collections', 'approved_by', {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
    onUpdate: 'CASCADE',
    onDelete: 'SET NULL',
    comment: 'Admin user who approved/rejected the collection',
  });

  await queryInterface.addColumn('collections', 'approved_at', {
    type: DataTypes.DATE,
    allowNull: true,
    comment: 'Timestamp when collection was approved/rejected',
  });

  await queryInterface.addColumn('collections', 'rejection_reason', {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Reason for rejection if status is REJECTED',
  });

  await queryInterface.sequelize.query(`
    UPDATE collections
    SET approval_status = 'APPROVED',
        approved_at = updated_at
    WHERE approval_status IS NULL OR approval_status = 'PENDING_APPROVAL'
  `);
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('collections', 'rejection_reason');
  await queryInterface.removeColumn('collections', 'approved_at');
  await queryInterface.removeColumn('collections', 'approved_by');
  await queryInterface.removeColumn('collections', 'approval_status');

  await queryInterface.sequelize.query(`
    DROP TYPE IF EXISTS "enum_collections_approval_status"
  `);
}

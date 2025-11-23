import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if treatment_type column already exists
  const tableDescription = await queryInterface.describeTable('collections');

  if (!tableDescription.treatment_type) {
    await queryInterface.addColumn('collections', 'treatment_type', {
      type: DataTypes.ENUM('RECYCLING', 'COMPOSTING', 'REUSE', 'LANDFILL', 'ANIMAL_FEEDING'),
      allowNull: false,
      defaultValue: 'RECYCLING',
      comment: 'Type of waste treatment applied',
    });
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.removeColumn('collections', 'treatment_type');
  await queryInterface.sequelize.query(
    'DROP TYPE IF EXISTS "enum_collections_treatment_type";'
  );
}

import { DataTypes, QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const tableDescription = await queryInterface.describeTable('collections');

  if (!tableDescription.metadata) {
    await queryInterface.addColumn('collections', 'metadata', {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional metadata about the collection',
    });
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('collections', 'metadata');
};

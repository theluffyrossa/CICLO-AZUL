import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  const tableDescription = await queryInterface.describeTable('images');

  if (!tableDescription.url_medium) {
    await queryInterface.addColumn('images', 'url_medium', {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL for medium size thumbnail (800px)',
    });
  }

  if (!tableDescription.url_small) {
    await queryInterface.addColumn('images', 'url_small', {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL for small size thumbnail (400px)',
    });
  }

  if (!tableDescription.url_thumbnail) {
    await queryInterface.addColumn('images', 'url_thumbnail', {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'URL for thumbnail (200px)',
    });
  }

  if (!tableDescription.storage_key) {
    await queryInterface.addColumn('images', 'storage_key', {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'S3 key for cloud storage',
    });
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.removeColumn('images', 'url_medium');
  await queryInterface.removeColumn('images', 'url_small');
  await queryInterface.removeColumn('images', 'url_thumbnail');
  await queryInterface.removeColumn('images', 'storage_key');
};

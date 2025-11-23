import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Check if table already exists
  const tables = await queryInterface.showAllTables();

  if (!tables.includes('client_waste_types')) {
    await queryInterface.createTable('client_waste_types', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      client_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'clients',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      waste_type_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'waste_types',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });

    await queryInterface.addIndex('client_waste_types', ['client_id', 'waste_type_id'], {
      unique: true,
      name: 'unique_client_waste_type',
    });

    await queryInterface.addIndex('client_waste_types', ['client_id']);
    await queryInterface.addIndex('client_waste_types', ['waste_type_id']);
  }
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('client_waste_types');
}

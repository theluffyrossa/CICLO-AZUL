import { QueryInterface, DataTypes } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  // Check if username column already exists
  const tableDescription = await queryInterface.describeTable('users');

  if (!tableDescription.username) {
    // Adicionar coluna username
    await queryInterface.addColumn('users', 'username', {
      type: DataTypes.STRING(50),
      allowNull: true, // Temporariamente null para permitir migração
      unique: false, // Temporariamente não-único
    });

    // Preencher username com valores temporários baseados no email
    await queryInterface.sequelize.query(`
      UPDATE users
      SET username = LOWER(SPLIT_PART(email, '@', 1))
      WHERE username IS NULL
    `);

    // Tornar username obrigatório e único
    await queryInterface.changeColumn('users', 'username', {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    });

    // Criar índice para performance
    try {
      await queryInterface.addIndex('users', ['username'], {
        unique: true,
        name: 'users_username_unique',
      });
    } catch (error) {
      // Index might already exist, ignore error
    }
  }
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  // Remover índice
  await queryInterface.removeIndex('users', 'users_username_unique');

  // Remover coluna username
  await queryInterface.removeColumn('users', 'username');
};

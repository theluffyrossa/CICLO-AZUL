import { QueryInterface } from 'sequelize';

export const up = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
      DO $$
      BEGIN
        ALTER TYPE enum_users_role ADD VALUE IF NOT EXISTS 'CLIENT';
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      UPDATE users
      SET role = 'CLIENT'
      WHERE role = 'OPERATOR';
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role DROP DEFAULT;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE TYPE enum_users_role_new AS ENUM ('ADMIN', 'CLIENT');
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role TYPE enum_users_role_new
      USING role::text::enum_users_role_new;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      DROP TYPE enum_users_role;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TYPE enum_users_role_new RENAME TO enum_users_role;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role SET DEFAULT 'CLIENT';
      `,
      { transaction }
    );
  });
};

export const down = async (queryInterface: QueryInterface): Promise<void> => {
  await queryInterface.sequelize.transaction(async (transaction) => {
    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role DROP DEFAULT;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      CREATE TYPE enum_users_role_new AS ENUM ('ADMIN', 'OPERATOR');
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role TYPE enum_users_role_new
      USING role::text::enum_users_role_new;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      DROP TYPE enum_users_role;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TYPE enum_users_role_new RENAME TO enum_users_role;
      `,
      { transaction }
    );

    await queryInterface.sequelize.query(
      `
      ALTER TABLE users
      ALTER COLUMN role SET DEFAULT 'OPERATOR';
      `,
      { transaction }
    );
  });
};

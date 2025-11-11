import { connectDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';
import { User } from './models';

const ADMIN_EMAIL = 'admin@cicloazul.com';
const NEW_PASSWORD = '1234';

const resetAdminPassword = async (): Promise<void> => {
  try {
    logger.info('Resetting admin password...');

    await connectDatabase();

    const admin = await User.findOne({ where: { email: ADMIN_EMAIL } });

    if (!admin) {
      logger.error(`Admin user not found with email: ${ADMIN_EMAIL}`);
      logger.info('Please run: npm run seed');
      process.exit(1);
    }

    admin.password = NEW_PASSWORD;
    await admin.save();

    logger.info('✅ Admin password reset successfully!');
    logger.info(`Email: ${ADMIN_EMAIL}`);
    logger.info(`Password: ${NEW_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    logger.error('Failed to reset admin password:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

resetAdminPassword();

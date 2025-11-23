import { connectDatabase, closeDatabase } from '../connection';
import { Recipient } from '../models';
import { logger } from '@config/logger.config';

async function removeAlimentacaoAnimalRecipient() {
  try {
    await connectDatabase();
    logger.info('Database connection established');

    const recipient = await Recipient.findOne({
      where: { name: 'Alimentação Animal' },
    });

    if (recipient) {
      await recipient.destroy();
      logger.info(`✅ Recipient "Alimentação Animal" removed successfully (ID: ${recipient.id})`);
    } else {
      logger.info('ℹ️ Recipient "Alimentação Animal" not found in database');
    }

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error removing recipient:', error);
    process.exit(1);
  }
}

removeAlimentacaoAnimalRecipient();

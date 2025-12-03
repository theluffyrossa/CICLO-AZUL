import { connectDatabase, closeDatabase } from '../connection';
import { logger } from '@config/logger.config';
import { Client, WasteType, Recipient, ClientWasteType } from '../models';
import { WasteCategory, RecipientType } from '@shared/types';

const addBacuriUpdates = async (): Promise<void> => {
  try {
    logger.info('🌱 Adding Bacuri updates...');
    logger.info('='.repeat(60));

    await connectDatabase();

    const bacuriClient = await Client.findOne({
      where: { document: '49.870.410/0001-82' },
    });

    if (!bacuriClient) {
      throw new Error('Bacuri client not found!');
    }

    logger.info(`Found Bacuri client: ${bacuriClient.id}`);

    const existingPlasticos = await WasteType.findOne({
      where: { name: 'Plásticos' },
    });

    let plasticosWasteType = existingPlasticos;

    if (!existingPlasticos) {
      plasticosWasteType = await WasteType.create({
        name: 'Plásticos',
        category: WasteCategory.RECYCLABLE,
        description: 'Plásticos em geral',
        unit: 'kg',
        active: true,
      });
      logger.info('✅ Created waste type: Plásticos');
    } else {
      logger.info('⚠️ Waste type Plásticos already exists');
    }

    if (plasticosWasteType) {
      const existingAssociation = await ClientWasteType.findOne({
        where: {
          clientId: bacuriClient.id,
          wasteTypeId: plasticosWasteType.id,
        },
      });

      if (!existingAssociation) {
        await ClientWasteType.create({
          clientId: bacuriClient.id,
          wasteTypeId: plasticosWasteType.id,
          active: true,
        });
        logger.info('✅ Associated Plásticos to Bacuri');
      } else {
        logger.info('⚠️ Plásticos already associated to Bacuri');
      }
    }

    const existingDoacaoAnimal = await Recipient.findOne({
      where: {
        name: 'Doação para alimentação animal',
        clientId: bacuriClient.id,
      },
    });

    if (!existingDoacaoAnimal) {
      await Recipient.create({
        clientId: bacuriClient.id,
        name: 'Doação para alimentação animal',
        type: RecipientType.OTHER,
        document: null,
        secondaryDocument: null,
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient específico do Bacuri - Doação para alimentação animal',
        acceptedWasteTypes: ['Alimentação Animal', 'Orgânicos'],
        active: true,
      });
      logger.info('✅ Created recipient: Doação para alimentação animal');
    } else {
      logger.info('⚠️ Recipient Doação para alimentação animal already exists');
    }

    const existingSecretaria = await Recipient.findOne({
      where: {
        name: 'Secretaria Municipal do Meio Ambiente do Município de Bonito MS',
        clientId: bacuriClient.id,
      },
    });

    if (!existingSecretaria) {
      await Recipient.create({
        clientId: bacuriClient.id,
        name: 'Secretaria Municipal do Meio Ambiente do Município de Bonito MS',
        type: RecipientType.OTHER,
        document: null,
        secondaryDocument: null,
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient específico do Bacuri - Secretaria do Meio Ambiente',
        acceptedWasteTypes: null,
        active: true,
      });
      logger.info('✅ Created recipient: Secretaria Municipal do Meio Ambiente');
    } else {
      logger.info('⚠️ Recipient Secretaria Municipal already exists');
    }

    logger.info('='.repeat(60));
    logger.info('✅ Bacuri updates completed successfully!');

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to add Bacuri updates:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

addBacuriUpdates();

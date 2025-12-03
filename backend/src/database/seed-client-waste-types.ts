import { connectDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';
import { Client, WasteType, ClientWasteType } from './models';

/**
 * Seed para associar tipos de resíduos aos clientes
 */
const seedClientWasteTypes = async (): Promise<void> => {
  try {
    logger.info('🌱 Associating waste types to clients...');
    logger.info('='.repeat(60));

    await connectDatabase();

    // Buscar clientes
    const parqueClient = await Client.findOne({
      where: { document: '04.495.804/0001-60' },
    });

    const bacuriClient = await Client.findOne({
      where: { document: '49.870.410/0001-82' },
    });

    if (!parqueClient || !bacuriClient) {
      throw new Error('Clients not found! Run seed first.');
    }

    // Buscar todos os tipos de resíduos
    const allWasteTypes = await WasteType.findAll();
    const wasteTypeMap = new Map(
      allWasteTypes.map((wt) => [wt.name, wt])
    );

    logger.info(`Found ${allWasteTypes.length} waste types in database`);

    // PARQUE ECOLÓGICO RIO FORMOSO
    const parqueWasteTypes = [
      'Garrafa Pet',
      'Plástico Mole',
      'Plástico Duro',
      'Pet Óleo',
      'Embalagem Longa Vida',
      'Latas de Alumínio',
      'Metais em Geral',
      'Papel',
      'Cartonagem',
      'Papelão',
      'Rejeito',
      'Orgânicos',
      'Isopor',
      'Caixotes',
      'Tampinha de Garrafa',
      'Vidro',
      'Neoprene',
    ];

    // BACURI COZINHA REGIONAL
    const bacuriWasteTypes = [
      'Orgânicos',
      'Alimentação Animal',
      'Rejeito',
      'Pet Óleo',
      'Plásticos',
      'Alumínio',
      'Vidro',
      'Papelão',
      'Papel',
      'Cartonagem',
      'Embalagem Longa Vida',
      'Óleo',
      'Caixotes',
      'Isopor',
      'Metais em Geral',
      'Latas de Alumínio',
    ];

    // Criar associações para Parque
    logger.info(`\nAssociating waste types to PARQUE RIO FORMOSO...`);
    const parqueAssociations = [];

    for (const wasteName of parqueWasteTypes) {
      const wasteType = wasteTypeMap.get(wasteName);
      if (wasteType) {
        parqueAssociations.push({
          clientId: parqueClient.id,
          wasteTypeId: wasteType.id,
          active: true,
        });
        logger.info(`  ✓ ${wasteName}`);
      } else {
        logger.warn(`  ⚠ Waste type not found: ${wasteName}`);
      }
    }

    // Criar associações para Bacuri
    logger.info(`\nAssociating waste types to BACURI...`);
    const bacuriAssociations = [];

    for (const wasteName of bacuriWasteTypes) {
      const wasteType = wasteTypeMap.get(wasteName);
      if (wasteType) {
        bacuriAssociations.push({
          clientId: bacuriClient.id,
          wasteTypeId: wasteType.id,
          active: true,
        });
        logger.info(`  ✓ ${wasteName}`);
      } else {
        logger.warn(`  ⚠ Waste type not found: ${wasteName}`);
      }
    }

    // Inserir todas as associações
    const allAssociations = [...parqueAssociations, ...bacuriAssociations];

    await ClientWasteType.bulkCreate(allAssociations, {
      ignoreDuplicates: true, // Ignora se já existir
    });

    logger.info('\n' + '='.repeat(60));
    logger.info(`✅ Created ${parqueAssociations.length} associations for PARQUE RIO FORMOSO`);
    logger.info(`✅ Created ${bacuriAssociations.length} associations for BACURI`);
    logger.info(`✅ Total: ${allAssociations.length} client-waste type associations`);
    logger.info('='.repeat(60));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create client-waste type associations:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

seedClientWasteTypes();

import { connectDatabase, closeDatabase } from '../connection';
import { logger } from '@config/logger.config';
import { WasteType, Client, ClientWasteType } from '../models';
import { WasteCategory } from '@shared/types';

const newWasteTypes = [
  {
    name: 'Resíduo Eletrônico',
    category: WasteCategory.ELECTRONIC,
    description: 'Equipamentos eletrônicos descartados (computadores, celulares, TVs, etc)',
    unit: 'kg',
    active: true,
  },
  {
    name: 'Pilhas e Baterias',
    category: WasteCategory.HAZARDOUS,
    description: 'Pilhas, baterias e acumuladores usados',
    unit: 'kg',
    active: true,
  },
];

const addElectronicWasteTypes = async (): Promise<void> => {
  try {
    logger.info('🔌 Iniciando adição de tipos de resíduo eletrônico...');
    logger.info('='.repeat(60));

    await connectDatabase();

    const createdTypes: WasteType[] = [];

    for (const wasteTypeData of newWasteTypes) {
      const existing = await WasteType.findOne({ where: { name: wasteTypeData.name } });

      if (existing) {
        logger.info(`⚠️  Tipo "${wasteTypeData.name}" já existe. Pulando...`);
        createdTypes.push(existing);
        continue;
      }

      const created = await WasteType.create(wasteTypeData);
      logger.info(`✅ Tipo "${created.name}" criado com sucesso!`);
      createdTypes.push(created);
    }

    const clients = await Client.findAll({ where: { active: true } });
    logger.info(`\n📋 Associando aos ${clients.length} clientes ativos...`);

    let associationsCreated = 0;

    for (const client of clients) {
      for (const wasteType of createdTypes) {
        const existingAssociation = await ClientWasteType.findOne({
          where: {
            clientId: client.id,
            wasteTypeId: wasteType.id,
          },
        });

        if (existingAssociation) {
          logger.info(`   ⚠️  ${client.name} já possui "${wasteType.name}". Pulando...`);
          continue;
        }

        await ClientWasteType.create({
          clientId: client.id,
          wasteTypeId: wasteType.id,
          active: true,
        });

        logger.info(`   ✅ ${client.name} <- "${wasteType.name}"`);
        associationsCreated++;
      }
    }

    logger.info('\n' + '='.repeat(60));
    logger.info('✅ Migração concluída!');
    logger.info(`   - Tipos criados/verificados: ${createdTypes.length}`);
    logger.info(`   - Associações criadas: ${associationsCreated}`);
    logger.info('='.repeat(60));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro na migração:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

addElectronicWasteTypes();

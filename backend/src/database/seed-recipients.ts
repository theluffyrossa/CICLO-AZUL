import { connectDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';
import { Recipient, Client } from './models';
import { RecipientType } from '@shared/types';

/**
 * Seed para destinatários (recipients) com associação aos clientes
 */
const seedRecipients = async (): Promise<void> => {
  try {
    logger.info('🌱 Creating recipients...');
    logger.info('='.repeat(60));

    await connectDatabase();

    const clients = await Client.findAll();
    const parqueClient = clients.find(c => c.document === '04.495.804/0001-60');
    const bacuriClient = clients.find(c => c.document === '49.870.410/0001-82');

    if (!parqueClient || !bacuriClient) {
      throw new Error('Clients not found. Please run seed.ts first.');
    }

    logger.info(`Found Parque Rio Formoso: ${parqueClient.id}`);
    logger.info(`Found Bacuri: ${bacuriClient.id}`);

    const recipients = await Recipient.bulkCreate([
      {
        clientId: null,
        name: 'Ciclo Azul Consultoria, Assessoria e Gestão Ambiental LTDA',
        type: RecipientType.COMPOSTING_CENTER,
        document: '36.940.762/0001-15',
        secondaryDocument: null,
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Clube da Compostagem - Recipient Global (disponível para todos)',
        acceptedWasteTypes: ['Orgânicos'],
        active: true,
      },
      {
        clientId: null,
        name: 'Aterro Sanitário de Jardim - Consórcio Intermunicipal',
        type: RecipientType.LANDFILL,
        document: null,
        secondaryDocument: null,
        address: null,
        city: 'Jardim',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient Global (disponível para todos)',
        acceptedWasteTypes: ['Rejeito'],
        active: true,
      },
      {
        clientId: null,
        name: 'Associação de Recicladores de Lixo Eletro Eletrônicos de Mato Grosso do Sul',
        type: RecipientType.RECYCLING_ASSOCIATION,
        document: '19.913.566/0001-32',
        secondaryDocument: null,
        address: null,
        city: null,
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient Global (disponível para todos)',
        acceptedWasteTypes: ['Metais em Geral', 'Alumínio'],
        active: true,
      },
      {
        clientId: null,
        name: 'Doação',
        type: RecipientType.OTHER,
        document: null,
        secondaryDocument: null,
        address: null,
        city: null,
        state: null,
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Destinatário genérico para doações - Recipient Global (disponível para todos)',
        acceptedWasteTypes: null,
        active: true,
      },
      {
        clientId: parqueClient.id,
        name: 'Maria Aparecida da Silva Souza',
        type: RecipientType.INDIVIDUAL,
        document: '954.154.161-53',
        secondaryDocument: null,
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient específico do Parque Rio Formoso',
        acceptedWasteTypes: null,
        active: true,
      },
      {
        clientId: parqueClient.id,
        name: 'Maria de Fatima Nascimento',
        type: RecipientType.INDIVIDUAL,
        document: '12.472.246/0001-45',
        secondaryDocument: '75767058920',
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient específico do Parque Rio Formoso',
        acceptedWasteTypes: null,
        active: true,
      },
      {
        clientId: bacuriClient.id,
        name: 'MARINALVA DOS SANTOS',
        type: RecipientType.INDIVIDUAL,
        document: '42.172.344/0001-28',
        secondaryDocument: '02958328198',
        address: null,
        city: 'Bonito',
        state: 'MS',
        zipCode: null,
        phone: null,
        email: null,
        responsibleName: null,
        responsiblePhone: null,
        notes: 'Recipient específico do Bacuri',
        acceptedWasteTypes: null,
        active: true,
      },
    ]);

    logger.info(`✅ Created ${recipients.length} recipients successfully!`);
    logger.info('='.repeat(60));
    logger.info('\n📋 DESTINATÁRIOS CRIADOS:');
    recipients.forEach((r, i) => {
      logger.info(`${i + 1}. ${r.name} (${r.type})`);
    });
    logger.info('='.repeat(60));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Failed to create recipients:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

seedRecipients();

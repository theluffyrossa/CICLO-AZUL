import { connectDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';
import { User, Client, Unit, WasteType, Recipient, ClientWasteType } from './models';
import { UserRole, WasteCategory, RecipientType } from '@shared/types';

/**
 * SEED INICIAL DO SISTEMA CICLO AZUL
 *
 * Este seed cria os dados iniciais necessários para o funcionamento do sistema:
 * - 1 Usuário Admin
 * - 2 Clientes Piloto (Parque Rio Formoso e Bacuri)
 * - 2 Usuários Cliente (um para cada cliente piloto)
 * - Tipos de Resíduo
 * - Unidades de coleta
 *
 * Todos os dados podem ser gerenciados posteriormente via interface da aplicação.
 */

// Credenciais dos usuários
const ADMIN_USERNAME = 'admin';
const ADMIN_EMAIL = 'admin@cicloazul.com';
const ADMIN_PASSWORD = '1234';

const PARQUE_CLIENT_USERNAME = 'parquerioformoso';
const PARQUE_CLIENT_EMAIL = 'financeiro@parquerioformoso.com.br';
const PARQUE_CLIENT_PASSWORD = '1111';

const BACURI_CLIENT_USERNAME = 'bacuri';
const BACURI_CLIENT_EMAIL = 'bacuricozinharegional@gmail.com';
const BACURI_CLIENT_PASSWORD = '2222';

/**
 * Cria o usuário administrador do sistema
 */
const seedAdmin = async (): Promise<User> => {
  logger.info('Creating admin user...');

  const existingAdmin = await User.findOne({ where: { username: ADMIN_USERNAME } });
  if (existingAdmin) {
    logger.info('Admin already exists. Skipping...');
    return existingAdmin;
  }

  const admin = await User.create({
    name: 'Administrador',
    username: ADMIN_USERNAME,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: UserRole.ADMIN,
    active: true,
  });

  logger.info(`✅ Admin created: ${admin.username}`);
  return admin;
};

/**
 * Cria os clientes piloto
 */
const seedClients = async (): Promise<Client[]> => {
  logger.info('Creating pilot clients...');

  const existingClients = await Client.findAll();
  if (existingClients.length > 0) {
    logger.info(`Clients already exist (${existingClients.length}). Skipping...`);
    return existingClients;
  }

  const clients = await Client.bulkCreate([
    {
      name: 'PARQUE ECOLÓGICO RIO FORMOSO LTDA',
      document: '04.495.804/0001-60',
      phone: '(67) 98162-5580',
      email: 'financeiro@parquerioformoso.com.br',
      address: 'Rodovia Bonito / Guia Lopes Da Laguna, S/N Km 07 - Zona Rural',
      city: 'Bonito',
      state: 'MS',
      zipCode: '79290-000',
      active: true,
      notes: 'Cliente Piloto - Parque Ecológico Rio Formoso e Restaurante da Lagoa',
    },
    {
      name: 'C&S BARES E RESTAURANTES LTDA',
      document: '49.870.410/0001-82',
      phone: '(67) 98473-8342',
      email: 'bacuricozinharegional@gmail.com',
      address: 'Rua 24 de Fevereiro, 2268, Centro',
      city: 'Bonito',
      state: 'MS',
      zipCode: '79290-000',
      active: true,
      notes: 'Cliente Piloto - BACURI Cozinha Regional',
    },
  ]);

  logger.info(`✅ Created ${clients.length} pilot clients`);
  return clients;
};

/**
 * Cria os usuários dos clientes piloto
 */
const seedClientUsers = async (clients: Client[]): Promise<User[]> => {
  logger.info('Creating client users...');

  const existingParque = await User.findOne({ where: { username: PARQUE_CLIENT_USERNAME } });
  const existingBacuri = await User.findOne({ where: { username: BACURI_CLIENT_USERNAME } });

  const usersToCreate = [];

  if (!existingParque) {
    usersToCreate.push({
      name: 'Administrador Parque Rio Formoso',
      username: PARQUE_CLIENT_USERNAME,
      email: PARQUE_CLIENT_EMAIL,
      password: PARQUE_CLIENT_PASSWORD,
      role: UserRole.CLIENT,
      clientId: clients[0].id,
      active: true,
    });
  }

  if (!existingBacuri) {
    usersToCreate.push({
      name: 'Administrador Bacuri',
      username: BACURI_CLIENT_USERNAME,
      email: BACURI_CLIENT_EMAIL,
      password: BACURI_CLIENT_PASSWORD,
      role: UserRole.CLIENT,
      clientId: clients[1].id,
      active: true,
    });
  }

  const clientUsers = usersToCreate.length > 0
    ? await User.bulkCreate(usersToCreate, { individualHooks: true })
    : [];

  logger.info(`✅ Created ${clientUsers.length} client users`);
  return clientUsers;
};

/**
 * Cria os tipos de resíduo do sistema
 */
const seedWasteTypes = async (): Promise<WasteType[]> => {
  logger.info('Creating waste types...');

  const wasteTypes = await WasteType.bulkCreate([
    // Tipos do Parque Rio Formoso
    {
      name: 'Garrafa Pet',
      category: WasteCategory.RECYCLABLE,
      description: 'Garrafas PET limpas e vazias',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Plástico Mole',
      category: WasteCategory.RECYCLABLE,
      description: 'Sacolas plásticas, embalagens flexíveis',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Plástico Duro',
      category: WasteCategory.RECYCLABLE,
      description: 'Embalagens rígidas, potes, tampas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Pet Óleo',
      category: WasteCategory.RECYCLABLE,
      description: 'Garrafas PET contaminadas com óleo',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Embalagem Longa Vida',
      category: WasteCategory.RECYCLABLE,
      description: 'Caixas Tetra Pak',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Latas de Alumínio',
      category: WasteCategory.RECYCLABLE,
      description: 'Latas de bebidas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Metais em Geral',
      category: WasteCategory.RECYCLABLE,
      description: 'Ferro, aço e outros metais',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Papel',
      category: WasteCategory.RECYCLABLE,
      description: 'Papel branco, colorido, jornais',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Cartonagem',
      category: WasteCategory.RECYCLABLE,
      description: 'Caixas de papel, cartolinas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Papelão',
      category: WasteCategory.RECYCLABLE,
      description: 'Caixas de papelão ondulado',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Rejeito',
      category: WasteCategory.OTHER,
      description: 'Material sem possibilidade de reaproveitamento',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Orgânicos',
      category: WasteCategory.ORGANIC,
      description: 'Restos de alimentos, cascas, folhas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Isopor',
      category: WasteCategory.RECYCLABLE,
      description: 'Embalagens de isopor limpo',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Caixotes',
      category: WasteCategory.RECYCLABLE,
      description: 'Caixotes de madeira',
      unit: 'unidade',
      active: true,
    },
    {
      name: 'Tampinha de Garrafa',
      category: WasteCategory.RECYCLABLE,
      description: 'Tampas plásticas de garrafas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Vidro',
      category: WasteCategory.RECYCLABLE,
      description: 'Garrafas, potes e cacos de vidro',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Neoprene',
      category: WasteCategory.RECYCLABLE,
      description: 'Material de neoprene',
      unit: 'kg',
      active: true,
    },
    // Tipos adicionais do Bacuri
    {
      name: 'Alimentação Animal',
      category: WasteCategory.ORGANIC,
      description: 'Resíduos orgânicos destinados à alimentação animal',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Óleo',
      category: WasteCategory.HAZARDOUS,
      description: 'Óleo de cozinha usado',
      unit: 'L',
      active: true,
    },
    {
      name: 'Alumínio',
      category: WasteCategory.RECYCLABLE,
      description: 'Latas e embalagens de alumínio',
      unit: 'kg',
      active: true,
    },
  ]);

  logger.info(`✅ Created ${wasteTypes.length} waste types`);
  return wasteTypes;
};

/**
 * Cria as unidades de coleta dos clientes
 */
const seedUnits = async (clients: Client[]): Promise<Unit[]> => {
  logger.info('Creating collection units...');

  const units = await Unit.bulkCreate([
    {
      clientId: clients[0].id,
      name: 'Ponto 1 - Pq Eco',
      type: 'Parque Ecológico',
      address: 'Rodovia Bonito / Guia Lopes Da Laguna, S/N Km 07 - Zona Rural',
      city: 'Bonito',
      state: 'MS',
      zipCode: '79290-000',
      latitude: -21.1296,
      longitude: -56.4731,
      responsibleName: 'Responsável Parque',
      responsiblePhone: '(67) 98162-5580',
      active: true,
    },
    {
      clientId: clients[1].id,
      name: 'Ponto 1 - Restaurante Bacuri',
      type: 'Restaurante',
      address: 'Rua 24 de Fevereiro, 2268, Centro',
      city: 'Bonito',
      state: 'MS',
      zipCode: '79290-000',
      latitude: -21.1269,
      longitude: -56.4286,
      responsibleName: 'Responsável Bacuri',
      responsiblePhone: '(67) 98473-8342',
      active: true,
    },
  ]);

  logger.info(`✅ Created ${units.length} collection units`);
  return units;
};

/**
 * Cria os destinatários do sistema
 */
const seedRecipients = async (clients: Client[]): Promise<Recipient[]> => {
  logger.info('Creating recipients...');

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
      clientId: clients[0].id,
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
      clientId: clients[0].id,
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
      clientId: clients[1].id,
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
  ]);

  logger.info(`✅ Created ${recipients.length} recipients`);
  return recipients;
};

const seedClientWasteTypes = async (
  clients: Client[],
  wasteTypes: WasteType[]
): Promise<void> => {
  logger.info('Creating client-waste type associations...');

  const wasteTypeMap = new Map(wasteTypes.map((wt) => [wt.name, wt]));

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

  const bacuriWasteTypes = [
    'Orgânicos',
    'Alimentação Animal',
    'Rejeito',
    'Pet Óleo',
    'Plástico Mole',
    'Plástico Duro',
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

  const parqueAssociations = [];
  for (const wasteName of parqueWasteTypes) {
    const wasteType = wasteTypeMap.get(wasteName);
    if (wasteType) {
      parqueAssociations.push({
        clientId: clients[0].id,
        wasteTypeId: wasteType.id,
        active: true,
      });
    }
  }

  const bacuriAssociations = [];
  for (const wasteName of bacuriWasteTypes) {
    const wasteType = wasteTypeMap.get(wasteName);
    if (wasteType) {
      bacuriAssociations.push({
        clientId: clients[1].id,
        wasteTypeId: wasteType.id,
        active: true,
      });
    }
  }

  const allAssociations = [...parqueAssociations, ...bacuriAssociations];
  await ClientWasteType.bulkCreate(allAssociations, { ignoreDuplicates: true });

  logger.info(`✅ Created ${allAssociations.length} client-waste type associations`);
  logger.info(`   - Parque Rio Formoso: ${parqueAssociations.length} waste types`);
  logger.info(`   - Bacuri: ${bacuriAssociations.length} waste types`);
};

const runSeeds = async (): Promise<void> => {
  try {
    logger.info('🌱 Starting CICLO AZUL database seeding...');
    logger.info('='.repeat(60));

    await connectDatabase();

    await seedAdmin();
    const clients = await seedClients();
    await seedClientUsers(clients);
    const wasteTypes = await seedWasteTypes();
    await seedUnits(clients);
    await seedRecipients(clients);
    await seedClientWasteTypes(clients, wasteTypes);

    logger.info('='.repeat(60));
    logger.info('✅ Database seeding completed successfully!');
    logger.info('\n📋 DADOS DE ACESSO:');
    logger.info('='.repeat(60));
    logger.info(`\n👤 ADMINISTRADOR:`);
    logger.info(`   Usuário: ${ADMIN_USERNAME}`);
    logger.info(`   PIN: ${ADMIN_PASSWORD}`);
    logger.info(`\n🏢 CLIENTE PILOTO 1 - PARQUE RIO FORMOSO:`);
    logger.info(`   Usuário: ${PARQUE_CLIENT_USERNAME}`);
    logger.info(`   PIN: ${PARQUE_CLIENT_PASSWORD}`);
    logger.info(`\n🏢 CLIENTE PILOTO 2 - BACURI:`);
    logger.info(`   Usuário: ${BACURI_CLIENT_USERNAME}`);
    logger.info(`   PIN: ${BACURI_CLIENT_PASSWORD}`);
    logger.info('\n' + '='.repeat(60));
    logger.info('⚠️  IMPORTANTE: Altere as senhas após o primeiro login!');
    logger.info('='.repeat(60));

    process.exit(0);
  } catch (error) {
    logger.error('❌ Database seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

runSeeds();

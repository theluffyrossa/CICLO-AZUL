import { connectDatabase, closeDatabase } from './connection';
import { logger } from '@config/logger.config';
import { User, Client, Unit, WasteType, Collection, GravimetricData, Recipient, RecipientType } from './models';
import { UserRole, WasteCategory, CollectionStatus, GravimetricDataSource } from '@shared/types';

const ADMIN_EMAIL = 'admin@cicloazul.com';
const OPERATOR_EMAIL = 'operator@cicloazul.com';
const ADMIN_PASSWORD = '1234'; // PIN do Admin
const OPERATOR_PASSWORD = '5678'; // PIN do Operador

const seedUsers = async (): Promise<{ admin: User; operator: User }> => {
  logger.info('Seeding users...');

  const admin = await User.create({
    name: 'Administrador',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: UserRole.ADMIN,
    active: true,
  });

  const operator = await User.create({
    name: 'João Silva',
    email: OPERATOR_EMAIL,
    password: OPERATOR_PASSWORD,
    role: UserRole.OPERATOR,
    active: true,
  });

  logger.info(`Created users: ${ADMIN_EMAIL}, ${OPERATOR_EMAIL}`);
  return { admin, operator };
};

const seedWasteTypes = async (): Promise<WasteType[]> => {
  logger.info('Seeding waste types...');

  const wasteTypes = await WasteType.bulkCreate([
    {
      name: 'Papel e Papelão',
      category: WasteCategory.RECYCLABLE,
      description: 'Papel, papelão, jornais, revistas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Plástico',
      category: WasteCategory.RECYCLABLE,
      description: 'Garrafas PET, embalagens plásticas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Metal',
      category: WasteCategory.RECYCLABLE,
      description: 'Latas de alumínio, ferro, aço',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Vidro',
      category: WasteCategory.RECYCLABLE,
      description: 'Garrafas, potes, cacos de vidro',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Orgânico',
      category: WasteCategory.ORGANIC,
      description: 'Restos de alimentos, cascas, folhas',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Eletrônico',
      category: WasteCategory.ELECTRONIC,
      description: 'Computadores, celulares, eletrodomésticos',
      unit: 'unidade',
      active: true,
    },
    {
      name: 'Pilhas e Baterias',
      category: WasteCategory.HAZARDOUS,
      description: 'Pilhas, baterias de celular e notebook',
      unit: 'kg',
      active: true,
    },
    {
      name: 'Entulho',
      category: WasteCategory.CONSTRUCTION,
      description: 'Resíduos de construção civil',
      unit: 'm³',
      active: true,
    },
  ]);

  logger.info(`Created ${wasteTypes.length} waste types`);
  return wasteTypes;
};

const seedClients = async (): Promise<Client[]> => {
  logger.info('Seeding clients...');

  const clients = await Client.bulkCreate([
    {
      name: 'Empresa ABC Ltda',
      document: '12.345.678/0001-90',
      phone: '(11) 98765-4321',
      email: 'contato@empresaabc.com.br',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      active: true,
    },
    {
      name: 'Indústria XYZ S.A.',
      document: '98.765.432/0001-10',
      phone: '(11) 91234-5678',
      email: 'ambiental@industriaxyz.com.br',
      address: 'Av. Industrial, 4567',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '08765-432',
      active: true,
    },
    {
      name: 'Comércio 123 ME',
      document: '11.222.333/0001-44',
      phone: '(11) 97777-8888',
      email: 'comercio123@email.com',
      address: 'Rua do Comércio, 456',
      city: 'Guarulhos',
      state: 'SP',
      zipCode: '07000-100',
      active: true,
    },
  ]);

  logger.info(`Created ${clients.length} clients`);
  return clients;
};

const seedUnits = async (clients: Client[]): Promise<Unit[]> => {
  logger.info('Seeding units...');

  const units = await Unit.bulkCreate([
    {
      clientId: clients[0].id,
      name: 'Matriz',
      type: 'Escritório',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234-567',
      latitude: -23.550520,
      longitude: -46.633308,
      responsibleName: 'João Silva',
      responsiblePhone: '(11) 99999-1111',
      active: true,
    },
    {
      clientId: clients[0].id,
      name: 'Filial Centro',
      type: 'Loja',
      address: 'Av. Paulista, 1000',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      latitude: -23.561684,
      longitude: -46.656140,
      responsibleName: 'Maria Santos',
      responsiblePhone: '(11) 99999-2222',
      active: true,
    },
    {
      clientId: clients[1].id,
      name: 'Fábrica Principal',
      type: 'Indústria',
      address: 'Av. Industrial, 4567',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '08765-432',
      latitude: -23.496404,
      longitude: -46.840576,
      responsibleName: 'Pedro Oliveira',
      responsiblePhone: '(11) 99999-3333',
      active: true,
    },
    {
      clientId: clients[2].id,
      name: 'Loja Principal',
      type: 'Comércio',
      address: 'Rua do Comércio, 456',
      city: 'Guarulhos',
      state: 'SP',
      zipCode: '07000-100',
      latitude: -23.462006,
      longitude: -46.533401,
      responsibleName: 'Ana Costa',
      responsiblePhone: '(11) 99999-4444',
      active: true,
    },
  ]);

  logger.info(`Created ${units.length} units`);
  return units;
};

const seedRecipients = async (): Promise<Recipient[]> => {
  logger.info('Seeding recipients...');

  const recipients = await Recipient.bulkCreate([
    {
      name: 'Ciclo Azul Consultoria, Assessoria e Gestão Ambiental LTDA - Clube da Compostagem',
      type: RecipientType.COMPOSTING_CENTER,
      document: '36.940.762/0001-15',
      active: true,
      notes: 'Centro de compostagem especializado em resíduos orgânicos',
    },
    {
      name: 'Maria Aparecida da Silva Souza',
      type: RecipientType.INDIVIDUAL,
      document: '954.154.161-53',
      active: true,
    },
    {
      name: 'Maria de Fatima Nascimento',
      type: RecipientType.INDIVIDUAL,
      document: '75767058920',
      secondaryDocument: '12.472.246/0001-45',
      active: true,
    },
    {
      name: 'MARINALVA DOS SANTOS',
      type: RecipientType.INDIVIDUAL,
      document: '02958328198',
      secondaryDocument: '42.172.344/0001-28',
      active: true,
    },
    {
      name: 'Aterro Sanitário de Jardim - Consórcio Intermunicipal',
      type: RecipientType.LANDFILL,
      active: true,
      notes: 'Aterro sanitário municipal',
    },
    {
      name: 'Associação de Recicladores de Lixo Eletro Eletrônicos de Mato Grosso do Sul',
      type: RecipientType.RECYCLING_ASSOCIATION,
      document: '19.913.566/0001-32',
      active: true,
      notes: 'Especializada em reciclagem de eletrônicos',
    },
  ]);

  logger.info(`Created ${recipients.length} recipients`);
  return recipients;
};

const seedCollections = async (
  users: { admin: User; operator: User },
  clients: Client[],
  units: Unit[],
  wasteTypes: WasteType[],
  recipients: Recipient[]
): Promise<Collection[]> => {
  logger.info('Seeding collections...');

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);
  const twoDaysAgo = new Date(now.getTime() - 172800000);

  const collections = await Collection.bulkCreate([
    {
      clientId: clients[0].id,
      unitId: units[0].id,
      wasteTypeId: wasteTypes[0].id,
      userId: users.operator.id,
      recipientId: recipients[1].id,
      collectionDate: twoDaysAgo,
      status: CollectionStatus.COMPLETED,
      notes: 'Coleta realizada sem problemas',
      latitude: -23.550520,
      longitude: -46.633308,
    },
    {
      clientId: clients[0].id,
      unitId: units[1].id,
      wasteTypeId: wasteTypes[1].id,
      userId: users.operator.id,
      recipientId: recipients[5].id,
      collectionDate: yesterday,
      status: CollectionStatus.COMPLETED,
      notes: 'Grande volume de plástico',
    },
    {
      clientId: clients[1].id,
      unitId: units[2].id,
      wasteTypeId: wasteTypes[4].id,
      userId: users.operator.id,
      recipientId: recipients[0].id,
      collectionDate: yesterday,
      status: CollectionStatus.COMPLETED,
      notes: 'Resíduo orgânico da cantina',
    },
    {
      clientId: clients[2].id,
      unitId: units[3].id,
      wasteTypeId: wasteTypes[2].id,
      userId: users.operator.id,
      recipientId: recipients[4].id,
      collectionDate: now,
      status: CollectionStatus.IN_PROGRESS,
      notes: 'Coleta em andamento',
    },
  ]);

  logger.info(`Created ${collections.length} collections`);
  return collections;
};

const seedGravimetricData = async (collections: Collection[]): Promise<void> => {
  logger.info('Seeding gravimetric data...');

  await GravimetricData.bulkCreate([
    {
      collectionId: collections[0].id,
      weightKg: 45.5,
      source: GravimetricDataSource.MANUAL,
    },
    {
      collectionId: collections[1].id,
      weightKg: 78.2,
      source: GravimetricDataSource.MANUAL,
    },
    {
      collectionId: collections[2].id,
      weightKg: 120.0,
      source: GravimetricDataSource.SCALE,
      deviceId: 'SCALE-001',
    },
  ]);

  logger.info('Created gravimetric data entries');
};

const runSeeds = async (): Promise<void> => {
  try {
    logger.info('Starting database seeding...');

    await connectDatabase();

    const users = await seedUsers();
    const wasteTypes = await seedWasteTypes();
    const clients = await seedClients();
    const units = await seedUnits(clients);
    const recipients = await seedRecipients();
    const collections = await seedCollections(users, clients, units, wasteTypes, recipients);
    await seedGravimetricData(collections);

    logger.info('✅ Database seeding completed successfully!');
    logger.info('\nDefault credentials:');
    logger.info(`Admin: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
    logger.info(`Operator: ${OPERATOR_EMAIL} / ${OPERATOR_PASSWORD}`);

    process.exit(0);
  } catch (error) {
    logger.error('Database seeding failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
};

runSeeds();

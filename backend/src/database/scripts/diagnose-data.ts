import { connectDatabase, closeDatabase } from '../connection';
import { logger } from '@config/logger.config';
import { User, Client, Collection, Recipient } from '../models';

const diagnoseData = async (): Promise<void> => {
  try {
    await connectDatabase();

    logger.info('='.repeat(80));
    logger.info('🔍 DIAGNÓSTICO DO BANCO DE DADOS - CICLO AZUL');
    logger.info('='.repeat(80));

    const users = await User.findAll({
      attributes: ['id', 'name', 'username', 'role', 'clientId'],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['id', 'name', 'document'],
        },
      ],
    });

    logger.info('\n📊 USUÁRIOS NO SISTEMA:');
    logger.info('-'.repeat(80));
    users.forEach((user) => {
      logger.info(`
  ID: ${user.id}
  Nome: ${user.name}
  Username: ${user.username}
  Role: ${user.role}
  Client ID: ${user.clientId || 'N/A (ADMIN)'}
  Client: ${user.client?.name || 'N/A'}
      `);
    });

    const clients = await Client.findAll({
      attributes: ['id', 'name', 'document'],
    });

    logger.info('\n📋 CLIENTES CADASTRADOS:');
    logger.info('-'.repeat(80));
    clients.forEach((client) => {
      logger.info(`
  ID: ${client.id}
  Nome: ${client.name}
  Document: ${client.document}
      `);
    });

    const collections = await Collection.findAll({
      attributes: ['id', 'clientId', 'userId', 'collectionDate', 'status'],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name'],
        },
        {
          model: User,
          as: 'user',
          attributes: ['name', 'username'],
        },
      ],
      order: [['collectionDate', 'DESC']],
    });

    logger.info(`\n📦 COLETAS NO SISTEMA (Total: ${collections.length}):`);
    logger.info('-'.repeat(80));

    if (collections.length === 0) {
      logger.warn('⚠️  NENHUMA COLETA ENCONTRADA NO BANCO DE DADOS!');
    } else {
      collections.forEach((collection) => {
        logger.info(`
  Collection ID: ${collection.id}
  Client ID: ${collection.clientId}
  Client: ${collection.client?.name}
  User ID: ${collection.userId}
  User: ${collection.user?.name} (${collection.user?.username})
  Date: ${collection.collectionDate}
  Status: ${collection.status}
        `);
      });
    }

    logger.info('\n🔐 ANÁLISE DE ISOLAMENTO DE DADOS:');
    logger.info('-'.repeat(80));

    for (const client of clients) {
      const clientCollections = collections.filter(c => c.clientId === client.id);
      logger.info(`
  Cliente: ${client.name}
  Total de Coletas: ${clientCollections.length}
  IDs das Coletas: ${clientCollections.map(c => c.id).join(', ') || 'Nenhuma'}
      `);
    }

    logger.info('\n👥 MAPEAMENTO USUÁRIO → COLETAS:');
    logger.info('-'.repeat(80));

    for (const user of users) {
      const userCollections = collections.filter(c => c.userId === user.id);
      logger.info(`
  User: ${user.username} (${user.role})
  Client: ${user.client?.name || 'N/A'}
  Pode ver: ${user.role === 'ADMIN' ? `TODAS (${collections.length})` : `Apenas do cliente ${user.client?.name} (${collections.filter(c => c.clientId === user.clientId).length})`}
  Coletas criadas por este usuário: ${userCollections.length}
      `);
    }

    const recipients = await Recipient.findAll({
      attributes: ['id', 'name', 'type', 'clientId'],
      include: [
        {
          model: Client,
          as: 'client',
          attributes: ['name'],
          required: false,
        },
      ],
    });

    logger.info(`\n🎯 RECIPIENTS/DESTINATÁRIOS (Total: ${recipients.length}):`);
    logger.info('-'.repeat(80));

    const globalRecipients = recipients.filter(r => !r.clientId);
    const clientSpecificRecipients = recipients.filter(r => r.clientId);

    logger.info(`\n  Recipients Globais (disponíveis para todos): ${globalRecipients.length}`);
    globalRecipients.forEach(r => {
      logger.info(`    - ${r.name} (${r.type})`);
    });

    logger.info(`\n  Recipients Específicos de Clientes: ${clientSpecificRecipients.length}`);
    clientSpecificRecipients.forEach(r => {
      logger.info(`    - ${r.name} (${r.type}) → Cliente: ${r.client?.name || 'N/A'}`);
    });

    logger.info('\n' + '='.repeat(80));
    logger.info('✅ DIAGNÓSTICO CONCLUÍDO');
    logger.info('='.repeat(80));

    await closeDatabase();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Erro ao executar diagnóstico:', error);
    await closeDatabase();
    process.exit(1);
  }
};

diagnoseData();

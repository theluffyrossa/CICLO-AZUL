import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve, join, basename } from 'path';
import { stat, readdir } from 'fs/promises';
import { createInterface } from 'readline';
import { logger } from '../../config/logger.config';
import { getCurrentDatabaseConfig } from '../../config/database.config';
import { BACKUP } from '../../shared/constants';
import { decompressFile } from '../../shared/utils/compression.util';
import { formatBytes } from '../../shared/utils/filesystem.util';
import { createBackup } from './backup';

const execAsync = promisify(exec);

interface RestoreOptions {
  backupFile: string;
  createSafetyBackup?: boolean;
  skipConfirmation?: boolean;
}

const listAvailableBackups = async (): Promise<string[]> => {
  const backupDir = resolve(process.cwd(), BACKUP.DIR);

  try {
    const files = await readdir(backupDir);
    const backupFiles = files
      .filter(file => file.startsWith(BACKUP.PREFIX) && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      .sort()
      .reverse();

    return backupFiles;
  } catch (error) {
    logger.error('[Restore] Failed to list backups:', error);
    throw new Error('Failed to list available backups');
  }
};

const confirmRestore = async (): Promise<boolean> => {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will REPLACE the current database. Continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
};

const getPsqlPath = (): string => {
  return process.env.PSQL_PATH || 'psql';
};

const executePsql = async (inputPath: string): Promise<void> => {
  const config = getCurrentDatabaseConfig();

  const env = {
    PGPASSWORD: config.password,
  };

  const psqlPath = getPsqlPath();
  const command = `${psqlPath} -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} -f "${inputPath}"`;

  logger.info('[Restore] Executing psql...');

  try {
    const { stdout, stderr } = await execAsync(command, { env });

    if (stderr && !stderr.includes('WARNING') && !stderr.includes('NOTICE')) {
      logger.warn('[Restore] psql warnings:', stderr);
    }

    if (stdout) {
      logger.info('[Restore] psql output:', stdout);
    }
  } catch (error) {
    logger.error('[Restore] psql failed:', error);
    throw new Error(`Database restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const restoreBackup = async (options: RestoreOptions): Promise<void> => {
  const startTime = Date.now();

  logger.info('[Restore] ================================');
  logger.info('[Restore] Starting database restore...');
  logger.info('[Restore] Database:', getCurrentDatabaseConfig().database);

  try {
    if (!options.skipConfirmation) {
      const confirmed = await confirmRestore();
      if (!confirmed) {
        logger.info('[Restore] Restore cancelled by user');
        return;
      }
    }

    const backupDir = resolve(process.cwd(), BACKUP.DIR);
    const backupPath = join(backupDir, options.backupFile);

    const backupStats = await stat(backupPath);
    logger.info('[Restore] Backup file:', basename(backupPath));
    logger.info('[Restore] Size:', formatBytes(backupStats.size));

    if (options.createSafetyBackup !== false) {
      logger.info('[Restore] Creating safety backup before restore...');
      await createBackup();
    }

    let sqlPath = backupPath;
    const isCompressed = backupPath.endsWith('.gz');

    if (isCompressed) {
      logger.info('[Restore] Decompressing backup file...');
      sqlPath = backupPath.replace('.gz', '');
      await decompressFile(backupPath, sqlPath);
      logger.info('[Restore] Decompression completed');
    }

    logger.info('[Restore] Dropping existing schema...');
    const config = getCurrentDatabaseConfig();
    const psqlPath = getPsqlPath();
    const dropCommand = `${psqlPath} -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"`;
    await execAsync(dropCommand, { env: { PGPASSWORD: config.password } });
    logger.info('[Restore] Schema dropped and recreated');

    await executePsql(sqlPath);
    logger.info('[Restore] Database restore completed');

    if (isCompressed) {
      const { unlink } = await import('fs/promises');
      await unlink(sqlPath);
      logger.info('[Restore] Temporary decompressed file removed');
    }

    const duration = Date.now() - startTime;

    logger.info('[Restore] ================================');
    logger.info('[Restore] Restore completed successfully!');
    logger.info('[Restore] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.info('[Restore] ================================');
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[Restore] ================================');
    logger.error('[Restore] Restore failed!');
    logger.error('[Restore] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.error('[Restore] Error:', error);
    logger.error('[Restore] ================================');
    throw error;
  }
};

if (require.main === module) {
  (async () => {
    try {
      console.log('\n📦 Available backups:\n');

      const backups = await listAvailableBackups();

      if (backups.length === 0) {
        console.log('No backups found.');
        process.exit(0);
      }

      backups.forEach((backup, index) => {
        console.log(`${index + 1}. ${backup}`);
      });

      const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      rl.question('\nSelect backup number to restore (or 0 to cancel): ', async (answer) => {
        rl.close();

        const selection = parseInt(answer);

        if (selection === 0 || isNaN(selection) || selection > backups.length) {
          console.log('Restore cancelled.');
          process.exit(0);
        }

        const selectedBackup = backups[selection - 1];

        await restoreBackup({
          backupFile: selectedBackup,
          createSafetyBackup: true,
          skipConfirmation: false,
        });

        process.exit(0);
      });
    } catch (error) {
      console.error('Restore failed:', error instanceof Error ? error.message : 'Unknown error');
      process.exit(1);
    }
  })();
}

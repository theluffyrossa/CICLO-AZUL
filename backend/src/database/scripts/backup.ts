import { exec } from 'child_process';
import { promisify } from 'util';
import { resolve, join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { format } from 'date-fns';
import { logger } from '../../config/logger.config';
import { getCurrentDatabaseConfig } from '../../config/database.config';
import { BACKUP } from '../../shared/constants';
import { compressFile } from '../../shared/utils/compression.util';
import { getFileSize, getFileChecksum, formatBytes } from '../../shared/utils/filesystem.util';

const execAsync = promisify(exec);

interface BackupResult {
  filename: string;
  path: string;
  size: number;
  sizeFormatted: string;
  checksum: string;
  timestamp: Date;
  duration: number;
}

const generateBackupFilename = (): string => {
  const timestamp = format(new Date(), 'yyyy-MM-dd-HHmmss');
  return `${BACKUP.PREFIX}-${timestamp}`;
};

const createBackupDirectory = async (): Promise<string> => {
  const backupDir = resolve(process.cwd(), BACKUP.DIR);
  await mkdir(backupDir, { recursive: true });
  return backupDir;
};

const getPgDumpPath = (): string => {
  return process.env.PG_DUMP_PATH || 'pg_dump';
};

const executePgDump = async (outputPath: string): Promise<void> => {
  const config = getCurrentDatabaseConfig();

  const env = {
    PGPASSWORD: config.password,
  };

  const pgDumpPath = getPgDumpPath();
  const command = `${pgDumpPath} -h ${config.host} -p ${config.port} -U ${config.username} -d ${config.database} -F p -f "${outputPath}"`;

  logger.info('[Backup] Executing pg_dump...');

  try {
    const { stdout, stderr } = await execAsync(command, { env });

    if (stderr && !stderr.includes('WARNING')) {
      logger.warn('[Backup] pg_dump warnings:', stderr);
    }

    if (stdout) {
      logger.info('[Backup] pg_dump output:', stdout);
    }
  } catch (error) {
    logger.error('[Backup] pg_dump failed:', error);
    throw new Error(`Database backup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

const saveBackupMetadata = async (
  metadataPath: string,
  result: BackupResult
): Promise<void> => {
  const metadata = {
    filename: result.filename,
    createdAt: result.timestamp.toISOString(),
    size: result.size,
    sizeFormatted: result.sizeFormatted,
    checksum: result.checksum,
    duration: result.duration,
    database: getCurrentDatabaseConfig().database,
    compressed: BACKUP.COMPRESSION,
  };

  await writeFile(metadataPath, JSON.stringify(metadata, null, 2));
  logger.info('[Backup] Metadata saved');
};

export const createBackup = async (): Promise<BackupResult> => {
  const startTime = Date.now();

  logger.info('[Backup] ================================');
  logger.info('[Backup] Starting database backup...');
  logger.info('[Backup] Database:', getCurrentDatabaseConfig().database);

  try {
    const backupDir = await createBackupDirectory();
    const filename = generateBackupFilename();
    const sqlPath = join(backupDir, `${filename}.sql`);
    const finalPath = BACKUP.COMPRESSION ? `${sqlPath}.gz` : sqlPath;
    const metadataPath = join(backupDir, `${filename}.json`);

    await executePgDump(sqlPath);
    logger.info('[Backup] Database dump completed');

    if (BACKUP.COMPRESSION) {
      logger.info('[Backup] Compressing backup file...');
      await compressFile(sqlPath, finalPath);

      const { unlink } = await import('fs/promises');
      await unlink(sqlPath);
      logger.info('[Backup] Compression completed, original file removed');
    }

    const size = await getFileSize(finalPath);
    const checksum = await getFileChecksum(finalPath);
    const duration = Date.now() - startTime;

    const result: BackupResult = {
      filename: `${filename}${BACKUP.COMPRESSION ? '.sql.gz' : '.sql'}`,
      path: finalPath,
      size,
      sizeFormatted: formatBytes(size),
      checksum,
      timestamp: new Date(),
      duration,
    };

    await saveBackupMetadata(metadataPath, result);

    logger.info('[Backup] ================================');
    logger.info('[Backup] Backup completed successfully!');
    logger.info('[Backup] File:', result.filename);
    logger.info('[Backup] Size:', result.sizeFormatted);
    logger.info('[Backup] Checksum:', result.checksum);
    logger.info('[Backup] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.info('[Backup] ================================');

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[Backup] ================================');
    logger.error('[Backup] Backup failed!');
    logger.error('[Backup] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.error('[Backup] Error:', error);
    logger.error('[Backup] ================================');
    throw error;
  }
};

if (require.main === module) {
  createBackup()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Backup failed:', error.message);
      process.exit(1);
    });
}

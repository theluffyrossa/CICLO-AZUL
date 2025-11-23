import { resolve, join, basename } from 'path';
import { stat, readdir } from 'fs/promises';
import { subDays, isAfter } from 'date-fns';
import { logger } from '../../config/logger.config';
import { BACKUP } from '../../shared/constants';
import { deleteFile, formatBytes } from '../../shared/utils/filesystem.util';

interface BackupFileInfo {
  filename: string;
  path: string;
  size: number;
  createdAt: Date;
  age: number;
}

const getBackupFiles = async (): Promise<BackupFileInfo[]> => {
  const backupDir = resolve(process.cwd(), BACKUP.DIR);

  try {
    const files = await readdir(backupDir);
    const backupFiles: BackupFileInfo[] = [];

    for (const file of files) {
      if (file.startsWith(BACKUP.PREFIX) && (file.endsWith('.sql') || file.endsWith('.sql.gz'))) {
        const filePath = join(backupDir, file);
        const stats = await stat(filePath);
        const now = new Date();
        const ageInDays = Math.floor((now.getTime() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24));

        backupFiles.push({
          filename: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime,
          age: ageInDays,
        });
      }
    }

    return backupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  } catch (error) {
    logger.error('[Clean] Failed to get backup files:', error);
    throw new Error('Failed to list backup files');
  }
};

const shouldDeleteBackup = (backup: BackupFileInfo, totalBackups: number, index: number): boolean => {
  if (index < BACKUP.MIN_BACKUPS_TO_KEEP) {
    return false;
  }

  const cutoffDate = subDays(new Date(), BACKUP.RETENTION_DAYS);
  return isAfter(cutoffDate, backup.createdAt);
};

export const cleanOldBackups = async (): Promise<{
  deletedCount: number;
  freedSpace: number;
  keptCount: number;
}> => {
  const startTime = Date.now();

  logger.info('[Clean] ================================');
  logger.info('[Clean] Starting backup cleanup...');
  logger.info('[Clean] Retention days:', BACKUP.RETENTION_DAYS);
  logger.info('[Clean] Min backups to keep:', BACKUP.MIN_BACKUPS_TO_KEEP);

  try {
    const backups = await getBackupFiles();

    logger.info('[Clean] Total backups found:', backups.length);

    if (backups.length === 0) {
      logger.info('[Clean] No backups to clean');
      return { deletedCount: 0, freedSpace: 0, keptCount: 0 };
    }

    let deletedCount = 0;
    let freedSpace = 0;
    const filesToDelete: BackupFileInfo[] = [];

    backups.forEach((backup, index) => {
      if (shouldDeleteBackup(backup, backups.length, index)) {
        filesToDelete.push(backup);
      }
    });

    if (filesToDelete.length === 0) {
      logger.info('[Clean] No old backups to delete');
      return { deletedCount: 0, freedSpace: 0, keptCount: backups.length };
    }

    logger.info('[Clean] Backups to delete:', filesToDelete.length);

    for (const backup of filesToDelete) {
      logger.info('[Clean] Deleting:', backup.filename, `(${backup.age} days old, ${formatBytes(backup.size)})`);

      await deleteFile(backup.path);

      const metadataPath = backup.path.replace(/\.(sql|sql\.gz)$/, '.json');
      try {
        await deleteFile(metadataPath);
      } catch (error) {
        logger.warn('[Clean] Metadata file not found or already deleted:', basename(metadataPath));
      }

      deletedCount++;
      freedSpace += backup.size;
    }

    const duration = Date.now() - startTime;
    const keptCount = backups.length - deletedCount;

    logger.info('[Clean] ================================');
    logger.info('[Clean] Cleanup completed successfully!');
    logger.info('[Clean] Deleted backups:', deletedCount);
    logger.info('[Clean] Kept backups:', keptCount);
    logger.info('[Clean] Freed space:', formatBytes(freedSpace));
    logger.info('[Clean] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.info('[Clean] ================================');

    return { deletedCount, freedSpace, keptCount };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error('[Clean] ================================');
    logger.error('[Clean] Cleanup failed!');
    logger.error('[Clean] Duration:', `${(duration / 1000).toFixed(2)}s`);
    logger.error('[Clean] Error:', error);
    logger.error('[Clean] ================================');
    throw error;
  }
};

if (require.main === module) {
  cleanOldBackups()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Cleanup failed:', error.message);
      process.exit(1);
    });
}

import { resolve, join } from 'path';
import { stat, readdir, readFile } from 'fs/promises';
import { formatDistanceToNow } from 'date-fns';
import { logger } from '../../config/logger.config';
import { BACKUP } from '../../shared/constants';
import { formatBytes, deleteFile, isPathSafe } from '../../shared/utils/filesystem.util';
import { createBackup as createBackupScript } from '../../database/scripts/backup';
import { restoreBackup as restoreBackupScript } from '../../database/scripts/restore';
import { cleanOldBackups as cleanOldBackupsScript } from '../../database/scripts/clean-old-backups';
import {
  BackupFileInfo,
  BackupCreateResponse,
  BackupListResponse,
  BackupRestoreRequest,
  BackupRestoreResponse,
  BackupCleanResponse,
} from './backup.types';

class BackupService {
  private getBackupDirectory(): string {
    return resolve(process.cwd(), BACKUP.DIR);
  }

  private validateFilename(filename: string): void {
    const backupDir = this.getBackupDirectory();

    if (!isPathSafe(backupDir, filename)) {
      throw new Error('Invalid filename: path traversal detected');
    }

    if (!filename.startsWith(BACKUP.PREFIX)) {
      throw new Error(`Invalid filename: must start with ${BACKUP.PREFIX}`);
    }

    if (!filename.endsWith('.sql') && !filename.endsWith('.sql.gz')) {
      throw new Error('Invalid filename: must end with .sql or .sql.gz');
    }
  }

  async createBackup(): Promise<BackupCreateResponse> {
    logger.info('[BackupService] Creating new backup...');

    const result = await createBackupScript();

    return {
      filename: result.filename,
      size: result.size,
      sizeFormatted: result.sizeFormatted,
      checksum: result.checksum,
      createdAt: result.timestamp,
      duration: result.duration,
    };
  }

  async listBackups(): Promise<BackupListResponse> {
    logger.info('[BackupService] Listing backups...');

    const backupDir = this.getBackupDirectory();

    try {
      const files = await readdir(backupDir);
      const backupFiles: BackupFileInfo[] = [];
      let totalSize = 0;

      for (const file of files) {
        if (file.startsWith(BACKUP.PREFIX) && (file.endsWith('.sql') || file.endsWith('.sql.gz'))) {
          const filePath = join(backupDir, file);
          const stats = await stat(filePath);
          const metadataPath = filePath.replace(/\.(sql|sql\.gz)$/, '.json');

          let checksum: string | undefined;

          try {
            const metadataContent = await readFile(metadataPath, 'utf-8');
            const metadata = JSON.parse(metadataContent);
            checksum = metadata.checksum;
          } catch (error) {
            logger.warn('[BackupService] Metadata not found for:', file);
          }

          backupFiles.push({
            filename: file,
            size: stats.size,
            sizeFormatted: formatBytes(stats.size),
            createdAt: stats.mtime,
            age: formatDistanceToNow(stats.mtime, { addSuffix: true }),
            checksum,
          });

          totalSize += stats.size;
        }
      }

      backupFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      return {
        backups: backupFiles,
        total: backupFiles.length,
        totalSize,
        totalSizeFormatted: formatBytes(totalSize),
      };
    } catch (error) {
      logger.error('[BackupService] Failed to list backups:', error);
      throw new Error('Failed to list backups');
    }
  }

  async getBackupFilePath(filename: string): Promise<string> {
    this.validateFilename(filename);

    const backupDir = this.getBackupDirectory();
    const filePath = join(backupDir, filename);

    try {
      await stat(filePath);
      return filePath;
    } catch (error) {
      throw new Error('Backup file not found');
    }
  }

  async restoreBackup(request: BackupRestoreRequest): Promise<BackupRestoreResponse> {
    logger.info('[BackupService] Restoring backup:', request.filename);

    this.validateFilename(request.filename);

    const startTime = Date.now();

    try {
      await restoreBackupScript({
        backupFile: request.filename,
        createSafetyBackup: request.createSafetyBackup !== false,
        skipConfirmation: true,
      });

      const duration = Date.now() - startTime;

      return {
        success: true,
        message: 'Database restored successfully',
        safetyBackupCreated: request.createSafetyBackup !== false,
        duration,
      };
    } catch (error) {
      logger.error('[BackupService] Restore failed:', error);
      throw new Error(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteBackup(filename: string): Promise<void> {
    logger.info('[BackupService] Deleting backup:', filename);

    this.validateFilename(filename);

    const backupDir = this.getBackupDirectory();
    const filePath = join(backupDir, filename);
    const metadataPath = filePath.replace(/\.(sql|sql\.gz)$/, '.json');

    try {
      await deleteFile(filePath);

      try {
        await deleteFile(metadataPath);
      } catch (error) {
        logger.warn('[BackupService] Metadata file not found or already deleted');
      }

      logger.info('[BackupService] Backup deleted successfully');
    } catch (error) {
      logger.error('[BackupService] Failed to delete backup:', error);
      throw new Error('Failed to delete backup');
    }
  }

  async cleanOldBackups(): Promise<BackupCleanResponse> {
    logger.info('[BackupService] Cleaning old backups...');

    const result = await cleanOldBackupsScript();

    return {
      deletedCount: result.deletedCount,
      freedSpace: result.freedSpace,
      freedSpaceFormatted: formatBytes(result.freedSpace),
      keptCount: result.keptCount,
    };
  }
}

export default new BackupService();

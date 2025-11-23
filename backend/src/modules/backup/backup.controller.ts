import { Request, Response, NextFunction } from 'express';
import { createReadStream } from 'fs';
import backupService from './backup.service';
import { sendSuccess } from '../../shared/utils/response.util';
import { HTTP_STATUS } from '../../shared/constants';
import { logger } from '../../config/logger.config';
import { AuditLog } from '../../database/models/AuditLog.model';
import { AuditAction } from '../../shared/types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

class BackupController {
  async createBackup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('[BackupController] Create backup request by user:', req.user?.id);

      const result = await backupService.createBackup();

      if (req.user?.id) {
        await AuditLog.create({
          userId: req.user.id,
          action: AuditAction.CREATE,
          tableName: 'backups',
          recordId: null,
          afterData: result,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }

      sendSuccess(res, result, 'Backup created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      logger.error('[BackupController] Create backup failed:', error);
      next(error);
    }
  }

  async listBackups(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('[BackupController] List backups request');

      const result = await backupService.listBackups();

      sendSuccess(res, result);
    } catch (error) {
      logger.error('[BackupController] List backups failed:', error);
      next(error);
    }
  }

  async downloadBackup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename } = req.params;

      logger.info('[BackupController] Download backup request:', filename);

      const filePath = await backupService.getBackupFilePath(filename);

      res.setHeader('Content-Type', 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

      const fileStream = createReadStream(filePath);

      fileStream.on('error', (error) => {
        logger.error('[BackupController] Stream error:', error);
        next(error);
      });

      fileStream.pipe(res);
    } catch (error) {
      logger.error('[BackupController] Download backup failed:', error);
      next(error);
    }
  }

  async restoreBackup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename } = req.params;
      const { createSafetyBackup } = req.body;

      logger.info('[BackupController] Restore backup request:', filename, 'by user:', req.user?.id);

      const result = await backupService.restoreBackup({
        filename,
        createSafetyBackup,
      });

      if (req.user?.id) {
        await AuditLog.create({
          userId: req.user.id,
          action: AuditAction.UPDATE,
          tableName: 'backups',
          recordId: null,
          afterData: result,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }

      sendSuccess(res, result);
    } catch (error) {
      logger.error('[BackupController] Restore backup failed:', error);
      next(error);
    }
  }

  async deleteBackup(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const { filename } = req.params;

      logger.info('[BackupController] Delete backup request:', filename, 'by user:', req.user?.id);

      await backupService.deleteBackup(filename);

      if (req.user?.id) {
        await AuditLog.create({
          userId: req.user.id,
          action: AuditAction.DELETE,
          tableName: 'backups',
          recordId: null,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }

      sendSuccess(res, { message: 'Backup deleted successfully' });
    } catch (error) {
      logger.error('[BackupController] Delete backup failed:', error);
      next(error);
    }
  }

  async cleanOldBackups(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      logger.info('[BackupController] Clean old backups request by user:', req.user?.id);

      const result = await backupService.cleanOldBackups();

      if (req.user?.id) {
        await AuditLog.create({
          userId: req.user.id,
          action: AuditAction.DELETE,
          tableName: 'backups',
          recordId: null,
          afterData: result,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
        });
      }

      sendSuccess(res, result);
    } catch (error) {
      logger.error('[BackupController] Clean backups failed:', error);
      next(error);
    }
  }
}

export default new BackupController();

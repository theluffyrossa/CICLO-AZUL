import { Router } from 'express';
import backupController from './backup.controller';
import { authenticate, isAdmin } from '../../shared/middleware/auth.middleware';
import { validate } from '../../shared/middleware/validation.middleware';
import { restoreBackupSchema, deleteBackupSchema } from './backup.validation';

const router = Router();

router.post('/', authenticate, isAdmin, backupController.createBackup);

router.get('/', authenticate, isAdmin, backupController.listBackups);

router.get('/:filename', authenticate, isAdmin, backupController.downloadBackup);

router.post(
  '/restore/:filename',
  authenticate,
  isAdmin,
  validate(restoreBackupSchema),
  backupController.restoreBackup
);

router.delete(
  '/:filename',
  authenticate,
  isAdmin,
  validate(deleteBackupSchema),
  backupController.deleteBackup
);

router.post('/clean', authenticate, isAdmin, backupController.cleanOldBackups);

export default router;

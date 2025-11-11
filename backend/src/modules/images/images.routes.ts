import { Router } from 'express';
import { ImagesController } from './images.controller';
import { authenticate, isOperatorOrAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { upload } from '@shared/utils/upload.util';
import { updateImageSchema } from './images.validation';

const router = Router();
const imagesController = new ImagesController();

router.use(authenticate);

router.post(
  '/upload',
  isOperatorOrAdmin,
  upload.single('image'),
  asyncHandler(imagesController.upload)
);

router.get('/collection/:collectionId', asyncHandler(imagesController.findByCollection));

router.get('/:id', asyncHandler(imagesController.findById));

router.put(
  '/:id',
  isOperatorOrAdmin,
  validate(updateImageSchema),
  asyncHandler(imagesController.update)
);

router.delete('/:id', isOperatorOrAdmin, asyncHandler(imagesController.delete));

export { router as imagesRouter };

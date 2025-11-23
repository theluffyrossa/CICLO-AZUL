import { Router } from 'express';
import { ImagesController } from './images.controller';
import { authenticate, isAdmin } from '@shared/middleware/auth.middleware';
import { validate } from '@shared/middleware/validation.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { upload } from '@shared/utils/upload.util';
import { updateImageSchema } from './images.validation';

const router = Router();
const imagesController = new ImagesController();

router.use(authenticate);

router.post(
  '/upload',
  upload.array('images', 6),
  asyncHandler(imagesController.upload)
);

router.post(
  '/upload-single',
  upload.single('image'),
  asyncHandler(imagesController.uploadSingle)
);

router.get('/collection/:collectionId', asyncHandler(imagesController.findByCollection));

router.get('/:id', asyncHandler(imagesController.findById));

router.put(
  '/:id',
  isAdmin,
  validate(updateImageSchema),
  asyncHandler(imagesController.update)
);

router.delete('/:id', isAdmin, asyncHandler(imagesController.delete));

export { router as imagesRouter };

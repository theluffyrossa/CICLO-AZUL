import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validate } from '@shared/middleware/validation.middleware';
import { authenticate } from '@shared/middleware/auth.middleware';
import { asyncHandler } from '@shared/middleware/error.middleware';
import { loginSchema, refreshTokenSchema } from './auth.validation';

const router = Router();
const authController = new AuthController();

router.post('/login', validate(loginSchema), asyncHandler(authController.login));

router.post(
  '/refresh',
  validate(refreshTokenSchema),
  asyncHandler(authController.refreshToken)
);

router.post('/logout', authenticate, asyncHandler(authController.logout));

router.get('/me', authenticate, asyncHandler(authController.me));

export { router as authRouter };

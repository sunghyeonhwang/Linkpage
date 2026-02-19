import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  signupSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@linkpage/shared';

const router = Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', validate(loginSchema), authController.login);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
router.post('/verify-email', authController.verifyEmail);
router.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

export default router;

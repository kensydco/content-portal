import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController';
import { requestPasswordReset, resetPassword } from '../controllers/passwordResetController';
import { validateBody } from '../middleware/validateRequest';
import { loginSchema, passwordResetRequestSchema, resetPasswordSchema } from '../utils/validation';
import { authenticate } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);
router.post('/request-reset', loginRateLimiter, validateBody(passwordResetRequestSchema), requestPasswordReset);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

export default router;

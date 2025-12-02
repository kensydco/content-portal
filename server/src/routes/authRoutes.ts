import { Router } from 'express';
import { login, logout, getCurrentUser } from '../controllers/authController';
import { validateBody } from '../middleware/validateRequest';
import { loginSchema } from '../utils/validation';
import { authenticate } from '../middleware/authMiddleware';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, validateBody(loginSchema), login);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

export default router;

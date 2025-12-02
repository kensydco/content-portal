import { Router } from 'express';
import { getPublicConfig, getFullConfig, updateConfig } from '../controllers/configController';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { configSchema } from '../utils/validation';

const router = Router();

// Public config (no auth required)
router.get('/public', getPublicConfig);

// Admin-only routes
router.get('/', authenticate, requireSuperAdmin, getFullConfig);
router.patch('/', authenticate, requireSuperAdmin, validateBody(configSchema), updateConfig);

export default router;

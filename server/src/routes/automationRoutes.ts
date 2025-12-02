import { Router } from 'express';
import { getApprovedContent } from '../controllers/automationController';
import { authenticateApiKey } from '../middleware/authMiddleware';
import { validateQuery } from '../middleware/validateRequest';
import { automationQuerySchema } from '../utils/validation';

const router = Router();

router.get(
  '/content',
  authenticateApiKey,
  validateQuery(automationQuerySchema),
  getApprovedContent
);

export default router;

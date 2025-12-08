import { Router } from 'express';
import {
  getPublicStudios,
  getStudios,
  createStudio,
  updateStudio,
} from '../controllers/studiosController';
import { authenticate } from '../middleware/authMiddleware';
import { requireSuperAdmin } from '../middleware/roleMiddleware';
import { validateBody } from '../middleware/validateRequest';
import { z } from 'zod';

const router = Router();

const studioSchema = z.object({
  studioId: z.string().min(1).max(20),
  name: z.string().min(1).max(100),
  city: z.string().min(1).max(100),
  state: z.string().length(2),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(200).optional(),
  tiktok: z.string().max(100).optional(),
});

// Public endpoint
router.get('/public', getPublicStudios);

// Admin endpoints
router.get('/', authenticate, getStudios);
router.post('/', authenticate, requireSuperAdmin, validateBody(studioSchema), createStudio);
router.patch('/:id', authenticate, requireSuperAdmin, validateBody(studioSchema.partial()), updateStudio);

export default router;

import { Router } from 'express';
import multer from 'multer';
import { uploadContent } from '../controllers/uploadController';
import { validateBody } from '../middleware/validateRequest';
import { uploadSchema } from '../utils/validation';
import { uploadRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB
  },
});

router.post(
  '/',
  uploadRateLimiter,
  upload.single('file'),
  validateBody(uploadSchema),
  uploadContent
);

export default router;

import { Router } from 'express';
import {
  getSubmissions,
  getSubmissionById,
  updateSubmission,
  bulkUpdateSubmissions,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/adminController';
import { authenticate } from '../middleware/authMiddleware';
import { requireViewer, requireEditor, requireSuperAdmin } from '../middleware/roleMiddleware';
import { validateBody, validateQuery } from '../middleware/validateRequest';
import {
  submissionQuerySchema,
  updateSubmissionSchema,
  bulkActionSchema,
  categorySchema,
} from '../utils/validation';

const router = Router();

// All admin routes require authentication
router.use(authenticate);

// Submissions
router.get('/submissions', requireViewer, validateQuery(submissionQuerySchema), getSubmissions);
router.get('/submissions/:id', requireViewer, getSubmissionById);
router.patch('/submissions/:id', requireEditor, validateBody(updateSubmissionSchema), updateSubmission);
router.post('/submissions/bulk', requireEditor, validateBody(bulkActionSchema), bulkUpdateSubmissions);

// Categories
router.get('/categories', requireViewer, getCategories);
router.post('/categories', requireSuperAdmin, validateBody(categorySchema), createCategory);
router.patch('/categories/:id', requireSuperAdmin, validateBody(categorySchema.partial()), updateCategory);
router.delete('/categories/:id', requireSuperAdmin, deleteCategory);

export default router;

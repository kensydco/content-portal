import { Router } from 'express';
import uploadRoutes from './uploadRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import configRoutes from './configRoutes';
import automationRoutes from './automationRoutes';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);
router.use('/automation', automationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;

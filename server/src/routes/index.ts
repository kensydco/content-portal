import { Router } from 'express';
import uploadRoutes from './uploadRoutes';
import authRoutes from './authRoutes';
import adminRoutes from './adminRoutes';
import configRoutes from './configRoutes';
import automationRoutes from './automationRoutes';
import studiosRoutes from './studiosRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/upload', uploadRoutes);
router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/config', configRoutes);
router.use('/automation', automationRoutes);
router.use('/studios', studiosRoutes);
router.use('/', healthRoutes);

export default router;

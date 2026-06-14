import { Router } from 'express';
import { getWeeklyStats, getGrowthPrediction } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/weekly', authenticateToken as any, getWeeklyStats as any);
router.get('/prediction', authenticateToken as any, getGrowthPrediction as any);

export default router;

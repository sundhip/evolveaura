import { Router } from 'express';
import { getDashboardInsight, getGrowthPrediction, getWeeklyReportAPI } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/insight', authenticateToken as any, getDashboardInsight as any);
router.get('/prediction', authenticateToken as any, getGrowthPrediction as any);
router.get('/weekly', authenticateToken as any, getWeeklyReportAPI as any);

export default router;

import { Router } from 'express';
import { getDailyQuests, verifyQuest, claimDailyReward } from '../controllers/questController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/daily', authenticateToken as any, getDailyQuests as any);
router.post('/verify', authenticateToken as any, verifyQuest as any);
router.post('/daily-reward/claim', authenticateToken as any, claimDailyReward as any);

export default router;

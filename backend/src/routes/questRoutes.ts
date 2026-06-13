import { Router } from 'express';
import { getDailyQuests, completeQuest } from '../controllers/questController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/daily', authenticateToken as any, getDailyQuests as any);
router.post('/complete/:userQuestId', authenticateToken as any, completeQuest as any);

export default router;

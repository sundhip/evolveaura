import { Router } from 'express';
import { getActiveBoss, attackBoss, selectBossTier, completeBossQuest, failBossQuest } from '../controllers/bossController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/active', authenticateToken as any, getActiveBoss as any);
router.post('/attack', authenticateToken as any, attackBoss as any);
router.post('/select-tier', authenticateToken as any, selectBossTier as any);
router.post('/complete-quest', authenticateToken as any, completeBossQuest as any);
router.post('/fail-quest', authenticateToken as any, failBossQuest as any);

export default router;

import { Router } from 'express';
import { getActiveBoss, attackBoss } from '../controllers/bossController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/active', authenticateToken as any, getActiveBoss as any);
router.post('/attack', authenticateToken as any, attackBoss as any);

export default router;

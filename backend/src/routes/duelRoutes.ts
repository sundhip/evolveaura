import { Router } from 'express';
import { createDuel, respondToDuel, selectStance, getMyDuels } from '../controllers/duelController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/', authenticateToken as any, getMyDuels as any);
router.post('/challenge', authenticateToken as any, createDuel as any);
router.post('/respond', authenticateToken as any, respondToDuel as any);
router.post('/stance', authenticateToken as any, selectStance as any);

export default router;

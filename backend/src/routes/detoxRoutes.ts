import { Router } from 'express';
import { logDetox, getDetoxHistory } from '../controllers/detoxController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/log', authenticateToken as any, logDetox as any);
router.get('/history', authenticateToken as any, getDetoxHistory as any);

export default router;

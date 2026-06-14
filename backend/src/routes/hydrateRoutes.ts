import { Router } from 'express';
import { hydrateDashboard } from '../controllers/hydrateController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/hydrate', authenticateToken as any, hydrateDashboard as any);

export default router;

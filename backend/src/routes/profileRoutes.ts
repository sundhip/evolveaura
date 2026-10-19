import { Router } from 'express';
import { choosePath, updateSmokingStatus } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/choose-path', authenticateToken as any, choosePath as any);
router.post('/smoking-status', authenticateToken as any, updateSmokingStatus as any);

export default router;

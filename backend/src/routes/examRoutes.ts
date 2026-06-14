import { Router } from 'express';
import { startExam, completeExam } from '../controllers/examController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/start', authenticateToken as any, startExam as any);
router.post('/complete', authenticateToken as any, completeExam as any);

export default router;

import { Router } from 'express';
import { submitAssessment, getLatestAssessment } from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/submit', authenticateToken as any, submitAssessment as any);
router.get('/latest', authenticateToken as any, getLatestAssessment as any);

export default router;

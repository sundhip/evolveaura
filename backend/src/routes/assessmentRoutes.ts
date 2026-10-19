import { Router } from 'express';
import {
  getAssessmentQuestions,
  submitAssessment,
  getAssessmentStatus,
  getLatestAssessment,
} from '../controllers/assessmentController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.get('/questions', authenticateToken as any, getAssessmentQuestions as any);
router.post('/submit', authenticateToken as any, submitAssessment as any);
router.get('/status', authenticateToken as any, getAssessmentStatus as any);
router.get('/latest', authenticateToken as any, getLatestAssessment as any);

export default router;

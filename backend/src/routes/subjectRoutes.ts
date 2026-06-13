import { Router } from 'express';
import { getSubjects, upsertSubject, getAnalysis } from '../controllers/subjectController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticateToken as any, getSubjects as any);
router.post('/upsert', authenticateToken as any, upsertSubject as any);
router.get('/analysis', authenticateToken as any, getAnalysis as any);

export default router;

import { Router } from 'express';
import { createSession, submitSession } from '../controllers/verificationController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/create', authenticateToken as any, createSession as any);
router.post('/submit', authenticateToken as any, submitSession as any);

export default router;

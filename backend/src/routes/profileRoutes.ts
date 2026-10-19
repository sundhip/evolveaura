import { Router } from 'express';
import { choosePath } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

router.post('/choose-path', authenticateToken as any, choosePath as any);

export default router;

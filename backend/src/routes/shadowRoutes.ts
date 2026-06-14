import { Router } from 'express';
import { getMyShadows } from '../controllers/shadowController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticateToken as any, getMyShadows as any);

export default router;

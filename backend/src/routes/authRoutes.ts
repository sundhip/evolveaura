import { Router } from 'express';
import { register, login, googleLogin, getProfile, allocateStatPoint, ascendRank } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken as any, getProfile as any);
router.post('/profile/allocate-stat', authenticateToken as any, allocateStatPoint as any);
router.post('/profile/ascend-rank', authenticateToken as any, ascendRank as any);

export default router;

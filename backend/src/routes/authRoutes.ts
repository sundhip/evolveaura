import { Router } from 'express';
import { register, login, googleLogin, getProfile, allocateStatPoint, ascendRank, clearFatigue } from '../controllers/authController';
import { calmReset, updatePressure } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken as any, getProfile as any);
router.post('/profile/allocate-stat', authenticateToken as any, allocateStatPoint as any);
router.post('/profile/ascend-rank', authenticateToken as any, ascendRank as any);
router.post('/profile/calm-reset', authenticateToken as any, calmReset as any);
router.post('/profile/pressure', authenticateToken as any, updatePressure as any);
router.post('/profile/clear-fatigue', authenticateToken as any, clearFatigue as any);

export default router;

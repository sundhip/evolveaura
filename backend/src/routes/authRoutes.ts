import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { register, login, googleLogin, getProfile, allocateStatPoint, ascendRank, clearFatigue } from '../controllers/authController';
import { calmReset, updatePressure, choosePath } from '../controllers/profileController';
import { authenticateToken } from '../middleware/authMiddleware';
import { env } from '../config/env';

const router = Router();

const createAuthLimiter = () =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many authentication attempts, please try again after 15 minutes.' },
    statusCode: 429,
  });

router.post('/register', createAuthLimiter(), register);
router.post('/login', createAuthLimiter(), login);
router.post('/google', createAuthLimiter(), googleLogin);
router.all('/google-simulator', (req, res) => {
  if (env.NODE_ENV === 'production' || !env.ALLOW_GOOGLE_SIMULATOR) {
    return res.status(404).json({ error: 'Google simulator endpoint is disabled' });
  }
  return res.json({ message: 'Google simulator active' });
});

router.get('/profile', authenticateToken as any, getProfile as any);
router.post('/profile/choose-path', authenticateToken as any, choosePath as any);
router.post('/profile/allocate-stat', authenticateToken as any, allocateStatPoint as any);
router.post('/profile/ascend-rank', authenticateToken as any, ascendRank as any);
router.post('/profile/calm-reset', authenticateToken as any, calmReset as any);
router.post('/profile/pressure', authenticateToken as any, updatePressure as any);
router.post('/profile/clear-fatigue', authenticateToken as any, clearFatigue as any);

export default router;

import { Router } from 'express';
import { register, login, googleLogin, getProfile, buyRelic, updateSkillTree } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken as any, getProfile as any);
router.post('/relics/buy', authenticateToken as any, buyRelic as any);
router.post('/skills/unlock', authenticateToken as any, updateSkillTree as any);

export default router;

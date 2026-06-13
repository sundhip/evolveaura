import { Router } from 'express';
import { register, login, googleLogin, getProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/profile', authenticateToken as any, getProfile as any);

export default router;

import { Router } from 'express';
import { getProjects, createProject, contributeProgress } from '../controllers/projectController';
import { convertToDungeon, verifyFloor } from '../controllers/dungeonController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();
router.get('/', authenticateToken as any, getProjects as any);
router.post('/', authenticateToken as any, createProject as any);
router.post('/contribute', authenticateToken as any, contributeProgress as any);
router.post('/convert-dungeon', authenticateToken as any, convertToDungeon as any);
router.post('/verify-floor', authenticateToken as any, verifyFloor as any);

export default router;

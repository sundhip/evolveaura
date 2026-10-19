import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authenticateToken } from '../middleware/authMiddleware';
import {
  saveConsent,
  getQuitProfile,
  saveScreening,
  savePlan,
  getTodayCheckIn,
  saveCheckIn,
  getCheckInHistory,
  startCraving,
  endCraving,
  logLapse,
  getQuitStats,
  exportQuitData,
  deleteQuitData,
  updateSavingsGoal,
  updateReminders,
  getQuitBoss,
  getQuitPlatformMetrics
} from '../controllers/quitController';

const router = Router();

const writeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 60, // limit each IP to 60 write requests per 15 mins
  skip: () => process.env.NODE_ENV === 'test',
  message: { error: 'TOO_MANY_REQUESTS', message: 'Too many requests, please try again shortly.' }
});

router.post('/consent', writeLimiter, authenticateToken as any, saveConsent as any);
router.get('/profile', authenticateToken as any, getQuitProfile as any);
router.post('/screening', writeLimiter, authenticateToken as any, saveScreening as any);
router.post('/plan', writeLimiter, authenticateToken as any, savePlan as any);
router.get('/checkin/today', authenticateToken as any, getTodayCheckIn as any);
router.post('/checkin', writeLimiter, authenticateToken as any, saveCheckIn as any);
router.get('/checkin/history', authenticateToken as any, getCheckInHistory as any);
router.post('/craving/start', writeLimiter, authenticateToken as any, startCraving as any);
router.post('/craving/end', writeLimiter, authenticateToken as any, endCraving as any);
router.post('/lapse', writeLimiter, authenticateToken as any, logLapse as any);
router.get('/stats', authenticateToken as any, getQuitStats as any);
router.get('/export', authenticateToken as any, exportQuitData as any);
router.delete('/data', writeLimiter, authenticateToken as any, deleteQuitData as any);

// Phase 6 endpoints
router.post('/savings-goal', writeLimiter, authenticateToken as any, updateSavingsGoal as any);
router.post('/reminders', writeLimiter, authenticateToken as any, updateReminders as any);
router.get('/boss', authenticateToken as any, getQuitBoss as any);
router.get('/metrics', getQuitPlatformMetrics as any);

export default router;

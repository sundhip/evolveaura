import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import questRoutes from './routes/questRoutes';
import bossRoutes from './routes/bossRoutes';
import projectRoutes from './routes/projectRoutes';
import subjectRoutes from './routes/subjectRoutes';
import hydrateRoutes from './routes/hydrateRoutes';
import analysisRoutes from './routes/analysisRoutes';
import verificationRoutes from './routes/verificationRoutes';
import duelRoutes from './routes/duelRoutes';
import shadowRoutes from './routes/shadowRoutes';
import examRoutes from './routes/examRoutes';
import quitRoutes from './routes/quitRoutes';
import { errorHandler } from './middleware/errorMiddleware';

const app = express();
const PORT = env.PORT;

app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (env.ALLOWED_ORIGINS.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/assessment', assessmentRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/bosses', bossRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', hydrateRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/verification', verificationRoutes);
app.use('/api/duels', duelRoutes);
app.use('/api/shadows', shadowRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/quit', quitRoutes);

// Simulator endpoint path guard
app.all('/google-simulator', (req, res) => {
  if (env.NODE_ENV === 'production' || !env.ALLOW_GOOGLE_SIMULATOR) {
    return res.status(404).json({ error: 'Google simulator endpoint is disabled' });
  }
  return res.json({ message: 'Google simulator active' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log('[EvolveAura Backend V2] Server running on port ' + PORT);
  });
}

export default app;

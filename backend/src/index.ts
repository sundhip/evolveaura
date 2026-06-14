import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
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
import { errorHandler } from './middleware/errorMiddleware';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('[EvolveAura Backend V2] Server running on port ' + PORT);
});

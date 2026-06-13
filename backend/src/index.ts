import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import questRoutes from './routes/questRoutes';
import subjectRoutes from './routes/subjectRoutes';
import detoxRoutes from './routes/detoxRoutes';
import analysisRoutes from './routes/analysisRoutes';
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
app.use('/api/subjects', subjectRoutes);
app.use('/api/detox', detoxRoutes);
app.use('/api/analysis', analysisRoutes);

// Base route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[EvolveAura Backend] Server running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import assessmentRoutes from './routes/assessmentRoutes';
import questRoutes from './routes/questRoutes';
import bossRoutes from './routes/bossRoutes';
import projectRoutes from './routes/projectRoutes';
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

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log('[EvolveAura Backend V2] Server running on port ' + PORT);
});

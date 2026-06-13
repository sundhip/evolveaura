import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateDetoxScore } from '../services/detoxEngine';

export const logDetox = async (req: AuthRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    const { screenTimeSeconds, studyTimeSeconds, exerciseTimeSeconds, mindfulnessTimeSeconds, creationTimeSeconds } = req.body;

    const existingMetric = await prisma.detoxMetric.findUnique({
      where: { userId_date: { userId: req.userId!, date: today } }
    });

    const metrics = {
      screenTimeSeconds: screenTimeSeconds || existingMetric?.screenTimeSeconds || 0,
      studyTimeSeconds: studyTimeSeconds || existingMetric?.studyTimeSeconds || 0,
      exerciseTimeSeconds: exerciseTimeSeconds || existingMetric?.exerciseTimeSeconds || 0,
      mindfulnessTimeSeconds: mindfulnessTimeSeconds || existingMetric?.mindfulnessTimeSeconds || 0,
      creationTimeSeconds: creationTimeSeconds || existingMetric?.creationTimeSeconds || 0
    };

    const detoxScore = calculateDetoxScore(metrics);

    const log = await prisma.detoxMetric.upsert({
      where: { userId_date: { userId: req.userId!, date: today } },
      update: { ...metrics, detoxScore },
      create: { userId: req.userId!, date: today, ...metrics, detoxScore }
    });

    res.json(log);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDetoxHistory = async (req: AuthRequest, res: Response) => {
  try {
    const history = await prisma.detoxMetric.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'asc' },
      take: 30
    });
    res.json(history);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

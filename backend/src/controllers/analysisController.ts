import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDailyInsight } from '../services/insightEngine';
import { predict30DayGrowth } from '../services/predictionEngine';
import { generateWeeklyReport } from '../services/weeklyEngine';

export const getDashboardInsight = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      include: { profile: true }
    });
    if (!user || !user.profile) return res.status(404).json({ error: 'Profile not found' });

    const assessment = await prisma.assessment.findFirst({
      where: { userId: req.userId! },
      orderBy: { completedAt: 'desc' }
    });

    const bottleneck = assessment ? assessment.auraRank : 'Focus';

    const insight = getDailyInsight(
      user.profile.role,
      user.profile.primaryGoal,
      bottleneck,
      user.profile.currentStreak
    );

    res.json({ insight });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGrowthPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const userQuests = await prisma.userQuest.findMany({ where: { userId: req.userId! } });
    const completed = userQuests.filter(q => q.completed).length;
    const total = userQuests.length;

    const consistencyRate = total > 0 ? completed / total : 0.75; // default 75% consistency
    const prediction = predict30DayGrowth(profile.currentLevel, profile.currentXP, consistencyRate);
    res.json(prediction);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getWeeklyReportAPI = async (req: AuthRequest, res: Response) => {
  try {
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 7);

    const metrics = await prisma.detoxMetric.findMany({
      where: { userId: req.userId!, date: { gte: sevenDaysAgo } }
    });

    const quests = await prisma.userQuest.findMany({
      where: { userId: req.userId!, date: { gte: sevenDaysAgo } }
    });

    const days = metrics.map(m => {
      const dayQuests = quests.filter(q => q.date.toISOString().split('T')[0] === m.date.toISOString().split('T')[0]);
      return {
        date: m.date,
        detoxScore: m.detoxScore,
        questsCompleted: dayQuests.filter(q => q.completed).length,
        studySeconds: m.studyTimeSeconds
      };
    });

    const report = generateWeeklyReport(days);
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getWeeklyStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    
    // Fetch completed quests in the last 7 days
    const completedQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      include: { quest: true }
    });

    let focusMinutes = 0;
    completedQuests.forEach(uq => {
      if (uq.quest.verificationType === 'TIMER') {
        if (uq.timerStartedAt && uq.completedAt) {
          const diffMs = uq.completedAt.getTime() - uq.timerStartedAt.getTime();
          focusMinutes += Math.max(1, Math.round(diffMs / 60000));
        } else {
          focusMinutes += 25; // default pomodoro deep work focus time
        }
      }
    });

    const profile = await prisma.profile.findUnique({ where: { userId } });
    const stability = profile ? profile.stabilityScore : 75;

    res.json({
      averageDetoxScore: Math.round(stability),
      focusMinutes: focusMinutes,
      questsCompleted: completedQuests.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGrowthPrediction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Calculate completed quests in last 7 days to get daily consistency rate
    const pastWeekQuests = await prisma.userQuest.count({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    const dailyCompletionRate = Math.max(0.5, pastWeekQuests / 7); // minimum 0.5 quest/day baseline
    const avgQuestXP = 35; // average quest XP reward

    let currentLevel = profile.currentLevel;
    let currentXP = profile.currentXP;

    const history = [];
    const predictionIntervals = [5, 10, 15, 20, 25, 30];

    for (const day of predictionIntervals) {
      const questsToComplete = dailyCompletionRate * day;
      const xpGained = Math.round(questsToComplete * avgQuestXP);
      
      let tempXP = currentXP + xpGained;
      let tempLevel = currentLevel;

      // Simulate level up sequence using Math.round(100 * Math.pow(L, 1.5))
      let nextLevelMax = Math.round(100 * Math.pow(tempLevel, 1.5));
      while (tempXP >= nextLevelMax) {
        tempXP -= nextLevelMax;
        tempLevel += 1;
        nextLevelMax = Math.round(100 * Math.pow(tempLevel, 1.5));
      }

      history.push({
        day,
        level: tempLevel,
        xp: tempXP
      });
    }

    const levelDiff = history[5].level - currentLevel;
    let summary = '';
    if (levelDiff > 0) {
      summary = `Based on your consistency rate of ${dailyCompletionRate.toFixed(1)} quests per day, you are projected to advance ${levelDiff} level(s) to Level ${history[5].level} in the next 30 days! Keep up the discipline.`;
    } else {
      summary = `With your current consistency rate of ${dailyCompletionRate.toFixed(1)} quests per day, you'll accumulate ${history[5].xp} XP towards Level ${currentLevel + 1}. Try increasing daily quest completions to accelerate your leveling!`;
    }

    res.json({
      history,
      summary
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

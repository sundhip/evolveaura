import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDynamicChallenge, getDifficultyMultiplier } from '../services/questEngine';

export const getDailyQuests = async (req: AuthRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    let userQuests = await prisma.userQuest.findMany({
      where: { userId: req.userId!, date: today },
      include: { quest: true }
    });

    if (userQuests.length === 0) {
      const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
      const lastAss = await prisma.assessment.findFirst({
        where: { userId: req.userId! },
        orderBy: { completedAt: 'desc' }
      });

      const mult = getDifficultyMultiplier(profile?.auraRank || 'E');
      const dayOfWeek = new Date().getDay();
      const dynChallenge = getDynamicChallenge(dayOfWeek);

      // Fetch default seeded templates
      const templates = await prisma.quest.findMany({
        where: { path: { in: ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'] } }
      });

      // Add dynamic weekday quest
      let dynamicQuest = await prisma.quest.findFirst({ where: { title: dynChallenge.title } });
      if (!dynamicQuest) {
        dynamicQuest = await prisma.quest.create({
          data: {
            title: dynChallenge.title,
            description: dynChallenge.desc,
            path: dynChallenge.path,
            difficulty: "MEDIUM",
            xpReward: 100,
            verificationType: "ACTION"
          }
        });
      }

      const allQuests = [...templates.slice(0, 4), dynamicQuest];

      for (const q of allQuests) {
        await prisma.userQuest.create({
          data: {
            userId: req.userId!,
            questId: q.id,
            date: today
          }
        });
      }

      userQuests = await prisma.userQuest.findMany({
        where: { userId: req.userId!, date: today },
        include: { quest: true }
      });
    }

    res.json(userQuests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { userQuestId, inputData } = req.body;
    const uq = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true, user: { include: { profile: true } } }
    });

    if (!uq) return res.status(404).json({ error: 'Quest not found' });
    if (uq.completed) return res.status(400).json({ error: 'Quest already completed' });

    // Validation checks
    if (uq.quest.verificationType === 'REFLECTION') {
      if (!inputData || inputData.trim().length < 50) {
        return res.status(400).json({ error: 'Reflection log must be at least 50 characters long.' });
      }
    }

    await prisma.userQuest.update({
      where: { id: userQuestId },
      data: { completed: true, completedAt: new Date(), inputData }
    });

    // Award rewards
    const profile = uq.user.profile!;
    let xpAwarded = uq.quest.xpReward;

    let level = profile.currentLevel;
    let xp = profile.currentXP + xpAwarded;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let leveledUp = false;

    while (xp >= required) {
      xp -= required;
      level += 1;
      leveledUp = true;
      required = Math.round(100 * Math.pow(level, 1.5));
    }

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentXP: xp,
        currentLevel: level,
        currentStreak: { increment: 1 }
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained: xpAwarded,
        source: `Completed Quest: ${uq.quest.title}`
      }
    });

    res.json({ completed: true, xpGained: xpAwarded, leveledUp, level });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const claimDailyReward = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const streak = profile.currentStreak;
    const rewards = [20, 30, 50, 75, 100, 150, 250];
    const rewardIndex = streak % 7;
    const xpGained = rewards[rewardIndex];

    let level = profile.currentLevel;
    let xp = profile.currentXP + xpGained;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let leveledUp = false;

    while (xp >= required) {
      xp -= required;
      level += 1;
      leveledUp = true;
      required = Math.round(100 * Math.pow(level, 1.5));
    }

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentXP: xp,
        currentLevel: level
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained,
        source: "Daily Login Chest Reward"
      }
    });

    res.json({ xpGained, newXP: xp, leveledUp, level });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

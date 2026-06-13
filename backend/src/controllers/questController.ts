import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { selectQuestsForUser } from '../services/questEngine';
import { processXPGain } from '../services/evolutionEngine';

export const getDailyQuests = async (req: AuthRequest, res: Response) => {
  try {
    const todayStr = new Date().toISOString().split('T')[0];
    const today = new Date(todayStr);

    let userQuests = await prisma.userQuest.findMany({
      where: { userId: req.userId!, date: today },
      include: { quest: true }
    });

    if (userQuests.length === 0) {
      // Fetch user profile scores
      const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
      const lastAssessment = await prisma.assessment.findFirst({
        where: { userId: req.userId! },
        orderBy: { completedAt: 'desc' }
      });

      const pathScores = lastAssessment ? {
        scholar: lastAssessment.scholarScore,
        warrior: lastAssessment.warriorScore,
        sage: lastAssessment.sageScore,
        creator: lastAssessment.creatorScore
      } : { scholar: 50, warrior: 50, sage: 50, creator: 50 };

      // Generate
      const templates = selectQuestsForUser(pathScores);
      
      // Save and map
      userQuests = [];
      for (const temp of templates) {
        let quest = await prisma.quest.findFirst({ where: { title: temp.title } });
        if (!quest) {
          quest = await prisma.quest.create({ data: temp });
        }

        const uq = await prisma.userQuest.create({
          data: {
            userId: req.userId!,
            questId: quest.id,
            date: today
          },
          include: { quest: true }
        });
        userQuests.push(uq);
      }
    }

    res.json(userQuests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { userQuestId } = req.params;
    const userQuest = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true, user: { include: { profile: true } } }
    });

    if (!userQuest) return res.status(404).json({ error: 'Quest not found' });
    if (userQuest.completed) return res.status(400).json({ error: 'Quest already completed' });

    // Mark completed
    const updatedUserQuest = await prisma.userQuest.update({
      where: { id: userQuestId },
      data: { completed: true, completedAt: new Date() }
    });

    // XP Logic
    const profile = userQuest.user.profile!;
    const xpReward = userQuest.quest.xpReward;
    const xpDetails = processXPGain(profile.currentLevel, profile.currentXP, xpReward);

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentLevel: xpDetails.level,
        currentXP: xpDetails.xp,
        currentStreak: { increment: 1 },
        lastActiveAt: new Date()
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained: xpReward,
        source: `Quest Completion: ${userQuest.quest.title}`
      }
    });

    // Check achievement unlock
    const unlockedAchievements = [];
    const achievements = await prisma.achievement.findMany();
    for (const ach of achievements) {
      const alreadyUnlocked = await prisma.userAchievement.findUnique({
        where: { userId_achievementId: { userId: req.userId!, achievementId: ach.id } }
      });
      if (alreadyUnlocked) continue;

      let meetsRequirement = false;
      if (ach.requirementType === 'streak' && profile.currentStreak + 1 >= ach.requirementValue) {
        meetsRequirement = true;
      } else if (ach.requirementType === 'level' && xpDetails.level >= ach.requirementValue) {
        meetsRequirement = true;
      }

      if (meetsRequirement) {
        const ua = await prisma.userAchievement.create({
          data: { userId: req.userId!, achievementId: ach.id },
          include: { achievement: true }
        });
        unlockedAchievements.push(ua.achievement);
      }
    }

    res.json({ userQuest: updatedUserQuest, xpDetails, unlockedAchievements });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

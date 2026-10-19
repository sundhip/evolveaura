import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const calmReset = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const newRecoveryMode = !profile.recoveryModeActive;

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { recoveryModeActive: newRecoveryMode }
    });

    let crisisQuest = null;

    if (newRecoveryMode) {
      // Setup micro crisis quest
      const todayStr = new Date().toISOString().split('T')[0];
      const today = new Date(todayStr);

      let questTemplate = await prisma.quest.findFirst({
        where: { title: "Calm Reset: Box Breathing Exercise" }
      });

      if (!questTemplate) {
        questTemplate = await prisma.quest.create({
          data: {
            title: "Calm Reset: Box Breathing Exercise",
            description: "Practice deep, calm box breathing for 60 seconds to stabilize mental focus.",
            path: "SAGE",
            difficulty: "EASY",
            xpReward: 50,
            verificationType: "TIMER"
          }
        });
      }

      // Check if user already has it today
      crisisQuest = await prisma.userQuest.findFirst({
        where: { userId, questId: questTemplate.id, date: today },
        include: { quest: true }
      });

      if (!crisisQuest) {
        crisisQuest = await prisma.userQuest.create({
          data: {
            userId,
            questId: questTemplate.id,
            date: today
          },
          include: { quest: true }
        });
      }
    }

    res.json({
      success: true,
      profile: updatedProfile,
      crisisQuest
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updatePressure = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { pressureScore } = req.body;
    
    if (pressureScore === undefined || pressureScore < 0 || pressureScore > 100) {
      return res.status(400).json({ error: 'Invalid pressure score. Must be between 0 and 100.' });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { pressureScore }
    });

    res.json({
      success: true,
      profile: updatedProfile
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const choosePath = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { path } = req.body;

    const validPaths = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'];
    if (!path || typeof path !== 'string' || !validPaths.includes(path.toUpperCase())) {
      return res.status(400).json({
        error: `Invalid path. Must be one of: ${validPaths.join(', ')}`,
      });
    }

    const targetPath = path.toUpperCase();

    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const now = new Date();
    const isFirstChoice = !profile.chosenPath || !profile.pathChosenAt;
    const isChange = !isFirstChoice && profile.chosenPath !== targetPath;

    if (isChange) {
      const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
      const unlocksAt = new Date(profile.pathChosenAt!.getTime() + sevenDaysMs);
      if (now < unlocksAt) {
        return res.status(429).json({
          error: `Path change locked until ${unlocksAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`,
          unlocksAt: unlocksAt.toISOString(),
        });
      }
    }

    // Get latest assessment for suggestion check
    const latestAssessment = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
    });

    const suggestedPath = latestAssessment?.suggestedPath || null;
    const followedSuggestion = Boolean(
      suggestedPath && suggestedPath.toUpperCase() === targetPath
    );

    const fromPath = profile.chosenPath || null;

    // Transaction: update profile, create PathChoiceLog, and if changed delete uncompleted quests today
    const updated = await prisma.$transaction(async (tx) => {
      // 1. Update Profile
      const updatedProfile = await tx.profile.update({
        where: { userId },
        data: {
          chosenPath: targetPath,
          pathChosenAt: now,
          pathChangeCount: { increment: 1 },
        },
      });

      // 2. Write PathChoiceLog
      const log = await tx.pathChoiceLog.create({
        data: {
          userId,
          fromPath,
          toPath: targetPath,
          suggestedPath,
          followedSuggestion,
          createdAt: now,
        },
      });

      // 3. On a path change, delete today's UNCOMPLETED UserQuest rows
      if (isChange) {
        const todayStr = now.toISOString().split('T')[0];
        const today = new Date(todayStr);
        await tx.userQuest.deleteMany({
          where: {
            userId,
            completed: false,
            date: today,
          },
        });
      }

      return { profile: updatedProfile, log };
    });

    const pathChangeUnlocksAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    res.json({
      success: true,
      profile: {
        ...updated.profile,
        pathChangeUnlocksAt,
      },
      log: updated.log,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSmokingStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { isSmoker } = req.body;
    if (typeof isSmoker !== 'boolean') {
      return res.status(400).json({ error: 'isSmoker must be a boolean' });
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: { isSmoker },
    });

    res.json({
      success: true,
      isSmoker: updatedProfile.isSmoker,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


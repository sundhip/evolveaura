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

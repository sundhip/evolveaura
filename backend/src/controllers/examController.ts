import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Start Rank Advancement Exam
export const startExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.levelLocked) {
      return res.status(450).json({ error: 'Level ceiling has not been reached. Standard grinding is still open.' });
    }

    if (profile.examActive) {
      return res.status(400).json({ error: 'Rank Advancement Exam is already active.' });
    }

    // Query latest assessment for bottleneck
    const latestAss = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' }
    });

    const bottleneck = latestAss?.bottleneck || 'WISDOM';
    let challengeTitle = '';
    let challengeDesc = '';

    if (bottleneck.toUpperCase() === 'WISDOM' || bottleneck.toUpperCase() === 'SAGE') {
      challengeTitle = '3-Day Digital Wind-Down Trial';
      challengeDesc = 'Maximum 30 minutes of mobile screen time past 9:00 PM. Verified by system log analysis.';
    } else if (bottleneck.toUpperCase() === 'SCHOLAR') {
      challengeTitle = '3-Day Intellectual Focus Trial';
      challengeDesc = 'Log at least 90 minutes of verified deep study focus sessions daily for 3 consecutive days.';
    } else if (bottleneck.toUpperCase() === 'WARRIOR') {
      challengeTitle = '3-Day Physical Endurance Trial';
      challengeDesc = 'Log one verified Warrior task (dumbbell or workout session) daily for 3 consecutive days.';
    } else {
      challengeTitle = '3-Day Creative Output Trial';
      challengeDesc = 'Submit a written development journal or sketch summary (min 100 characters) daily for 3 consecutive days.';
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        examActive: true,
        examChallengeStartedAt: new Date()
      }
    });

    res.json({
      success: true,
      profile: updatedProfile,
      bottleneck,
      challengeTitle,
      challengeDesc,
      proclamation: `[System: Welcome to your Rank Advancement Exam. System Scanner identified lifestyle bottleneck: ${bottleneck.toUpperCase()}. Initiate Trial: ${challengeTitle}.]`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Complete/Ascend Rank Exam
export const completeExam = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (!profile.examActive) {
      return res.status(400).json({ error: 'No active exam found.' });
    }

    // Determine current rank and next rank badge
    const currentRank = profile.auraRank;
    let nextRank = 'D';
    let nextTitle = 'C-Rank Vanguard';

    if (currentRank === 'E') {
      nextRank = 'D';
      nextTitle = 'D-Rank Dragger';
    } else if (currentRank === 'D') {
      nextRank = 'C';
      nextTitle = 'C-Rank Vanguard';
    } else if (currentRank === 'C') {
      nextRank = 'B';
      nextTitle = 'B-Rank Defender';
    } else if (currentRank === 'B') {
      nextRank = 'A';
      nextTitle = 'A-Rank Overlord';
    } else {
      nextRank = 'S';
      nextTitle = 'S-Rank Monarch';
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        examActive: false,
        examChallengeStartedAt: null,
        levelLocked: false,
        auraRank: nextRank,
        equippedTitle: nextTitle,
        currentXP: 0, // reset XP for the next level tier
        currentLevel: profile.currentLevel + 1, // Advance level
        unallocatedPoints: { increment: 5 } // +5 stat points award
      }
    });

    await prisma.xPLog.create({
      data: {
        userId,
        xpGained: 500,
        source: `Cleared Rank Advancement Exam. Tier Evolved: ${nextTitle}`
      }
    });

    res.json({
      success: true,
      profile: updatedProfile,
      proclamation: `[System: Rank Exam cleared. Level Lock removed. Global character tier evolved to ${nextTitle}. Your processing limits have expanded.]`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

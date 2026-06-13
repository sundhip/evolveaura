import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateDamage } from '../services/bossEngine';

export const getActiveBoss = async (req: AuthRequest, res: Response) => {
  try {
    let progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false },
      include: { boss: true }
    });

    if (!progress) {
      const boss = await prisma.boss.findFirst();
      if (!boss) return res.status(404).json({ error: 'No bosses seeded' });

      progress = await prisma.userBossProgress.create({
        data: {
          userId: req.userId!,
          bossId: boss.id,
          currentHP: boss.maxHP,
          selectedTier: 0,
          questActive: false,
          questCompleted: false
        },
        include: { boss: true }
      });
    }

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const attackBoss = async (req: AuthRequest, res: Response) => {
  try {
    const { actionType, focusMinutes } = req.body;
    const progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false },
      include: { boss: true }
    });

    if (!progress) return res.status(404).json({ error: 'No active boss found' });

    const dmg = calculateDamage(actionType, focusMinutes);
    const newHP = Math.max(0, progress.currentHP - dmg);
    const defeated = newHP === 0;

    const updated = await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: {
        currentHP: newHP,
        defeated,
        defeatedAt: defeated ? new Date() : null
      }
    });

    if (defeated) {
      const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
      if (profile) {
        let level = profile.currentLevel;
        let xp = profile.currentXP + progress.boss.xpReward;
        let required = Math.round(100 * Math.pow(level, 1.5));
        let points = profile.unallocatedPoints;
        let leveledUp = false;

        while (xp >= required) {
          xp -= required;
          level += 1;
          points += 5;
          leveledUp = true;
          required = Math.round(100 * Math.pow(level, 1.5));
        }

        await prisma.profile.update({
          where: { userId: req.userId! },
          data: {
            currentXP: xp,
            currentLevel: level,
            unallocatedPoints: points
          }
        });
      }
    }

    res.json({ damageDealt: dmg, bossProgress: updated, defeated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const selectBossTier = async (req: AuthRequest, res: Response) => {
  try {
    const { tier } = req.body; // 1, 2, or 3
    if (![1, 2, 3].includes(tier)) {
      return res.status(400).json({ error: 'Invalid tier' });
    }

    const progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false }
    });

    if (!progress) return res.status(404).json({ error: 'No active boss found' });

    const updated = await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: {
        selectedTier: tier,
        questActive: true
      },
      include: { boss: true }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const completeBossQuest = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false },
      include: { boss: true }
    });

    if (!progress) return res.status(404).json({ error: 'No active boss found' });
    if (!progress.questActive) return res.status(400).json({ error: 'Boss quest not active' });

    // Determine rewards by tier
    let xpReward = 500;
    if (progress.selectedTier === 2) xpReward = 1000;
    if (progress.selectedTier === 3) xpReward = 1500;

    const updatedBoss = await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: {
        currentHP: 0,
        defeated: true,
        questActive: false,
        questCompleted: true,
        defeatedAt: new Date()
      },
      include: { boss: true }
    });

    // Update profile levels & stat points
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    let level = profile.currentLevel;
    let xp = profile.currentXP + xpReward;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let points = profile.unallocatedPoints;
    let leveledUp = false;

    while (xp >= required) {
      xp -= required;
      level += 1;
      points += 5;
      leveledUp = true;
      required = Math.round(100 * Math.pow(level, 1.5));
    }

    const updatedProfile = await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentXP: xp,
        currentLevel: level,
        unallocatedPoints: points,
        currentStreak: { increment: 1 }
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained: xpReward,
        source: `Defeated Weekly Boss: ${progress.boss.name}`
      }
    });

    res.json({
      success: true,
      leveledUp,
      level,
      xpGained: xpReward,
      profile: updatedProfile,
      bossProgress: updatedBoss
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const failBossQuest = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false },
      include: { boss: true }
    });

    if (!progress) return res.status(404).json({ error: 'No active boss found' });

    // Boss heals by 15% of max HP
    const healAmount = Math.round(progress.boss.maxHP * 0.15);
    const newHP = Math.min(progress.boss.maxHP, progress.currentHP + healAmount);

    const updated = await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: {
        currentHP: newHP,
        questActive: false
      },
      include: { boss: true }
    });

    res.json({
      success: false,
      healedAmount: healAmount,
      bossProgress: updated
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const startBossQuest = async (req: AuthRequest, res: Response) => {
  try {
    const progress = await prisma.userBossProgress.findFirst({
      where: { userId: req.userId!, defeated: false }
    });

    if (!progress) return res.status(404).json({ error: 'No active boss found' });
    if (progress.selectedTier === 0) {
      return res.status(400).json({ error: 'No boss quest tier selected' });
    }

    const updated = await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: { questActive: true },
      include: { boss: true }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

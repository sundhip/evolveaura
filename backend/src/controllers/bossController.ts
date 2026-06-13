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
          currentHP: boss.maxHP
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
      await prisma.profile.update({
        where: { userId: req.userId! },
        data: {
          auraGold: { increment: progress.boss.goldReward },
          currentXP: { increment: progress.boss.xpReward }
        }
      });
    }

    res.json({ damageDealt: dmg, bossProgress: updated, defeated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

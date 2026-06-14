import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Challenge a peer to a duel
export const createDuel = async (req: AuthRequest, res: Response) => {
  try {
    const challengerId = req.userId!;
    const { opponentEmail, durationHours } = req.body;

    if (!opponentEmail || !durationHours) {
      return res.status(400).json({ error: 'Opponent email and duration are required' });
    }

    const opponent = await prisma.user.findUnique({
      where: { email: opponentEmail }
    });

    if (!opponent) {
      return res.status(404).json({ error: 'Opponent not found' });
    }

    if (opponent.id === challengerId) {
      return res.status(400).json({ error: 'You cannot challenge yourself' });
    }

    // Check if there is already an active duel between these users
    const existing = await prisma.duel.findFirst({
      where: {
        OR: [
          { challengerId, opponentId: opponent.id, status: { in: ['PENDING', 'ACTIVE'] } },
          { challengerId: opponent.id, opponentId: challengerId, status: { in: ['PENDING', 'ACTIVE'] } }
        ]
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'An active or pending duel already exists with this user' });
    }

    const duel = await prisma.duel.create({
      data: {
        challengerId,
        opponentId: opponent.id,
        durationHours: Number(durationHours),
        status: 'PENDING',
        challengerStance: 'NONE',
        opponentStance: 'NONE'
      }
    });

    res.json(duel);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Accept or decline a duel
export const respondToDuel = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { duelId, accept } = req.body;

    const duel = await prisma.duel.findUnique({
      where: { id: duelId }
    });

    if (!duel) return res.status(404).json({ error: 'Duel not found' });
    if (duel.opponentId !== userId) return res.status(403).json({ error: 'Forbidden' });
    if (duel.status !== 'PENDING') return res.status(400).json({ error: 'Duel is not pending' });

    if (accept) {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + duel.durationHours * 60 * 60 * 1000);

      const updated = await prisma.duel.update({
        where: { id: duelId },
        data: {
          status: 'ACTIVE',
          startTime,
          endTime
        }
      });
      res.json(updated);
    } else {
      const updated = await prisma.duel.update({
        where: { id: duelId },
        data: { status: 'DECLINED' }
      });
      res.json(updated);
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Select Stance
export const selectStance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { duelId, stance } = req.body;

    if (!['BERSERKER', 'FOCUS', 'NONE'].includes(stance)) {
      return res.status(400).json({ error: 'Invalid stance' });
    }

    const duel = await prisma.duel.findUnique({
      where: { id: duelId }
    });

    if (!duel) return res.status(404).json({ error: 'Duel not found' });
    if (duel.status !== 'ACTIVE' && duel.status !== 'PENDING') {
      return res.status(400).json({ error: 'Cannot set stance on a completed or declined duel' });
    }

    let updateData: any = {};
    if (duel.challengerId === userId) {
      updateData.challengerStance = stance;
    } else if (duel.opponentId === userId) {
      updateData.opponentStance = stance;
    } else {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const updated = await prisma.duel.update({
      where: { id: duelId },
      data: updateData
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's duels (active, pending, and recently completed)
export const getMyDuels = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;

    // Auto-complete expired duels
    const now = new Date();
    const expiredActive = await prisma.duel.findMany({
      where: {
        status: 'ACTIVE',
        endTime: { lt: now }
      }
    });

    for (const d of expiredActive) {
      await prisma.duel.update({
        where: { id: d.id },
        data: { status: 'COMPLETED' }
      });
    }

    const duels = await prisma.duel.findMany({
      where: {
        OR: [
          { challengerId: userId },
          { opponentId: userId }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    // Fetch user details for profiles
    const duelsWithUsers = await Promise.all(
      duels.map(async (d) => {
        const challenger = await prisma.user.findUnique({
          where: { id: d.challengerId },
          include: { profile: true }
        });
        const opponent = await prisma.user.findUnique({
          where: { id: d.opponentId },
          include: { profile: true }
        });

        return {
          ...d,
          challengerName: challenger?.profile?.name || challenger?.email || 'Unknown',
          challengerRank: challenger?.profile?.auraRank || 'E',
          opponentName: opponent?.profile?.name || opponent?.email || 'Unknown',
          opponentRank: opponent?.profile?.auraRank || 'E'
        };
      })
    );

    res.json(duelsWithUsers);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to apply active duel XP increments
export const applyDuelXP = async (userId: string, baseXP: number, questPath: string, verificationType: string) => {
  try {
    const now = new Date();
    const activeDuels = await prisma.duel.findMany({
      where: {
        status: 'ACTIVE',
        startTime: { lte: now },
        endTime: { gte: now },
        OR: [{ challengerId: userId }, { opponentId: userId }]
      }
    });

    for (const d of activeDuels) {
      const isChallenger = d.challengerId === userId;
      const stance = isChallenger ? d.challengerStance : d.opponentStance;

      let multiplier = 1.0;

      if (stance === 'BERSERKER') {
        // Multiplies physical Warrior (Vitality) yields by 1.5x
        if (questPath === 'WARRIOR') {
          multiplier = 1.5;
        }
      } else if (stance === 'FOCUS') {
        // 2.0x surge for focus blocks logged during final 4 hours
        if (verificationType === 'TIMER') {
          const hoursLeft = (d.endTime!.getTime() - now.getTime()) / (1000 * 60 * 60);
          if (hoursLeft <= 4.0) {
            multiplier = 2.0;
          }
        }
      }

      const addedXP = Math.round(baseXP * multiplier);

      if (isChallenger) {
        await prisma.duel.update({
          where: { id: d.id },
          data: { challengerXP: { increment: addedXP } }
        });
      } else {
        await prisma.duel.update({
          where: { id: d.id },
          data: { opponentXP: { increment: addedXP } }
        });
      }
    }
  } catch (e) {
    console.warn('Failed to update duel XP:', e);
  }
};

import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Get active shadow soldiers for current user
export const getMyShadows = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const shadows = await prisma.shadowSoldier.findMany({
      where: { userId, active: true },
      include: { quest: true }
    });
    res.json(shadows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

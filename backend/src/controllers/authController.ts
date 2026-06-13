import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, role, primaryGoal } = req.body;
    if (!email || !name) return res.status(400).json({ error: 'Email and name are required' });

    let passwordHash = '';
    if (password) passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password ? passwordHash : null,
        profile: {
          create: {
            name,
            role: role || 'PROFESSIONAL',
            primaryGoal: primaryGoal || 'Balanced Growth',
            auraGold: 100, // start gold
            auraShields: 0
          }
        }
      },
      include: { profile: true }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email }, include: { profile: true } });
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    if (user.passwordHash) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const googleLogin = async (req: AuthRequest, res: Response) => {
  try {
    const { email, name, googleId } = req.body;
    let user = await prisma.user.findFirst({
      where: { OR: [{ googleId }, { email }] },
      include: { profile: true }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          googleId,
          profile: {
            create: {
              name,
              role: 'PROFESSIONAL',
              primaryGoal: 'Balanced Growth',
              auraGold: 100
            }
          }
        },
        include: { profile: true }
      });
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId },
        include: { profile: true }
      });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      include: { profile: true, skills: true, projects: true }
    });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const buyRelic = async (req: AuthRequest, res: Response) => {
  try {
    const { relicId, cost, type, name } = req.body; // e.g. "Focus Master" title
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.auraGold < cost) return res.status(400).json({ error: 'Insufficient Aura Coins' });

    const relics = JSON.parse(JSON.stringify(profile.unlockedRelics || [])) as any[];
    if (relics.some(r => r.id === relicId)) return res.status(400).json({ error: 'Item already unlocked' });

    relics.push({ id: relicId, name, type });

    const updated = await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        auraGold: profile.auraGold - cost,
        unlockedRelics: relics,
        equippedTitle: type === 'title' ? name : profile.equippedTitle
      }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSkillTree = async (req: AuthRequest, res: Response) => {
  try {
    const { path, nodeName } = req.body;
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Deduct skill point (can be level minus spent skills)
    const spentSkills = await prisma.skillNode.count({ where: { userId: req.userId! } });
    const availablePoints = profile.currentLevel - spentSkills;

    if (availablePoints <= 0) return res.status(400).json({ error: 'No Skill Points available' });

    const existing = await prisma.skillNode.findFirst({
      where: { userId: req.userId!, path, nodeName }
    });

    if (existing) {
      await prisma.skillNode.update({
        where: { id: existing.id },
        data: { level: { increment: 1 } }
      });
    } else {
      await prisma.skillNode.create({
        data: { userId: req.userId!, path, nodeName, level: 1 }
      });
    }

    const skills = await prisma.skillNode.findMany({ where: { userId: req.userId! } });
    res.json({ skills, availablePoints: availablePoints - 1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

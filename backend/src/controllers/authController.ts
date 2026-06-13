import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, name, age, role, academicDetails, primaryGoal } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ error: 'User already exists' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        profile: {
          create: {
            name,
            age: age ? parseInt(age) : 18,
            role: role || 'Professional',
            academicDetails: academicDetails || {},
            primaryGoal: primaryGoal || 'Balanced Growth'
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

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

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
      include: { profile: true, achievements: { include: { achievement: true } } }
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, academicDetails, primaryGoal } = req.body;
    const profile = await prisma.profile.update({
      where: { userId: req.userId },
      data: { name, role, academicDetails, primaryGoal }
    });
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

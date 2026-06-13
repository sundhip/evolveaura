import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const getProjects = async (req: AuthRequest, res: Response) => {
  try {
    const list = await prisma.personalProject.findMany({ where: { userId: req.userId! } });
    res.json(list);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { title } = req.body;
    if (!title) return res.status(400).json({ error: 'Title is required' });

    const proj = await prisma.personalProject.create({
      data: { userId: req.userId!, title }
    });
    res.json(proj);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const contributeProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, increment } = req.body;
    const proj = await prisma.personalProject.findFirst({
      where: { id: projectId, userId: req.userId! }
    });

    if (!proj) return res.status(404).json({ error: 'Project not found' });

    const newProgress = Math.min(100, proj.progress + (increment || 1));
    const updated = await prisma.personalProject.update({
      where: { id: projectId },
      data: { progress: newProgress }
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateSubjectHealth, getSubjectRecommendation } from '../services/subjectEngine';

export const getSubjects = async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await prisma.subjectScore.findMany({ where: { userId: req.userId! } });
    res.json(subjects);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const upsertSubject = async (req: AuthRequest, res: Response) => {
  try {
    const { subjectName, understanding, retention, problemSolving, confidence } = req.body;
    if (!subjectName) return res.status(400).json({ error: 'subjectName is required' });

    const subject = await prisma.subjectScore.upsert({
      where: { userId_subjectName: { userId: req.userId!, subjectName } },
      update: { understanding, retention, problemSolving, confidence },
      create: { userId: req.userId!, subjectName, understanding, retention, problemSolving, confidence }
    });
    res.json(subject);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAnalysis = async (req: AuthRequest, res: Response) => {
  try {
    const subjects = await prisma.subjectScore.findMany({ where: { userId: req.userId! } });
    if (subjects.length === 0) return res.json({ weakestSubject: null, recommendations: [] });

    const analyzed = subjects.map(s => {
      const health = calculateSubjectHealth(s);
      const recommendation = getSubjectRecommendation(s.subjectName, s);
      return { ...s, health, recommendation };
    });

    analyzed.sort((a, b) => a.health - b.health);

    res.json({
      weakestSubject: analyzed[0],
      subjects: analyzed
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculatePathScores, calculateAuraScore } from '../services/scoringEngine';
import { getRank } from '../services/rankEngine';
import { detectBottleneck } from '../services/bottleneckEngine';

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body; // { q1: 5, q2: 4, ... }
    if (!answers || Object.keys(answers).length < 48) {
      return res.status(400).json({ error: 'All 48 answers are required' });
    }

    const pathScores = calculatePathScores(answers);
    const auraScore = calculateAuraScore(pathScores);
    const auraRank = getRank(auraScore);
    const bottlenecks = detectBottleneck(answers);

    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId!,
        answers,
        scholarScore: pathScores.scholar,
        warriorScore: pathScores.warrior,
        sageScore: pathScores.sage,
        creatorScore: pathScores.creator,
        auraScore,
        auraRank
      }
    });

    // Update User Profile
    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        auraScore,
        auraRank,
        title: `Aura ${auraRank} Initiate`
      }
    });

    res.status(201).json({ assessment, bottlenecks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLatestAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: { userId: req.userId! },
      orderBy: { completedAt: 'desc' }
    });
    if (!assessment) return res.status(404).json({ error: 'No assessments found' });
    const bottlenecks = detectBottleneck(assessment.answers as any);
    res.json({ assessment, bottlenecks });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

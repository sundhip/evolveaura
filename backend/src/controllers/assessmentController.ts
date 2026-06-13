import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculatePathScores } from '../services/scoringEngine';
import { getRank } from '../services/rankEngine';
import { detectBottleneck } from '../services/bottleneckEngine';

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const { answers } = req.body;
    if (!answers) return res.status(400).json({ error: 'Answers are required' });

    const pathScores = calculatePathScores(answers);
    const auraScore = Math.round((pathScores.scholar + pathScores.warrior + pathScores.sage + pathScores.creator) / 4);
    const auraRank = getRank(auraScore);
    const bottleneck = detectBottleneck(pathScores);

    const assessment = await prisma.assessment.create({
      data: {
        userId: req.userId!,
        answers,
        scholarScore: pathScores.scholar,
        warriorScore: pathScores.warrior,
        sageScore: pathScores.sage,
        creatorScore: pathScores.creator,
        auraScore,
        auraRank,
        bottleneck
      }
    });

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        auraScore,
        auraRank,
        equippedTitle: `Aura ${auraRank} Initiate`
      }
    });

    res.status(201).json({ assessment, bottleneck });
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
    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

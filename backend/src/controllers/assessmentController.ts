import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { issueAttempt } from '../services/assessmentEngine';
import { getRank } from '../services/rankEngine';
import { detectBottleneck } from '../services/bottleneckEngine';
import { calculatePathScores, calculateThemeScores, calculateAuraScore } from '../services/scoringEngine';
import {
  suggestPath,
  getWeakestTheme,
  THEME_TITLES,
  BOTTLENECK_EXPLANATIONS,
  Path,
  PathSuggestionResult,
} from '../services/pathSuggestionEngine';

export const getAssessmentQuestions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const attemptData = await issueAttempt(userId);
    res.json(attemptData);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to issue assessment attempt' });
  }
};

export const getAssessmentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const latest = await prisma.assessment.findFirst({
      where: { userId },
      orderBy: { completedAt: 'desc' },
      select: { completedAt: true },
    });

    res.json({
      hasCompletedAssessment: !!latest,
      lastAssessmentAt: latest ? latest.completedAt : null,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const submitAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { attemptId, answers } = req.body;

    if (!attemptId || !answers || typeof answers !== 'object' || Array.isArray(answers)) {
      return res.status(400).json({ error: 'attemptId and answers object are required' });
    }

    const attempt = await prisma.assessmentAttempt.findUnique({
      where: { id: attemptId },
      include: {
        items: {
          include: { question: true },
        },
      },
    });

    if (!attempt) {
      return res.status(400).json({ error: 'Assessment attempt not found' });
    }

    if (attempt.userId !== userId) {
      return res.status(400).json({ error: 'Assessment attempt does not belong to user' });
    }

    if (attempt.status === 'SUBMITTED') {
      return res.status(409).json({ error: 'Assessment attempt has already been submitted' });
    }

    if (attempt.status !== 'ISSUED') {
      return res.status(400).json({ error: `Assessment attempt is not in ISSUED state (status: ${attempt.status})` });
    }

    if (new Date() > attempt.expiresAt) {
      return res.status(400).json({ error: 'Assessment attempt has expired' });
    }

    // Validate that every issued question is answered exactly once with 1-5 integer, and no unknown questions
    const issuedItemMap = new Map(attempt.items.map((it) => [it.questionId, it]));

    const answerKeys = Object.keys(answers);
    for (const qId of answerKeys) {
      if (!issuedItemMap.has(qId)) {
        return res.status(400).json({ error: `Unknown question id in answers: ${qId}` });
      }
    }

    for (const [qId] of issuedItemMap) {
      const val = answers[qId];
      if (val === undefined || val === null) {
        return res.status(400).json({ error: `Missing answer for question id: ${qId}` });
      }
      if (!Number.isInteger(val) || val < 1 || val > 5) {
        return res.status(400).json({ error: `Answer for question ${qId} must be an integer between 1 and 5 (got ${val})` });
      }
    }

    // 1. Calculate path scores and theme scores from database attempt items
    const scoredItems = attempt.items.map((item) => ({
      path: item.question.path,
      theme: item.question.theme,
      answer: answers[item.questionId] as number,
      reverseScored: item.question.reverseScored,
    }));

    const pathScores = calculatePathScores(scoredItems);
    if (
      pathScores.scholar === null ||
      pathScores.warrior === null ||
      pathScores.sage === null ||
      pathScores.creator === null
    ) {
      return res.status(400).json({
        error: 'Assessment submission incomplete: all 4 paths must have answered questions',
      });
    }

    const themeScores = calculateThemeScores(scoredItems);
    const validScores = {
      scholar: pathScores.scholar,
      warrior: pathScores.warrior,
      sage: pathScores.sage,
      creator: pathScores.creator,
    };

    const auraScore = calculateAuraScore(validScores);
    const auraRank = getRank(auraScore);
    const bottleneck = detectBottleneck(validScores);

    // 2. Fetch user profile for onboarding primaryGoal
    const profile = await prisma.profile.findUnique({
      where: { userId },
      select: { primaryGoal: true },
    });

    // 3. Compute suggestion
    const suggestion = suggestPath(validScores, themeScores, profile?.primaryGoal);

    // Save in transaction: update attempt items, mark attempt SUBMITTED, create Assessment row, update Profile
    const now = new Date();
    const result = await prisma.$transaction(async (tx) => {
      // Update attempt items with answers
      for (const item of attempt.items) {
        await tx.assessmentAttemptItem.update({
          where: { id: item.id },
          data: { answer: answers[item.questionId] as number },
        });
      }

      // Mark attempt SUBMITTED
      await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: {
          status: 'SUBMITTED',
          submittedAt: now,
        },
      });

      // Create Assessment record (linked with attemptId, suggestedPath, suggestionJson)
      const assessment = await tx.assessment.create({
        data: {
          userId,
          attemptId: attempt.id,
          answers,
          scholarScore: validScores.scholar,
          warriorScore: validScores.warrior,
          sageScore: validScores.sage,
          creatorScore: validScores.creator,
          auraScore,
          auraRank,
          bottleneck,
          suggestedPath: suggestion.recommended,
          suggestionJson: suggestion as any,
          completedAt: now,
        },
      });

      // Update Profile
      await tx.profile.update({
        where: { userId },
        data: {
          auraScore,
          auraRank,
          equippedTitle: `Aura ${auraRank} Initiate`,
        },
      });

      return assessment;
    }, {
      maxWait: 10000,
      timeout: 20000,
    });

    res.status(201).json({ assessment: result, bottleneck, suggestion });
  } catch (error: any) {
    console.error('[submitAssessment error]:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getLatestAssessment = async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.assessment.findFirst({
      where: { userId: req.userId! },
      orderBy: { completedAt: 'desc' },
    });
    if (!assessment) return res.status(404).json({ error: 'No assessment found' });

    const profile = await prisma.profile.findUnique({
      where: { userId: req.userId! },
      select: { primaryGoal: true },
    });

    // Compute or retrieve suggestion
    let suggestion: PathSuggestionResult;
    if (assessment.suggestionJson && typeof assessment.suggestionJson === 'object') {
      suggestion = assessment.suggestionJson as unknown as PathSuggestionResult;
    } else {
      const scores = {
        scholar: assessment.scholarScore,
        warrior: assessment.warriorScore,
        sage: assessment.sageScore,
        creator: assessment.creatorScore,
      };
      suggestion = suggestPath(scores, {}, profile?.primaryGoal);
    }

    // Determine growthArea path and weakest theme
    const growthPath = (suggestion.growthArea
      ? suggestion.growthArea.toUpperCase()
      : assessment.bottleneck
      ? assessment.bottleneck.toUpperCase()
      : 'SCHOLAR') as Path;

    const themeScores = (suggestion as any).themeScores || {};
    const weakest = getWeakestTheme(growthPath, themeScores);
    const subSkillTitle =
      THEME_TITLES[weakest.theme] ||
      weakest.theme.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const pathExplanations = BOTTLENECK_EXPLANATIONS[growthPath] || BOTTLENECK_EXPLANATIONS.SCHOLAR;
    const explanation = pathExplanations[weakest.theme] || pathExplanations.default;

    res.json({
      assessment,
      suggestion,
      bottlenecks: {
        path: growthPath,
        explanation,
        primary: {
          subSkill: subSkillTitle,
        },
      },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

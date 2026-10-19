import crypto from 'crypto';
import prisma from '../config/db';

export function cryptoShuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = crypto.randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export interface ClientQuestion {
  id: string;
  text: string;
  position: number;
}

export interface IssuedAttemptResult {
  attemptId: string;
  expiresAt: Date;
  questions: ClientQuestion[];
}

interface QuestionRecord {
  id: string;
  path: string;
  text: string;
  theme: string;
  reverseScored: boolean;
  active: boolean;
}

export async function issueAttempt(userId: string): Promise<IssuedAttemptResult> {
  const now = new Date();
  const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

  // 1. Check for existing active attempt within last 10 minutes with zero answers
  const existingAttempt = await prisma.assessmentAttempt.findFirst({
    where: {
      userId,
      status: 'ISSUED',
      expiresAt: { gt: now },
      issuedAt: { gte: tenMinutesAgo },
      items: {
        none: {
          answer: { not: null },
        },
      },
    },
    include: {
      items: {
        include: { question: true },
        orderBy: { position: 'asc' },
      },
    },
  });

  if (existingAttempt && existingAttempt.items.length === 16) {
    return {
      attemptId: existingAttempt.id,
      expiresAt: existingAttempt.expiresAt,
      questions: existingAttempt.items.map((item) => ({
        id: item.question.id,
        text: item.question.text,
        position: item.position,
      })),
    };
  }

  // 2. Fetch last 3 attempts for this user to enforce freshness
  const recentAttempts = await prisma.assessmentAttempt.findMany({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
    take: 3,
    include: {
      items: {
        select: { questionId: true },
      },
    },
  });

  const excludedQuestionIds = new Set<string>();
  for (const attempt of recentAttempts) {
    for (const item of attempt.items) {
      excludedQuestionIds.add(item.questionId);
    }
  }

  // Fetch all serving history for this user to compute last served date for fallback
  const userHistory = await prisma.assessmentAttemptItem.findMany({
    where: {
      attempt: { userId },
    },
    select: {
      questionId: true,
      attempt: {
        select: { issuedAt: true },
      },
    },
  });

  const lastServedMap = new Map<string, number>();
  for (const h of userHistory) {
    const time = h.attempt.issuedAt.getTime();
    const prev = lastServedMap.get(h.questionId) || 0;
    if (time > prev) {
      lastServedMap.set(h.questionId, time);
    }
  }

  // 3. Fetch all active questions
  const allActiveQuestions = await prisma.assessmentQuestion.findMany({
    where: { active: true },
  });

  const paths = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'] as const;
  const selectedQuestions: QuestionRecord[] = [];

  for (const path of paths) {
    const pathQuestions = allActiveQuestions.filter((q) => q.path === path);
    // Candidates not served in last 3 attempts
    let candidates = pathQuestions.filter((q) => !excludedQuestionIds.has(q.id));

    // If fewer than 4 candidates, fall back to least recently served for that path
    if (candidates.length < 4) {
      const sortedByLastServed = [...pathQuestions].sort((a, b) => {
        const timeA = lastServedMap.get(a.id) || 0;
        const timeB = lastServedMap.get(b.id) || 0;
        return timeA - timeB;
      });
      candidates = sortedByLastServed;
    }

    // Pick 4 questions for this path:
    // - At least 1 reverse-scored when available
    // - Cover at least 3 different themes when possible
    const pathPicked: QuestionRecord[] = [];
    const pickedIds = new Set<string>();

    const reverseCandidates = cryptoShuffle(candidates.filter((q) => q.reverseScored));
    const nonReverseCandidates = cryptoShuffle(candidates.filter((q) => !q.reverseScored));

    // 1. Pick 1 reverse-scored question if available
    if (reverseCandidates.length > 0) {
      const rev = reverseCandidates[0];
      pathPicked.push(rev);
      pickedIds.add(rev.id);
    }

    // 2. Pick remaining candidates prioritizing distinct themes
    const remainingPool = cryptoShuffle(candidates.filter((q) => !pickedIds.has(q.id)));
    const chosenThemes = new Set<string>(pathPicked.map((q) => q.theme));

    // First try picking questions from new themes
    for (const q of remainingPool) {
      if (pathPicked.length >= 4) break;
      if (!chosenThemes.has(q.theme)) {
        pathPicked.push(q);
        pickedIds.add(q.id);
        chosenThemes.add(q.theme);
      }
    }

    // If still need more to reach 4, pick from any remaining candidate
    for (const q of remainingPool) {
      if (pathPicked.length >= 4) break;
      if (!pickedIds.has(q.id)) {
        pathPicked.push(q);
        pickedIds.add(q.id);
        chosenThemes.add(q.theme);
      }
    }

    // If candidate pool was extremely constrained (less than 4 total candidates in path),
    // fill from path pool ordered by last served date
    if (pathPicked.length < 4) {
      const fallbackPool = [...pathQuestions].sort((a, b) => {
        const timeA = lastServedMap.get(a.id) || 0;
        const timeB = lastServedMap.get(b.id) || 0;
        return timeA - timeB;
      });
      for (const q of fallbackPool) {
        if (pathPicked.length >= 4) break;
        if (!pickedIds.has(q.id)) {
          pathPicked.push(q);
          pickedIds.add(q.id);
        }
      }
    }

    selectedQuestions.push(...pathPicked);
  }

  // 4. Shuffled across paths using crypto.randomInt so test does not feel grouped
  const shuffledOverall = cryptoShuffle(selectedQuestions);

  // 5. Create attempt and items inside a single transaction
  const expiresAt = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours

  const attempt = await prisma.$transaction(async (tx) => {
    const createdAttempt = await tx.assessmentAttempt.create({
      data: {
        userId,
        status: 'ISSUED',
        issuedAt: now,
        expiresAt,
      },
    });

    const itemsData = shuffledOverall.map((q, idx) => ({
      attemptId: createdAttempt.id,
      questionId: q.id,
      position: idx + 1,
    }));

    await tx.assessmentAttemptItem.createMany({
      data: itemsData,
    });

    return createdAttempt;
  });

  // 6. Return response without path, theme, or reverseScored
  return {
    attemptId: attempt.id,
    expiresAt,
    questions: shuffledOverall.map((q, idx) => ({
      id: q.id,
      text: q.text,
      position: idx + 1,
    })),
  };
}

import { Quest, UserQuest } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../config/db';

export function getDifficultyMultiplier(rank: string): number {
  switch (rank) {
    case 'S': return 2.0;
    case 'A': return 1.5;
    case 'B': return 1.2;
    case 'C': return 1.0;
    case 'D': return 0.8;
    default: return 0.5;
  }
}

export function getDynamicChallenge(dayOfWeek: number) {
  // 0 = Sunday, 1 = Monday ...
  const challenges = [
    { title: "Reflection Sabbath", desc: "Focus entirely on mindfulness and write a 100-char reflection.", path: "SAGE" },
    { title: "Focus Frenzy Monday", desc: "Complete 2 separate 25-minute Pomodoro study sessions today.", path: "SCHOLAR" },
    { title: "No Scroll Tuesday", desc: "Keep screen time to absolute minimum. Log active walk.", path: "WARRIOR" },
    { title: "Creator Day Wednesday", desc: "Spend 45 minutes on blueprints or code drafts for personal projects.", path: "CREATOR" },
    { title: "Deep Work Thursday", desc: "Complete 60 minutes of study on your weakest subject.", path: "SCHOLAR" },
    { title: "Fitness Friday", desc: "Complete 45 minutes of vigorous exercise and walk.", path: "WARRIOR" },
    { title: "Sovereign Saturday", desc: "Reflect on week's growth and plan next week's modules.", path: "SAGE" }
  ];
  return challenges[dayOfWeek];
}

export interface GenerateQuestsResult {
  quests: (UserQuest & { quest: Quest })[];
  error?: 'PATH_NOT_CHOSEN' | string;
}

export function isNonPathQuest(q: { title: string; path?: string; tags?: string | null }): boolean {
  if (q.title.includes('Calm Reset') || q.title.includes('Box Breathing')) return true;
  if (q.path === 'BOSS') return true;
  if (q.tags && (q.tags.includes('recovery') || q.tags.includes('boss'))) return true;
  return false;
}

export async function generateDailyQuestsForUser(
  userId: string,
  today: Date,
  clientDate?: string
): Promise<GenerateQuestsResult> {
  const profile = await prisma.profile.findUnique({
    where: { userId }
  });

  if (!profile || !profile.chosenPath) {
    return { quests: [], error: 'PATH_NOT_CHOSEN' };
  }

  const chosenPath = profile.chosenPath.toUpperCase() as 'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR';

  let todayStr = clientDate;
  if (!todayStr) {
    todayStr = today.toISOString().split('T')[0];
  }

  // 1. Fetch existing quests for today
  let existingUserQuests = await prisma.userQuest.findMany({
    where: { userId, date: today },
    include: { quest: true },
    orderBy: { id: 'asc' }
  });

  // Only count chosenPath regular quests towards the 7 daily quota
  const existingPathQuests = existingUserQuests.filter(
    uq => uq.quest.path === chosenPath && !isNonPathQuest(uq.quest)
  );

  if (existingPathQuests.length >= 7) {
    return { quests: existingUserQuests };
  }

  // Atomic lock on lastQuestRollDate to coordinate concurrent requests without heavy connection locks
  const rollLock = await prisma.profile.updateMany({
    where: {
      userId,
      OR: [
        { lastQuestRollDate: null },
        { lastQuestRollDate: { not: todayStr } }
      ]
    },
    data: {
      lastQuestRollDate: todayStr
    }
  });

  if (rollLock.count === 0) {
    // Another concurrent call is currently rolling or already completed.
    // Poll briefly for the winner to finish inserting
    for (let attempt = 0; attempt < 15; attempt++) {
      await new Promise(res => setTimeout(res, 250));
      const currentQuests = await prisma.userQuest.findMany({
        where: { userId, date: today },
        include: { quest: true },
        orderBy: { id: 'asc' }
      });
      const pathCount = currentQuests.filter(uq => uq.quest.path === chosenPath && !isNonPathQuest(uq.quest)).length;
      if (pathCount >= 7) {
        return { quests: currentQuests };
      }
    }
  }

  // 2. Query quests assigned in past 5 days for rotation exclusion: (today - 5 days, today)
  const fiveDaysAgo = new Date(today.getTime() - 5 * 24 * 60 * 60 * 1000);
  const recentUserQuests = await prisma.userQuest.findMany({
    where: {
      userId,
      date: {
        gt: fiveDaysAgo,
        lt: today
      }
    },
    select: { questId: true, date: true },
    orderBy: { date: 'desc' }
  });

  const recentQuestIds = new Set<string>(recentUserQuests.map(uq => uq.questId));
  const lastAssignedDate = new Map<string, number>();
  for (const uq of recentUserQuests) {
    if (!lastAssignedDate.has(uq.questId)) {
      lastAssignedDate.set(uq.questId, uq.date.getTime());
    }
  }

  // 3. Fetch all quest templates for the chosenPath (excluding non-path recovery/boss items)
  const allPathTemplates = await prisma.quest.findMany({
    where: {
      path: chosenPath,
      NOT: [
        { title: { contains: 'Calm Reset' } },
        { title: { contains: 'Boss' } }
      ]
    }
  });

  const dayOfWeek = today.getUTCDay(); // 0 = Sunday ... 6 = Saturday
  const selectedQuests: { quest: Quest; isHighTier: boolean; proofType: string | null }[] = [];
  const selectedQuestIds = new Set<string>(existingUserQuests.map(uq => uq.questId));

  // Helper candidate picker with 5-day rotation & least-recently-assigned fallback
  function pickCandidate(
    pool: Quest[],
    targetDifficulty?: string,
    tagFilter?: (tags: string | null) => boolean
  ): Quest | null {
    let matching = pool.filter(q => {
      if (selectedQuestIds.has(q.id)) return false;
      if (targetDifficulty && q.difficulty !== targetDifficulty) return false;
      if (tagFilter && !tagFilter(q.tags)) return false;
      return true;
    });

    // Check fresh candidates matching tag and difficulty
    let freshCandidates = matching.filter(q => !recentQuestIds.has(q.id));

    // If tagFilter had no fresh candidates, relax tagFilter to keep 5-day rotation intact!
    if (freshCandidates.length === 0 && tagFilter) {
      const relaxedByTag = pool.filter(q => {
        if (selectedQuestIds.has(q.id)) return false;
        if (targetDifficulty && q.difficulty !== targetDifficulty) return false;
        return true;
      });
      freshCandidates = relaxedByTag.filter(q => !recentQuestIds.has(q.id));
      if (freshCandidates.length > 0) {
        matching = relaxedByTag;
      }
    }

    // If still no fresh candidates and difficulty was constrained, relax difficulty
    if (freshCandidates.length === 0 && targetDifficulty) {
      const relaxedByDiff = pool.filter(q => !selectedQuestIds.has(q.id));
      freshCandidates = relaxedByDiff.filter(q => !recentQuestIds.has(q.id));
      if (freshCandidates.length > 0) {
        matching = relaxedByDiff;
      }
    }

    if (freshCandidates.length > 0) {
      const idx = crypto.randomInt(0, freshCandidates.length);
      return freshCandidates[idx];
    }

    if (matching.length === 0) {
      matching = pool.filter(q => !selectedQuestIds.has(q.id));
    }
    if (matching.length === 0) return null;

    // Fallback: least recently assigned among the matching candidates
    matching.sort((a, b) => {
      const timeA = lastAssignedDate.get(a.id) || 0;
      const timeB = lastAssignedDate.get(b.id) || 0;
      return timeA - timeB; // oldest first
    });

    return matching[0];
  }

  // SLOT 1: Main Anchor (MEDIUM, proof required, isHighTier: true)
  let anchor = pickCandidate(allPathTemplates, 'MEDIUM', (tags) => !!tags && tags.includes('anchor'));
  if (!anchor) {
    anchor = pickCandidate(allPathTemplates, 'MEDIUM');
  }
  if (!anchor) {
    anchor = pickCandidate(allPathTemplates);
  }

  if (anchor) {
    selectedQuestIds.add(anchor.id);
    selectedQuests.push({ quest: anchor, isHighTier: true, proofType: 'NOTE' });
  }

  // SLOT 2: Weekday Signature Quest (tags: weekday_<0-6>)
  const weekdayTag = `weekday_${dayOfWeek}`;
  let weekdayQuest = pickCandidate(allPathTemplates, undefined, (tags) => !!tags && tags.includes(weekdayTag));
  if (!weekdayQuest) {
    weekdayQuest = pickCandidate(allPathTemplates, 'MEDIUM');
  }
  if (weekdayQuest) {
    selectedQuestIds.add(weekdayQuest.id);
    selectedQuests.push({ quest: weekdayQuest, isHighTier: false, proofType: null });
  }

  // SLOTS 3 to 7: 5 additional quests with difficulty distribution and rank/state adjustments
  let easyCount = 2;
  let medCount = 2;
  let hardCount = 1;

  const isHighStressOrLowRank = 
    profile.auraRank === 'E' || 
    profile.auraRank === 'D' || 
    (profile.pressureScore !== null && profile.pressureScore >= 70) || 
    profile.fatigueActive || 
    profile.recoveryModeActive;

  const isHighRank = 
    (profile.auraRank === 'A' || profile.auraRank === 'S') && 
    !isHighStressOrLowRank;

  if (isHighStressOrLowRank) {
    // Shift 1 tier down: HARD becomes MEDIUM
    hardCount = 0;
    medCount = 3;
    easyCount = 2;
  } else if (isHighRank) {
    // Shift 1 tier up: EASY becomes HARD
    easyCount = 1;
    medCount = 2;
    hardCount = 2;
  }

  const neededTiers: ('EASY' | 'MEDIUM' | 'HARD')[] = [];
  for (let i = 0; i < easyCount; i++) neededTiers.push('EASY');
  for (let i = 0; i < medCount; i++) neededTiers.push('MEDIUM');
  for (let i = 0; i < hardCount; i++) neededTiers.push('HARD');

  for (const tier of neededTiers) {
    if (selectedQuests.length + existingPathQuests.length >= 7) break;
    const q = pickCandidate(allPathTemplates, tier);
    if (q) {
      selectedQuestIds.add(q.id);
      selectedQuests.push({ quest: q, isHighTier: false, proofType: null });
    }
  }

  // If still under 7, fill with any remaining candidate from path
  while (selectedQuests.length + existingPathQuests.length < 7) {
    const q = pickCandidate(allPathTemplates);
    if (!q) break;
    selectedQuestIds.add(q.id);
    selectedQuests.push({ quest: q, isHighTier: false, proofType: null });
  }

  // 4. Concurrently-safe insert into UserQuest
  for (const sq of selectedQuests) {
    try {
      await prisma.userQuest.create({
        data: {
          userId,
          questId: sq.quest.id,
          date: today,
          isHighTier: sq.isHighTier,
          proofType: sq.proofType
        }
      });
    } catch (createErr: any) {
      // P2002 is unique constraint violation (userId, questId, date) -> idempotent ignore
      if (createErr.code !== 'P2002') {
        console.error('Error inserting daily quest:', createErr);
      }
    }
  }

  // 5. Final self-healing query and duplicate cleanup
  let finalUserQuests = await prisma.userQuest.findMany({
    where: { userId, date: today },
    include: { quest: true },
    orderBy: { id: 'asc' }
  });

  // Prune excess if any race slipped through
  const pathOnly = finalUserQuests.filter(uq => uq.quest.path === chosenPath && !isNonPathQuest(uq.quest));
  if (pathOnly.length > 7) {
    const excess = pathOnly.filter(uq => !uq.completed).slice(7);
    if (excess.length > 0) {
      await prisma.userQuest.deleteMany({
        where: { id: { in: excess.map(uq => uq.id) } }
      });
      finalUserQuests = await prisma.userQuest.findMany({
        where: { userId, date: today },
        include: { quest: true },
        orderBy: { id: 'asc' }
      });
    }
  }

  return { quests: finalUserQuests };
}

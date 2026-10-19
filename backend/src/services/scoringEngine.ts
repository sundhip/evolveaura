export interface ScoredItem {
  path: string;
  theme?: string;
  answer: number;
  reverseScored: boolean;
}

export interface PathScores {
  scholar: number | null;
  warrior: number | null;
  sage: number | null;
  creator: number | null;
}

export function calculatePathScores(items: ScoredItem[]): PathScores {
  const sums: Record<string, number> = {
    SCHOLAR: 0,
    WARRIOR: 0,
    SAGE: 0,
    CREATOR: 0,
  };
  const counts: Record<string, number> = {
    SCHOLAR: 0,
    WARRIOR: 0,
    SAGE: 0,
    CREATOR: 0,
  };

  for (const item of items) {
    const p = item.path ? item.path.toUpperCase() : '';
    if (sums[p] !== undefined) {
      const effectiveAnswer = item.reverseScored ? 6 - item.answer : item.answer;
      sums[p] += effectiveAnswer;
      counts[p] += 1;
    }
  }

  const computeScore = (sum: number, n: number): number | null => {
    if (n === 0) return null;
    const raw = Math.round(((sum - n) / (4 * n)) * 100);
    return Math.max(0, Math.min(100, raw));
  };

  return {
    scholar: computeScore(sums.SCHOLAR, counts.SCHOLAR),
    warrior: computeScore(sums.WARRIOR, counts.WARRIOR),
    sage: computeScore(sums.SAGE, counts.SAGE),
    creator: computeScore(sums.CREATOR, counts.CREATOR),
  };
}

export function calculateThemeScores(items: ScoredItem[]): Record<string, number> {
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};

  for (const item of items) {
    if (!item.theme) continue;
    const t = item.theme;
    const effectiveAnswer = item.reverseScored ? 6 - item.answer : item.answer;
    sums[t] = (sums[t] || 0) + effectiveAnswer;
    counts[t] = (counts[t] || 0) + 1;
  }

  const result: Record<string, number> = {};
  for (const [theme, sum] of Object.entries(sums)) {
    const n = counts[theme];
    if (n > 0) {
      const raw = Math.round(((sum - n) / (4 * n)) * 100);
      result[theme] = Math.max(0, Math.min(100, raw));
    }
  }
  return result;
}

export function calculateAuraScore(pathScores: { scholar: number; warrior: number; sage: number; creator: number }): number {
  return Math.round((pathScores.scholar + pathScores.warrior + pathScores.sage + pathScores.creator) / 4);
}

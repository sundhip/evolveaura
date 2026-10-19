import { describe, it, expect } from 'vitest';
import { suggestPath } from '../pathSuggestionEngine';

describe('PathSuggestionEngine - suggestPath', () => {
  it('identifies unambiguous top path with HIGH confidence', () => {
    const scores = { scholar: 90, warrior: 60, sage: 50, creator: 40 };
    const themeScores = {
      'deep-focus': 95,
      'active-recall': 85,
      'spaced-review': 80,
    };

    const res = suggestPath(scores, themeScores, null);
    expect(res.recommended).toBe('SCHOLAR');
    expect(res.runnerUp).toBe('WARRIOR');
    expect(res.growthArea).toBe('CREATOR');
    expect(res.confidence).toBe('HIGH'); // 90 - 60 = 30 >= 15
    expect(res.reasons.length).toBeGreaterThanOrEqual(2);
    expect(res.reasons.length).toBeLessThanOrEqual(3);
    expect(res.ranking[0]).toEqual({ path: 'SCHOLAR', score: 90 });
    expect(res.ranking[3]).toEqual({ path: 'CREATOR', score: 40 });
  });

  it('determines MEDIUM confidence when score difference is between 6 and 14', () => {
    const scores = { scholar: 80, warrior: 72, sage: 50, creator: 40 };
    const res = suggestPath(scores, {}, null);
    expect(res.recommended).toBe('SCHOLAR');
    expect(res.runnerUp).toBe('WARRIOR');
    expect(res.confidence).toBe('MEDIUM'); // 80 - 72 = 8
  });

  it('handles LOW confidence when scores are close (< 6) and adds disclaimer in reasons', () => {
    const scores = { scholar: 70, warrior: 68, sage: 65, creator: 60 };
    const res = suggestPath(scores, {}, null);
    expect(res.confidence).toBe('LOW'); // 70 - 68 = 2
    expect(res.reasons.some((r) => r.includes('scores are close'))).toBe(true);
  });

  it('applies TIE-BREAK 1 (primaryGoal within 5 points of top score)', () => {
    // Scholar is 80, Warrior is 78 (within 5 points).
    // User picked "Fitness" (maps to WARRIOR).
    const scores = { scholar: 80, warrior: 78, sage: 50, creator: 40 };
    const res = suggestPath(scores, {}, 'Fitness');
    expect(res.recommended).toBe('WARRIOR'); // Warrior chosen via goal tie-break
    expect(res.runnerUp).toBe('SCHOLAR');
  });

  it('ignores Balanced Growth for TIE-BREAK 1 and proceeds to TIE-BREAK 2 (theme scores)', () => {
    // Scholar and Warrior tied at 75.
    // User picked "Balanced Growth" (no tie-break).
    // Scholar highest theme = 70, Warrior highest theme = 90 (sleep).
    const scores = { scholar: 75, warrior: 75, sage: 50, creator: 40 };
    const themeScores = {
      'deep-focus': 70,
      'active-recall': 65,
      sleep: 90,
      exercise: 80,
    };
    const res = suggestPath(scores, themeScores, 'Balanced Growth');
    expect(res.recommended).toBe('WARRIOR');
    expect(res.runnerUp).toBe('SCHOLAR');
  });

  it('applies TIE-BREAK 3 (fixed order SCHOLAR, WARRIOR, SAGE, CREATOR) when completely tied', () => {
    // All 4 paths at 50, all theme scores at 50, no primary goal
    const scores = { scholar: 50, warrior: 50, sage: 50, creator: 50 };
    const res = suggestPath(scores, {}, null);
    expect(res.recommended).toBe('SCHOLAR');
    expect(res.runnerUp).toBe('WARRIOR');
    expect(res.growthArea).toBe('CREATOR');
    expect(res.ranking.map((r) => r.path)).toEqual(['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR']);
    expect(res.confidence).toBe('LOW');
  });

  it('guarantees deterministic output across multiple repeated runs', () => {
    const scores = { scholar: 65, warrior: 65, sage: 65, creator: 65 };
    const run1 = suggestPath(scores, {}, 'Balanced Growth');
    const run2 = suggestPath(scores, {}, 'Balanced Growth');
    expect(run1).toEqual(run2);
  });
});

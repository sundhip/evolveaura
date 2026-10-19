import { describe, it, expect } from 'vitest';
import { calculatePathScores, calculateThemeScores, calculateAuraScore } from '../scoringEngine';

describe('ScoringEngine - calculatePathScores', () => {
  it('computes 100 for all-5s on standard items', () => {
    const paths = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'];
    const items = paths.flatMap((p) =>
      Array(4)
        .fill(null)
        .map(() => ({ path: p, answer: 5, reverseScored: false }))
    );

    const scores = calculatePathScores(items);
    expect(scores).toEqual({
      scholar: 100,
      warrior: 100,
      sage: 100,
      creator: 100,
    });
  });

  it('computes 0 for all-1s on standard items', () => {
    const paths = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'];
    const items = paths.flatMap((p) =>
      Array(4)
        .fill(null)
        .map(() => ({ path: p, answer: 1, reverseScored: false }))
    );

    const scores = calculatePathScores(items);
    expect(scores).toEqual({
      scholar: 0,
      warrior: 0,
      sage: 0,
      creator: 0,
    });
  });

  it('correctly inverts reverse-scored items (6 - answer)', () => {
    // 4 items for SCHOLAR:
    // 2 standard with answer 5 -> 5, 5
    // 2 reverse with answer 5 -> 6-5=1, 6-5=1
    // Total sum = 5 + 5 + 1 + 1 = 12
    // Score = round(((12 - 4) / 16) * 100) = 50%
    const items = [
      { path: 'SCHOLAR', answer: 5, reverseScored: false },
      { path: 'SCHOLAR', answer: 5, reverseScored: false },
      { path: 'SCHOLAR', answer: 5, reverseScored: true },
      { path: 'SCHOLAR', answer: 5, reverseScored: true },
      { path: 'WARRIOR', answer: 1, reverseScored: true }, // 6 - 1 = 5 -> 100%
      { path: 'SAGE', answer: 3, reverseScored: false },
      { path: 'CREATOR', answer: 3, reverseScored: true }, // 6 - 3 = 3
    ];

    const scores = calculatePathScores(items);
    expect(scores.scholar).toBe(50);
    expect(scores.warrior).toBe(100);
    expect(scores.sage).toBe(50);
    expect(scores.creator).toBe(50);
  });

  it('correctly calculates mixed answers with clamping and exact rounding', () => {
    // 4 items: answers [1, 2, 4, 5], all standard
    // sum = 12, n = 4, round(((12 - 4) / 16) * 100) = 50
    const items = [
      { path: 'SCHOLAR', answer: 1, reverseScored: false },
      { path: 'SCHOLAR', answer: 2, reverseScored: false },
      { path: 'SCHOLAR', answer: 4, reverseScored: false },
      { path: 'SCHOLAR', answer: 5, reverseScored: false },
      { path: 'WARRIOR', answer: 4, reverseScored: false },
      { path: 'WARRIOR', answer: 4, reverseScored: false },
      { path: 'WARRIOR', answer: 4, reverseScored: false },
      { path: 'WARRIOR', answer: 4, reverseScored: false }, // sum=16, n=4, ((16-4)/16)*100 = 75
      { path: 'SAGE', answer: 2, reverseScored: false },
      { path: 'SAGE', answer: 2, reverseScored: false },
      { path: 'SAGE', answer: 2, reverseScored: false },
      { path: 'SAGE', answer: 2, reverseScored: false }, // sum=8, n=4, ((8-4)/16)*100 = 25
      { path: 'CREATOR', answer: 5, reverseScored: false },
    ];

    const scores = calculatePathScores(items);
    expect(scores.scholar).toBe(50);
    expect(scores.warrior).toBe(75);
    expect(scores.sage).toBe(25);
    expect(scores.creator).toBe(100);
  });

  it('evaluates one-path-dominant scenarios properly', () => {
    const items = [
      ...Array(4).fill(null).map(() => ({ path: 'SCHOLAR', answer: 5, reverseScored: false })),
      ...Array(4).fill(null).map(() => ({ path: 'WARRIOR', answer: 1, reverseScored: false })),
      ...Array(4).fill(null).map(() => ({ path: 'SAGE', answer: 1, reverseScored: false })),
      ...Array(4).fill(null).map(() => ({ path: 'CREATOR', answer: 1, reverseScored: false })),
    ];

    const scores = calculatePathScores(items);
    expect(scores).toEqual({
      scholar: 100,
      warrior: 0,
      sage: 0,
      creator: 0,
    });
  });

  it('regression: scores by question path rather than position in array', () => {
    // In old scoring, index 0..3 was always forced to Scholar.
    // Here, we put Creator questions at the front.
    const items = [
      { path: 'CREATOR', answer: 5, reverseScored: false },
      { path: 'CREATOR', answer: 5, reverseScored: false },
      { path: 'CREATOR', answer: 5, reverseScored: false },
      { path: 'CREATOR', answer: 5, reverseScored: false },
    ];

    const scores = calculatePathScores(items);
    expect(scores.creator).toBe(100);
    expect(scores.scholar).toBeNull(); // Proves questions are not misattributed to Scholar by position
    expect(scores.warrior).toBeNull();
    expect(scores.sage).toBeNull();
  });

  it('returns null when a path has no items', () => {
    const items = [
      { path: 'SCHOLAR', answer: 4, reverseScored: false },
      { path: 'WARRIOR', answer: 4, reverseScored: false },
      { path: 'SAGE', answer: 4, reverseScored: false },
    ];

    const scores = calculatePathScores(items);
    expect(scores.creator).toBeNull();
  });

  it('calculates theme scores and aura average', () => {
    const items = [
      { path: 'SCHOLAR', theme: 'deep-focus', answer: 5, reverseScored: false },
      { path: 'SCHOLAR', theme: 'deep-focus', answer: 4, reverseScored: false },
      { path: 'WARRIOR', theme: 'sleep', answer: 1, reverseScored: true }, // 6-1 = 5
    ];

    const themeScores = calculateThemeScores(items);
    // deep-focus: sum=9, n=2 -> round(((9-2)/8)*100) = round(7/8 * 100) = 88
    expect(themeScores['deep-focus']).toBe(88);
    expect(themeScores['sleep']).toBe(100);

    const aura = calculateAuraScore({ scholar: 80, warrior: 60, sage: 70, creator: 50 });
    expect(aura).toBe(65);
  });
});

import { describe, it, expect } from 'vitest';
import {
  calculateFtndScore,
  getFtndBand,
  checkChainSmoker,
  generateTaperPlan,
  validateQuitDate,
  calculateQuitStats,
  checkCrisisTriggers
} from '../quitEngine';

describe('Smoke-Free Path - FTND Scoring & Classification', () => {
  it('correctly scores and classifies VERY LOW dependence (0-2)', () => {
    // Answers: 0, 0, 0, 0, 0, 0 => sum 0
    const score0 = calculateFtndScore([0, 0, 0, 0, 0, 0]);
    expect(score0).toBe(0);
    expect(getFtndBand(score0).band).toBe('VERY_LOW');

    // Answers: 1, 0, 0, 1, 0, 0 => sum 2
    const score2 = calculateFtndScore([1, 0, 0, 1, 0, 0]);
    expect(score2).toBe(2);
    expect(getFtndBand(score2).band).toBe('VERY_LOW');
  });

  it('correctly scores and classifies LOW dependence (3-4)', () => {
    // Answers: 2, 0, 0, 1, 0, 0 => sum 3
    const score3 = calculateFtndScore([2, 0, 0, 1, 0, 0]);
    expect(score3).toBe(3);
    expect(getFtndBand(score3).band).toBe('LOW');

    // Answers: 2, 1, 0, 1, 0, 0 => sum 4
    const score4 = calculateFtndScore([2, 1, 0, 1, 0, 0]);
    expect(score4).toBe(4);
    expect(getFtndBand(score4).band).toBe('LOW');
  });

  it('correctly scores and classifies MEDIUM dependence (5)', () => {
    // Answers: 2, 1, 1, 1, 0, 0 => sum 5
    const score5 = calculateFtndScore([2, 1, 1, 1, 0, 0]);
    expect(score5).toBe(5);
    expect(getFtndBand(score5).band).toBe('MEDIUM');
  });

  it('correctly scores and classifies HIGH dependence (6-7)', () => {
    // Answers: 3, 1, 0, 1, 1, 0 => sum 6
    const score6 = calculateFtndScore([3, 1, 0, 1, 1, 0]);
    expect(score6).toBe(6);
    expect(getFtndBand(score6).band).toBe('HIGH');

    // Answers: 3, 1, 1, 1, 1, 0 => sum 7
    const score7 = calculateFtndScore([3, 1, 1, 1, 1, 0]);
    expect(score7).toBe(7);
    expect(getFtndBand(score7).band).toBe('HIGH');
  });

  it('correctly scores and classifies VERY HIGH dependence (8-10)', () => {
    // Answers: 3, 1, 1, 2, 1, 0 => sum 8
    const score8 = calculateFtndScore([3, 1, 1, 2, 1, 0]);
    expect(score8).toBe(8);
    expect(getFtndBand(score8).band).toBe('VERY_HIGH');

    // Maximum: 3, 1, 1, 3, 1, 1 => sum 10
    const score10 = calculateFtndScore([3, 1, 1, 3, 1, 1]);
    expect(score10).toBe(10);
    expect(getFtndBand(score10).band).toBe('VERY_HIGH');
  });

  it('flags chain smokers correctly (within 5 mins + 20+ cigarettes/day)', () => {
    // Within 5 min and 20 cpd => true
    expect(checkChainSmoker(5, 20)).toBe(true);
    expect(checkChainSmoker(2, 25)).toBe(true);

    // Within 5 min but less than 20 cpd => false
    expect(checkChainSmoker(5, 15)).toBe(false);

    // 20+ cpd but after 5 min => false
    expect(checkChainSmoker(10, 20)).toBe(false);
    expect(checkChainSmoker(30, 30)).toBe(false);
  });
});

describe('Smoke-Free Path - Plan Generator & Validation', () => {
  it('generates taper plan respecting chosen length (2 to 6 weeks)', () => {
    const plan2Weeks = generateTaperPlan(20, 2);
    expect(plan2Weeks.weeks).toBe(2);
    expect(plan2Weeks.totalDays).toBe(14);
    expect(plan2Weeks.plan.length).toBe(14);

    const plan6Weeks = generateTaperPlan(20, 6);
    expect(plan6Weeks.weeks).toBe(6);
    expect(plan6Weeks.totalDays).toBe(42);
    expect(plan6Weeks.plan.length).toBe(42);
  });

  it('ensures taper daily caps are never negative and end strictly at 0', () => {
    const baseline = 15;
    const taper = generateTaperPlan(baseline, 4);

    expect(taper.plan[0].dailyCap).toBeLessThanOrEqual(baseline);
    expect(taper.plan[taper.plan.length - 1].dailyCap).toBe(0);

    for (const d of taper.plan) {
      expect(d.dailyCap).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(d.dailyCap)).toBe(true);
    }
  });

  it('validates quit date within 14 days and rejects past or overly distant dates', () => {
    const today = new Date('2026-10-18T00:00:00Z');

    // Today is valid
    expect(validateQuitDate('2026-10-18', today).valid).toBe(true);

    // In 7 days is valid
    expect(validateQuitDate('2026-10-25', today).valid).toBe(true);

    // In 14 days is valid
    expect(validateQuitDate('2026-11-01', today).valid).toBe(true);

    // Past date is rejected
    const past = validateQuitDate('2026-10-17', today);
    expect(past.valid).toBe(false);
    expect(past.error).toContain('past');

    // Beyond 14 days is rejected
    const distant = validateQuitDate('2026-11-05', today);
    expect(distant.valid).toBe(false);
    expect(distant.error).toContain('14 days');
  });
});

describe('Smoke-Free Path - Savings & Streak Hand-Computed Verification', () => {
  it('accurately calculates avoided cigarettes, money saved, and smoke-free streak', () => {
    // Hand-computed Example:
    // Profile: 20 cpd, costPerPack = 360 INR, 20 cigs per pack => 18 INR per cigarette.
    // Day 1 (2026-10-15): 0 cigarettes smoked => avoided 20 => 360 INR saved
    // Day 2 (2026-10-16): 0 cigarettes smoked => avoided 20 => 360 INR saved
    // Day 3 (2026-10-17): 5 cigarettes smoked => avoided 15 => 270 INR saved
    // Expected Total avoided: 20 + 20 + 15 = 55
    // Expected Total money saved: 55 * 18 = 990 INR
    // Expected Smoke-Free Days: 2 (Day 1 and Day 2)
    // Expected Streak: 0 (since latest day Day 3 had 5 cigarettes)

    const profile = {
      cigarettesPerDay: 20,
      costPerPackInr: 360,
      cigarettesPerPack: 20,
      startedAt: new Date('2026-10-15T00:00:00Z'),
      consentAt: new Date('2026-10-15T00:00:00Z')
    };

    const checkIns = [
      { date: new Date('2026-10-17T00:00:00Z'), cigarettesSmoked: 5, mood: 3, note: null },
      { date: new Date('2026-10-16T00:00:00Z'), cigarettesSmoked: 0, mood: 4, note: null },
      { date: new Date('2026-10-15T00:00:00Z'), cigarettesSmoked: 0, mood: 4, note: null }
    ];

    const cravings = [
      { survived: true },
      { survived: true },
      { survived: false }
    ];

    const lapses = [
      { cigarettes: 5 }
    ];

    const stats = calculateQuitStats(profile, checkIns, cravings, lapses);

    expect(stats.totalAvoided).toBe(55);
    expect(stats.moneySavedInr).toBe(990);
    expect(stats.smokeFreeDays).toBe(2);
    expect(stats.smokeFreeStreak).toBe(0); // broken by latest 5 cigarettes
    expect(stats.cravingsSurvived).toBe(2);
    expect(stats.totalCravings).toBe(3);
    expect(stats.totalLapses).toBe(1);
  });

  it('calculates unbroken smoke-free streak when latest days are 0 cigarettes', () => {
    const profile = {
      cigarettesPerDay: 15,
      costPerPackInr: 300,
      cigarettesPerPack: 20,
      startedAt: new Date('2026-10-15T00:00:00Z'),
      consentAt: new Date('2026-10-15T00:00:00Z')
    };

    const checkIns = [
      { date: new Date('2026-10-18T00:00:00Z'), cigarettesSmoked: 0, mood: 4, note: null },
      { date: new Date('2026-10-17T00:00:00Z'), cigarettesSmoked: 0, mood: 4, note: null },
      { date: new Date('2026-10-16T00:00:00Z'), cigarettesSmoked: 0, mood: 3, note: null },
      { date: new Date('2026-10-15T00:00:00Z'), cigarettesSmoked: 3, mood: 2, note: null }
    ];

    const stats = calculateQuitStats(profile, checkIns, [], []);

    // 3 unbroken days at 0 cigarettes (Oct 18, 17, 16)
    expect(stats.smokeFreeStreak).toBe(3);
    expect(stats.smokeFreeDays).toBe(3);
  });
});

describe('Smoke-Free Path - Crisis Alert Detection', () => {
  it('triggers crisis alert on crisis keywords in note', () => {
    const res = checkCrisisTriggers([], 'I feel completely hopeless today');
    expect(res.hasCrisisAlert).toBe(true);
    expect(res.message).toBeDefined();

    const res2 = checkCrisisTriggers([], "I just can't go on like this");
    expect(res2.hasCrisisAlert).toBe(true);
  });

  it('triggers crisis alert when mood is 1 for two consecutive check-ins', () => {
    const checkIns = [
      { mood: 1, note: 'Normal check-in' },
      { mood: 1, note: 'Tough day' }
    ];
    const res = checkCrisisTriggers(checkIns);
    expect(res.hasCrisisAlert).toBe(true);
  });

  it('does not trigger crisis alert on normal notes and moods', () => {
    const checkIns = [
      { mood: 3, note: 'Had tea and walked' },
      { mood: 4, note: 'Feeling calmer' }
    ];
    const res = checkCrisisTriggers(checkIns, 'Doing okay');
    expect(res.hasCrisisAlert).toBe(false);
  });
});

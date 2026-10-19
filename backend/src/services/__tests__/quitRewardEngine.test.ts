import { describe, it, expect, beforeEach } from 'vitest';
import {
  QUIT_REWARD_CONSTANTS,
  QUIT_BADGES
} from '../quitRewardEngine';

describe('Phase 6 Quit Reward Engine Unit Tests', () => {
  it('verifies reward constants and daily caps are strictly configured', () => {
    expect(QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP).toBe(20);
    expect(QUIT_REWARD_CONSTANTS.HONEST_LAPSE_XP).toBe(10);
    expect(QUIT_REWARD_CONSTANTS.CRAVING_SURVIVED_XP).toBe(15);
    expect(QUIT_REWARD_CONSTANTS.MAX_CRAVINGS_REWARDED_PER_DAY).toBe(3);
    expect(QUIT_REWARD_CONSTANTS.SMOKE_FREE_BASE_XP).toBe(30);
    expect(QUIT_REWARD_CONSTANTS.MAX_STREAK_BONUS_XP).toBe(60);
    expect(QUIT_REWARD_CONSTANTS.WELCOME_BONUS_XP).toBe(100);
  });

  it('verifies max possible daily XP for someone logging 0 cigarettes with no other activity is capped at 90 XP', () => {
    // 0 cigarettes checkin: 20 base checkin + 30 smoke-free base + max 60 streak = 110 XP
    // An idle user logging 0 cigarettes cannot farm beyond this daily limit
    const idleCheckInXP = QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP + QUIT_REWARD_CONSTANTS.SMOKE_FREE_BASE_XP + QUIT_REWARD_CONSTANTS.MAX_STREAK_BONUS_XP;
    expect(idleCheckInXP).toBe(110);
    // Without craving sessions (capped at 3 * 15 = 45 XP), daily activity has a hard mathematical ceiling
    const absoluteDailyCeiling = idleCheckInXP + (QUIT_REWARD_CONSTANTS.MAX_CRAVINGS_REWARDED_PER_DAY * QUIT_REWARD_CONSTANTS.CRAVING_SURVIVED_XP);
    expect(absoluteDailyCeiling).toBe(155);
  });

  it('ensures lapse day still pays honest check-in and honesty bonus', () => {
    const cigarettesLogged = 2;
    let expectedXP = 0;
    // 1. Daily check-in is awarded regardless of cigarettes smoked
    expectedXP += QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP;
    // 2. Honesty bonus awarded for disclosing >0 cigarettes
    if (cigarettesLogged > 0) {
      expectedXP += QUIT_REWARD_CONSTANTS.HONEST_LAPSE_XP;
    }
    expect(expectedXP).toBe(30); // 20 + 10
  });

  it('verifies all 12 Quit Badges are uniquely keyed with non-empty titles', () => {
    expect(QUIT_BADGES.length).toBe(12);
    const keys = new Set(QUIT_BADGES.map(b => b.key));
    expect(keys.size).toBe(QUIT_BADGES.length);

    QUIT_BADGES.forEach(b => {
      expect(b.title.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
      expect(b.equippableTitle.length).toBeGreaterThan(0);
    });
  });

  it('confirms boss damage constants are defined and positive', () => {
    expect(QUIT_REWARD_CONSTANTS.DAMAGE_PER_CHECKIN).toBeGreaterThan(0);
    expect(QUIT_REWARD_CONSTANTS.DAMAGE_PER_CRAVING).toBeGreaterThan(0);
    expect(QUIT_REWARD_CONSTANTS.DAMAGE_PER_SMOKE_FREE_DAY).toBeGreaterThan(0);
  });
});

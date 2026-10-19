import prisma from '../config/db';

export const QUIT_REWARD_CONSTANTS = {
  DAILY_CHECKIN_XP: 20,
  HONEST_LAPSE_XP: 10,
  CRAVING_SURVIVED_XP: 15,
  MAX_CRAVINGS_REWARDED_PER_DAY: 3, // max 3 * 15 = 45 XP
  SMOKE_FREE_BASE_XP: 30,
  STREAK_MULTIPLIER_XP_PER_DAY: 5,
  MAX_STREAK_BONUS_XP: 60, // base 30 + up to 60 = 90 XP max
  WEEKLY_FOLLOW_THROUGH_XP: 50, // 3 unique days in a rolling 7-day week
  MILESTONE_7_DAY_XP: 100,
  MILESTONE_14_DAY_XP: 250,
  MILESTONE_30_DAY_XP: 500,
  STEP_DOWN_BADGE_XP: 50,
  WELCOME_BONUS_XP: 100, // completed screening + plan in first 24h
  DAMAGE_PER_CHECKIN: 100,
  DAMAGE_PER_CRAVING: 75,
  DAMAGE_PER_SMOKE_FREE_DAY: 150
};

export interface QuitRewardResult {
  xpAwarded: number;
  reasons: string[];
  newBadges: string[];
  bossDamageDealt: number;
  streakShieldsAwarded: number;
}

export const QUIT_BADGES = [
  {
    key: 'FIRST_BREATH',
    title: 'First Breath',
    description: 'Completed your first check-in or screening plan.',
    equippableTitle: 'The Resilient Breather'
  },
  {
    key: 'CRAVING_RIDER',
    title: 'Craving Rider',
    description: 'Rode through 10 craving surges using rapid coping tools.',
    equippableTitle: 'Wave Rider'
  },
  {
    key: 'HONEST_COMPASS',
    title: 'Honest Compass',
    description: 'Completed 7 check-ins with transparent, authentic logging.',
    equippableTitle: 'Truth Seeker'
  },
  {
    key: 'DAY_1',
    title: 'Day 1 Smoke-Free',
    description: 'Achieved your first full 24-hour smoke-free milestone.',
    equippableTitle: 'Day One Pioneer'
  },
  {
    key: 'DAY_3',
    title: 'Day 3 Cleansing',
    description: 'Maintained 3 consecutive smoke-free days. Earned 1 Aura Shield!',
    equippableTitle: 'Breath Keeper'
  },
  {
    key: 'DAY_7',
    title: 'Day 7 Unshakable',
    description: 'Completed 1 full smoke-free week. Earned 1 Aura Shield!',
    equippableTitle: 'Unshakable Will'
  },
  {
    key: 'DAY_14',
    title: 'Day 14 Rebound',
    description: 'Rebound stamina for 2 full weeks. Earned 1 Aura Shield!',
    equippableTitle: 'Vigor Reclaimed'
  },
  {
    key: 'DAY_30',
    title: 'Day 30 Evolution',
    description: 'A full month smoke-free. Habits transformed into identity.',
    equippableTitle: 'Smoke-Free Vanguard'
  },
  {
    key: 'SAVINGS_500',
    title: 'Pocket Guardian (₹500)',
    description: 'Saved ₹500 in real money from unbought tobacco products.',
    equippableTitle: 'Pocket Guardian'
  },
  {
    key: 'SAVINGS_1000',
    title: 'Wealth Reclaimer (₹1,000)',
    description: 'Saved ₹1,000 in personal capital redirected to real goals.',
    equippableTitle: 'Wealth Reclaimer'
  },
  {
    key: 'SAVINGS_5000',
    title: 'Treasury Restored (₹5,000)',
    description: 'Saved ₹5,000 in hard-earned money.',
    equippableTitle: 'Treasury Restored'
  },
  {
    key: 'COMEBACK',
    title: 'Comeback',
    description: 'Resumed daily tracking with head held high following a slip.',
    equippableTitle: 'The Relentless'
  }
];

/**
 * Evaluates and awards XP for a daily check-in (Honest check-in, Honesty bonus for slips, Smoke-free streak bonus)
 */
export async function awardCheckInRewards(
  userId: string,
  cigarettesSmoked: number,
  clientDateStr: string,
  consecutiveSmokeFreeDays: number
): Promise<QuitRewardResult> {
  let totalXP = 0;
  const reasons: string[] = [];
  const newBadges: string[] = [];
  let streakShieldsAwarded = 0;
  let bossDamageDealt = 0;

  const todayKey = clientDateStr || new Date().toISOString().split('T')[0];

  // 1. Base Check-in Reward (Awarded regardless of cigarette count - honesty encouraged)
  const checkinSource = `QUIT_CHECKIN_${todayKey}`;
  const existingCheckinXP = await prisma.xPLog.findFirst({
    where: { userId, source: checkinSource }
  });

  if (!existingCheckinXP) {
    totalXP += QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP;
    reasons.push(`Daily Check-in Completed (+${QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP} XP)`);
    await prisma.xPLog.create({
      data: {
        userId,
        xpGained: QUIT_REWARD_CONSTANTS.DAILY_CHECKIN_XP,
        source: checkinSource
      }
    });
    bossDamageDealt += QUIT_REWARD_CONSTANTS.DAMAGE_PER_CHECKIN;
  }

  // 2. Honesty Bonus if a slip or cigarette was logged (>0)
  if (cigarettesSmoked > 0) {
    const honestySource = `QUIT_HONESTY_${todayKey}`;
    const existingHonestyXP = await prisma.xPLog.findFirst({
      where: { userId, source: honestySource }
    });
    if (!existingHonestyXP) {
      totalXP += QUIT_REWARD_CONSTANTS.HONEST_LAPSE_XP;
      reasons.push(`Honesty Bonus (+${QUIT_REWARD_CONSTANTS.HONEST_LAPSE_XP} XP)`);
      await prisma.xPLog.create({
        data: {
          userId,
          xpGained: QUIT_REWARD_CONSTANTS.HONEST_LAPSE_XP,
          source: honestySource
        }
      });
    }
  }

  // 3. Smoke-Free Day Reward + Streak Multiplier (If 0 cigarettes smoked)
  if (cigarettesSmoked === 0) {
    const smokeFreeSource = `QUIT_SMOKEFREE_${todayKey}`;
    const existingSmokeFreeXP = await prisma.xPLog.findFirst({
      where: { userId, source: smokeFreeSource }
    });
    if (!existingSmokeFreeXP) {
      const streakBonus = Math.min(
        QUIT_REWARD_CONSTANTS.MAX_STREAK_BONUS_XP,
        consecutiveSmokeFreeDays * QUIT_REWARD_CONSTANTS.STREAK_MULTIPLIER_XP_PER_DAY
      );
      const smokeFreeTotal = QUIT_REWARD_CONSTANTS.SMOKE_FREE_BASE_XP + streakBonus;
      totalXP += smokeFreeTotal;
      reasons.push(`Smoke-Free Day (+${QUIT_REWARD_CONSTANTS.SMOKE_FREE_BASE_XP} XP + ${streakBonus} Streak Bonus)`);
      await prisma.xPLog.create({
        data: {
          userId,
          xpGained: smokeFreeTotal,
          source: smokeFreeSource
        }
      });
      bossDamageDealt += QUIT_REWARD_CONSTANTS.DAMAGE_PER_SMOKE_FREE_DAY;
    }
  }

  // 4. Follow-Through Weekly Bonus (3 unique days in past 7 days)
  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekCheckinsCount = await prisma.quitCheckIn.count({
    where: { userId, date: { gte: weekStart } }
  });

  if (weekCheckinsCount >= 3) {
    const currentWeekNumber = Math.floor(Date.now() / (7 * 24 * 60 * 60 * 1000));
    const weeklySource = `QUIT_WEEKLY_FOLLOW_THROUGH_${currentWeekNumber}`;
    const existingWeekly = await prisma.xPLog.findFirst({
      where: { userId, source: weeklySource }
    });
    if (!existingWeekly) {
      totalXP += QUIT_REWARD_CONSTANTS.WEEKLY_FOLLOW_THROUGH_XP;
      reasons.push(`Weekly Follow-Through Bonus (3+ check-ins) (+${QUIT_REWARD_CONSTANTS.WEEKLY_FOLLOW_THROUGH_XP} XP)`);
      await prisma.xPLog.create({
        data: {
          userId,
          xpGained: QUIT_REWARD_CONSTANTS.WEEKLY_FOLLOW_THROUGH_XP,
          source: weeklySource
        }
      });
    }
  }

  // 5. Total Check-in Count Consistency Badges (7, 14, 30 days)
  const totalCheckInsAllTime = await prisma.quitCheckIn.count({ where: { userId } });
  if (totalCheckInsAllTime >= 1) {
    const b = await awardBadgeIfEarned(userId, 'FIRST_BREATH');
    if (b) newBadges.push(b);
  }
  if (totalCheckInsAllTime >= 7) {
    const b = await awardBadgeIfEarned(userId, 'HONEST_COMPASS');
    if (b) {
      newBadges.push(b);
      const milestoneSource = 'QUIT_MILESTONE_7_DAY';
      const existing = await prisma.xPLog.findFirst({ where: { userId, source: milestoneSource } });
      if (!existing) {
        totalXP += QUIT_REWARD_CONSTANTS.MILESTONE_7_DAY_XP;
        reasons.push(`7-Day Check-in Consistency (+${QUIT_REWARD_CONSTANTS.MILESTONE_7_DAY_XP} XP)`);
        await prisma.xPLog.create({ data: { userId, xpGained: QUIT_REWARD_CONSTANTS.MILESTONE_7_DAY_XP, source: milestoneSource } });
      }
    }
  }

  // 6. Streak Milestones & Aura Shield Awards (Days 1, 3, 7, 14, 30)
  if (consecutiveSmokeFreeDays >= 1) {
    const b = await awardBadgeIfEarned(userId, 'DAY_1');
    if (b) newBadges.push(b);
  }
  if (consecutiveSmokeFreeDays >= 3) {
    const b = await awardBadgeIfEarned(userId, 'DAY_3');
    if (b) {
      newBadges.push(b);
      streakShieldsAwarded += 1;
      await grantAuraShield(userId);
    }
  }
  if (consecutiveSmokeFreeDays >= 7) {
    const b = await awardBadgeIfEarned(userId, 'DAY_7');
    if (b) {
      newBadges.push(b);
      streakShieldsAwarded += 1;
      await grantAuraShield(userId);
    }
  }
  if (consecutiveSmokeFreeDays >= 14) {
    const b = await awardBadgeIfEarned(userId, 'DAY_14');
    if (b) {
      newBadges.push(b);
      streakShieldsAwarded += 1;
      await grantAuraShield(userId);
    }
  }
  if (consecutiveSmokeFreeDays >= 30) {
    const b = await awardBadgeIfEarned(userId, 'DAY_30');
    if (b) newBadges.push(b);
  }

  // 7. Check if user came back after a prior lapse
  const priorLapse = await prisma.quitLapse.findFirst({ where: { userId } });
  if (priorLapse && cigarettesSmoked === 0) {
    const b = await awardBadgeIfEarned(userId, 'COMEBACK');
    if (b) newBadges.push(b);
  }

  // Apply XP to Profile if > 0
  if (totalXP > 0) {
    await applyXpToUserProfile(userId, totalXP);
  }

  // Apply damage to Nicotine Shade boss if damage > 0
  if (bossDamageDealt > 0) {
    await damageNicotineShadeBoss(userId, bossDamageDealt);
  }

  // Record aggregate metric
  await incrementDailyMetric('checkInsCount', 1);

  return {
    xpAwarded: totalXP,
    reasons,
    newBadges,
    bossDamageDealt,
    streakShieldsAwarded
  };
}

/**
 * Awards XP for surviving a craving using a coping tool (max 3/day)
 */
export async function awardCravingSurvivedReward(userId: string): Promise<QuitRewardResult> {
  const todayKey = new Date().toISOString().split('T')[0];
  const prefix = `QUIT_CRAVING_${todayKey}_`;

  const todayCravingLogs = await prisma.xPLog.count({
    where: {
      userId,
      source: { startsWith: prefix }
    }
  });

  let xpAwarded = 0;
  const reasons: string[] = [];
  const newBadges: string[] = [];
  let bossDamageDealt = 0;

  if (todayCravingLogs < QUIT_REWARD_CONSTANTS.MAX_CRAVINGS_REWARDED_PER_DAY) {
    const nextIdx = todayCravingLogs + 1;
    const sourceKey = `${prefix}${nextIdx}`;
    xpAwarded = QUIT_REWARD_CONSTANTS.CRAVING_SURVIVED_XP;
    reasons.push(`Craving Survived (+${xpAwarded} XP)`);

    await prisma.xPLog.create({
      data: {
        userId,
        xpGained: xpAwarded,
        source: sourceKey
      }
    });

    await applyXpToUserProfile(userId, xpAwarded);
    bossDamageDealt = QUIT_REWARD_CONSTANTS.DAMAGE_PER_CRAVING;
    await damageNicotineShadeBoss(userId, bossDamageDealt);
  }

  // Check 10 cravings survived badge
  const totalSurvived = await prisma.quitCraving.count({
    where: { userId, survived: true }
  });
  if (totalSurvived >= 10) {
    const b = await awardBadgeIfEarned(userId, 'CRAVING_RIDER');
    if (b) newBadges.push(b);
  }

  await incrementDailyMetric('cravingsSurvived', 1);

  return {
    xpAwarded,
    reasons,
    newBadges,
    bossDamageDealt,
    streakShieldsAwarded: 0
  };
}

/**
 * Awards Welcome Bonus (+100 XP + First Breath) if screening + plan completed within 24h
 */
export async function awardWelcomeBonus(userId: string): Promise<QuitRewardResult> {
  const source = 'QUIT_WELCOME_BONUS';
  const existing = await prisma.xPLog.findFirst({ where: { userId, source } });

  let xpAwarded = 0;
  const reasons: string[] = [];
  const newBadges: string[] = [];

  if (!existing) {
    xpAwarded = QUIT_REWARD_CONSTANTS.WELCOME_BONUS_XP;
    reasons.push(`Welcome to Smoke-Free Path Bonus (+${xpAwarded} XP)`);
    await prisma.xPLog.create({
      data: {
        userId,
        xpGained: xpAwarded,
        source
      }
    });
    await applyXpToUserProfile(userId, xpAwarded);

    const b = await awardBadgeIfEarned(userId, 'FIRST_BREATH');
    if (b) newBadges.push(b);
  }

  await incrementDailyMetric('newStarts', 1);

  return {
    xpAwarded,
    reasons,
    newBadges,
    bossDamageDealt: 0,
    streakShieldsAwarded: 0
  };
}

/**
 * Evaluates real savings to award Savings Milestones (₹500, ₹1000, ₹5000)
 */
export async function checkSavingsBadges(userId: string, totalMoneySavedInr: number): Promise<string[]> {
  const newBadges: string[] = [];
  if (totalMoneySavedInr >= 500) {
    const b = await awardBadgeIfEarned(userId, 'SAVINGS_500');
    if (b) newBadges.push(b);
  }
  if (totalMoneySavedInr >= 1000) {
    const b = await awardBadgeIfEarned(userId, 'SAVINGS_1000');
    if (b) newBadges.push(b);
  }
  if (totalMoneySavedInr >= 5000) {
    const b = await awardBadgeIfEarned(userId, 'SAVINGS_5000');
    if (b) newBadges.push(b);
  }
  return newBadges;
}

/**
 * Helper to grant a QuitBadge and equip the title if not already owned
 */
async function awardBadgeIfEarned(userId: string, badgeKey: string): Promise<string | null> {
  const badgeDef = QUIT_BADGES.find(b => b.key === badgeKey);
  if (!badgeDef) return null;

  try {
    const existing = await prisma.quitBadge.findUnique({
      where: { userId_badgeKey: { userId, badgeKey } }
    });
    if (existing) return null;

    await prisma.quitBadge.create({
      data: {
        userId,
        badgeKey: badgeDef.key,
        title: badgeDef.title,
        description: badgeDef.description
      }
    });

    // Optionally set as equipped title if user has default
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile && (profile.equippedTitle === 'Novice Evolver' || !profile.equippedTitle)) {
      await prisma.profile.update({
        where: { userId },
        data: { equippedTitle: badgeDef.equippableTitle }
      });
    }

    return badgeDef.title;
  } catch (e) {
    return null;
  }
}

/**
 * Grants an Aura Shield to the user's profile and quitProfile
 */
async function grantAuraShield(userId: string) {
  try {
    await prisma.profile.update({
      where: { userId },
      data: { auraShields: { increment: 1 } }
    });
    await prisma.quitProfile.update({
      where: { userId },
      data: { streakShieldCount: { increment: 1 } }
    });
  } catch (e) {
    console.warn('Failed to grant aura shield', e);
  }
}

/**
 * Updates profile XP and level calculation without breaking game balance
 */
async function applyXpToUserProfile(userId: string, xpGained: number) {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return;

    let level = profile.currentLevel;
    let xp = profile.currentXP + xpGained;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let pointsAwarded = 0;

    if (!profile.levelLocked) {
      while (xp >= required) {
        xp -= required;
        level += 1;
        pointsAwarded += 5;
        required = Math.round(100 * Math.pow(level, 1.5));
      }
    }

    await prisma.profile.update({
      where: { userId },
      data: {
        currentXP: xp,
        currentLevel: level,
        unallocatedPoints: { increment: pointsAwarded }
      }
    });
  } catch (e) {
    console.warn('Failed to update user profile XP', e);
  }
}

/**
 * Damages the Nicotine Shade recovery boss.
 * Never heals on a lapse.
 */
export async function damageNicotineShadeBoss(userId: string, damageAmount: number) {
  try {
    let boss = await prisma.boss.findFirst({
      where: { name: 'Nicotine Shade' }
    });

    if (!boss) {
      boss = await prisma.boss.create({
        data: {
          name: 'Nicotine Shade',
          description: 'A shadowy manifestation of chemical cravings. Damaged by consistent daily check-ins, surviving cravings, and smoke-free days. Never recovers HP on slips.',
          maxHP: 3000,
          badgeReward: 'Shade Dispeller',
          xpReward: 1000,
          spriteName: 'shade',
          isRecovery: true
        }
      });
    }

    let progress = await prisma.userBossProgress.findFirst({
      where: { userId, bossId: boss.id, defeated: false }
    });

    if (!progress) {
      progress = await prisma.userBossProgress.create({
        data: {
          userId,
          bossId: boss.id,
          currentHP: boss.maxHP,
          selectedTier: 0
        }
      });
    }

    const nextHP = Math.max(0, progress.currentHP - damageAmount);
    const isDefeated = nextHP <= 0;

    await prisma.userBossProgress.update({
      where: { id: progress.id },
      data: {
        currentHP: nextHP,
        defeated: isDefeated,
        defeatedAt: isDefeated ? new Date() : undefined
      }
    });

    if (isDefeated) {
      await prisma.xPLog.create({
        data: {
          userId,
          xpGained: boss.xpReward,
          source: 'BOSS_CLEAR: Nicotine Shade'
        }
      });
      await applyXpToUserProfile(userId, boss.xpReward);
    }
  } catch (e) {
    console.warn('Failed to damage Nicotine Shade boss', e);
  }
}

/**
 * Aggregates anonymous non-identifying platform metrics
 */
export async function incrementDailyMetric(
  field: 'newStarts' | 'checkInsCount' | 'cravingsSurvived' | 'lapsesLogged' | 'activeUsers',
  amount: number = 1
) {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.quitMetricDaily.upsert({
      where: { date: today },
      create: {
        date: today,
        [field]: amount
      },
      update: {
        [field]: { increment: amount }
      }
    });
  } catch (e) {
    // Non-blocking
  }
}

import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  calculateFtndScore,
  getFtndBand,
  checkChainSmoker,
  generateTaperPlan,
  validateQuitDate,
  calculateQuitStats,
  checkCrisisTriggers
} from '../services/quitEngine';
import {
  awardCheckInRewards,
  awardCravingSurvivedReward,
  awardWelcomeBonus,
  checkSavingsBadges,
  QUIT_BADGES
} from '../services/quitRewardEngine';

// Middleware / Guard helper: verifies user has an active 18+ consent QuitProfile
async function getValidatedQuitProfile(userId: string) {
  const profile = await prisma.quitProfile.findUnique({ where: { userId } });
  if (!profile || !profile.ageConfirmed18) {
    return null;
  }
  return profile;
}

export const saveConsent = async (req: AuthRequest, res: Response) => {
  try {
    const { ageConfirmed18, consentGiven, isOver18, hasInformedConsent } = req.body;
    const isAgeValid = Boolean(ageConfirmed18 || isOver18);
    const isConsentValid = Boolean(consentGiven || hasInformedConsent);

    if (!isAgeValid || !isConsentValid) {
      return res.status(403).json({
        error: 'CONSENT_REQUIRED',
        message: 'You must be 18 years or older and provide informed consent to access the Smoke-Free Path.'
      });
    }

    const profile = await prisma.quitProfile.upsert({
      where: { userId: req.userId! },
      create: {
        userId: req.userId!,
        consentAt: new Date(),
        ageConfirmed18: true,
        status: 'ASSESSING'
      },
      update: {
        consentAt: new Date(),
        ageConfirmed18: true
      }
    });

    res.json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuitProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.quitProfile.findUnique({
      where: { userId: req.userId! }
    });

    if (!profile) {
      return res.status(404).json({ error: 'PROFILE_NOT_FOUND', message: 'No quit profile found.' });
    }

    if (!profile.ageConfirmed18) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    res.json({
      success: true,
      profile: {
        ...profile,
        hasConsented: profile.ageConfirmed18,
        isOver18: profile.ageConfirmed18,
        planMode: profile.approach === 'GRADUAL' ? 'TAPER' : profile.approach === 'QUIT_DATE' ? 'COLD_TURKEY' : null,
        targetQuitDate: profile.quitDate,
        dailyTarget: profile.approach === 'GRADUAL' && Array.isArray(profile.taperPlan) && profile.taperPlan.length > 0
          ? (profile.taperPlan[0] as any)?.dailyCap ?? 0
          : 0,
        taperDailyCaps: profile.approach === 'GRADUAL' && Array.isArray(profile.taperPlan)
          ? (profile.taperPlan as any[]).map(p => p.dailyCap)
          : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveScreening = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const {
      ftndAnswers,
      readiness,
      readinessStage,
      cigarettesPerDay,
      baselineDailyCount,
      timeToFirstMins,
      costPerPackInr,
      costPerUnit,
      cigarettesPerPack,
      reasons,
      triggers,
      usualSmokingTimes
    } = req.body;

    const cpd = Number(cigarettesPerDay) || Number(baselineDailyCount) || 10;
    const cpp = Number(cigarettesPerPack) || 20;
    const unitCost = Number(costPerUnit) || 15;
    const packCost = Number(costPerPackInr) || (unitCost * cpp);

    const score = calculateFtndScore(ftndAnswers || []);
    const band = getFtndBand(score);
    const isChain = checkChainSmoker(Number(timeToFirstMins) || 30, cpd);

    const updated = await prisma.quitProfile.update({
      where: { userId: req.userId! },
      data: {
        ftndScore: score,
        dependenceLevel: band.label,
        readiness: readiness || readinessStage || 'THINKING',
        cigarettesPerDay: cpd,
        costPerPackInr: packCost,
        cigarettesPerPack: cpp,
        reasons: reasons || [],
        triggers: triggers || [],
        usualSmokingTimes: usualSmokingTimes || [],
        status: 'PLANNING'
      }
    });

    res.json({
      success: true,
      profile: updated,
      ftnd: {
        score,
        band: band.band,
        label: band.label,
        description: band.description,
        isChainSmoker: isChain
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const savePlan = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { approach, planMode, taperWeeks, quitDate, targetQuitDate } = req.body;
    const mode = planMode || approach;
    const targetDate = quitDate || targetQuitDate;

    if (mode === 'GRADUAL' || mode === 'TAPER') {
      const taper = generateTaperPlan(profile.cigarettesPerDay || 15, Number(taperWeeks) || 4);
      const updated = await prisma.quitProfile.update({
        where: { userId: req.userId! },
        data: {
          approach: 'GRADUAL',
          taperPlan: taper.plan as any,
          status: 'ACTIVE',
          startedAt: new Date()
        }
      });

      // Award welcome bonus if eligible
      const welcomeRewards = await awardWelcomeBonus(req.userId!);

      return res.json({ success: true, profile: updated, taper, rewards: welcomeRewards });
    }

    if (mode === 'QUIT_DATE' || mode === 'COLD_TURKEY') {
      const val = validateQuitDate(targetDate);
      if (!val.valid) {
        return res.status(400).json({ error: 'INVALID_QUIT_DATE', message: val.error });
      }
      const updated = await prisma.quitProfile.update({
        where: { userId: req.userId! },
        data: {
          approach: 'QUIT_DATE',
          quitDate: new Date(targetDate),
          status: 'QUIT_DATE_SET',
          startedAt: new Date()
        }
      });

      // Award welcome bonus if eligible
      const welcomeRewards = await awardWelcomeBonus(req.userId!);

      return res.json({ success: true, profile: updated, rewards: welcomeRewards });
    }

    return res.status(400).json({ error: 'INVALID_APPROACH', message: 'Approach must be GRADUAL or QUIT_DATE.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getTodayCheckIn = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { clientDate } = req.query;
    const todayStr = (clientDate as string) || new Date().toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00Z');

    const checkIn = await prisma.quitCheckIn.findUnique({
      where: { userId_date: { userId: req.userId!, date: today } }
    });

    res.json({ success: true, checkIn });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveCheckIn = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { clientDate, cigarettesSmoked, cravingPeak, cravingCount, mood, triggersHit, note, notes } = req.body;
    const todayStr = clientDate || new Date().toISOString().split('T')[0];
    const today = new Date(todayStr + 'T00:00:00Z');

    const safeCigarettes = Math.max(0, Number(cigarettesSmoked) || 0);
    const safeCraving = Math.max(0, Math.min(10, Number(cravingPeak) || Number(cravingCount) || 0));
    const safeMood = Math.max(1, Math.min(5, Number(mood) || 3));
    const noteContent = note || notes ? String(note || notes).slice(0, 500) : null;

    const checkIn = await prisma.quitCheckIn.upsert({
      where: { userId_date: { userId: req.userId!, date: today } },
      create: {
        userId: req.userId!,
        date: today,
        cigarettesSmoked: safeCigarettes,
        cravingPeak: safeCraving,
        mood: safeMood,
        triggersHit: triggersHit || [],
        note: noteContent
      },
      update: {
        cigarettesSmoked: safeCigarettes,
        cravingPeak: safeCraving,
        mood: safeMood,
        triggersHit: triggersHit || [],
        note: noteContent
      }
    });

    // Check crisis triggers without storing or analyzing note beyond keyword check
    const recentCheckIns = await prisma.quitCheckIn.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' },
      take: 2
    });

    const crisis = checkCrisisTriggers(recentCheckIns, noteContent || undefined);

    // Calculate current consecutive smoke-free days for reward multiplier
    const allUserCheckIns = await prisma.quitCheckIn.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' }
    });
    let consecutiveSmokeFree = 0;
    for (const ci of allUserCheckIns) {
      if (ci.cigarettesSmoked === 0) {
        consecutiveSmokeFree++;
      } else {
        break;
      }
    }

    // Award XP, check-in honesty bonuses, streak rewards, and boss damage
    const rewards = await awardCheckInRewards(
      req.userId!,
      safeCigarettes,
      todayStr,
      consecutiveSmokeFree
    );

    res.json({
      success: true,
      checkIn,
      rewards,
      hasCrisisAlert: crisis.hasCrisisAlert,
      crisisMessage: crisis.message || null,
      crisisAlert: {
        triggered: crisis.hasCrisisAlert,
        reasons: crisis.message ? [crisis.message] : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCheckInHistory = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const checkIns = await prisma.quitCheckIn.findMany({
      where: { userId: req.userId! },
      orderBy: { date: 'desc' }
    });

    res.json({ success: true, checkIns });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const startCraving = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { intensityBefore, intensity, toolUsed } = req.body;
    const safeIntensity = Math.max(0, Math.min(10, Number(intensityBefore) || Number(intensity) || 5));
    const safeTool = ['BREATHE', 'DELAY', 'WATER', 'DISTRACT', 'WALK'].includes(toolUsed)
      ? toolUsed
      : 'BREATHE';

    const craving = await prisma.quitCraving.create({
      data: {
        userId: req.userId!,
        intensityBefore: safeIntensity,
        toolUsed: safeTool,
        startedAt: new Date()
      }
    });

    res.json({ success: true, cravingId: craving.id, craving });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const endCraving = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { cravingId, intensityAfter, survived } = req.body;
    if (!cravingId) {
      return res.status(400).json({ error: 'CRAVING_ID_REQUIRED' });
    }

    const updated = await prisma.quitCraving.update({
      where: { id: cravingId },
      data: {
        intensityAfter: intensityAfter !== undefined ? Math.max(0, Math.min(10, Number(intensityAfter))) : null,
        survived: Boolean(survived),
        endedAt: new Date()
      }
    });

    let rewards = null;
    if (Boolean(survived)) {
      rewards = await awardCravingSurvivedReward(req.userId!);
    }

    const survivedCount = await prisma.quitCraving.count({
      where: { userId: req.userId!, survived: true }
    });

    res.json({
      success: true,
      craving: updated,
      cravingsSurvived: survivedCount,
      rewards
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const logLapse = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { cigarettes, unitsSmoked, trigger, note, notes } = req.body;
    const count = Math.max(1, Number(cigarettes) || Number(unitsSmoked) || 1);
    const lapseNote = note || notes ? String(note || notes).slice(0, 500) : null;

    const lapse = await prisma.quitLapse.create({
      data: {
        userId: req.userId!,
        cigarettes: count,
        trigger: trigger ? String(trigger).slice(0, 100) : null,
        note: lapseNote,
        occurredAt: new Date()
      }
    });

    // Check if user came back and record metric
    const { incrementDailyMetric } = require('../services/quitRewardEngine');
    await incrementDailyMetric('lapsesLogged', 1);

    res.json({
      success: true,
      lapse,
      message: 'A slip is information, not failure. Notice what prompted it, take a slow breath, and resume your path.'
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuitStats = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const [checkIns, cravings, lapses] = await Promise.all([
      prisma.quitCheckIn.findMany({ where: { userId: req.userId! }, orderBy: { date: 'desc' } }),
      prisma.quitCraving.findMany({ where: { userId: req.userId! } }),
      prisma.quitLapse.findMany({ where: { userId: req.userId! } })
    ]);

    const stats = calculateQuitStats(profile, checkIns, cravings, lapses);

    // Check savings milestone badges
    await checkSavingsBadges(req.userId!, stats.moneySavedInr);

    // Fetch all earned quit badges
    const earnedBadges = await prisma.quitBadge.findMany({
      where: { userId: req.userId! },
      orderBy: { earnedAt: 'asc' }
    });

    // Effective smoke-free streak with Streak Shield protection:
    // If user has a streakShieldCount > 0 and slipped yesterday, the shield absorbs 1 lapse
    let effectiveStreak = stats.smokeFreeStreak;
    let shieldApplied = false;
    if (effectiveStreak === 0 && profile.streakShieldCount > 0 && lapses.length > 0) {
      // Check if lapse was recent (within past 24-48 hours)
      const mostRecentLapse = lapses[0];
      const lapseAgeHours = (Date.now() - new Date(mostRecentLapse.occurredAt).getTime()) / (1000 * 60 * 60);
      if (lapseAgeHours <= 48) {
        effectiveStreak = Math.max(1, stats.smokeFreeDays);
        shieldApplied = true;
      }
    }

    // Provide friendly alias properties for UI
    const enrichedStats = {
      ...stats,
      streakDays: effectiveStreak,
      rawStreak: stats.smokeFreeStreak,
      shieldApplied,
      avoidedUnits: stats.totalAvoided,
      moneySaved: stats.moneySavedInr,
      hasPlan: Boolean(profile.approach)
    };

    res.json({
      success: true,
      stats: enrichedStats,
      badges: earnedBadges,
      allBadgeDefs: QUIT_BADGES,
      profile: {
        ...profile,
        hasConsented: profile.ageConfirmed18,
        isOver18: profile.ageConfirmed18,
        planMode: profile.approach === 'GRADUAL' ? 'TAPER' : profile.approach === 'QUIT_DATE' ? 'COLD_TURKEY' : null,
        targetQuitDate: profile.quitDate,
        dailyTarget: profile.approach === 'GRADUAL' && Array.isArray(profile.taperPlan) && profile.taperPlan.length > 0
          ? (profile.taperPlan[0] as any)?.dailyCap ?? 0
          : 0,
        taperDailyCaps: profile.approach === 'GRADUAL' && Array.isArray(profile.taperPlan)
          ? (profile.taperPlan as any[]).map(p => p.dailyCap)
          : []
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportQuitData = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.quitProfile.findUnique({
      where: { userId: req.userId! }
    });

    if (!profile) {
      return res.status(404).json({ error: 'NO_DATA_TO_EXPORT' });
    }

    const [checkIns, cravings, lapses] = await Promise.all([
      prisma.quitCheckIn.findMany({ where: { userId: req.userId! }, orderBy: { date: 'asc' } }),
      prisma.quitCraving.findMany({ where: { userId: req.userId! }, orderBy: { startedAt: 'asc' } }),
      prisma.quitLapse.findMany({ where: { userId: req.userId! }, orderBy: { occurredAt: 'asc' } })
    ]);

    res.json({
      exportTimestamp: new Date().toISOString(),
      disclaimer: 'This data was exported from EvolveAura Smoke-Free Path. It is private personal tracking data.',
      profile,
      checkIns,
      cravings,
      lapses
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteQuitData = async (req: AuthRequest, res: Response) => {
  try {
    const { confirm, confirmation } = req.body;
    const confirmVal = confirm || confirmation;
    if (confirmVal !== 'DELETE_MY_QUIT_DATA') {
      return res.status(400).json({
        error: 'CONFIRMATION_MISMATCH',
        message: 'Please type DELETE_MY_QUIT_DATA to permanently delete all cessation records.'
      });
    }

    const userId = req.userId!;

    const lapsesDeleted = await prisma.quitLapse.deleteMany({ where: { userId } });
    const cravingsDeleted = await prisma.quitCraving.deleteMany({ where: { userId } });
    const checkInsDeleted = await prisma.quitCheckIn.deleteMany({ where: { userId } });
    const profileDeleted = await prisma.quitProfile.deleteMany({ where: { userId } });

    res.json({
      success: true,
      deleted: {
        profile: profileDeleted.count,
        checkIns: checkInsDeleted.count,
        cravings: cravingsDeleted.count,
        lapses: lapsesDeleted.count
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSavingsGoal = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { item, amount } = req.body;
    const cleanItem = String(item || '').slice(0, 100);
    const cleanAmount = Math.max(1, Number(amount) || 0);

    const updated = await prisma.quitProfile.update({
      where: { userId: req.userId! },
      data: {
        savingsGoalItem: cleanItem,
        savingsGoalAmount: cleanAmount
      }
    });

    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReminders = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

    const { remindersEnabled, smokingTimeReminders, checkInReminderTime } = req.body;

    const updated = await prisma.quitProfile.update({
      where: { userId: req.userId! },
      data: {
        remindersEnabled: Boolean(remindersEnabled),
        smokingTimeReminders: smokingTimeReminders || [],
        checkInReminderTime: checkInReminderTime || '20:00'
      }
    });

    res.json({ success: true, profile: updated });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuitBoss = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await getValidatedQuitProfile(req.userId!);
    if (!profile) {
      return res.status(403).json({ error: 'CONSENT_REQUIRED', message: 'Informed consent is required.' });
    }

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
      where: { userId: req.userId!, bossId: boss.id },
      include: { boss: true }
    });

    if (!progress) {
      progress = await prisma.userBossProgress.create({
        data: {
          userId: req.userId!,
          bossId: boss.id,
          currentHP: boss.maxHP,
          selectedTier: 0
        },
        include: { boss: true }
      });
    }

    res.json({ success: true, bossProgress: progress });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getQuitPlatformMetrics = async (_req: any, res: Response) => {
  try {
    const totalUsersWithQuitProfile = await prisma.quitProfile.count({
      where: { ageConfirmed18: true }
    });

    // Only show numbers if total opted-in users >= 100 to prevent misleading/fake counters
    if (totalUsersWithQuitProfile < 100) {
      return res.json({
        hasSufficientData: false,
        message: 'Metrics will be published once opted-in community exceeds 100 participants.'
      });
    }

    const aggregates = await prisma.quitMetricDaily.aggregate({
      _sum: {
        newStarts: true,
        checkInsCount: true,
        cravingsSurvived: true,
        lapsesLogged: true
      }
    });

    res.json({
      hasSufficientData: true,
      totalUsers: totalUsersWithQuitProfile,
      totalStarts: aggregates._sum.newStarts || 0,
      totalCheckIns: aggregates._sum.checkInsCount || 0,
      totalCravingsSurvived: aggregates._sum.cravingsSurvived || 0
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export interface FtndResult {
  score: number;
  band: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  label: string;
  description: string;
  isChainSmoker: boolean;
}

export function calculateFtndScore(answers: number[]): number {
  if (!answers || answers.length < 6) return 0;
  // Item 1: 0-3, Item 2: 0-1, Item 3: 0-1, Item 4: 0-3, Item 5: 0-1, Item 6: 0-1
  const score = answers.slice(0, 6).reduce((sum, val) => sum + (Number(val) || 0), 0);
  return Math.min(10, Math.max(0, score));
}

export function getFtndBand(score: number): {
  band: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  label: string;
  description: string;
} {
  if (score <= 2) {
    return {
      band: 'VERY_LOW',
      label: 'Very Low Dependence',
      description: 'Your body has a lower physical dependence on nicotine. Behavioural habit changes can be especially effective.'
    };
  }
  if (score <= 4) {
    return {
      band: 'LOW',
      label: 'Low Dependence',
      description: 'You have mild physical dependence. Identifying daily triggers and replacing smoking routines will be key.'
    };
  }
  if (score === 5) {
    return {
      band: 'MEDIUM',
      label: 'Medium Dependence',
      description: 'You experience moderate physical dependence. A structured plan and regular check-ins will help you build momentum.'
    };
  }
  if (score <= 7) {
    return {
      band: 'HIGH',
      label: 'High Dependence',
      description: 'You have high physical dependence on nicotine. Consider pairing this digital plan with medical guidance from a Tobacco Cessation Centre.'
    };
  }
  return {
    band: 'VERY_HIGH',
    label: 'Very High Dependence',
    description: 'You have very high physical dependence. Support from a doctor or a Tobacco Cessation Centre is strongly recommended alongside your daily tracking.'
  };
}

export function checkChainSmoker(timeToFirstMins: number, cigarettesPerDay: number): boolean {
  // First cigarette within 5 minutes + 20+ cigarettes per day
  return timeToFirstMins <= 5 && cigarettesPerDay >= 20;
}

export interface TaperDay {
  day: number;
  dateStr: string;
  dailyCap: number;
}

export interface TaperPlanResult {
  weeks: number;
  totalDays: number;
  plan: TaperDay[];
}

export function generateTaperPlan(baselineCpd: number, weeks: number, start: Date = new Date()): TaperPlanResult {
  const safeWeeks = Math.max(2, Math.min(6, Math.round(weeks || 4)));
  const totalDays = safeWeeks * 7;
  const startMs = new Date(start.toISOString().split('T')[0] + 'T00:00:00Z').getTime();

  const plan: TaperDay[] = [];
  const cpd = Math.max(1, Math.round(baselineCpd));

  for (let i = 0; i < totalDays; i++) {
    const dayNum = i + 1;
    const currentMs = startMs + i * 24 * 60 * 60 * 1000;
    const dateStr = new Date(currentMs).toISOString().split('T')[0];

    // Linear reduction: from baseline on day 1 to 0 on final day
    // Fraction remaining decreases from 1 to 0
    const fraction = Math.max(0, (totalDays - dayNum) / (totalDays - 1));
    const dailyCap = dayNum === totalDays ? 0 : Math.max(0, Math.round(cpd * fraction));

    plan.push({
      day: dayNum,
      dateStr,
      dailyCap
    });
  }

  // Ensure last day is strictly 0 and daily caps never negative
  plan[plan.length - 1].dailyCap = 0;

  return {
    weeks: safeWeeks,
    totalDays,
    plan
  };
}

export function validateQuitDate(quitDateInput: Date | string, now: Date = new Date()): { valid: boolean; error?: string } {
  const target = new Date(typeof quitDateInput === 'string' ? quitDateInput + 'T00:00:00Z' : quitDateInput);
  if (isNaN(target.getTime())) {
    return { valid: false, error: 'Invalid quit date format.' };
  }

  const todayStr = now.toISOString().split('T')[0];
  const today = new Date(todayStr + 'T00:00:00Z');
  const maxDate = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);

  if (target.getTime() < today.getTime()) {
    return { valid: false, error: 'Quit date cannot be in the past.' };
  }
  if (target.getTime() > maxDate.getTime()) {
    return { valid: false, error: 'Quit date must be within 14 days from today.' };
  }

  return { valid: true };
}

export interface QuitStatsResult {
  daysSinceStart: number;
  totalCheckIns: number;
  checkInConsistency: number;
  smokeFreeDays: number;
  smokeFreeStreak: number;
  totalAvoided: number;
  moneySavedInr: number;
  cravingsSurvived: number;
  totalCravings: number;
  totalLapses: number;
  hasCrisisAlert: boolean;
}

export function calculateQuitStats(
  profile: {
    cigarettesPerDay: number | null;
    costPerPackInr: number | null;
    cigarettesPerPack: number;
    startedAt: Date;
    consentAt: Date;
  },
  checkIns: {
    date: Date;
    cigarettesSmoked: number;
    mood: number;
    note: string | null;
  }[],
  cravings: {
    survived: boolean | null;
  }[],
  lapses: {
    cigarettes: number;
  }[]
): QuitStatsResult {
  const baselineCpd = profile.cigarettesPerDay || 0;
  const costPerPack = profile.costPerPackInr || 0;
  const cPerPack = profile.cigarettesPerPack || 20;
  const costPerCig = cPerPack > 0 ? costPerPack / cPerPack : 0;

  const startDate = profile.startedAt || profile.consentAt || new Date();
  const startMs = new Date(startDate).setHours(0, 0, 0, 0);
  const nowMs = new Date().setHours(0, 0, 0, 0);
  const diffDays = Math.max(1, Math.floor((nowMs - startMs) / (24 * 60 * 60 * 1000)) + 1);

  const totalCheckIns = checkIns.length;
  const checkInConsistency = Math.min(100, Math.round((totalCheckIns / diffDays) * 100));

  let totalAvoided = 0;
  let smokeFreeDays = 0;

  // Sort check-ins by date descending for streak calculation
  const sortedDesc = [...checkIns].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  for (const ci of checkIns) {
    if (ci.cigarettesSmoked === 0) {
      smokeFreeDays++;
    }
    const avoided = Math.max(0, baselineCpd - ci.cigarettesSmoked);
    totalAvoided += avoided;
  }

  const moneySavedInr = Math.round(totalAvoided * costPerCig);

  // Smoke-free streak: consecutive days with 0 cigarettes counting backwards from today
  let smokeFreeStreak = 0;
  for (const ci of sortedDesc) {
    if (ci.cigarettesSmoked === 0) {
      smokeFreeStreak++;
    } else {
      break;
    }
  }

  const cravingsSurvived = cravings.filter(c => c.survived === true).length;
  const totalCravings = cravings.length;
  const totalLapses = lapses.length;

  const crisisCheck = checkCrisisTriggers(checkIns);

  return {
    daysSinceStart: diffDays,
    totalCheckIns,
    checkInConsistency,
    smokeFreeDays,
    smokeFreeStreak,
    totalAvoided,
    moneySavedInr,
    cravingsSurvived,
    totalCravings,
    totalLapses,
    hasCrisisAlert: crisisCheck.hasCrisisAlert
  };
}

const CRISIS_KEYWORDS = [
  'hopeless',
  "can't go on",
  'cant go on',
  'want to die',
  'suicide',
  'end my life',
  'end it all',
  'give up on life',
  'worthless',
  'no reason to live'
];

export function checkCrisisTriggers(
  checkIns: { mood: number; note: string | null }[],
  currentNote?: string
): { hasCrisisAlert: boolean; message?: string } {
  // 1. Keyword check in note
  if (currentNote) {
    const lower = currentNote.toLowerCase();
    for (const kw of CRISIS_KEYWORDS) {
      if (lower.includes(kw)) {
        return {
          hasCrisisAlert: true,
          message: 'Support is available right now. You are not alone.'
        };
      }
    }
  }

  // 2. Check mood 1 for two consecutive check-ins
  if (checkIns.length >= 2) {
    const recent = checkIns.slice(0, 2);
    if (recent[0].mood === 1 && recent[1].mood === 1) {
      return {
        hasCrisisAlert: true,
        message: 'Your check-ins show you have been having a tough time. Reach out for caring support.'
      };
    }
  }

  // Check latest check-in note if present
  if (checkIns.length > 0 && checkIns[0].note) {
    const lower = checkIns[0].note.toLowerCase();
    for (const kw of CRISIS_KEYWORDS) {
      if (lower.includes(kw)) {
        return {
          hasCrisisAlert: true,
          message: 'Support is available right now. You are not alone.'
        };
      }
    }
  }

  return { hasCrisisAlert: false };
}

import prisma from '../config/db';

export const checkFatigue = async (userId: string) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return false;

    const now = new Date();
    
    // If fatigue is active but the time has expired, reset it automatically
    if (profile.fatigueActive && profile.fatigueEndsAt && now > new Date(profile.fatigueEndsAt)) {
      await prisma.profile.update({
        where: { userId },
        data: {
          fatigueActive: false,
          fatigueEndsAt: null
        }
      });
      return false;
    }

    if (profile.fatigueActive) return true;

    // Check 1: 3 high-tier tasks completed in past 12 hours
    const twelveHoursAgo = new Date(Date.now() - 12 * 60 * 60 * 1000);
    const highTierCount = await prisma.userQuest.count({
      where: {
        userId,
        completed: true,
        isHighTier: true,
        completedAt: { gte: twelveHoursAgo }
      }
    });

    // Check 2: Focus minutes today >= 240 mins (4 hours)
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const focusQuests = await prisma.userQuest.findMany({
      where: {
        userId,
        completed: true,
        completedAt: { gte: todayStart },
        quest: { verificationType: 'TIMER' }
      },
      include: { quest: true }
    });

    let focusMinutes = 0;
    focusQuests.forEach(uq => {
      if (uq.timerStartedAt && uq.completedAt) {
        const diffMs = uq.completedAt.getTime() - uq.timerStartedAt.getTime();
        focusMinutes += Math.round(diffMs / 60000);
      } else {
        focusMinutes += 25; // default
      }
    });

    if (highTierCount >= 3 || focusMinutes >= 240) {
      await prisma.profile.update({
        where: { userId },
        data: {
          fatigueActive: true,
          fatigueEndsAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
        }
      });
      return true;
    }
  } catch (e) {
    console.error('Failed checking fatigue:', e);
  }
  return false;
};

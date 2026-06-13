export interface XPDetails {
  level: number;
  xp: number;
  xpAdded: number;
  xpRequired: number;
  leveledUp: boolean;
}

export function getXPRequiredForLevel(level: number): number {
  return Math.round(100 * Math.pow(level, 1.5));
}

export function processXPGain(currentLevel: number, currentXP: number, xpGained: number): XPDetails {
  let level = currentLevel;
  let xp = currentXP + xpGained;
  let xpRequired = getXPRequiredForLevel(level);
  let leveledUp = false;

  while (xp >= xpRequired) {
    xp -= xpRequired;
    level += 1;
    xpRequired = getXPRequiredForLevel(level);
    leveledUp = true;
  }

  return { level, xp, xpAdded: xpGained, xpRequired, leveledUp };
}

export function updateStreak(lastActiveAt: Date, currentStreak: number): { streak: number, streakUpdated: boolean } {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastActiveAt.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays <= 1) {
    const wasYesterday = now.getDate() !== lastActiveAt.getDate();
    if (wasYesterday) {
      return { streak: currentStreak + 1, streakUpdated: true };
    }
    return { streak: currentStreak, streakUpdated: false };
  } else {
    return { streak: 1, streakUpdated: true };
  }
}

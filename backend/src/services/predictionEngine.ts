export function predict30DayGrowth(
  currentLevel: number,
  currentXP: number,
  consistencyRate: number
) {
  const dailyXPGain = Math.round((4 * 50 + 50) * consistencyRate);
  let level = currentLevel;
  let xp = currentXP;
  const history: { day: number; level: number; xp: number }[] = [];

  for (let day = 1; day <= 30; day++) {
    xp += dailyXPGain;
    let required = Math.round(100 * Math.pow(level, 1.5));
    while (xp >= required) {
      xp -= required;
      level += 1;
      required = Math.round(100 * Math.pow(level, 1.5));
    }
    if (day % 5 === 0) {
      history.push({ day, level, xp });
    }
  }

  return {
    projectedLevel: level,
    projectedXP: xp,
    history,
    summary: `At a consistency rate of ${Math.round(consistencyRate * 100)}%, you are projected to reach Level ${level} in 30 days. Maintain your streak!`
  };
}

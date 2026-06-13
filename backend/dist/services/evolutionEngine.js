"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getXPRequiredForLevel = getXPRequiredForLevel;
exports.processXPGain = processXPGain;
exports.updateStreak = updateStreak;
function getXPRequiredForLevel(level) {
    return Math.round(100 * Math.pow(level, 1.5));
}
function processXPGain(currentLevel, currentXP, xpGained) {
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
function updateStreak(lastActiveAt, currentStreak) {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastActiveAt.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays <= 1) {
        const wasYesterday = now.getDate() !== lastActiveAt.getDate();
        if (wasYesterday) {
            return { streak: currentStreak + 1, streakUpdated: true };
        }
        return { streak: currentStreak, streakUpdated: false };
    }
    else {
        return { streak: 1, streakUpdated: true };
    }
}

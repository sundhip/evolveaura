"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRank = getRank;
exports.getRankDescription = getRankDescription;
function getRank(score) {
    if (score >= 96)
        return 'S';
    if (score >= 81)
        return 'A';
    if (score >= 61)
        return 'B';
    if (score >= 41)
        return 'C';
    if (score >= 21)
        return 'D';
    return 'E';
}
function getRankDescription(rank) {
    switch (rank) {
        case 'S': return 'Ethereal Being - You have mastered self-regulation and possess a legendary aura.';
        case 'A': return 'Aura Master - Highly disciplined and consistent across all aspects of life.';
        case 'B': return 'Aura Adept - Showing strong progress, close to unlocking full potential.';
        case 'C': return 'Aura Initiate - Stabilized daily routines, starting to overcome scrolling habit.';
        case 'D': return 'Novice - Struggle with distractions, beginning your evolution.';
        case 'E': return 'Tethered - Addicted to instant gratification. Ready to break the chains.';
        default: return 'Novice';
    }
}

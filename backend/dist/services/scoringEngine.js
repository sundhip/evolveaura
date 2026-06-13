"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculatePathScores = calculatePathScores;
exports.calculateAuraScore = calculateAuraScore;
function calculatePathScores(answers) {
    let scholarSum = 0;
    let warriorSum = 0;
    let sageSum = 0;
    let creatorSum = 0;
    for (let i = 1; i <= 48; i++) {
        const val = answers[`q${i}`] || 3;
        if (i <= 12)
            scholarSum += val;
        else if (i <= 24)
            warriorSum += val;
        else if (i <= 36)
            sageSum += val;
        else
            creatorSum += val;
    }
    const normalize = (sum) => Math.round(((sum - 12) / 48) * 100);
    return {
        scholar: normalize(scholarSum),
        warrior: normalize(warriorSum),
        sage: normalize(sageSum),
        creator: normalize(creatorSum)
    };
}
function calculateAuraScore(scores) {
    return Math.round((scores.scholar + scores.warrior + scores.sage + scores.creator) / 4);
}

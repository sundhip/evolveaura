"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDetoxScore = calculateDetoxScore;
function calculateDetoxScore(metrics) {
    const productiveSeconds = metrics.studyTimeSeconds +
        metrics.exerciseTimeSeconds +
        metrics.mindfulnessTimeSeconds +
        metrics.creationTimeSeconds;
    const totalTime = productiveSeconds + metrics.screenTimeSeconds;
    if (totalTime === 0)
        return 50;
    const weightedScreenTime = 0.6 * metrics.screenTimeSeconds;
    const score = (productiveSeconds / (productiveSeconds + weightedScreenTime)) * 100;
    return Math.min(100, Math.max(10, Math.round(score)));
}

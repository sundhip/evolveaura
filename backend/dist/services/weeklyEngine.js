"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateWeeklyReport = generateWeeklyReport;
function generateWeeklyReport(days) {
    const totalDays = days.length;
    if (totalDays === 0)
        return { averageDetoxScore: 50, focusMinutes: 0, questsCompleted: 0 };
    const sumDetox = days.reduce((acc, d) => acc + d.detoxScore, 0);
    const sumQuests = days.reduce((acc, d) => acc + d.questsCompleted, 0);
    const sumStudy = days.reduce((acc, d) => acc + d.studySeconds, 0);
    return {
        averageDetoxScore: Math.round(sumDetox / totalDays),
        focusMinutes: Math.round(sumStudy / 60),
        questsCompleted: sumQuests
    };
}

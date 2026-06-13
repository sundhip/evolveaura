"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWeeklyReportAPI = exports.getGrowthPrediction = exports.getDashboardInsight = void 0;
const db_1 = __importDefault(require("../config/db"));
const insightEngine_1 = require("../services/insightEngine");
const predictionEngine_1 = require("../services/predictionEngine");
const weeklyEngine_1 = require("../services/weeklyEngine");
const getDashboardInsight = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.userId },
            include: { profile: true }
        });
        if (!user || !user.profile)
            return res.status(404).json({ error: 'Profile not found' });
        const assessment = await db_1.default.assessment.findFirst({
            where: { userId: req.userId },
            orderBy: { completedAt: 'desc' }
        });
        const bottleneck = assessment ? assessment.auraRank : 'Focus';
        const insight = (0, insightEngine_1.getDailyInsight)(user.profile.role, user.profile.primaryGoal, bottleneck, user.profile.currentStreak);
        res.json({ insight });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDashboardInsight = getDashboardInsight;
const getGrowthPrediction = async (req, res) => {
    try {
        const profile = await db_1.default.profile.findUnique({ where: { userId: req.userId } });
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        const userQuests = await db_1.default.userQuest.findMany({ where: { userId: req.userId } });
        const completed = userQuests.filter(q => q.completed).length;
        const total = userQuests.length;
        const consistencyRate = total > 0 ? completed / total : 0.75; // default 75% consistency
        const prediction = (0, predictionEngine_1.predict30DayGrowth)(profile.currentLevel, profile.currentXP, consistencyRate);
        res.json(prediction);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getGrowthPrediction = getGrowthPrediction;
const getWeeklyReportAPI = async (req, res) => {
    try {
        const today = new Date();
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(today.getDate() - 7);
        const metrics = await db_1.default.detoxMetric.findMany({
            where: { userId: req.userId, date: { gte: sevenDaysAgo } }
        });
        const quests = await db_1.default.userQuest.findMany({
            where: { userId: req.userId, date: { gte: sevenDaysAgo } }
        });
        const days = metrics.map(m => {
            const dayQuests = quests.filter(q => q.date.toISOString().split('T')[0] === m.date.toISOString().split('T')[0]);
            return {
                date: m.date,
                detoxScore: m.detoxScore,
                questsCompleted: dayQuests.filter(q => q.completed).length,
                studySeconds: m.studyTimeSeconds
            };
        });
        const report = (0, weeklyEngine_1.generateWeeklyReport)(days);
        res.json(report);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getWeeklyReportAPI = getWeeklyReportAPI;

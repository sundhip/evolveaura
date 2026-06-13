"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDetoxHistory = exports.logDetox = void 0;
const db_1 = __importDefault(require("../config/db"));
const detoxEngine_1 = require("../services/detoxEngine");
const logDetox = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = new Date(todayStr);
        const { screenTimeSeconds, studyTimeSeconds, exerciseTimeSeconds, mindfulnessTimeSeconds, creationTimeSeconds } = req.body;
        const existingMetric = await db_1.default.detoxMetric.findUnique({
            where: { userId_date: { userId: req.userId, date: today } }
        });
        const metrics = {
            screenTimeSeconds: screenTimeSeconds || existingMetric?.screenTimeSeconds || 0,
            studyTimeSeconds: studyTimeSeconds || existingMetric?.studyTimeSeconds || 0,
            exerciseTimeSeconds: exerciseTimeSeconds || existingMetric?.exerciseTimeSeconds || 0,
            mindfulnessTimeSeconds: mindfulnessTimeSeconds || existingMetric?.mindfulnessTimeSeconds || 0,
            creationTimeSeconds: creationTimeSeconds || existingMetric?.creationTimeSeconds || 0
        };
        const detoxScore = (0, detoxEngine_1.calculateDetoxScore)(metrics);
        const log = await db_1.default.detoxMetric.upsert({
            where: { userId_date: { userId: req.userId, date: today } },
            update: { ...metrics, detoxScore },
            create: { userId: req.userId, date: today, ...metrics, detoxScore }
        });
        res.json(log);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.logDetox = logDetox;
const getDetoxHistory = async (req, res) => {
    try {
        const history = await db_1.default.detoxMetric.findMany({
            where: { userId: req.userId },
            orderBy: { date: 'asc' },
            take: 30
        });
        res.json(history);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDetoxHistory = getDetoxHistory;

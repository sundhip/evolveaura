"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestAssessment = exports.submitAssessment = void 0;
const db_1 = __importDefault(require("../config/db"));
const scoringEngine_1 = require("../services/scoringEngine");
const rankEngine_1 = require("../services/rankEngine");
const bottleneckEngine_1 = require("../services/bottleneckEngine");
const submitAssessment = async (req, res) => {
    try {
        const { answers } = req.body; // { q1: 5, q2: 4, ... }
        if (!answers || Object.keys(answers).length < 48) {
            return res.status(400).json({ error: 'All 48 answers are required' });
        }
        const pathScores = (0, scoringEngine_1.calculatePathScores)(answers);
        const auraScore = (0, scoringEngine_1.calculateAuraScore)(pathScores);
        const auraRank = (0, rankEngine_1.getRank)(auraScore);
        const bottlenecks = (0, bottleneckEngine_1.detectBottleneck)(answers);
        const assessment = await db_1.default.assessment.create({
            data: {
                userId: req.userId,
                answers,
                scholarScore: pathScores.scholar,
                warriorScore: pathScores.warrior,
                sageScore: pathScores.sage,
                creatorScore: pathScores.creator,
                auraScore,
                auraRank
            }
        });
        // Update User Profile
        await db_1.default.profile.update({
            where: { userId: req.userId },
            data: {
                auraScore,
                auraRank,
                title: `Aura ${auraRank} Initiate`
            }
        });
        res.status(201).json({ assessment, bottlenecks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.submitAssessment = submitAssessment;
const getLatestAssessment = async (req, res) => {
    try {
        const assessment = await db_1.default.assessment.findFirst({
            where: { userId: req.userId },
            orderBy: { completedAt: 'desc' }
        });
        if (!assessment)
            return res.status(404).json({ error: 'No assessments found' });
        const bottlenecks = (0, bottleneckEngine_1.detectBottleneck)(assessment.answers);
        res.json({ assessment, bottlenecks });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getLatestAssessment = getLatestAssessment;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalysis = exports.upsertSubject = exports.getSubjects = void 0;
const db_1 = __importDefault(require("../config/db"));
const subjectEngine_1 = require("../services/subjectEngine");
const getSubjects = async (req, res) => {
    try {
        const subjects = await db_1.default.subjectScore.findMany({ where: { userId: req.userId } });
        res.json(subjects);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getSubjects = getSubjects;
const upsertSubject = async (req, res) => {
    try {
        const { subjectName, understanding, retention, problemSolving, confidence } = req.body;
        if (!subjectName)
            return res.status(400).json({ error: 'subjectName is required' });
        const subject = await db_1.default.subjectScore.upsert({
            where: { userId_subjectName: { userId: req.userId, subjectName } },
            update: { understanding, retention, problemSolving, confidence },
            create: { userId: req.userId, subjectName, understanding, retention, problemSolving, confidence }
        });
        res.json(subject);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.upsertSubject = upsertSubject;
const getAnalysis = async (req, res) => {
    try {
        const subjects = await db_1.default.subjectScore.findMany({ where: { userId: req.userId } });
        if (subjects.length === 0)
            return res.json({ weakestSubject: null, recommendations: [] });
        const analyzed = subjects.map(s => {
            const health = (0, subjectEngine_1.calculateSubjectHealth)(s);
            const recommendation = (0, subjectEngine_1.getSubjectRecommendation)(s.subjectName, s);
            return { ...s, health, recommendation };
        });
        analyzed.sort((a, b) => a.health - b.health);
        res.json({
            weakestSubject: analyzed[0],
            subjects: analyzed
        });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getAnalysis = getAnalysis;

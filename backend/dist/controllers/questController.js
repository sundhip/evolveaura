"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.completeQuest = exports.getDailyQuests = void 0;
const db_1 = __importDefault(require("../config/db"));
const questEngine_1 = require("../services/questEngine");
const evolutionEngine_1 = require("../services/evolutionEngine");
const getDailyQuests = async (req, res) => {
    try {
        const todayStr = new Date().toISOString().split('T')[0];
        const today = new Date(todayStr);
        let userQuests = await db_1.default.userQuest.findMany({
            where: { userId: req.userId, date: today },
            include: { quest: true }
        });
        if (userQuests.length === 0) {
            // Fetch user profile scores
            const profile = await db_1.default.profile.findUnique({ where: { userId: req.userId } });
            const lastAssessment = await db_1.default.assessment.findFirst({
                where: { userId: req.userId },
                orderBy: { completedAt: 'desc' }
            });
            const pathScores = lastAssessment ? {
                scholar: lastAssessment.scholarScore,
                warrior: lastAssessment.warriorScore,
                sage: lastAssessment.sageScore,
                creator: lastAssessment.creatorScore
            } : { scholar: 50, warrior: 50, sage: 50, creator: 50 };
            // Generate
            const templates = (0, questEngine_1.selectQuestsForUser)(pathScores);
            // Save and map
            userQuests = [];
            for (const temp of templates) {
                let quest = await db_1.default.quest.findFirst({ where: { title: temp.title } });
                if (!quest) {
                    quest = await db_1.default.quest.create({ data: temp });
                }
                const uq = await db_1.default.userQuest.create({
                    data: {
                        userId: req.userId,
                        questId: quest.id,
                        date: today
                    },
                    include: { quest: true }
                });
                userQuests.push(uq);
            }
        }
        res.json(userQuests);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getDailyQuests = getDailyQuests;
const completeQuest = async (req, res) => {
    try {
        const { userQuestId } = req.params;
        const userQuest = await db_1.default.userQuest.findUnique({
            where: { id: userQuestId },
            include: { quest: true, user: { include: { profile: true } } }
        });
        if (!userQuest)
            return res.status(404).json({ error: 'Quest not found' });
        if (userQuest.completed)
            return res.status(400).json({ error: 'Quest already completed' });
        // Mark completed
        const updatedUserQuest = await db_1.default.userQuest.update({
            where: { id: userQuestId },
            data: { completed: true, completedAt: new Date() }
        });
        // XP Logic
        const profile = userQuest.user.profile;
        const xpReward = userQuest.quest.xpReward;
        const xpDetails = (0, evolutionEngine_1.processXPGain)(profile.currentLevel, profile.currentXP, xpReward);
        await db_1.default.profile.update({
            where: { userId: req.userId },
            data: {
                currentLevel: xpDetails.level,
                currentXP: xpDetails.xp,
                currentStreak: { increment: 1 },
                lastActiveAt: new Date()
            }
        });
        await db_1.default.xPLog.create({
            data: {
                userId: req.userId,
                xpGained: xpReward,
                source: `Quest Completion: ${userQuest.quest.title}`
            }
        });
        // Check achievement unlock
        const unlockedAchievements = [];
        const achievements = await db_1.default.achievement.findMany();
        for (const ach of achievements) {
            const alreadyUnlocked = await db_1.default.userAchievement.findUnique({
                where: { userId_achievementId: { userId: req.userId, achievementId: ach.id } }
            });
            if (alreadyUnlocked)
                continue;
            let meetsRequirement = false;
            if (ach.requirementType === 'streak' && profile.currentStreak + 1 >= ach.requirementValue) {
                meetsRequirement = true;
            }
            else if (ach.requirementType === 'level' && xpDetails.level >= ach.requirementValue) {
                meetsRequirement = true;
            }
            if (meetsRequirement) {
                const ua = await db_1.default.userAchievement.create({
                    data: { userId: req.userId, achievementId: ach.id },
                    include: { achievement: true }
                });
                unlockedAchievements.push(ua.achievement);
            }
        }
        res.json({ userQuest: updatedUserQuest, xpDetails, unlockedAchievements });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.completeQuest = completeQuest;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const questController_1 = require("../controllers/questController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get('/daily', authMiddleware_1.authenticateToken, questController_1.getDailyQuests);
router.post('/complete/:userQuestId', authMiddleware_1.authenticateToken, questController_1.completeQuest);
exports.default = router;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const assessmentController_1 = require("../controllers/assessmentController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/submit', authMiddleware_1.authenticateToken, assessmentController_1.submitAssessment);
router.get('/latest', authMiddleware_1.authenticateToken, assessmentController_1.getLatestAssessment);
exports.default = router;

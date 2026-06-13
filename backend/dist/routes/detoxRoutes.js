"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const detoxController_1 = require("../controllers/detoxController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.post('/log', authMiddleware_1.authenticateToken, detoxController_1.logDetox);
router.get('/history', authMiddleware_1.authenticateToken, detoxController_1.getDetoxHistory);
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const assessmentRoutes_1 = __importDefault(require("./routes/assessmentRoutes"));
const questRoutes_1 = __importDefault(require("./routes/questRoutes"));
const subjectRoutes_1 = __importDefault(require("./routes/subjectRoutes"));
const detoxRoutes_1 = __importDefault(require("./routes/detoxRoutes"));
const analysisRoutes_1 = __importDefault(require("./routes/analysisRoutes"));
const errorMiddleware_1 = require("./middleware/errorMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/assessment', assessmentRoutes_1.default);
app.use('/api/quests', questRoutes_1.default);
app.use('/api/subjects', subjectRoutes_1.default);
app.use('/api/detox', detoxRoutes_1.default);
app.use('/api/analysis', analysisRoutes_1.default);
// Base route
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Error handling
app.use(errorMiddleware_1.errorHandler);
app.listen(PORT, () => {
    console.log(`[EvolveAura Backend] Server running on port ${PORT}`);
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const register = async (req, res) => {
    try {
        const { email, password, name, age, role, academicDetails, primaryGoal } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        const existingUser = await db_1.default.user.findUnique({ where: { email } });
        if (existingUser)
            return res.status(400).json({ error: 'User already exists' });
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const user = await db_1.default.user.create({
            data: {
                email,
                passwordHash,
                profile: {
                    create: {
                        name,
                        age: age ? parseInt(age) : 18,
                        role: role || 'Professional',
                        academicDetails: academicDetails || {},
                        primaryGoal: primaryGoal || 'Balanced Growth'
                    }
                }
            },
            include: { profile: true }
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await db_1.default.user.findUnique({ where: { email }, include: { profile: true } });
        if (!user)
            return res.status(400).json({ error: 'Invalid credentials' });
        const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(400).json({ error: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, profile: user.profile } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const user = await db_1.default.user.findUnique({
            where: { id: req.userId },
            include: { profile: true, achievements: { include: { achievement: true } } }
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const { name, role, academicDetails, primaryGoal } = req.body;
        const profile = await db_1.default.profile.update({
            where: { userId: req.userId },
            data: { name, role, academicDetails, primaryGoal }
        });
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;

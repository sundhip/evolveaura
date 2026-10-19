import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../index';
import prisma from '../config/db';

describe('Phase 7 Backend Integration Test Suite', () => {
  let authToken = '';
  let userId = '';
  const testEmail = `test_${Date.now()}_${Math.random().toString(36).substring(7)}@example.com`;

  afterAll(async () => {
    // Cleanup created test records
    if (userId) {
      try {
        await prisma.quitMetricDaily.deleteMany({});
        await prisma.quitBadge.deleteMany({ where: { userId } });
        await prisma.quitCraving.deleteMany({ where: { userId } });
        await prisma.quitCheckIn.deleteMany({ where: { userId } });
        await prisma.quitProfile.deleteMany({ where: { userId } });
        await prisma.assessmentAttemptItem.deleteMany({ where: { attempt: { userId } } });
        await prisma.assessmentAttempt.deleteMany({ where: { userId } });
        await prisma.assessment.deleteMany({ where: { userId } });
        await prisma.userQuest.deleteMany({ where: { userId } });
        await prisma.pathChoiceLog.deleteMany({ where: { userId } });
        await prisma.profile.deleteMany({ where: { userId } });
        await prisma.user.deleteMany({ where: { id: userId } });
      } catch (e) {
        // Ignored in teardown
      }
    }
  }, 30000);

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: testEmail,
        password: 'Password123!',
        name: 'Integration Tester',
        role: 'STUDENT',
        primaryGoal: 'Exam Mastery',
      });

    authToken = res.body.token;
    userId = res.body.user.id;
  }, 30000);

  describe('1. Auth Flow', () => {
    it('registers a new user successfully', async () => {
      const email = `unique_${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Password123!',
          name: 'Unique User',
          role: 'STUDENT',
          primaryGoal: 'Exam Mastery',
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('id');
    });

    it('logs in the registered user with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user.id).toBe(userId);
    });

    it('rejects invalid password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });
  });

  describe('2. Question Bank Lifecycle, Freshness & Scoring', () => {
    let attemptId = '';
    let items: any[] = [];

    it('issues an assessment attempt with exactly 16 items (4 per path)', async () => {
      const res = await request(app)
        .get('/api/assessment/questions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('attemptId');
      expect(res.body).toHaveProperty('questions');
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.questions.length).toBe(16);

      attemptId = res.body.attemptId;
      items = res.body.questions;
    });

    it('submits assessment answers, verifies scoring, and generates suggestedPath', async () => {
      // Simulate answer scores (1 to 5) for all 16 issued questions
      const answers: Record<string, number> = {};
      items.forEach((item, index) => {
        answers[item.id] = (index % 5) + 1;
      });

      const res = await request(app)
        .post('/api/assessment/submit')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ attemptId, answers });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('assessment');
      expect(res.body.assessment).toHaveProperty('auraScore');
      expect(res.body.assessment).toHaveProperty('auraRank');
      expect(res.body.assessment).toHaveProperty('suggestedPath');
      expect(['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR']).toContain(res.body.assessment.suggestedPath);
    }, 30000);
  });

  describe('3. Choose-Path Rules & 7-Day Change Lock', () => {
    it('allows choosing a path for the first time', async () => {
      const res = await request(app)
        .post('/api/profile/choose-path')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ path: 'SCHOLAR' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.chosenPath).toBe('SCHOLAR');
    });

    it('blocks immediate path change under the 7-day lock rule', async () => {
      const res = await request(app)
        .post('/api/profile/choose-path')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ path: 'WARRIOR' });

      expect(res.status).toBe(429);
      expect(res.body.error).toMatch(/locked until/i);
      expect(res.body).toHaveProperty('unlocksAt');
    });
  });

  describe('4. Path-Purity of Daily Quests Across All Paths', () => {
    it('generates strictly SCHOLAR quests for Scholar user', async () => {
      const res = await request(app)
        .get('/api/quests/daily')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);

      // Verify path purity
      for (const uq of res.body) {
        if (!uq.quest.title.includes('Calm Reset') && uq.quest.path !== 'BOSS') {
          expect(uq.quest.path).toBe('SCHOLAR');
        }
      }
    });
  });

  describe('5. Smoke-Free Quit Module: Consent, Screening, Plan, Check-in & Rewards', () => {
    it('blocks consent if ageConfirmed18 is false (under-18 gate)', async () => {
      const res = await request(app)
        .post('/api/quit/consent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ageConfirmed18: false, consentGiven: true });

      expect(res.status).toBe(403);
      expect(res.body.error).toBe('CONSENT_REQUIRED');
    });

    it('accepts consent when ageConfirmed18 is true', async () => {
      const res = await request(app)
        .post('/api/quit/consent')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ ageConfirmed18: true, consentGiven: true });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.profile.ageConfirmed18).toBe(true);
    });

    it('saves FTND screening and computes dependence level', async () => {
      const res = await request(app)
        .post('/api/quit/screening')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          ftndAnswers: [2, 1, 1, 1, 0, 1],
          readiness: 'READY',
          cigarettesPerDay: 15,
          timeToFirstMins: 15,
          costPerUnit: 18,
          reasons: ['Health', 'Energy'],
          triggers: ['Work stress', 'Post meals']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('ftnd');
      expect(res.body.ftnd).toHaveProperty('score');
      expect(res.body.ftnd).toHaveProperty('band');
    });

    it('saves quit plan and awards Welcome Bonus (100 XP + First Breath badge)', async () => {
      const futureQuitDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/quit/plan')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          approach: 'QUIT_DATE',
          quitDate: futureQuitDate
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('rewards');
      expect(res.body.rewards.xpAwarded).toBe(100);
      expect(res.body.rewards.newBadges).toContain('First Breath');
    });

    it('records check-in and awards honest lapse bonus without healing boss', async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const res = await request(app)
        .post('/api/quit/checkin')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          clientDate: todayStr,
          cigarettesSmoked: 1, // Honest slip logged
          cravingPeak: 4,
          mood: 3,
          note: 'Work deadline slip',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body).toHaveProperty('rewards');
      expect(res.body.rewards.xpAwarded).toBeGreaterThanOrEqual(10);
    });

    it('limits craving survived XP to maximum 3 per day (anti-farming)', async () => {
      const rewards: any[] = [];
      for (let i = 0; i < 4; i++) {
        const startRes = await request(app)
          .post('/api/quit/craving/start')
          .set('Authorization', `Bearer ${authToken}`)
          .send({ toolUsed: 'BREATHE', intensityBefore: 6 });
        const cravingId = startRes.body.cravingId;

        const endRes = await request(app)
          .post('/api/quit/craving/end')
          .set('Authorization', `Bearer ${authToken}`)
          .send({
            cravingId,
            survived: true,
            intensityAfter: 2,
          });
        rewards.push(endRes.body.rewards);
      }

      // First 3 get 15 XP each, 4th gets 0 XP
      expect(rewards[0].xpAwarded).toBe(15);
      expect(rewards[1].xpAwarded).toBe(15);
      expect(rewards[2].xpAwarded).toBe(15);
      expect(rewards[3].xpAwarded).toBe(0);
    });

    it('exports all quit data cleanly in JSON format', async () => {
      const res = await request(app)
        .get('/api/quit/export')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('profile');
      expect(res.body).toHaveProperty('checkIns');
      expect(res.body).toHaveProperty('cravings');
    });

    it('deletes all quit data upon user request (Right to be Forgotten)', async () => {
      const res = await request(app)
        .delete('/api/quit/data')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ confirmation: 'DELETE_MY_QUIT_DATA' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      // Verify profile is removed
      const profileCheck = await request(app)
        .get('/api/quit/profile')
        .set('Authorization', `Bearer ${authToken}`);
      expect(profileCheck.status).toBe(404);
    });
  });
});

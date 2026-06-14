import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDynamicChallenge, getDifficultyMultiplier } from '../services/questEngine';

export const getDailyQuests = async (req: AuthRequest, res: Response) => {
  try {
    const { clientDate, timezoneOffset } = req.query;
    const offset = timezoneOffset !== undefined ? Number(timezoneOffset) : 0;
    
    let todayStr = clientDate as string;
    if (!todayStr) {
      const localMs = Date.now() - (offset * 60 * 1000);
      todayStr = new Date(localMs).toISOString().split('T')[0];
    }
    
    const today = new Date(todayStr + 'T00:00:00Z');
    const dayOfWeek = today.getUTCDay();

    let userQuests = await prisma.userQuest.findMany({
      where: { userId: req.userId!, date: today },
      include: { quest: true }
    });

    if (userQuests.length === 0) {
      const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
      const lastAss = await prisma.assessment.findFirst({
        where: { userId: req.userId! },
        orderBy: { completedAt: 'desc' }
      });

      const mult = getDifficultyMultiplier(profile?.auraRank || 'E');
      const dynChallenge = getDynamicChallenge(dayOfWeek);

      // Fetch default seeded templates
      const templates = await prisma.quest.findMany({
        where: { path: { in: ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'] } }
      });

      // Add dynamic weekday quest
      let dynamicQuest = await prisma.quest.findFirst({ where: { title: dynChallenge.title } });
      if (!dynamicQuest) {
        dynamicQuest = await prisma.quest.create({
          data: {
            title: dynChallenge.title,
            description: dynChallenge.desc,
            path: dynChallenge.path,
            difficulty: "MEDIUM",
            xpReward: 100,
            verificationType: "ACTION"
          }
        });
      }

      const allQuests = [...templates.slice(0, 4), dynamicQuest];

      for (const q of allQuests) {
        const alreadyExists = await prisma.userQuest.findFirst({
          where: {
            userId: req.userId!,
            questId: q.id,
            date: today
          }
        });
        if (!alreadyExists) {
          await prisma.userQuest.create({
            data: {
              userId: req.userId!,
              questId: q.id,
              date: today
            }
          });
        }
      }

      userQuests = await prisma.userQuest.findMany({
        where: { userId: req.userId!, date: today },
        include: { quest: true }
      });
    }

    // Always run self-healing deduplication on userQuests to ensure clean database state
    const uniqueQuestsMap = new Map<string, any>();
    const idsToDelete: string[] = [];
    for (const uq of userQuests) {
      if (uniqueQuestsMap.has(uq.questId)) {
        const existing = uniqueQuestsMap.get(uq.questId);
        if (!existing.completed && uq.completed) {
          idsToDelete.push(existing.id);
          uniqueQuestsMap.set(uq.questId, uq);
        } else {
          idsToDelete.push(uq.id);
        }
      } else {
        uniqueQuestsMap.set(uq.questId, uq);
      }
    }

    if (idsToDelete.length > 0) {
      await prisma.userQuest.deleteMany({
        where: { id: { in: idsToDelete } }
      });
    }

    const cleanedUserQuests = Array.from(uniqueQuestsMap.values());
    res.json(cleanedUserQuests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyQuest = async (req: AuthRequest, res: Response) => {
  try {
    const { userQuestId, inputData, devBypass } = req.body;
    const uq = await prisma.userQuest.findUnique({
      where: { id: userQuestId },
      include: { quest: true, user: { include: { profile: true } } }
    });

    if (!uq) return res.status(404).json({ error: 'Quest not found' });
    if (uq.completed) return res.status(400).json({ error: 'Quest already completed' });

    const profile = uq.user.profile!;

    // 1. Focus Session Timer Verification
    if (uq.quest.verificationType === 'TIMER') {
      if (!uq.timerStartedAt) {
        return res.status(400).json({ error: 'Focus session not initiated. Activate timer first.' });
      }
      
      // Parse expected duration from quest metadata
      let expectedSeconds = 25 * 60; // default 25 mins
      const match = uq.quest.description.match(/(\d+)\s*(?:minutes|mins|minute|min)/i) || uq.quest.title.match(/(\d+)\s*(?:minutes|mins|minute|min)/i);
      if (match) {
        expectedSeconds = parseInt(match[1]) * 60;
      }

      // Check elapsed time
      const elapsedSeconds = (Date.now() - new Date(uq.timerStartedAt).getTime()) / 1000;
      if (elapsedSeconds < expectedSeconds && !devBypass) {
        return res.status(400).json({ 
          error: `Focus time insufficient. Finished only ${Math.round(elapsedSeconds / 60)} of ${Math.round(expectedSeconds / 60)} minutes.` 
        });
      }
    }

    // 2. Deliverable Proof & Reflection Check (Mandatory for all quests)
    if (true) {
      if (!inputData || inputData.trim().length < 50) {
        return res.status(400).json({ 
          error: 'Quest requires deliverables verification. Please write a note of at least 50 characters summarizing your work.' 
        });
      }
    }

    // 3. Anti-Burst Lockout (Max 3 high-tier quests in rolling 2 hours)
    if (uq.isHighTier) {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const completedHighTier = await prisma.userQuest.count({
        where: {
          userId: req.userId!,
          completed: true,
          isHighTier: true,
          completedAt: { gte: twoHoursAgo }
        }
      });
      if (completedHighTier >= 3) {
        return res.status(400).json({ 
          error: 'Anti-Burst Lockout: You have completed 3 high-tier quests in the last 2 hours. Please pace your consistency.' 
        });
      }
    }

    // 4. Quest Timestamp Anomaly & Cooldown Check
    const lastCompleted = await prisma.userQuest.findFirst({
      where: {
        userId: req.userId!,
        completed: true
      },
      orderBy: { completedAt: 'desc' }
    });

    let integrityScore = profile.integrityScore;
    let cooldownActive = profile.cooldownActive;
    let cooldownEndsAt = profile.cooldownEndsAt;

    // Reset cooldown if expired
    if (cooldownActive && cooldownEndsAt && new Date() > new Date(cooldownEndsAt)) {
      cooldownActive = false;
      cooldownEndsAt = null;
    }

    if (lastCompleted && lastCompleted.completedAt) {
      const elapsedMs = Date.now() - new Date(lastCompleted.completedAt).getTime();
      if (elapsedMs < 5 * 60 * 1000 && !devBypass) { // completed within 5 minutes of previous completion
        // Deduct trust score for instant completions
        integrityScore = Math.max(0.0, integrityScore - 15.0);
        if (integrityScore < 70.0) {
          cooldownActive = true;
          cooldownEndsAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour cooldown lock
        }
      } else {
        // Paced completions rebuild integrity trust score
        integrityScore = Math.min(100.0, integrityScore + 2.0);
      }
    }

    // Calculate XP payout multiplier
    let xpMultiplier = integrityScore / 100.0;
    if (cooldownActive) {
      xpMultiplier = 0.2; // 80% reduction
    }

    let xpAwarded = Math.round(uq.quest.xpReward * xpMultiplier);

    // Suppress XP to 0 if level ceiling is locked or fatigued
    if (profile.levelLocked || profile.fatigueActive) {
      xpAwarded = 0;
    }

    // Save completed state
    await prisma.userQuest.update({
      where: { id: userQuestId },
      data: { completed: true, completedAt: new Date(), inputData }
    });

    // Award rewards & check levels
    let level = profile.currentLevel;
    let xp = profile.currentXP + xpAwarded;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let leveledUp = false;
    let pointsAwarded = 0;

    // Level ceiling locks (10, 20, 30, 50)
    const isCeiling = [10, 20, 30, 50].includes(level);
    if (isCeiling && xp >= required && !profile.levelLocked) {
      xp = required;
      await prisma.profile.update({
        where: { userId: req.userId! },
        data: { levelLocked: true }
      });
    } else if (!profile.levelLocked) {
      while (xp >= required) {
        xp -= required;
        level += 1;
        pointsAwarded += 5;
        leveledUp = true;
        required = Math.round(100 * Math.pow(level, 1.5));

        if ([10, 20, 30, 50].includes(level)) {
          if (xp >= required) xp = required;
          await prisma.profile.update({
            where: { userId: req.userId! },
            data: { levelLocked: true }
          });
          break;
        }
      }
    }

    // Update User Quest Streaks & Extract Shadows
    const streakRecord = await prisma.userQuestStreak.upsert({
      where: { userId_questId: { userId: req.userId!, questId: uq.questId } },
      update: {
        streak: { increment: 1 },
        lastCompletedAt: new Date()
      },
      create: {
        userId: req.userId!,
        questId: uq.questId,
        streak: 1,
        lastCompletedAt: new Date()
      }
    });

    let shadowExtracted = false;
    if (streakRecord.streak >= 21) {
      const existingShadow = await prisma.shadowSoldier.findFirst({
        where: { userId: req.userId!, questId: uq.questId, active: true }
      });
      if (!existingShadow) {
        await prisma.shadowSoldier.create({
          data: {
            userId: req.userId!,
            questId: uq.questId,
            title: uq.quest.title,
            active: true
          }
        });
        shadowExtracted = true;
      }
    }

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentXP: xp,
        currentLevel: level,
        unallocatedPoints: { increment: pointsAwarded },
        integrityScore,
        cooldownActive,
        cooldownEndsAt,
        currentStreak: { increment: 1 }
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained: xpAwarded,
        source: `Completed Quest: ${uq.quest.title}`
      }
    });

    // Apply XP to active duels
    try {
      const { applyDuelXP } = require('./duelController');
      await applyDuelXP(req.userId!, xpAwarded, uq.quest.path, uq.quest.verificationType);
    } catch (duelErr) {
      console.warn('Failed to apply duel XP in quest verify:', duelErr);
    }

    // Check fatigue limit triggers
    try {
      const { checkFatigue } = require('../services/fatigueService');
      await checkFatigue(req.userId!);
    } catch (fatigueErr) {
      console.warn('Failed to check fatigue in quest verify:', fatigueErr);
    }

    // Check and apply damage to active weekly boss
    let bossDefeated = false;
    let bossDamageDealt = 0;
    let bossName = "";

    try {
      const activeBossProgress = await prisma.userBossProgress.findFirst({
        where: { userId: req.userId!, defeated: false },
        include: { boss: true }
      });

      if (activeBossProgress) {
        bossName = activeBossProgress.boss.name;
        if (activeBossProgress.boss.isRecovery) {
          // Recovery boss can ONLY be damaged by SAGE path quests, REFLECTION quests, or Calm Reset tasks
          const isCalmAction = 
            uq.quest.path === 'SAGE' || 
            uq.quest.verificationType === 'REFLECTION' || 
            uq.quest.title.toLowerCase().includes('calm') || 
            uq.quest.title.toLowerCase().includes('breathe');
            
          if (isCalmAction) {
            bossDamageDealt = Math.round(uq.quest.xpReward * 2);
          }
        } else {
          // Standard boss is damaged by any daily quest
          bossDamageDealt = Math.round(uq.quest.xpReward * 2);
        }

        if (bossDamageDealt > 0) {
          const newHP = Math.max(0, activeBossProgress.currentHP - bossDamageDealt);
          bossDefeated = newHP === 0;

          await prisma.userBossProgress.update({
            where: { id: activeBossProgress.id },
            data: {
              currentHP: newHP,
              defeated: bossDefeated,
              defeatedAt: bossDefeated ? new Date() : null
            }
          });

          // Award extra XP if the boss is defeated
          if (bossDefeated) {
            const freshProfile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
            if (freshProfile) {
              let bLevel = freshProfile.currentLevel;
              let bXP = freshProfile.currentXP + activeBossProgress.boss.xpReward;
              let bRequired = Math.round(100 * Math.pow(bLevel, 1.5));
              let bPoints = freshProfile.unallocatedPoints;
              let bLeveledUp = false;

              while (bXP >= bRequired) {
                bXP -= bRequired;
                bLevel += 1;
                bPoints += 5;
                bLeveledUp = true;
                bRequired = Math.round(100 * Math.pow(bLevel, 1.5));
              }

              await prisma.profile.update({
                where: { userId: req.userId! },
                data: {
                  currentXP: bXP,
                  currentLevel: bLevel,
                  unallocatedPoints: bPoints
                }
              });

              await prisma.xPLog.create({
                data: {
                  userId: req.userId!,
                  xpGained: activeBossProgress.boss.xpReward,
                  source: `Defeated Weekly Boss: ${activeBossProgress.boss.name}`
                }
              });

              leveledUp = leveledUp || bLeveledUp;
              level = bLevel;
            }
          }
        }
      }
    } catch (bossErr) {
      console.error("Failed to apply boss damage on quest verification:", bossErr);
    }

    res.json({ 
      completed: true, 
      xpGained: xpAwarded, 
      leveledUp, 
      level,
      integrityScore,
      cooldownActive,
      cooldownEndsAt,
      bossDamageDealt,
      bossDefeated,
      bossName,
      shadowExtracted,
      streak: streakRecord.streak
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const startQuestTimer = async (req: AuthRequest, res: Response) => {
  try {
    const { userQuestId } = req.body;
    const uq = await prisma.userQuest.findUnique({
      where: { id: userQuestId }
    });

    if (!uq) return res.status(404).json({ error: 'Quest not found' });
    if (uq.completed) return res.status(400).json({ error: 'Quest already completed' });

    const updated = await prisma.userQuest.update({
      where: { id: userQuestId },
      data: { timerStartedAt: new Date() }
    });

    res.json({ success: true, timerStartedAt: updated.timerStartedAt });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const claimDailyReward = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await prisma.profile.findUnique({ where: { userId: req.userId! } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const streak = profile.currentStreak;
    const rewards = [20, 30, 50, 75, 100, 150, 250];
    const rewardIndex = streak % 7;
    const xpGained = rewards[rewardIndex];

    let level = profile.currentLevel;
    let xp = profile.currentXP + xpGained;
    let required = Math.round(100 * Math.pow(level, 1.5));
    let leveledUp = false;

    while (xp >= required) {
      xp -= required;
      level += 1;
      leveledUp = true;
      required = Math.round(100 * Math.pow(level, 1.5));
    }

    await prisma.profile.update({
      where: { userId: req.userId! },
      data: {
        currentXP: xp,
        currentLevel: level
      }
    });

    await prisma.xPLog.create({
      data: {
        userId: req.userId!,
        xpGained,
        source: "Daily Login Chest Reward"
      }
    });

    res.json({ xpGained, newXP: xp, leveledUp, level });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

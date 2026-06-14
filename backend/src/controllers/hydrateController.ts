import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getDynamicChallenge, getDifficultyMultiplier } from '../services/questEngine';

function getClientLocalDateStr(date: Date, offsetMinutes: number): string {
  const localMs = date.getTime() - (offsetMinutes * 60 * 1000);
  return new Date(localMs).toISOString().split('T')[0];
}

function seededRandom(seedStr: string) {
  let hash = 0;
  for (let i = 0; i < seedStr.length; i++) {
    hash = seedStr.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

function seededShuffle<T>(array: T[], seedStr: string): T[] {
  const rand = seededRandom(seedStr);
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const hydrateDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { clientDate, timezoneOffset } = req.body;
    
    // Find profile
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const offset = timezoneOffset !== undefined ? Number(timezoneOffset) : 0;
    let todayStr = clientDate;
    if (!todayStr) {
      const localMs = Date.now() - (offset * 60 * 1000);
      todayStr = new Date(localMs).toISOString().split('T')[0];
    }

    const today = new Date(todayStr + 'T00:00:00Z');
    const dayOfWeek = today.getUTCDay(); // Local day of week (0 = Sunday, 6 = Saturday)

    let penaltiesDeducted = 0;
    let skippedCount = 0;
    let levelDemoted = false;
    let alerts: string[] = [];

    const lastHydrated = profile.lastHydratedAt ? new Date(profile.lastHydratedAt) : null;
    
    // Check if we need to roll new quests for today (using atomic update to prevent duplicate concurrency rolls)
    const updateResult = await prisma.profile.updateMany({
      where: {
        userId,
        OR: [
          { lastQuestRollDate: null },
          { lastQuestRollDate: { not: todayStr } }
        ]
      },
      data: {
        lastQuestRollDate: todayStr,
        lastHydratedAt: new Date()
      }
    });
    const isNewRoll = updateResult.count > 0;

    if (isNewRoll) {
      const dynChallenge = getDynamicChallenge(dayOfWeek);
      // 1. Process rollover penalties for unresolved tasks from previous dates (date < today)
      const pendingQuests = await prisma.userQuest.findMany({
        where: {
          userId,
          completed: false,
          date: { lt: today }
        },
        include: { quest: true }
      });

      if (pendingQuests.length > 0) {
        skippedCount = pendingQuests.length;
        for (const uq of pendingQuests) {
          const penalty = uq.isHighTier ? 50 : 25;
          penaltiesDeducted += penalty;
        }

        const nextStability = Math.max(0.0, profile.stabilityScore - (skippedCount * 2.0));

        let currentXP = profile.currentXP - penaltiesDeducted;
        let currentLevel = profile.currentLevel;
        
        while (currentXP < 0 && currentLevel > 1) {
          currentLevel -= 1;
          const prevLevelMaxXP = Math.round(100 * Math.pow(currentLevel, 1.5));
          currentXP = prevLevelMaxXP + currentXP;
          levelDemoted = true;
        }

        if (currentXP < 0) {
          currentXP = 0;
        }

        alerts.push(`🚨 Midnight carry-over: ${skippedCount} task(s) skipped. -${penaltiesDeducted} XP deducted.`);
        if (levelDemoted) {
          alerts.push(`📉 Level demoted! Your level fell to Lvl ${currentLevel} due to unresolved tasks.`);
        }

        await prisma.profile.update({
          where: { userId },
          data: {
            currentXP,
            currentLevel,
            stabilityScore: nextStability,
            longestStreak: Math.max(profile.longestStreak, profile.currentStreak),
            currentStreak: profile.pressureScore >= 70 ? Math.max(1, profile.currentStreak - 1) : 0
          }
        });

        // Migrate unresolved tasks to today (carry forward), keeping only one instance per unique questId
        const migratedQuestIds = new Set<string>();
        for (const uq of pendingQuests) {
          if (!migratedQuestIds.has(uq.questId)) {
            migratedQuestIds.add(uq.questId);
            await prisma.userQuest.update({
              where: { id: uq.id },
              data: { date: today }
            });
          } else {
            // Delete duplicate pending quest to prevent database clutter
            await prisma.userQuest.delete({
              where: { id: uq.id }
            });
          }
        }

        await prisma.xPLog.create({
          data: {
            userId,
            xpGained: -penaltiesDeducted,
            source: `Forfeiture Penalty: skipped ${skippedCount} tasks`
          }
        });
      }

      // 2. Harvest passive XP trickles from active shadow soldiers (+5 XP per shadow)
      const activeShadows = await prisma.shadowSoldier.findMany({
        where: { userId, active: true }
      });

      if (activeShadows.length > 0) {
        const shadowXP = activeShadows.length * 5;
        let finalXP = profile.currentXP + shadowXP;
        let finalLevel = profile.currentLevel;
        let finalReq = Math.round(100 * Math.pow(finalLevel, 1.5));

        while (finalXP >= finalReq && !profile.levelLocked) {
          finalXP -= finalReq;
          finalLevel += 1;
          finalReq = Math.round(100 * Math.pow(finalLevel, 1.5));
        }

        await prisma.profile.update({
          where: { userId },
          data: {
            currentXP: finalXP,
            currentLevel: finalLevel
          }
        });

        await prisma.xPLog.create({
          data: {
            userId,
            xpGained: shadowXP,
            source: `Shadow Soldiers Passive Harvesting XP: ${activeShadows.map(s => s.title).join(', ')}`
          }
        });

        alerts.push(`👥 Shadow Roster: Your shadows harvested +${shadowXP} XP passively.`);
      }

      // 3. Shatter shadow soldiers if global consistency falls significantly
      const freshProfile = await prisma.profile.findUnique({ where: { userId } });
      const currentStability = freshProfile?.stabilityScore || 100.0;
      if (skippedCount > 3 || currentStability < 60) {
        const activeShadowsList = await prisma.shadowSoldier.findMany({
          where: { userId, active: true }
        });
        if (activeShadowsList.length > 0) {
          // Shatter the first active shadow
          const shattered = activeShadowsList[0];
          await prisma.shadowSoldier.update({
            where: { id: shattered.id },
            data: { active: false }
          });
          // Reset streak for that quest
          await prisma.userQuestStreak.update({
            where: { userId_questId: { userId, questId: shattered.questId } },
            data: { streak: 0 }
          });
          alerts.push(`💔 Shadow shattered! Your consistency fell too low. "${shattered.title}" returned to main quests.`);
        }
      }

      // 4. Generate 7 new daily quests for today, excluding active shadows and carried forward tasks
      const activeShadowsAfterShatter = await prisma.shadowSoldier.findMany({
        where: { userId, active: true }
      });
      const shadowQuestIds = new Set(activeShadowsAfterShatter.map(s => s.questId));
      const seenIds = new Set<string>();
      
      // Prevent duplicating carried forward tasks
      pendingQuests.forEach(uq => seenIds.add(uq.questId));
      shadowQuestIds.forEach(id => seenIds.add(id));

      const templates = await prisma.quest.findMany();

      const latestAss = await prisma.assessment.findFirst({
        where: { userId },
        orderBy: { completedAt: 'desc' }
      });
      const bottleneck = latestAss ? latestAss.bottleneck.toUpperCase() : 'SCHOLAR';

      const seed = `${userId}-${todayStr}`;
      
      const scholarPool = templates.filter(q => q.path === 'SCHOLAR' && !shadowQuestIds.has(q.id));
      const warriorPool = templates.filter(q => q.path === 'WARRIOR' && !shadowQuestIds.has(q.id));
      const sagePool = templates.filter(q => q.path === 'SAGE' && !shadowQuestIds.has(q.id));
      const creatorPool = templates.filter(q => q.path === 'CREATOR' && !shadowQuestIds.has(q.id));

      const shufScholar = seededShuffle(scholarPool, seed + '-scholar');
      const shufWarrior = seededShuffle(warriorPool, seed + '-warrior');
      const shufSage = seededShuffle(sagePool, seed + '-sage');
      const shufCreator = seededShuffle(creatorPool, seed + '-creator');

      const pools: Record<string, any[]> = {
        SCHOLAR: shufScholar,
        WARRIOR: shufWarrior,
        SAGE: shufSage,
        CREATOR: shufCreator
      };

      const selectedQuests: any[] = [];
      const bottleneckPool = pools[bottleneck] || shufScholar;
      selectedQuests.push(...bottleneckPool.slice(0, 3));

      Object.keys(pools).forEach((path) => {
        if (path !== bottleneck) {
          const pool = pools[path];
          if (pool && pool.length > 0) {
            selectedQuests.push(pool[0]);
          }
        }
      });

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
      if (!shadowQuestIds.has(dynamicQuest.id)) {
        selectedQuests.push(dynamicQuest);
      }

      const finalQuests: any[] = [];
      for (const q of selectedQuests) {
        if (!seenIds.has(q.id)) {
          seenIds.add(q.id);
          finalQuests.push(q);
        }
      }

      // Fill up to 7 if needed
      if (finalQuests.length < 7) {
        const allShuffled = seededShuffle(templates, seed + '-all');
        for (const q of allShuffled) {
          if (finalQuests.length >= 7) break;
          if (!seenIds.has(q.id) && !shadowQuestIds.has(q.id)) {
            seenIds.add(q.id);
            finalQuests.push(q);
          }
        }
      }

      const finalSeven = finalQuests.slice(0, 7);

      for (let i = 0; i < finalSeven.length; i++) {
        const q = finalSeven[i];
        const alreadyExists = await prisma.userQuest.findFirst({
          where: {
            userId,
            questId: q.id,
            date: today
          }
        });
        if (!alreadyExists) {
          await prisma.userQuest.create({
            data: {
              userId,
              questId: q.id,
              date: today,
              isHighTier: i === 0,
              proofType: i === 0 ? 'NOTE' : null
            }
          });
        }
      }


    }

    // Check fatigue lockout limits on load
    try {
      const { checkFatigue } = require('../services/fatigueService');
      await checkFatigue(userId);
    } catch (fatigueErr) {
      console.warn('Failed to check fatigue in hydration:', fatigueErr);
    }

    // Always fetch user's quests for today
    const userQuests = await prisma.userQuest.findMany({
      where: { userId, date: today },
      include: { quest: true }
    });

    // Self-healing: clean up any duplicate quests for today in the database
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

    const updatedProfile = await prisma.profile.findUnique({ where: { userId } });

    res.json({
      success: true,
      profile: updatedProfile,
      quests: cleanedUserQuests,
      penaltiesDeducted,
      skippedCount,
      levelDemoted,
      alerts
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

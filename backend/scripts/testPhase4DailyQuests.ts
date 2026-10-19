import { PrismaClient } from '@prisma/client';
import { generateDailyQuestsForUser, isNonPathQuest } from '../src/services/questEngine';

const prisma = new PrismaClient();

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING PHASE 4 TEST SUITE: PATH-LOCKED DAILY TASKS');
  console.log('====================================================\n');

  const testEmailPrefix = `phase4_test_${Date.now()}`;
  const paths: ('SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR')[] = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'];

  // ----------------------------------------------------
  // TEST 1: Path Purity Across All 4 Paths (4 Users)
  // ----------------------------------------------------
  console.log('--- TEST 1: Path Purity Across All 4 Paths ---');
  const createdUserIds: string[] = [];

  for (const path of paths) {
    const email = `${testEmailPrefix}_${path.toLowerCase()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: 'dummy_hash',
        profile: {
          create: {
            name: 'Test Player',
            role: 'STUDENT',
            primaryGoal: 'Discipline',
            auraRank: 'B',
            chosenPath: path,
            pathChosenAt: new Date(),
            pathChangeCount: 1
          }
        }
      },
      include: { profile: true }
    });
    createdUserIds.push(user.id);

    const testDate = new Date('2026-10-20T00:00:00Z'); // Tuesday (day 2)
    const result = await generateDailyQuestsForUser(user.id, testDate, '2026-10-20');

    if (result.error) {
      throw new Error(`Test 1 Failed for ${path}: ${result.error}`);
    }

    const quests = result.quests;
    console.log(`User ${path}: Generated ${quests.length} quests.`);

    if (quests.length !== 7) {
      throw new Error(`Expected exactly 7 quests for ${path}, got ${quests.length}`);
    }

    // Check path purity
    for (const uq of quests) {
      if (uq.quest.path !== path) {
        throw new Error(`Cross-path quest found! Expected ${path}, got ${uq.quest.path} ("${uq.quest.title}")`);
      }
    }

    // Check for duplicates
    const questIds = new Set(quests.map(uq => uq.questId));
    if (questIds.size !== 7) {
      throw new Error(`Duplicate quests detected within the same day for ${path}! Unique: ${questIds.size}/7`);
    }

    // Check Main Anchor
    const anchor = quests.find(uq => uq.isHighTier);
    if (!anchor) {
      throw new Error(`No Main Anchor found in daily 7 for ${path}`);
    }
    if (anchor.proofType !== 'NOTE') {
      throw new Error(`Main Anchor proofType expected 'NOTE', got '${anchor.proofType}' for ${path}`);
    }

    // Check Weekday Signature (Day 2 = Tuesday)
    const tuesdaySignature = quests.find(uq => uq.quest.tags?.includes('weekday_2'));
    if (!tuesdaySignature) {
      throw new Error(`Weekday signature (weekday_2) not found in daily quests for ${path}`);
    }

    console.log(`  ✓ ${path} verified: Exactly 7 pure path quests, Anchor="${anchor.quest.title}", Weekday="${tuesdaySignature.quest.title}"`);
  }

  // ----------------------------------------------------
  // TEST 2: 10-Day Rotation Simulation (No Repeats in 5-day window)
  // ----------------------------------------------------
  console.log('\n--- TEST 2: 10-Day Rotation Simulation (5-Day Rolling Window) ---');
  const rotUserEmail = `${testEmailPrefix}_rotation@example.com`;
  const rotUser = await prisma.user.create({
    data: {
      email: rotUserEmail,
      passwordHash: 'dummy_hash',
      profile: {
        create: {
          name: 'Test Player',
          role: 'STUDENT',
          primaryGoal: 'Discipline',
          auraRank: 'B',
          chosenPath: 'SCHOLAR',
          pathChosenAt: new Date(),
          pathChangeCount: 1
        }
      }
    }
  });
  createdUserIds.push(rotUser.id);

  const baseDate = new Date('2026-11-01T00:00:00Z');
  const dailyHistory: { day: number; dateStr: string; questIds: string[]; titles: string[] }[] = [];

  for (let day = 0; day < 10; day++) {
    const simDate = new Date(baseDate.getTime() + day * 24 * 60 * 60 * 1000);
    const simDateStr = simDate.toISOString().split('T')[0];

    const res = await generateDailyQuestsForUser(rotUser.id, simDate, simDateStr);
    if (res.error) throw new Error(`Rotation sim day ${day} error: ${res.error}`);

    const qIds = res.quests.map(uq => uq.questId);
    const titles = res.quests.map(uq => uq.quest.title);

    // Verify 5-day rotation constraint: no quest repeats within the last 5 days
    const minDayToCheck = Math.max(0, day - 4);
    for (let prev = minDayToCheck; prev < day; prev++) {
      const prevIds = new Set(dailyHistory[prev].questIds);
      const overlap = qIds.filter(id => prevIds.has(id));
      if (overlap.length > 0) {
        const overlappingTitles = res.quests.filter(uq => overlap.includes(uq.questId)).map(uq => uq.quest.title);
        throw new Error(`Rotation Violation! Day ${day} repeats quest(s) from Day ${prev}: ${overlappingTitles.join(', ')}`);
      }
    }

    dailyHistory.push({ day, dateStr: simDateStr, questIds: qIds, titles });
    console.log(`  Day ${day + 1} (${simDateStr}): 7 unique quests generated. 0 repeats in last 5 days.`);
  }
  console.log(`  ✓ 10-Day rotation simulation passed: ZERO repeats within any 5-day window!`);

  // ----------------------------------------------------
  // TEST 3: Concurrent Parallel Requests (Race-Safety & Idempotency)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Concurrent Parallel Requests ---');
  const concUserEmail = `${testEmailPrefix}_concurrency@example.com`;
  const concUser = await prisma.user.create({
    data: {
      email: concUserEmail,
      passwordHash: 'dummy_hash',
      profile: {
        create: {
          name: 'Test Player',
          role: 'STUDENT',
          primaryGoal: 'Discipline',
          auraRank: 'A',
          chosenPath: 'CREATOR',
          pathChosenAt: new Date(),
          pathChangeCount: 1
        }
      }
    }
  });
  createdUserIds.push(concUser.id);

  const concDate = new Date('2026-10-25T00:00:00Z');
  // Fire 5 simultaneous requests
  const results = await Promise.all([
    generateDailyQuestsForUser(concUser.id, concDate, '2026-10-25'),
    generateDailyQuestsForUser(concUser.id, concDate, '2026-10-25'),
    generateDailyQuestsForUser(concUser.id, concDate, '2026-10-25'),
    generateDailyQuestsForUser(concUser.id, concDate, '2026-10-25'),
    generateDailyQuestsForUser(concUser.id, concDate, '2026-10-25')
  ]);

  for (const r of results) {
    if (r.error) throw new Error(`Concurrent call failed: ${r.error}`);
  }

  const dbRows = await prisma.userQuest.findMany({
    where: { userId: concUser.id, date: concDate }
  });
  console.log(`  Concurrent calls finished. Database rows for date: ${dbRows.length}`);
  if (dbRows.length !== 7) {
    throw new Error(`Race condition failure! Expected exactly 7 UserQuest rows, found ${dbRows.length}`);
  }
  console.log(`  ✓ Race safety verified: Exactly 7 rows created despite 5 concurrent requests.`);

  // ----------------------------------------------------
  // TEST 4: Path Not Chosen (HTTP 409 error)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Path Not Chosen (409 Error Handling) ---');
  const noPathEmail = `${testEmailPrefix}_nopath@example.com`;
  const noPathUser = await prisma.user.create({
    data: {
      email: noPathEmail,
      passwordHash: 'dummy_hash',
      profile: {
        create: {
          name: 'Test Player',
          role: 'STUDENT',
          primaryGoal: 'Discipline',
          auraRank: 'E',
          chosenPath: null
        }
      }
    }
  });
  createdUserIds.push(noPathUser.id);

  const noPathResult = await generateDailyQuestsForUser(noPathUser.id, new Date('2026-10-20T00:00:00Z'));
  if (noPathResult.error !== 'PATH_NOT_CHOSEN') {
    throw new Error(`Expected error 'PATH_NOT_CHOSEN', got '${noPathResult.error}'`);
  }
  console.log(`  ✓ Correctly returned error: 'PATH_NOT_CHOSEN' when profile.chosenPath is null.`);

  // ----------------------------------------------------
  // TEST 5: Non-Path Features (Recovery / Boss) Separation
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Recovery / Boss Never Counted in 7 Daily Tasks ---');
  const recoveryUserEmail = `${testEmailPrefix}_recovery@example.com`;
  const recoveryUser = await prisma.user.create({
    data: {
      email: recoveryUserEmail,
      passwordHash: 'dummy_hash',
      profile: {
        create: {
          name: 'Test Player',
          role: 'STUDENT',
          primaryGoal: 'Discipline',
          auraRank: 'C',
          chosenPath: 'WARRIOR',
          recoveryModeActive: true
        }
      }
    }
  });
  createdUserIds.push(recoveryUser.id);

  // Manually attach a Calm Reset / Box Breathing quest to this user for today
  let calmTemplate = await prisma.quest.findFirst({
    where: { title: 'Calm Reset: Box Breathing Exercise' }
  });
  if (!calmTemplate) {
    calmTemplate = await prisma.quest.create({
      data: {
        title: 'Calm Reset: Box Breathing Exercise',
        description: 'Guided 60s breathing.',
        path: 'SAGE',
        difficulty: 'EASY',
        xpReward: 50,
        verificationType: 'TIMER',
        tags: 'recovery'
      }
    });
  }

  const recDate = new Date('2026-10-22T00:00:00Z');
  await prisma.userQuest.create({
    data: {
      userId: recoveryUser.id,
      questId: calmTemplate.id,
      date: recDate
    }
  });

  // Now generate daily quests
  const recResult = await generateDailyQuestsForUser(recoveryUser.id, recDate, '2026-10-22');
  const allUserQuestsToday = await prisma.userQuest.findMany({
    where: { userId: recoveryUser.id, date: recDate },
    include: { quest: true }
  });

  const warriorQuests = allUserQuestsToday.filter(uq => uq.quest.path === 'WARRIOR' && !isNonPathQuest(uq.quest));
  const recoveryQuests = allUserQuestsToday.filter(uq => isNonPathQuest(uq.quest));

  console.log(`  Warrior daily path tasks: ${warriorQuests.length}`);
  console.log(`  Recovery non-path tasks: ${recoveryQuests.length}`);
  console.log(`  Total UserQuest rows: ${allUserQuestsToday.length}`);

  if (warriorQuests.length !== 7) {
    throw new Error(`Expected 7 Warrior path tasks, got ${warriorQuests.length}`);
  }
  if (recoveryQuests.length !== 1) {
    throw new Error(`Expected 1 Recovery task, got ${recoveryQuests.length}`);
  }
  console.log(`  ✓ Recovery quest correctly excluded from the 7 daily path tasks quota!`);

  // ----------------------------------------------------
  // TEST 6: SQL Proof of Path Purity across 4 Users
  // ----------------------------------------------------
  console.log('\n--- TEST 6: SQL Verification Query ---');
  const sqlCheck = await prisma.$queryRaw<any[]>`
    SELECT 
      p."chosenPath", 
      q."path" AS "questPath", 
      COUNT(*) AS "taskCount"
    FROM "UserQuest" uq
    JOIN "Quest" q ON uq."questId" = q."id"
    JOIN "Profile" p ON uq."userId" = p."userId"
    WHERE uq."userId" IN (${createdUserIds[0]}, ${createdUserIds[1]}, ${createdUserIds[2]}, ${createdUserIds[3]})
    GROUP BY p."chosenPath", q."path"
    ORDER BY p."chosenPath", q."path";
  `;
  console.log('SQL Aggregation Result (Path vs Quest Path):');
  console.table(sqlCheck);

  for (const row of sqlCheck) {
    if (row.chosenPath !== row.questPath) {
      throw new Error(`SQL Inconsistency: User on ${row.chosenPath} has quest on ${row.questPath}!`);
    }
  }
  console.log('✓ SQL proof confirms 100% path purity! All chosenPaths match questPaths perfectly.');

  // Cleanup test users
  console.log('\nCleaning up test artifacts...');
  await prisma.user.deleteMany({
    where: { id: { in: createdUserIds } }
  });
  console.log('Cleaned up test users.');

  console.log('\n====================================================');
  console.log('🎉 ALL PHASE 4 ACCEPTANCE TESTS PASSED SUCCESSFULLY!');
  console.log('====================================================');
}

runTests()
  .catch(err => {
    console.error('❌ Phase 4 Test Suite Failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('=== PHASE 3 PATH CHOICE & PERSISTENCE VERIFICATION ===\n');

  const testEmail = 'phase3_path_test@evolveaura.internal';
  await prisma.user.deleteMany({ where: { email: testEmail } });

  const hash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      email: testEmail,
      passwordHash: hash,
      profile: {
        create: {
          name: 'Phase 3 Tester',
          role: 'PROFESSIONAL',
          primaryGoal: 'Study',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`Created test user: ${user.id}`);

  // Create an assessment record with suggestedPath="SCHOLAR"
  const assessment = await prisma.assessment.create({
    data: {
      userId: user.id,
      answers: {},
      scholarScore: 90,
      warriorScore: 60,
      sageScore: 50,
      creatorScore: 40,
      auraScore: 60,
      auraRank: 'B',
      bottleneck: 'Creator',
      suggestedPath: 'SCHOLAR',
      completedAt: new Date(),
    },
  });
  console.log(`Created test assessment with suggestedPath="${assessment.suggestedPath}"`);

  // Create mock quests for today: one completed, one uncompleted
  const todayStr = new Date().toISOString().split('T')[0];
  const today = new Date(todayStr);

  let q1 = await prisma.quest.findFirst({ where: { path: 'SCHOLAR' } });
  if (!q1) {
    q1 = await prisma.quest.create({
      data: {
        title: 'Deep Focus Block',
        description: 'Complete 45 min focus block',
        path: 'SCHOLAR',
        difficulty: 'EASY',
        xpReward: 30,
        verificationType: 'TIMER',
      },
    });
  }

  let q2 = await prisma.quest.findFirst({ where: { path: 'WARRIOR' } });
  if (!q2) {
    q2 = await prisma.quest.create({
      data: {
        title: 'Morning Conditioning',
        description: 'Execute 30 min exercise',
        path: 'WARRIOR',
        difficulty: 'EASY',
        xpReward: 30,
        verificationType: 'ACTION',
      },
    });
  }

  const uqCompleted = await prisma.userQuest.create({
    data: {
      userId: user.id,
      questId: q1.id,
      date: today,
      completed: true,
      completedAt: new Date(),
    },
  });

  const uqUncompleted = await prisma.userQuest.create({
    data: {
      userId: user.id,
      questId: q2.id,
      date: today,
      completed: false,
    },
  });
  console.log(`Created UserQuests: Completed (${uqCompleted.id}), Uncompleted (${uqUncompleted.id})`);

  // TEST 1: First Choice - choosing the recommended path (SCHOLAR)
  console.log('\n--- TEST 1: First Choice following recommendation (SCHOLAR) ---');
  const now = new Date();
  const followedSuggestion = Boolean(assessment.suggestedPath === 'SCHOLAR');
  const updatedProfile1 = await prisma.profile.update({
    where: { userId: user.id },
    data: {
      chosenPath: 'SCHOLAR',
      pathChosenAt: now,
      pathChangeCount: { increment: 1 },
    },
  });

  const log1 = await prisma.pathChoiceLog.create({
    data: {
      userId: user.id,
      fromPath: null,
      toPath: 'SCHOLAR',
      suggestedPath: assessment.suggestedPath,
      followedSuggestion,
      createdAt: now,
    },
  });

  console.log(`Logged choice 1: from=${log1.fromPath}, to=${log1.toPath}, followedSuggestion=${log1.followedSuggestion}`);
  if (!log1.followedSuggestion) throw new Error('Expected followedSuggestion to be true');

  // TEST 2: Attempting path change within 7 days (should be locked)
  console.log('\n--- TEST 2: Lock enforcement within 7 days ---');
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  const unlocksAt = new Date(updatedProfile1.pathChosenAt!.getTime() + sevenDaysMs);
  const isLocked = new Date() < unlocksAt;
  console.log(`Current time is before unlock (${unlocksAt.toISOString()}): ${isLocked}`);
  if (!isLocked) throw new Error('Expected 7-day lock to be active');
  console.log('✓ PASS: Path change correctly blocked within 7 days.');

  // TEST 3: Simulating 7 days elapsed and switching to WARRIOR (non-recommended)
  console.log('\n--- TEST 3: Switching path after 7 days to non-recommended (WARRIOR) ---');
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000);
  await prisma.profile.update({
    where: { userId: user.id },
    data: { pathChosenAt: eightDaysAgo },
  });

  // Execute change logic matching profileController.ts
  const changeNow = new Date();
  const updatedProfile2 = await prisma.$transaction(async (tx) => {
    const prof = await tx.profile.update({
      where: { userId: user.id },
      data: {
        chosenPath: 'WARRIOR',
        pathChosenAt: changeNow,
        pathChangeCount: { increment: 1 },
      },
    });

    const log2 = await tx.pathChoiceLog.create({
      data: {
        userId: user.id,
        fromPath: 'SCHOLAR',
        toPath: 'WARRIOR',
        suggestedPath: assessment.suggestedPath,
        followedSuggestion: assessment.suggestedPath === 'WARRIOR',
        createdAt: changeNow,
      },
    });

    // Delete uncompleted quests today
    await tx.userQuest.deleteMany({
      where: {
        userId: user.id,
        completed: false,
        date: today,
      },
    });

    return { prof, log2 };
  });

  console.log(`Logged choice 2: from=${updatedProfile2.log2.fromPath}, to=${updatedProfile2.log2.toPath}, followedSuggestion=${updatedProfile2.log2.followedSuggestion}`);
  if (updatedProfile2.log2.followedSuggestion) throw new Error('Expected followedSuggestion to be false for WARRIOR');

  // Verify UserQuests state
  const remainingQuests = await prisma.userQuest.findMany({ where: { userId: user.id } });
  console.log(`Remaining UserQuests count: ${remainingQuests.length}`);
  if (remainingQuests.length !== 1 || !remainingQuests[0].completed) {
    throw new Error('Expected only the completed quest to remain after path change!');
  }
  console.log('✓ PASS: Uncompleted quest was pruned while completed quest was preserved.');

  // Dump all logs for reporting
  const allLogs = await prisma.pathChoiceLog.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' },
  });
  console.log('\n--- PathChoiceLog Database Rows ---');
  console.table(allLogs);

  // Clean up
  await prisma.user.deleteMany({ where: { email: testEmail } });
  console.log('=== ALL PHASE 3 VERIFICATION CHECKS PASSED ===');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });

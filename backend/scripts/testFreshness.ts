import { PrismaClient } from '@prisma/client';
import { issueAttempt } from '../src/services/assessmentEngine';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('--- STARTING PHASE 1 VERIFICATION SCRIPT ---');

  // Clean up any previous test user
  const testEmail1 = 'freshness_test_1@evolveaura.internal';
  const testEmail2 = 'freshness_test_2@evolveaura.internal';
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail1, testEmail2] } },
  });

  const hash = await bcrypt.hash('Password123!', 10);

  const user1 = await prisma.user.create({
    data: {
      email: testEmail1,
      passwordHash: hash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: testEmail2,
      passwordHash: hash,
    },
  });

  console.log(`Created test users: ${user1.id}, ${user2.id}`);

  // Test 1: Freshness across 3 consecutive attempts for user 1
  console.log('\n--- TEST 1: Freshness across attempts ---');
  const attempts: any[] = [];
  for (let i = 0; i < 3; i++) {
    const attempt = await issueAttempt(user1.id);
    attempts.push(attempt);
    console.log(`Attempt ${i + 1}: ID=${attempt.attemptId}, Questions count=${attempt.questions.length}`);

    // Verify properties of attempt
    if (attempt.questions.length !== 16) {
      throw new Error(`Attempt ${i + 1} has ${attempt.questions.length} questions instead of 16`);
    }

    // Verify no secret fields in returned items
    for (const q of attempt.questions) {
      if ('path' in q || 'theme' in q || 'reverseScored' in q) {
        throw new Error(`Leak detected in question: ${JSON.stringify(q)}`);
      }
    }

    // Mark as submitted so a new attempt can be issued
    await prisma.assessmentAttempt.update({
      where: { id: attempt.attemptId },
      data: { status: 'SUBMITTED', submittedAt: new Date() },
    });
  }

  // Check overlap across consecutive attempts
  const qSets = attempts.map(a => new Set(a.questions.map((q: any) => q.id)));
  console.log(`Attempt 1 questions: ${qSets[0].size}`);
  console.log(`Attempt 2 questions: ${qSets[1].size}`);
  console.log(`Attempt 3 questions: ${qSets[2].size}`);

  const overlap1_2 = [...qSets[0]].filter(x => qSets[1].has(x));
  const overlap2_3 = [...qSets[1]].filter(x => qSets[2].has(x));
  const overlap1_3 = [...qSets[0]].filter(x => qSets[2].has(x));

  console.log(`Overlap between Attempt 1 & 2: ${overlap1_2.length} (Expected: 0)`);
  console.log(`Overlap between Attempt 2 & 3: ${overlap2_3.length} (Expected: 0)`);
  console.log(`Overlap between Attempt 1 & 3: ${overlap1_3.length} (Expected: 0)`);

  if (overlap1_2.length > 0 || overlap2_3.length > 0 || overlap1_3.length > 0) {
    throw new Error('Freshness failure: Questions repeated across 3 consecutive attempts!');
  }
  console.log('✓ PASS: Zero question overlap across 3 consecutive attempts.');

  // Test 2: Difference between User 1 and User 2
  console.log('\n--- TEST 2: Difference between two users ---');
  const user2Attempt = await issueAttempt(user2.id);
  const u1q = attempts[0].questions.map((q: any) => q.id);
  const u2q = user2Attempt.questions.map((q: any) => q.id);
  
  const isIdentical = u1q.every((id: string, idx: number) => id === u2q[idx]);
  console.log(`User 1 attempt 1 vs User 2 attempt 1 identical: ${isIdentical}`);
  if (isIdentical) {
    throw new Error('User 1 and User 2 received identical questions in identical positions!');
  }
  console.log('✓ PASS: Different users receive different shuffled question sets.');

  // Test 3: Path diversity and reverse-scoring check on database attempt items
  console.log('\n--- TEST 3: Path balance, reverse scoring, and theme diversity ---');
  const dbAttemptItems = await prisma.assessmentAttemptItem.findMany({
    where: { attemptId: user2Attempt.attemptId },
    include: { question: true },
  });

  const pathCounts: Record<string, number> = {};
  const pathReverse: Record<string, number> = {};
  const pathThemes: Record<string, Set<string>> = {};

  for (const item of dbAttemptItems) {
    const p = item.question.path;
    pathCounts[p] = (pathCounts[p] || 0) + 1;
    if (item.question.reverseScored) {
      pathReverse[p] = (pathReverse[p] || 0) + 1;
    }
    if (!pathThemes[p]) pathThemes[p] = new Set();
    pathThemes[p].add(item.question.theme);
  }

  console.log('Path counts:', pathCounts);
  console.log('Path reverse scored counts:', pathReverse);
  console.log('Path theme counts:', Object.fromEntries(Object.entries(pathThemes).map(([k, v]) => [k, v.size])));

  for (const path of ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR']) {
    if (pathCounts[path] !== 4) throw new Error(`Path ${path} has ${pathCounts[path]} questions, expected 4`);
    if ((pathReverse[path] || 0) < 1) throw new Error(`Path ${path} has 0 reverse scored questions, expected >= 1`);
    if (pathThemes[path].size < 3) throw new Error(`Path ${path} has ${pathThemes[path].size} themes, expected >= 3`);
  }
  console.log('✓ PASS: Exactly 4 questions per path, >=1 reverse scored, >=3 themes per path.');

  // Clean up test users
  await prisma.user.deleteMany({
    where: { email: { in: [testEmail1, testEmail2] } },
  });
  console.log('\n--- TEST CLEANUP COMPLETED ---');
  console.log('ALL PHASE 1 ENGINE & DB CHECKS PASSED SUCCESSFULLY!');
}

main()
  .catch((err) => {
    console.error('Test failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { issueAttempt } from '../src/services/assessmentEngine';
import { calculatePathScores, calculateThemeScores, calculateAuraScore } from '../src/services/scoringEngine';
import { suggestPath } from '../src/services/pathSuggestionEngine';

const prisma = new PrismaClient();

async function main() {
  console.log('=== PHASE 2 END-TO-END VERIFICATION ===\n');

  // Clean previous test user
  const email = 'phase2_tester@evolveaura.internal';
  await prisma.user.deleteMany({ where: { email } });

  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      profile: {
        create: {
          name: 'Phase 2 Test User',
          role: 'COLLEGE_STUDENT',
          primaryGoal: 'Study',
        },
      },
    },
    include: { profile: true },
  });
  console.log(`Created test user: ${user.id} with primaryGoal="Study"`);

  // 1. Issue attempt
  const issued = await issueAttempt(user.id);
  console.log(`Issued attempt: ${issued.attemptId} with ${issued.questions.length} questions`);

  // Fetch full attempt items with questions to inspect paths and reverseScored
  const attemptDb = await prisma.assessmentAttempt.findUniqueOrThrow({
    where: { id: issued.attemptId },
    include: { items: { include: { question: true } } },
  });

  // Construct answers favouring WARRIOR:
  // For WARRIOR: standard=5, reverse=1 -> effective score = 5 (100%)
  // For others (SCHOLAR, SAGE, CREATOR): standard=1, reverse=5 -> effective score = 1 (0%)
  const answers: Record<string, number> = {};
  for (const item of attemptDb.items) {
    if (item.question.path === 'WARRIOR') {
      answers[item.questionId] = item.question.reverseScored ? 1 : 5;
    } else {
      answers[item.questionId] = item.question.reverseScored ? 5 : 1;
    }
  }

  // Calculate scores
  const scoredItems = attemptDb.items.map((it) => ({
    path: it.question.path,
    theme: it.question.theme,
    answer: answers[it.questionId],
    reverseScored: it.question.reverseScored,
  }));

  const pathScores = calculatePathScores(scoredItems);
  const themeScores = calculateThemeScores(scoredItems);
  const validScores = {
    scholar: pathScores.scholar!,
    warrior: pathScores.warrior!,
    sage: pathScores.sage!,
    creator: pathScores.creator!,
  };

  console.log('\n--- Calculated Path Scores ---');
  console.log(validScores);

  const suggestion = suggestPath(validScores, themeScores, user.profile?.primaryGoal);
  console.log('\n--- Suggestion Result ---');
  console.log({
    recommended: suggestion.recommended,
    runnerUp: suggestion.runnerUp,
    growthArea: suggestion.growthArea,
    confidence: suggestion.confidence,
    reasons: suggestion.reasons,
  });

  if (suggestion.recommended !== 'WARRIOR') {
    throw new Error(`Expected WARRIOR to be recommended, got ${suggestion.recommended}`);
  }
  if (suggestion.confidence !== 'HIGH') {
    throw new Error(`Expected HIGH confidence, got ${suggestion.confidence}`);
  }
  console.log('✓ PASS: Warrior-favoured assessment clearly recommends WARRIOR with HIGH confidence.');

  // 2. Test all-equal submission with primaryGoal="Creativity"
  console.log('\n--- All-Equal Submission (Goal Tie-Break) ---');
  const equalScores = { scholar: 50, warrior: 50, sage: 50, creator: 50 };
  const goalTieBreakSuggestion = suggestPath(equalScores, {}, 'Creativity');
  console.log(`With primaryGoal="Creativity", recommended=${goalTieBreakSuggestion.recommended}`);
  if (goalTieBreakSuggestion.recommended !== 'CREATOR') {
    throw new Error(`Expected CREATOR from goal tie-break, got ${goalTieBreakSuggestion.recommended}`);
  }
  console.log('✓ PASS: All-equal with primaryGoal="Creativity" returns CREATOR via Goal Tie-Break.');

  // 3. Test all-equal submission with Balanced Growth (Fixed Order)
  console.log('\n--- All-Equal Submission (Fixed Order Tie-Break) ---');
  const fixedOrderSuggestion = suggestPath(equalScores, {}, 'Balanced Growth');
  console.log(`With primaryGoal="Balanced Growth", recommended=${fixedOrderSuggestion.recommended}`);
  if (fixedOrderSuggestion.recommended !== 'SCHOLAR') {
    throw new Error(`Expected SCHOLAR from fixed order, got ${fixedOrderSuggestion.recommended}`);
  }
  console.log('✓ PASS: All-equal with Balanced Growth returns SCHOLAR via deterministic fixed order.');

  // Clean up
  await prisma.user.deleteMany({ where: { email } });
  console.log('\n=== ALL PHASE 2 VERIFICATIONS PASSED ===');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma['$disconnect']();
  });

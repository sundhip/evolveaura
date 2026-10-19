import { PrismaClient } from '@prisma/client';
import { isNonPathQuest } from '../src/services/questEngine';

const prisma = new PrismaClient();

async function main() {
  const isApply = process.argv.includes('--apply');
  console.log(`[Cleanup Off-Path Quests] Mode: ${isApply ? 'APPLY (changes will be committed)' : 'DRY RUN (read-only)'}`);

  const users = await prisma.user.findMany({
    include: {
      profile: true,
      quests: {
        where: { completed: false },
        include: { quest: true }
      }
    }
  });

  let totalOffPathFound = 0;
  const idsToDelete: string[] = [];

  for (const user of users) {
    const chosenPath = user.profile?.chosenPath;
    if (!chosenPath) continue;

    for (const uq of user.quests) {
      if (isNonPathQuest(uq.quest)) continue;

      if (uq.quest.path !== chosenPath) {
        totalOffPathFound++;
        idsToDelete.push(uq.id);
        console.log(`  User ${user.email} [${chosenPath}]: Off-path quest "${uq.quest.title}" (${uq.quest.path}) on ${uq.date.toISOString().split('T')[0]}`);
      }
    }
  }

  console.log(`Total off-path uncompleted quests identified: ${totalOffPathFound}`);

  if (isApply && idsToDelete.length > 0) {
    const result = await prisma.userQuest.deleteMany({
      where: { id: { in: idsToDelete } }
    });
    console.log(`[APPLY SUCCESS] Deleted ${result.count} off-path uncompleted user quests.`);
  } else if (!isApply && idsToDelete.length > 0) {
    console.log(`[DRY RUN] Would delete ${idsToDelete.length} off-path quests. Re-run with --apply to execute.`);
  } else {
    console.log('Clean state: 0 off-path uncompleted quests found.');
  }
}

main()
  .catch((e) => {
    console.error('Cleanup script error:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

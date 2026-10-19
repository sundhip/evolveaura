import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const dups: any[] = await prisma.$queryRaw`
    SELECT "userId", "questId", "date", COUNT(*) as cnt
    FROM "UserQuest"
    GROUP BY "userId", "questId", "date"
    HAVING COUNT(*) > 1
  `;
  console.log('Duplicates count:', dups.length);
  if (dups.length > 0) {
    console.log('Duplicates found:', dups);
    // Deduplicate by keeping the most recent or completed one
    for (const dup of dups) {
      const records = await prisma.userQuest.findMany({
        where: {
          userId: dup.userId,
          questId: dup.questId,
          date: new Date(dup.date),
        },
        orderBy: [{ completed: 'desc' }, { id: 'asc' }],
      });
      // Keep records[0], delete the rest
      const idsToDelete = records.slice(1).map((r) => r.id);
      if (idsToDelete.length > 0) {
        await prisma.userQuest.deleteMany({
          where: { id: { in: idsToDelete } },
        });
        console.log(`Deleted ${idsToDelete.length} duplicates for quest ${dup.questId}`);
      }
    }
  }

  // Also check Quest title duplicates
  const questDups: any[] = await prisma.$queryRaw`
    SELECT "title", COUNT(*) as cnt
    FROM "Quest"
    GROUP BY "title"
    HAVING COUNT(*) > 1
  `;
  console.log('Quest title duplicates:', questDups.length);
  if (questDups.length > 0) {
    for (const qd of questDups) {
      const qRecords = await prisma.quest.findMany({
        where: { title: qd.title },
        orderBy: { id: 'asc' },
      });
      const idsToDelete = qRecords.slice(1).map((r) => r.id);
      // Reassign any UserQuest pointing to duplicate quest IDs to qRecords[0].id
      for (const oldId of idsToDelete) {
        await prisma.userQuest.updateMany({
          where: { questId: oldId },
          data: { questId: qRecords[0].id },
        });
        await prisma.quest.delete({ where: { id: oldId } });
      }
      console.log(`Merged duplicate quest: ${qd.title}`);
    }
  }

  console.log('DB clean for unique constraints.');
}

main().catch(console.error).finally(() => prisma['$disconnect']());

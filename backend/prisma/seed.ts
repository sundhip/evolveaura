import { PrismaClient } from '@prisma/client';
import { QUESTION_BANK } from './questionBank';
import { QUEST_LIBRARY } from './questLibrary';

const prisma = new PrismaClient();

async function main() {
  console.log(`Upserting ${QUEST_LIBRARY.length} quests across all four paths...`);
  for (const q of QUEST_LIBRARY) {
    await prisma.quest.upsert({
      where: { title: q.title },
      update: {
        description: q.description,
        path: q.path,
        difficulty: q.difficulty,
        xpReward: q.xpReward,
        verificationType: q.verificationType,
        tags: q.tags || null,
        minRank: q.minRank || null,
      },
      create: {
        title: q.title,
        description: q.description,
        path: q.path,
        difficulty: q.difficulty,
        xpReward: q.xpReward,
        verificationType: q.verificationType,
        tags: q.tags || null,
        minRank: q.minRank || null,
      },
    });
  }

  // Upsert bosses
  const bosses = [
    {
      name: "Doom Scroll Demon",
      description: "Drains focus. Attacks when you check social media first thing in the morning.",
      maxHP: 2000,
      badgeReward: "Demon Slayer",
      xpReward: 500,
      spriteName: "demon",
      isRecovery: false,
    },
    {
      name: "Attention Destroyer",
      description: "Scatters attention span. Attacks when you multitask.",
      maxHP: 5000,
      badgeReward: "Zen Master",
      xpReward: 1000,
      spriteName: "destroyer",
      isRecovery: false,
    },
    {
      name: "Sleep Reaper",
      description: "Steals recovery. Attacks when you look at screens past 11:00 PM.",
      maxHP: 8000,
      badgeReward: "Night Sentinel",
      xpReward: 1500,
      spriteName: "reaper",
      isRecovery: false,
    },
    {
      name: "Nicotine Shade",
      description: "A shadowy manifestation of chemical cravings. Damaged by consistent daily check-ins, surviving cravings, and smoke-free days. Never recovers HP on slips.",
      maxHP: 3000,
      badgeReward: "Shade Dispeller",
      xpReward: 1000,
      spriteName: "shade",
      isRecovery: true,
    },
  ];

  for (const b of bosses) {
    await prisma.boss.upsert({
      where: { name: b.name },
      update: {
        description: b.description,
        maxHP: b.maxHP,
        badgeReward: b.badgeReward,
        xpReward: b.xpReward,
        spriteName: b.spriteName,
        isRecovery: b.isRecovery,
      },
      create: {
        name: b.name,
        description: b.description,
        maxHP: b.maxHP,
        badgeReward: b.badgeReward,
        xpReward: b.xpReward,
        spriteName: b.spriteName,
        isRecovery: b.isRecovery,
      },
    });
  }

  // Seed question bank - upsert by unique text
  console.log(`Upserting ${QUESTION_BANK.length} assessment questions...`);
  for (const q of QUESTION_BANK) {
    await prisma.assessmentQuestion.upsert({
      where: { text: q.text },
      update: {
        path: q.path,
        theme: q.theme,
        reverseScored: q.reverseScored,
        active: true,
      },
      create: {
        path: q.path,
        text: q.text,
        theme: q.theme,
        reverseScored: q.reverseScored,
        active: true,
      },
    });
  }

  console.log("Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma['$disconnect']());

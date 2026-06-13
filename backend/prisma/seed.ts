import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear any existing quests and bosses to prevent unique conflicts
  await prisma.quest.deleteMany({}).catch(() => {});
  await prisma.boss.deleteMany({}).catch(() => {});

  // Seed standard quests
  const quests = [
    { title: "Active Recall Study", description: "Complete a 25 minute focus session using active recall flashcards.", path: "SCHOLAR", difficulty: "EASY", xpReward: 50, verificationType: "TIMER" },
    { title: "Deep Work Block", description: "Maintain absolute focus for 45 minutes on your weakest academic subject.", path: "SCHOLAR", difficulty: "MEDIUM", xpReward: 100, verificationType: "TIMER" },
    { title: "Hydration Target", description: "Drink at least 3 liters of water and log your recovery logs.", path: "WARRIOR", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Outdoor Walking", description: "Walk for 30 minutes outdoors without checking social media.", path: "WARRIOR", difficulty: "MEDIUM", xpReward: 80, verificationType: "WALKING" },
    { title: "Mindfulness Meditation", description: "Perform 10 minutes of box breathing meditation to stabilize focus.", path: "SAGE", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Nightly Reflection Log", description: "Write down your end-of-day reflection review (minimum 50 characters).", path: "SAGE", difficulty: "MEDIUM", xpReward: 80, verificationType: "REFLECTION" },
    { title: "Creative Blueprint", description: "Draft a creative map or project design explaining a novel idea.", path: "CREATOR", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Mini Project Code", description: "Spend 45 minutes writing code or drawing layouts for your personal project.", path: "CREATOR", difficulty: "MEDIUM", xpReward: 100, verificationType: "TIMER" },
  ];

  for (const q of quests) {
    await prisma.quest.create({ data: q }).catch((e) => console.error("Quest seed fail", e));
  }

  // Seed bosses representing bad habits
  const bosses = [
    { name: "Doom Scroll Demon", description: "Drains focus. Attacks when you check social media first thing in the morning.", maxHP: 2000, badgeReward: "Demon Slayer", xpReward: 500, spriteName: "demon" },
    { name: "Attention Destroyer", description: "Scatters attention span. Attacks when you multitask.", maxHP: 5000, badgeReward: "Zen Master", xpReward: 1000, spriteName: "destroyer" },
    { name: "Sleep Reaper", description: "Steals recovery. Attacks when you look at screens past 11:00 PM.", maxHP: 8000, badgeReward: "Night Sentinel", xpReward: 1500, spriteName: "reaper" }
  ];

  for (const b of bosses) {
    await prisma.boss.create({ data: b }).catch((e) => console.error("Boss seed fail", e));
  }

  console.log("Database seeded successfully.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

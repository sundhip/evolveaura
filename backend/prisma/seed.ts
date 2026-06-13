import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const achievements = [
    { name: "7 Day Streak", description: "Maintain a study or habits streak for 7 consecutive days.", requirementType: "streak", requirementValue: 7, iconName: "Flame" },
    { name: "30 Day Streak", description: "Maintain a study or habits streak for 30 consecutive days.", requirementType: "streak", requirementValue: 30, iconName: "Crown" },
    { name: "Scholar Rank B", description: "Reach Rank B in the Scholar path.", requirementType: "path_rank", requirementValue: 61, iconName: "BookOpen" },
    { name: "Detox Champion", description: "Achieve a Detox Score of 90 or higher in a single day.", requirementType: "detox", requirementValue: 90, iconName: "ShieldCheck" },
    { name: "Focus Master", description: "Complete a total of 10 Focus sessions.", requirementType: "focus", requirementValue: 10, iconName: "Timer" },
    { name: "Consistency Master", description: "Complete all 4 daily quests for 5 days in a row.", requirementType: "consistency", requirementValue: 5, iconName: "Award" }
  ];

  for (const ach of achievements) {
    await prisma.achievement.upsert({
      where: { name: ach.name },
      update: {},
      create: ach
    });
  }

  // Pre-seed some default quests
  const quests = [
    { title: "Focus Block", description: "Perform 1 session of 25 minutes of deep focus without checking your phone.", path: "Scholar", difficulty: "Easy", xpReward: 25, category: "Deep Work", subSkill: "Focus" },
    { title: "Quick Review", description: "Write down 5 key bullet points from memory about a topic studied yesterday.", path: "Scholar", difficulty: "Easy", xpReward: 25, category: "Active Recall", subSkill: "Retention" },
    { title: "Hydration Check", description: "Drink at least 8 glasses (2.5 liters) of water today.", path: "Warrior", difficulty: "Easy", xpReward: 25, category: "Hydration", subSkill: "Energy" },
    { title: "Evening Walk", description: "Go for a brisk 15-minute walk outdoors. No devices.", path: "Warrior", difficulty: "Easy", xpReward: 25, category: "Walking", subSkill: "Activity" },
    { title: "Mindful Breathing", description: "Perform 5 minutes of mindful box breathing (4s inhale, 4s hold, 4s exhale, 4s hold).", path: "Sage", difficulty: "Easy", xpReward: 25, category: "Breathing", subSkill: "Mindfulness" },
    { title: "Gratitude Journal", description: "Write down 3 specific things you are grateful for today and why.", path: "Sage", difficulty: "Easy", xpReward: 25, category: "Gratitude", subSkill: "Reflection" },
    { title: "Curiosity Spark", description: "Read an article or watch a video about an completely unfamiliar topic.", path: "Creator", difficulty: "Easy", xpReward: 25, category: "Writing", subSkill: "Curiosity" },
    { title: "Mind Mapping", description: "Draw a mind map of a creative project or business concept.", path: "Creator", difficulty: "Easy", xpReward: 25, category: "Mind Maps", subSkill: "Innovation" }
  ];

  for (const q of quests) {
    await prisma.quest.create({
      data: q
    }).catch(() => {});
  }

  console.log("Database seeded successfully.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

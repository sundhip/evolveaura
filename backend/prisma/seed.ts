import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Clear any existing quests and bosses to prevent conflicts
  await prisma.quest.deleteMany({}).catch(() => {});
  await prisma.boss.deleteMany({}).catch(() => {});

  // Seed standard quests - 6 per path
  const quests = [
    // SCHOLAR PATH
    { title: "Active Recall Study", description: "Complete a 25 minute focus session using active recall flashcards.", path: "SCHOLAR", difficulty: "EASY", xpReward: 50, verificationType: "TIMER" },
    { title: "Deep Work Block", description: "Maintain absolute focus for 45 minutes on your weakest academic subject.", path: "SCHOLAR", difficulty: "MEDIUM", xpReward: 100, verificationType: "TIMER" },
    { title: "Feynman Technique Learn", description: "Spend 30 minutes learning a topic and explain it in simple terms in your notes.", path: "SCHOLAR", difficulty: "MEDIUM", xpReward: 90, verificationType: "REFLECTION" },
    { title: "Spaced Repetition Review", description: "Review 3 previously learned topics using a spaced repetition schedule.", path: "SCHOLAR", difficulty: "EASY", xpReward: 60, verificationType: "ACTION" },
    { title: "Sustained Reading Session", description: "Complete a 60-minute focused reading session of academic textbook chapters.", path: "SCHOLAR", difficulty: "HARD", xpReward: 150, verificationType: "TIMER" },
    { title: "Problem Solving Drill", description: "Complete a 35-minute practice set solving tough test problems.", path: "SCHOLAR", difficulty: "MEDIUM", xpReward: 80, verificationType: "TIMER" },

    // WARRIOR PATH
    { title: "Hydration Target", description: "Drink at least 3 liters of water and log your recovery logs.", path: "WARRIOR", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Outdoor Walking", description: "Walk for 30 minutes outdoors without checking social media.", path: "WARRIOR", difficulty: "MEDIUM", xpReward: 80, verificationType: "WALKING" },
    { title: "Morning Sunlight Capture", description: "Get 15 minutes of direct morning sunlight exposure within 1 hour of waking.", path: "WARRIOR", difficulty: "EASY", xpReward: 40, verificationType: "ACTION" },
    { title: "Screen-Free Wind Down", description: "Disconnect from all digital screens 1 hour before going to bed.", path: "WARRIOR", difficulty: "MEDIUM", xpReward: 70, verificationType: "ACTION" },
    { title: "Consistent Sleep Target", description: "Log 7-8 hours of sound sleep without late-night screen wakeups.", path: "WARRIOR", difficulty: "MEDIUM", xpReward: 90, verificationType: "REFLECTION" },
    { title: "Cardio Endurance Workout", description: "Complete a 30-minute cardio exercise (running, cycling, or HIIT).", path: "WARRIOR", difficulty: "HARD", xpReward: 120, verificationType: "ACTION" },

    // SAGE PATH
    { title: "Mindfulness Meditation", description: "Perform 10 minutes of box breathing meditation to stabilize focus.", path: "SAGE", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Nightly Reflection Log", description: "Write down your end-of-day reflection review (minimum 50 characters).", path: "SAGE", difficulty: "MEDIUM", xpReward: 80, verificationType: "REFLECTION" },
    { title: "Nature Grounding", description: "Spend 15 minutes in a park or garden with zero digital inputs.", path: "SAGE", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Gratitude Journaling", description: "Write down 3 specific things you are grateful for today and why.", path: "SAGE", difficulty: "EASY", xpReward: 60, verificationType: "REFLECTION" },
    { title: "Digital Detox Window", description: "Lock all devices away and engage in a 60-minute analog hobby.", path: "SAGE", difficulty: "MEDIUM", xpReward: 100, verificationType: "TIMER" },
    { title: "Guided Deep Exhale", description: "Complete 5 minutes of box breathing focus stabilizer.", path: "SAGE", difficulty: "EASY", xpReward: 40, verificationType: "TIMER" },

    // CREATOR PATH
    { title: "Creative Blueprint", description: "Draft a creative map or project design explaining a novel idea.", path: "CREATOR", difficulty: "EASY", xpReward: 50, verificationType: "ACTION" },
    { title: "Mini Project Code", description: "Spend 45 minutes writing code or drawing layouts for your personal project.", path: "CREATOR", difficulty: "MEDIUM", xpReward: 100, verificationType: "TIMER" },
    { title: "UI Wireframe Draft", description: "Sketch 3 wireframe layouts for your project screen concept.", path: "CREATOR", difficulty: "EASY", xpReward: 60, verificationType: "ACTION" },
    { title: "Skill Practice Drill", description: "Practice a specific technical or artistic skill for 30 minutes.", path: "CREATOR", difficulty: "MEDIUM", xpReward: 80, verificationType: "TIMER" },
    { title: "Project Architecture Review", description: "Document the system database schema or folder structure design.", path: "CREATOR", difficulty: "MEDIUM", xpReward: 90, verificationType: "REFLECTION" },
    { title: "Milestone Release Build", description: "Complete a 90-minute core project development block.", path: "CREATOR", difficulty: "HARD", xpReward: 160, verificationType: "TIMER" }
  ];

  for (const q of quests) {
    await prisma.quest.create({ data: q }).catch((e) => console.error("Quest seed fail", e));
  }

  // Seed bosses representing bad habits
  const bosses = [
    { name: "Doom Scroll Demon", description: "Drains focus. Attacks when you check social media first thing in the morning.", maxHP: 2000, badgeReward: "Demon Slayer", xpReward: 500, spriteName: "demon", isRecovery: false },
    { name: "Attention Destroyer", description: "Scatters attention span. Attacks when you multitask.", maxHP: 5000, badgeReward: "Zen Master", xpReward: 1000, spriteName: "destroyer", isRecovery: false },
    { name: "Sleep Reaper", description: "Steals recovery. Attacks when you look at screens past 11:00 PM.", maxHP: 8000, badgeReward: "Night Sentinel", xpReward: 1500, spriteName: "reaper", isRecovery: false }
  ];

  for (const b of bosses) {
    await prisma.boss.create({ data: b }).catch((e) => console.error("Boss seed fail", e));
  }

  console.log("Database seeded successfully.");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());

export interface QuestDefinition {
  title: string;
  description: string;
  path: 'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR';
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'ELITE';
  xpReward: number;
  verificationType: 'TIMER' | 'WALKING' | 'REFLECTION' | 'ACTION';
  tags?: string;
  minRank?: string;
}

export const QUEST_LIBRARY: QuestDefinition[] = [
  // ==========================================
  // SCHOLAR PATH (32 quests: 10 EASY, 14 MEDIUM, 6 HARD, 2 ELITE)
  // ==========================================
  // Existing Quests preserved
  {
    title: "Active Recall Study",
    description: "Complete a 25 minute focus session using active recall flashcards.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "TIMER"
  },
  {
    title: "Deep Work Block",
    description: "Maintain absolute focus for 45 minutes on your weakest academic subject.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 100,
    verificationType: "TIMER",
    tags: "anchor"
  },
  {
    title: "Feynman Technique Learn",
    description: "Spend 30 minutes learning a topic and explain it in simple terms in your notes.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "REFLECTION"
  },
  {
    title: "Spaced Repetition Review",
    description: "Review 3 previously learned topics using a spaced repetition schedule.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 60,
    verificationType: "ACTION"
  },
  {
    title: "Sustained Reading Session",
    description: "Complete a 60-minute focused reading session of academic textbook chapters.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "TIMER"
  },
  {
    title: "Problem Solving Drill",
    description: "Complete a 35-minute practice set solving tough test problems.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "TIMER"
  },

  // Weekday Signatures (0 = Sunday ... 6 = Saturday)
  {
    title: "Scholar Sunday Syllabus Audit",
    description: "Audit your weekly study syllabus for 20 minutes and schedule your priority topics.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION",
    tags: "weekday_0"
  },
  {
    title: "Scholar Monday Focus Sprint",
    description: "Kick off the academic week with an intense 30-minute deep study sprint.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER",
    tags: "weekday_1"
  },
  {
    title: "Scholar Tuesday Core Concept Map",
    description: "Create a concept mind-map linking key equations and principles for 25 minutes.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "REFLECTION",
    tags: "weekday_2"
  },
  {
    title: "Scholar Wednesday Mid-Week Quiz",
    description: "Self-administer a 30-minute closed-book quiz on topics covered this week.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER",
    tags: "weekday_3"
  },
  {
    title: "Scholar Thursday Weak-Point Siege",
    description: "Dedicate a 40-minute problem dissection targeting your lowest-scoring topic.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 95,
    verificationType: "TIMER",
    tags: "weekday_4"
  },
  {
    title: "Scholar Friday Exam Synthesis",
    description: "Synthesize summary formula sheets and core rules in a 30-minute review.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "ACTION",
    tags: "weekday_5"
  },
  {
    title: "Scholar Saturday Full Mock Session",
    description: "Simulate test conditions for a 50-minute uninterrupted mock assessment block.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 130,
    verificationType: "TIMER",
    tags: "weekday_6"
  },

  // Remaining Easy (8 more to reach 10 total EASY)
  {
    title: "Scholar Desk Declutter",
    description: "Clear your physical study desk of all clutter and non-academic distractions.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Scholar Quick Glossary Check",
    description: "Review and define 10 core terminology definitions in your notebook.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Micro Pomodoro",
    description: "Run a quick 15-minute single-task focus burst on pending homework.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Chapter Preview",
    description: "Skim chapter headings, figures, and summaries before starting class lectures.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Scholar Formula Flashcard Review",
    description: "Test 15 key formulas or definitions using quick flashcard recall.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Scholar Error Log Entry",
    description: "Log 3 errors made during homework problems and write the correct rationale.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Audio Lecture Recap",
    description: "Summarize main takeaways from a lecture or educational video in 3 bullet points.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Question Bank Prep",
    description: "Curate a list of 5 difficult practice questions to solve in upcoming study sessions.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },

  // Remaining Medium (6 more to reach 14 total MEDIUM)
  {
    title: "Scholar Cornell Note Taking",
    description: "Rewrite lecture notes using the Cornell method with clear cues and summaries for 30 minutes.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 75,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Proof & Derivation",
    description: "Derive 2 fundamental scientific or mathematical proofs step-by-step for 30 minutes.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Interleaved Practice",
    description: "Switch between 3 distinct problem types in a 35-minute mixed problem-solving session.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Peer Teaching Outline",
    description: "Structure a concise 1-page teaching guide to explain a tricky concept to a peer.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Academic Article Dissection",
    description: "Read a research or journal paper for 30 minutes and annotate its methodology.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Timed Essay Outline",
    description: "Draft a comprehensive essay outline with citations and thesis statement in 25 minutes.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "TIMER"
  },

  // Remaining Hard (4 more to reach 6 total HARD)
  {
    title: "Scholar 75-Minute Mastery Block",
    description: "Maintain rigorous, uninterrupted study focus for 75 minutes on core coursework.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 160,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Olympiad Problem Gauntlet",
    description: "Attempt 3 competitive exam-level problems requiring deep multi-step deduction for 45 minutes.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 140,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Full Chapter Deep Deconstruction",
    description: "Deconstruct an entire advanced chapter into notes, questions, and summaries for 60 minutes.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Timed Exam Section Simulation",
    description: "Complete an official timed exam paper section without open notes for 60 minutes.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 155,
    verificationType: "TIMER"
  },

  // Elite (2 ELITE)
  {
    title: "Scholar 90-Minute Arch-Sage Crucible",
    description: "Engage in an intense 90-minute uninterrupted deep-work crucible with comprehensive deliverables.",
    path: "SCHOLAR",
    difficulty: "ELITE",
    xpReward: 220,
    verificationType: "TIMER",
    minRank: "A"
  },
  {
    title: "Scholar Comprehensive Subject Synthesis",
    description: "Produce a publication-quality 10-page synthesized master review guide across the whole semester.",
    path: "SCHOLAR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "REFLECTION",
  },
  {
    title: "Scholar Formula Sheet Review",
    description: "Complete a 20-minute active recall review of core academic formulas and definitions.",
    path: "SCHOLAR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Scholar Peer Review Simulation",
    description: "Spend 35 minutes critiquing and proofreading an academic essay or problem set.",
    path: "SCHOLAR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "REFLECTION"
  },
  {
    title: "Scholar Comprehensive Mock Exam",
    description: "Complete a 75-minute timed mock test under strict exam conditions without notes.",
    path: "SCHOLAR",
    difficulty: "HARD",
    xpReward: 160,
    verificationType: "TIMER"
  },
  {
    title: "Scholar Sovereign Synthesis Treatise",
    description: "Draft a 90-minute multi-disciplinary synthesis connecting two distinct subject domains.",
    path: "SCHOLAR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "TIMER",
    minRank: "A"
  },

  // ==========================================
  // WARRIOR PATH (32 quests: 10 EASY, 14 MEDIUM, 6 HARD, 2 ELITE)
  // ==========================================
  // Existing Quests preserved
  {
    title: "Hydration Target",
    description: "Drink at least 3 liters of water and log your recovery logs.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Outdoor Walking",
    description: "Walk for 30 minutes outdoors without checking social media.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "WALKING"
  },
  {
    title: "Morning Sunlight Capture",
    description: "Get 15 minutes of direct morning sunlight exposure within 1 hour of waking.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Screen-Free Wind Down",
    description: "Disconnect from all digital screens 1 hour before going to bed.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 70,
    verificationType: "ACTION"
  },
  {
    title: "Consistent Sleep Target",
    description: "Log 7-8 hours of sound sleep without late-night screen wakeups.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "REFLECTION",
    tags: "anchor"
  },
  {
    title: "Cardio Endurance Workout",
    description: "Complete a 30-minute cardio exercise (running, cycling, or HIIT).",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 120,
    verificationType: "ACTION"
  },

  // Weekday Signatures (0 = Sunday ... 6 = Saturday)
  {
    title: "Warrior Sunday Recovery Meal Prep",
    description: "Plan and prep nutrient-dense whole meals for the upcoming training week.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "ACTION",
    tags: "weekday_0"
  },
  {
    title: "Warrior Monday Calisthenics Foundation",
    description: "Complete a 30-minute bodyweight circuit of pushups, pullups, and core drills.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "ACTION",
    tags: "weekday_1"
  },
  {
    title: "Warrior Tuesday Low-Intensity Steady State",
    description: "Execute 40 minutes of zone 2 aerobic recovery walking, jogging, or cycling.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "WALKING",
    tags: "weekday_2"
  },
  {
    title: "Warrior Wednesday Posture & Mobility",
    description: "Dedicate 25 minutes to thoracic spine mobility, hip openers, and posture drills.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "ACTION",
    tags: "weekday_3"
  },
  {
    title: "Warrior Thursday Interval Power",
    description: "Complete a high-intensity interval conditioning workout for 25 minutes.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 95,
    verificationType: "ACTION",
    tags: "weekday_4"
  },
  {
    title: "Warrior Friday Strict Sleep Lock",
    description: "Lock sleep timing: in bed with lights extinguished at your designated hour.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "REFLECTION",
    tags: "weekday_5"
  },
  {
    title: "Warrior Saturday Trail Expedition",
    description: "Complete a 60-minute outdoor endurance ruck or vigorous nature trail march.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 140,
    verificationType: "WALKING",
    tags: "weekday_6"
  },

  // Remaining Easy (8 more to reach 10 total EASY)
  {
    title: "Warrior Morning Hydration Starter",
    description: "Drink 500ml of water with a pinch of electrolytes immediately upon rising.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Cold Shower Shock",
    description: "End your morning shower with 60 seconds of cold water to trigger alertness.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Warrior 10-Minute Desk Decompress",
    description: "Take a 10-minute break to stand, stretch hip flexors, and look into the distance.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Step Goal Benchmark",
    description: "Log at least 8,000 recorded steps across your normal daytime movement.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "WALKING"
  },
  {
    title: "Warrior Sugar & Soda Fast",
    description: "Eliminate sugary sodas and processed candy for the entire calendar day.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "REFLECTION"
  },
  {
    title: "Warrior Deep Squat Rest",
    description: "Accumulate 5 minutes of resting in a deep flat-footed primal squat.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Evening Bedroom Cool-Down",
    description: "Set your bedroom environment to a cool, dark, and well-ventilated sleep state.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Whole Food Nutrition Log",
    description: "Ensure all meals today consist of unprocessed whole foods and record your macros.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "REFLECTION"
  },

  // Remaining Medium (6 more to reach 14 total MEDIUM)
  {
    title: "Warrior Kettlebell or Dumbbell Complex",
    description: "Complete 5 rounds of a compound dumbbell or kettlebell strength circuit for 30 minutes.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Ruck March Pace",
    description: "Walk for 35 minutes carrying a weighted backpack at a brisk cadence.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "WALKING"
  },
  {
    title: "Warrior Contrast Hydrotherapy",
    description: "Alternate between hot and cold shower cycles for 15 minutes to spur circulation.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 75,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Fasting Protocol Check",
    description: "Observe a 14-hour overnight metabolic rest window before your first meal.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION"
  },
  {
    title: "Warrior Core Stability Hold",
    description: "Complete a 20-minute core stability workout featuring planks and bird-dogs.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Breathing Capacity Drill",
    description: "Perform 20 minutes of nasal-only aerobic cardio to expand lung efficiency.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "ACTION"
  },

  // Remaining Hard (4 more to reach 6 total HARD)
  {
    title: "Warrior 5K Run Test",
    description: "Complete a continuous 5-kilometer run and document your pacing metrics.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Heavy Compound Strength",
    description: "Complete a 45-minute structured barbell or heavy resistance strength workout.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 145,
    verificationType: "ACTION"
  },
  {
    title: "Warrior 10,000 Step Distance March",
    description: "Achieve a recorded 10,000 steps through intentional walking and hiking.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 135,
    verificationType: "WALKING"
  },
  {
    title: "Warrior Full Body Metcon",
    description: "Execute a relentless 40-minute metabolic conditioning circuit.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "ACTION"
  },

  // Elite (2 ELITE)
  {
    title: "Warrior Spartan Decathlon Trial",
    description: "Execute 100 pushups, 50 pullups, 150 squats, and a 5km run within a single training block.",
    path: "WARRIOR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "ACTION",
    minRank: "A"
  },
  {
    title: "Warrior 2-Hour Mountain Ruck",
    description: "Complete a demanding 120-minute outdoor mountainous endurance march with elevation gain.",
    path: "WARRIOR",
    difficulty: "ELITE",
    xpReward: 240,
    verificationType: "WALKING",
    minRank: "A"
  },
  {
    title: "Warrior Hydration & Posture Reset",
    description: "Drink 1 liter of electrolytes and execute 15 minutes of dynamic spinal and posture resets.",
    path: "WARRIOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Warrior Functional Calisthenics Circuit",
    description: "Complete a 35-minute full body functional calisthenics circuit maintaining continuous rhythm.",
    path: "WARRIOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER"
  },
  {
    title: "Warrior Trail Ruck Endurance",
    description: "Complete a 60-minute outdoor weighted ruck march or sustained trail run.",
    path: "WARRIOR",
    difficulty: "HARD",
    xpReward: 140,
    verificationType: "WALKING"
  },
  {
    title: "Warrior Iron Spartan Crucible",
    description: "Complete a demanding 90-minute multi-stage functional strength and endurance trial.",
    path: "WARRIOR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "TIMER",
    minRank: "A"
  },

  // ==========================================
  // SAGE PATH (32 quests: 10 EASY, 14 MEDIUM, 6 HARD, 2 ELITE)
  // ==========================================
  // Existing Quests preserved
  {
    title: "Mindfulness Meditation",
    description: "Perform 10 minutes of box breathing meditation to stabilize focus.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Nightly Reflection Log",
    description: "Write down your end-of-day reflection review (minimum 50 characters).",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION",
    tags: "anchor"
  },
  {
    title: "Nature Grounding",
    description: "Spend 15 minutes in a park or garden with zero digital inputs.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Gratitude Journaling",
    description: "Write down 3 specific things you are grateful for today and why.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 60,
    verificationType: "REFLECTION"
  },
  {
    title: "Digital Detox Window",
    description: "Lock all devices away and engage in a 60-minute analog hobby.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 100,
    verificationType: "TIMER"
  },
  {
    title: "Guided Deep Exhale",
    description: "Complete 5 minutes of box breathing focus stabilizer.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "TIMER"
  },

  // Weekday Signatures (0 = Sunday ... 6 = Saturday)
  {
    title: "Sage Sunday Solitude Retreat",
    description: "Spend 45 minutes in total undistracted silence reflecting on personal virtues.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER",
    tags: "weekday_0"
  },
  {
    title: "Sage Monday Intention Setting",
    description: "Write your weekly manifesto and top 3 moral/behavioral guidelines for 20 minutes.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION",
    tags: "weekday_1"
  },
  {
    title: "Sage Tuesday Stoic Perception Check",
    description: "Identify an external annoyance and reframe it into an opportunity for resilience.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION",
    tags: "weekday_2"
  },
  {
    title: "Sage Wednesday Breath Equilibrium",
    description: "Practice 20 minutes of rhythmic diaphragmatic breathing to regulate nervous system tone.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER",
    tags: "weekday_3"
  },
  {
    title: "Sage Thursday Impulsive Urge Surfing",
    description: "Notice an urge to scroll or browse, pause for 15 minutes, and observe it dissipate.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "REFLECTION",
    tags: "weekday_4"
  },
  {
    title: "Sage Friday Compassion Practice",
    description: "Reach out to someone in your circle with words of genuine encouragement and empathy.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "ACTION",
    tags: "weekday_5"
  },
  {
    title: "Sage Saturday Forest Contemplation",
    description: "Complete a 60-minute silent contemplative walk amidst trees without headphones.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 135,
    verificationType: "WALKING",
    tags: "weekday_6"
  },

  // Remaining Easy (6 more to reach 10 total EASY)
  {
    title: "Sage 3-Minute Stress Reset",
    description: "Execute 3 minutes of physiological sighs (double inhale, slow exhale) to lower heart rate.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "TIMER"
  },
  {
    title: "Sage Notification Purge",
    description: "Silence all non-essential phone and app notifications for the rest of today.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Sage Mindful Tea Ritual",
    description: "Drink a cup of tea or warm water in complete stillness, noticing every sensory detail.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Sage Judgment Suspension",
    description: "Catch yourself making a hasty criticism today and consciously replace it with curiosity.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "REFLECTION"
  },
  {
    title: "Sage Posture Awareness Check",
    description: "Take 5 conscious posture alignments throughout the day, unclenching jaw and shoulders.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },
  {
    title: "Sage Evening Gratitude Trio",
    description: "Note three simple moments of peace experienced during today's routine.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "REFLECTION"
  },

  // Remaining Medium (6 more to reach 14 total MEDIUM)
  {
    title: "Sage 30-Minute Vipassana Sit",
    description: "Maintain motionless seated posture and follow breath sensations for 30 minutes.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Sage Emotional Shadow Journal",
    description: "Explore a source of lingering anger or resentment in writing for 25 minutes.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "REFLECTION"
  },
  {
    title: "Sage Half-Day Phone Fast",
    description: "Store your mobile device in another room from 12:00 PM to 4:00 PM.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 95,
    verificationType: "ACTION"
  },
  {
    title: "Sage Body Scan Meditation",
    description: "Complete a 25-minute sequential body scan meditation relaxing every muscle group.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "TIMER"
  },
  {
    title: "Sage Philosophical Essay Study",
    description: "Read and summarize 30 minutes of classical Stoic or Buddhist philosophy.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Sage Random Act of Kindness",
    description: "Perform an anonymous or unsolicited thoughtful action for a neighbor or colleague.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "ACTION"
  },

  // Remaining Hard (5 more to reach 6 total HARD)
  {
    title: "Sage 2-Hour Digital Blackout",
    description: "Spend 120 minutes with every electronic screen powered completely off.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "TIMER"
  },
  {
    title: "Sage 45-Minute Deep Meditation",
    description: "Sustain continuous mindfulness meditation without breaking posture for 45 minutes.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 145,
    verificationType: "TIMER"
  },
  {
    title: "Sage Complete Fast From Complaints",
    description: "Go 24 hours without voicing a single complaint or negative critique.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 160,
    verificationType: "REFLECTION"
  },
  {
    title: "Sage Life Philosophy Audit",
    description: "Write a comprehensive 750-word philosophical essay examining your core life principles.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 155,
    verificationType: "REFLECTION"
  },
  {
    title: "Sage 10-Mile Contemplative March",
    description: "Complete a long solitary march observing your inner monologue without distraction.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "WALKING"
  },

  // Elite (2 ELITE)
  {
    title: "Sage Full Day Silent Vigil",
    description: "Maintain unbroken noble silence with zero non-essential speech and zero screens for an entire day.",
    path: "SAGE",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "REFLECTION",
    minRank: "A"
  },
  {
    title: "Sage 60-Minute Non-Dual Awareness",
    description: "Sustain deep uninterrupted non-dual awareness meditation for 60 minutes with a written log.",
    path: "SAGE",
    difficulty: "ELITE",
    xpReward: 220,
    verificationType: "TIMER",
    minRank: "A"
  },
  {
    title: "Sage Mindful Breath Walk",
    description: "Complete a 20-minute silent walk in nature, synchronizing footsteps with steady 4-count breathing.",
    path: "SAGE",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Sage Stoic Reflection Audit",
    description: "Spend 30 minutes writing a structured reflection on cognitive biases and emotional detachment.",
    path: "SAGE",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "REFLECTION"
  },
  {
    title: "Sage Extended Sensory Fast",
    description: "Spend 60 minutes in complete stillness without sound, speech, or digital input.",
    path: "SAGE",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "TIMER"
  },
  {
    title: "Sage Transcendent Stillness Vigil",
    description: "Engage in a 90-minute advanced contemplative stillness session with documented insights.",
    path: "SAGE",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "REFLECTION",
    minRank: "A"
  },

  // ==========================================
  // CREATOR PATH (32 quests: 10 EASY, 14 MEDIUM, 6 HARD, 2 ELITE)
  // ==========================================
  // Existing Quests preserved
  {
    title: "Creative Blueprint",
    description: "Draft a creative map or project design explaining a novel idea.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Mini Project Code",
    description: "Spend 45 minutes writing code or drawing layouts for your personal project.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 100,
    verificationType: "TIMER",
    tags: "anchor"
  },
  {
    title: "UI Wireframe Draft",
    description: "Sketch 3 wireframe layouts for your project screen concept.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 60,
    verificationType: "ACTION"
  },
  {
    title: "Skill Practice Drill",
    description: "Practice a specific technical or artistic skill for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "TIMER"
  },
  {
    title: "Project Architecture Review",
    description: "Document the system database schema or folder structure design.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "REFLECTION"
  },
  {
    title: "Milestone Release Build",
    description: "Complete a 90-minute core project development block.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 160,
    verificationType: "TIMER"
  },

  // Weekday Signatures (0 = Sunday ... 6 = Saturday)
  {
    title: "Creator Sunday Backlog Pruning",
    description: "Organize project tasks, write user stories, and prioritize the week's build roadmap for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION",
    tags: "weekday_0"
  },
  {
    title: "Creator Monday Core Feature Kickoff",
    description: "Build the foundational logic or draft of a new project component for 35 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER",
    tags: "weekday_1"
  },
  {
    title: "Creator Tuesday Refactoring Sweep",
    description: "Clean up code, revise prose, or improve design components for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER",
    tags: "weekday_2"
  },
  {
    title: "Creator Wednesday Rapid Prototyping",
    description: "Build a raw, imperfect interactive prototype of a feature in 40 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER",
    tags: "weekday_3"
  },
  {
    title: "Creator Thursday Feedback Collection",
    description: "Share your latest draft with a peer or user community and log 2 actionable notes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "REFLECTION",
    tags: "weekday_4"
  },
  {
    title: "Creator Friday Polish & Commit",
    description: "Polish edges, fix bugs, and push a verified commit to version control for 35 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER",
    tags: "weekday_5"
  },
  {
    title: "Creator Saturday Public Ship Sprint",
    description: "Complete a 60-minute shipping sprint to deploy or publish tangible work.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 140,
    verificationType: "TIMER",
    tags: "weekday_6"
  },

  // Remaining Easy (8 more to reach 10 total EASY)
  {
    title: "Creator Idea Journal Log",
    description: "Write down 3 creative project ideas or inventive solutions that came to mind today.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "REFLECTION"
  },
  {
    title: "Creator Inspiration Moodboard",
    description: "Collect 5 inspiring visual or architectural references for your ongoing project.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Creator 15-Minute Freeform Sketch",
    description: "Draw, write, or brainstorm without editing for 15 minutes to overcome creative friction.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "TIMER"
  },
  {
    title: "Creator Color Palette Study",
    description: "Create or refine a harmonious 4-color palette for your user interface or artwork.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Creator Documentation Snippet",
    description: "Write a clear, concise README overview describing what your project accomplishes.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "REFLECTION"
  },
  {
    title: "Creator Typography Selection",
    description: "Audit and select font pairings for optimal legibility and aesthetic tone.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Creator Micro Component Build",
    description: "Code or design a single isolated UI button, card, or graphic element.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 50,
    verificationType: "ACTION"
  },
  {
    title: "Creator Asset Organization",
    description: "Organize project assets, icons, and exports into clean named directory folders.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 40,
    verificationType: "ACTION"
  },

  // Remaining Medium (6 more to reach 14 total MEDIUM)
  {
    title: "Creator State Management Flow",
    description: "Map and diagram data flows or state lifecycles in your project architecture for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Creator API Endpoint Design",
    description: "Design and implement 2 clean API routes with request validation for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER"
  },
  {
    title: "Creator Responsive UI Audit",
    description: "Test and optimize mobile screen responsiveness across all breakpoints for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Creator User Story Mapping",
    description: "Write 5 detailed user test scenarios outlining edge cases and user journeys.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 80,
    verificationType: "REFLECTION"
  },
  {
    title: "Creator Audio or Visual Polish",
    description: "Add micro-interactions, sound effects, or animation transitions for 30 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 85,
    verificationType: "TIMER"
  },
  {
    title: "Creator Modular Refactor",
    description: "Extract messy duplicate code into reusable utility helpers for 35 minutes.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER"
  },

  // Remaining Hard (4 more to reach 6 total HARD)
  {
    title: "Creator 75-Minute Deep Build",
    description: "Maintain unbroken engineering focus for 75 minutes on core project deliverables.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 160,
    verificationType: "TIMER"
  },
  {
    title: "Creator Zero-to-One Prototype",
    description: "Build an end-to-end working MVP feature flow from scratch in 60 minutes.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 150,
    verificationType: "TIMER"
  },
  {
    title: "Creator Performance Optimization Sprint",
    description: "Profile and reduce bundle size or database query latency for 60 minutes.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 155,
    verificationType: "TIMER"
  },
  {
    title: "Creator Public Release Notes",
    description: "Package a formal versioned release with comprehensive change logs and demos.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 145,
    verificationType: "REFLECTION"
  },

  // Elite (2 ELITE)
  {
    title: "Creator 120-Minute Product Forge",
    description: "Complete an epic 120-minute product building marathon pushing a major milestone.",
    path: "CREATOR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "TIMER",
    minRank: "A"
  },
  {
    title: "Creator End-to-End Application Launch",
    description: "Deploy a live production build with custom domain, database, and telemetry connected.",
    path: "CREATOR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "REFLECTION",
    minRank: "A"
  },
  {
    title: "Creator Component Design Sketch",
    description: "Draw paper or digital wireframes for 3 distinct user interface screens or data structures.",
    path: "CREATOR",
    difficulty: "EASY",
    xpReward: 45,
    verificationType: "ACTION"
  },
  {
    title: "Creator Codebase Modular Refactor",
    description: "Spend 40 minutes refactoring coupled modules into clean, typed, and tested components.",
    path: "CREATOR",
    difficulty: "MEDIUM",
    xpReward: 90,
    verificationType: "TIMER"
  },
  {
    title: "Creator Production Pipeline Test",
    description: "Build, containerize, and execute end-to-end integration tests for a core system feature.",
    path: "CREATOR",
    difficulty: "HARD",
    xpReward: 155,
    verificationType: "TIMER"
  },
  {
    title: "Creator Grand Architecture Blueprint",
    description: "Author a comprehensive 90-minute system architecture document with schemas and flow diagrams.",
    path: "CREATOR",
    difficulty: "ELITE",
    xpReward: 250,
    verificationType: "REFLECTION",
    minRank: "A"
  }
];

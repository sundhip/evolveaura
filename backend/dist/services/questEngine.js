"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QUEST_TEMPLATES = void 0;
exports.selectQuestsForUser = selectQuestsForUser;
exports.QUEST_TEMPLATES = [
    { title: "Focus Block", description: "Perform 1 session of 25 minutes of deep focus without checking your phone.", path: "Scholar", difficulty: "Easy", xpReward: 25, category: "Deep Work", subSkill: "Focus" },
    { title: "Quick Review", description: "Write down 5 key bullet points from memory about a topic studied yesterday.", path: "Scholar", difficulty: "Easy", xpReward: 25, category: "Active Recall", subSkill: "Retention" },
    { title: "Double Pomodoro", description: "Complete 2 blocks of 25 minutes of deep focus with a 5-minute break.", path: "Scholar", difficulty: "Medium", xpReward: 50, category: "Deep Work", subSkill: "Focus" },
    { title: "Feynman Method", description: "Explain a difficult concept in a simple written paragraph as if teaching a child.", path: "Scholar", difficulty: "Medium", xpReward: 50, category: "Feynman Technique", subSkill: "Understanding" },
    { title: "Deep Work Marathon", description: "Engage in 90 minutes of continuous focus on a high-difficulty learning task.", path: "Scholar", difficulty: "Hard", xpReward: 100, category: "Deep Work", subSkill: "Focus" },
    { title: "Spaced Recall Review", description: "Review a complex subject using flashcards and active recall.", path: "Scholar", difficulty: "Hard", xpReward: 100, category: "Spaced Repetition", subSkill: "Retention" },
    { title: "Monk Mode Study", description: "Complete 4 hours of total deep study today. Log focus intervals.", path: "Scholar", difficulty: "Elite", xpReward: 250, category: "Deep Work", subSkill: "Consistency" },
    { title: "Hydration Check", description: "Drink at least 8 glasses (2.5 liters) of water today.", path: "Warrior", difficulty: "Easy", xpReward: 25, category: "Hydration", subSkill: "Energy" },
    { title: "Evening Walk", description: "Go for a brisk 15-minute walk outdoors. No devices.", path: "Warrior", difficulty: "Easy", xpReward: 25, category: "Walking", subSkill: "Activity" },
    { title: "Digital Sunset", description: "Turn off all screens at least 45 minutes before bedtime.", path: "Warrior", difficulty: "Medium", xpReward: 50, category: "Sleep", subSkill: "Sleep" },
    { title: "Body Weight Workout", description: "Perform a 20-minute bodyweight routine (pushups, squats, planks).", path: "Warrior", difficulty: "Medium", xpReward: 50, category: "Workout", subSkill: "Discipline" },
    { title: "Power Run", description: "Run/jog for 5 km or complete a 45-minute intense workout.", path: "Warrior", difficulty: "Hard", xpReward: 100, category: "Workout", subSkill: "Activity" },
    { title: "Sleep Master", description: "Sleep at least 7.5 hours and wake up on time without snoozing.", path: "Warrior", difficulty: "Hard", xpReward: 100, category: "Sleep", subSkill: "Sleep" },
    { title: "Iron Discipline Day", description: "Perform 60 minutes of high-intensity activity and eat clean.", path: "Warrior", difficulty: "Elite", xpReward: 250, category: "Workout", subSkill: "Discipline" },
    { title: "Mindful Breathing", description: "Perform 5 minutes of mindful box breathing (4s inhale, 4s hold, 4s exhale, 4s hold).", path: "Sage", difficulty: "Easy", xpReward: 25, category: "Breathing", subSkill: "Mindfulness" },
    { title: "Gratitude Journal", description: "Write down 3 specific things you are grateful for today and why.", path: "Sage", difficulty: "Easy", xpReward: 25, category: "Gratitude", subSkill: "Reflection" },
    { title: "Mindful Meditation", description: "Perform 15 minutes of guided or silent breathing meditation.", path: "Sage", difficulty: "Medium", xpReward: 50, category: "Meditation", subSkill: "Mindfulness" },
    { title: "Negative Screen Detox", description: "Identify and unfollow 5 accounts that trigger comparison or anxiety.", path: "Sage", difficulty: "Medium", xpReward: 50, category: "Mindfulness", subSkill: "Self-Regulation" },
    { title: "Stoic Reflection", description: "Write a 300-word journal entry analyzing a failure. Focus on control.", path: "Sage", difficulty: "Hard", xpReward: 100, category: "Reflection", subSkill: "Resilience" },
    { title: "Stress Recovery Routine", description: "Spend 30 minutes in quiet practicing progressive muscle relaxation.", path: "Sage", difficulty: "Hard", xpReward: 100, category: "Mindfulness", subSkill: "Stress Recovery" },
    { title: "24-Hour Digital Fast", description: "Delete social media apps from your phone for 24 hours. Log cravings.", path: "Sage", difficulty: "Elite", xpReward: 250, category: "Reflection", subSkill: "Self-Regulation" },
    { title: "Curiosity Spark", description: "Read an article or watch a video about an completely unfamiliar topic.", path: "Creator", difficulty: "Easy", xpReward: 25, category: "Writing", subSkill: "Curiosity" },
    { title: "Mind Mapping", description: "Draw a mind map of a creative project or business concept.", path: "Creator", difficulty: "Easy", xpReward: 25, category: "Mind Maps", subSkill: "Innovation" },
    { title: "Daily Writing Habit", description: "Write a 300-word text explaining a unique concept or idea.", path: "Creator", difficulty: "Medium", xpReward: 50, category: "Writing", subSkill: "Communication" },
    { title: "Skill Practice", description: "Spend 30 minutes practicing a creative skill (drawing, music, coding).", path: "Creator", difficulty: "Medium", xpReward: 50, category: "Mini Projects", subSkill: "Execution" },
    { title: "Mini Project Release", description: "Build, write, or design a small shareable asset (logo, UI screen).", path: "Creator", difficulty: "Hard", xpReward: 100, category: "Mini Projects", subSkill: "Execution" },
    { title: "Creative Synthesis", description: "Read 2 articles from unrelated fields and write 3 ways they connect.", path: "Creator", difficulty: "Hard", xpReward: 100, category: "Writing", subSkill: "Innovation" },
    { title: "Creator Showcase", description: "Spend 4 hours building a fully functional prototype of a project.", path: "Creator", difficulty: "Elite", xpReward: 250, category: "Mini Projects", subSkill: "Execution" }
];
function selectQuestsForUser(pathScores) {
    const getDifficulty = (score) => {
        if (score <= 40)
            return 'Easy';
        if (score <= 70)
            return 'Medium';
        if (score <= 90)
            return 'Hard';
        return 'Elite';
    };
    const resultQuests = [];
    const paths = ['Scholar', 'Warrior', 'Sage', 'Creator'];
    for (const path of paths) {
        let score = 50;
        if (path === 'Scholar')
            score = pathScores.scholar;
        else if (path === 'Warrior')
            score = pathScores.warrior;
        else if (path === 'Sage')
            score = pathScores.sage;
        else if (path === 'Creator')
            score = pathScores.creator;
        const diff = getDifficulty(score);
        let candidates = exports.QUEST_TEMPLATES.filter(t => t.path === path && t.difficulty === diff);
        if (candidates.length === 0) {
            candidates = exports.QUEST_TEMPLATES.filter(t => t.path === path);
        }
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        resultQuests.push(pick);
    }
    return resultQuests;
}

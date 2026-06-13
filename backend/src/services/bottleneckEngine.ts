interface SubSkillScore {
  path: string;
  subSkill: string;
  score: number;
}

export function detectBottleneck(answers: { [key: string]: number }) {
  const subSkills: { [key: string]: { path: string; q: number[] } } = {
    "Focus": { path: "Scholar", q: [1, 7] },
    "Retention": { path: "Scholar", q: [2, 8] },
    "Problem Solving": { path: "Scholar", q: [3, 9] },
    "Consistency": { path: "Scholar", q: [4, 10] },
    "Learning Strategy": { path: "Scholar", q: [5, 11] },
    "Understanding": { path: "Scholar", q: [6, 12] },

    "Sleep": { path: "Warrior", q: [13, 23] },
    "Activity": { path: "Warrior", q: [14, 24] },
    "Energy": { path: "Warrior", q: [15, 20] },
    "Recovery": { path: "Warrior", q: [16, 21] },
    "Discipline": { path: "Warrior", q: [17, 22] },
    "Routines": { path: "Warrior", q: [18, 19] },

    "Mindfulness": { path: "Sage", q: [25, 30] },
    "Resilience": { path: "Sage", q: [26, 31] },
    "Emotional Awareness": { path: "Sage", q: [27, 32] },
    "Stress Recovery": { path: "Sage", q: [28, 33] },
    "Reflection": { path: "Sage", q: [29, 34] },
    "Self-Regulation": { path: "Sage", q: [35, 36] },

    "Curiosity": { path: "Creator", q: [37, 42] },
    "Communication": { path: "Creator", q: [38, 43] },
    "Creative Confidence": { path: "Creator", q: [39, 44] },
    "Execution": { path: "Creator", q: [40, 45] },
    "Innovation": { path: "Creator", q: [41, 46] },
    "Inspiration": { path: "Creator", q: [47, 48] }
  };

  const scores: SubSkillScore[] = [];

  for (const [subSkill, info] of Object.entries(subSkills)) {
    const sum = (answers[`q${info.q[0]}`] || 3) + (answers[`q${info.q[1]}`] || 3);
    const normalized = Math.round(((sum - 2) / 8) * 100);
    scores.push({ path: info.path, subSkill, score: normalized });
  }

  scores.sort((a, b) => a.score - b.score);

  return {
    primary: scores[0],
    secondary: scores[1],
    tertiary: scores[2],
    explanation: `Your primary bottleneck is "${scores[0].subSkill}" under the ${scores[0].path} path (${scores[0].score}%). This represents a key barrier to your growth.`
  };
}

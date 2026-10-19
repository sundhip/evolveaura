export type Path = 'SCHOLAR' | 'WARRIOR' | 'SAGE' | 'CREATOR';

export interface PathRankingItem {
  path: Path;
  score: number;
}

export interface PathSuggestionResult {
  recommended: Path;
  runnerUp: Path;
  growthArea: Path;
  ranking: PathRankingItem[];
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  reasons: string[];
}

export const PATH_THEMES: Record<Path, string[]> = {
  SCHOLAR: [
    'deep-focus',
    'active-recall',
    'spaced-review',
    'planning',
    'problem-solving',
    'exam-stress-handling',
  ],
  WARRIOR: [
    'sleep',
    'exercise',
    'hydration',
    'wake-up-consistency',
    'nutrition-habits',
    'screen-free-wind-down',
  ],
  SAGE: [
    'stress-awareness',
    'breathing-meditation',
    'journaling',
    'emotional-regulation',
    'digital-detox',
    'gratitude',
  ],
  CREATOR: [
    'project-output',
    'curiosity',
    'skill-practice',
    'finishing-drafts',
    'feedback',
    'idea-capture',
  ],
};

export const THEME_TITLES: Record<string, string> = {
  // Scholar
  'deep-focus': 'Deep Focus',
  'active-recall': 'Active Recall',
  'spaced-review': 'Spaced Review',
  'planning': 'Study Planning',
  'problem-solving': 'Problem Solving',
  'exam-stress-handling': 'Exam Composure',

  // Warrior
  'sleep': 'Sleep & Rest',
  'exercise': 'Physical Conditioning',
  'hydration': 'Daily Hydration',
  'wake-up-consistency': 'Wake-up Consistency',
  'nutrition-habits': 'Nutrition & Energy',
  'screen-free-wind-down': 'Screen-free Wind-down',

  // Sage
  'stress-awareness': 'Stress Awareness',
  'breathing-meditation': 'Breathwork & Meditation',
  'journaling': 'Reflective Journaling',
  'emotional-regulation': 'Emotional Regulation',
  'digital-detox': 'Digital Detox',
  'gratitude': 'Gratitude Practice',

  // Creator
  'project-output': 'Project Completion',
  'curiosity': 'Domain Exploration',
  'skill-practice': 'Deliberate Skill Practice',
  'finishing-drafts': 'Finishing Drafts',
  'feedback': 'Iteration & Feedback',
  'idea-capture': 'Idea Capture',
};

export const THEME_REASONS: Record<string, string> = {
  // Scholar
  'deep-focus': 'You show strong dedication to protecting uninterrupted focus blocks and sustained attention.',
  'active-recall': 'You actively test your recall rather than passively rereading study material.',
  'spaced-review': 'You space out your review sessions at intervals to build durable retention.',
  'planning': 'You structure your learning with proactive planning and concrete daily milestones.',
  'problem-solving': 'You tackle complex challenges with systematic reasoning and persistence.',
  'exam-stress-handling': 'You maintain composure and mental clarity under assessment pressure.',

  // Warrior
  'sleep': 'You prioritize restorative sleep to sustain physical energy and cognitive performance.',
  'exercise': 'You regularly engage in physical exercise to elevate stamina and vitality.',
  'hydration': 'You maintain consistent daily hydration to support peak cellular function.',
  'wake-up-consistency': 'You anchor your mornings with a disciplined and predictable wake-up routine.',
  'nutrition-habits': 'You fuel your daily output with mindful and nourishing nutritional choices.',
  'screen-free-wind-down': 'You protect your evening recovery with screen-free wind-down routines.',

  // Sage
  'stress-awareness': 'You recognize early signs of stress and respond with calm self-awareness.',
  'breathing-meditation': 'You utilize breathwork and mindfulness to center your mental equilibrium.',
  'journaling': 'You practice regular journaling to untangle complex thoughts and process emotions.',
  'emotional-regulation': 'You navigate high-pressure situations with steady emotional stability.',
  'digital-detox': 'You set firm digital boundaries to guard your mental bandwidth against noise.',
  'gratitude': 'You practice intentional gratitude to maintain grounded perspective and resilience.',

  // Creator
  'project-output': 'You consistently push personal creative projects across the finish line.',
  'curiosity': 'You follow intellectual curiosity into varied disciplines and new craft areas.',
  'skill-practice': 'You invest dedicated time into deliberate practice to sharpen your creative skills.',
  'finishing-drafts': 'You overcome perfectionism to finish early drafts and ship tangible work.',
  'feedback': 'You actively seek constructive critique to iterate and refine your creations.',
  'idea-capture': 'You systematically capture inspirations as they occur so ideas can flourish.',
};

export const BOTTLENECK_EXPLANATIONS: Record<Path, Record<string, string>> = {
  SCHOLAR: {
    'deep-focus': 'Your focus continuity is currently your primary bottleneck. Protecting distraction-free study blocks will unlock rapid academic momentum.',
    'active-recall': 'Your reliance on passive review is slowing retention. Testing yourself proactively will dramatically boost concept mastery.',
    'spaced-review': 'Cramming without spaced intervals creates rapid decay. Spacing your study sessions will cement lasting recall.',
    'planning': 'Unstructured study sessions cause friction. Establishing daily study milestones will bring clarity to your learning.',
    'problem-solving': 'Hesitation on hard problems limits progress. Developing systematic problem-solving methods will build confidence.',
    'exam-stress-handling': 'Assessment anxiety degrades working memory. Practicing timed simulations will stabilize your performance.',
    default: 'Your learning efficiency and study habits are currently your primary growth opportunity.',
  },
  WARRIOR: {
    'sleep': 'Irregular or insufficient sleep is acting as your primary energy constraint. Prioritizing consistent rest will elevate daily vitality.',
    'exercise': 'Physical inactivity is limiting your baseline stamina. Introducing daily functional movement will boost alertness and drive.',
    'hydration': 'Dehydration quietly diminishes cognitive processing speed. Keeping hydration consistent will optimize daily energy.',
    'wake-up-consistency': 'Fluctuating morning wake times disrupt circadian rhythm. Anchoring a steady wake schedule will stabilize your routine.',
    'nutrition-habits': 'Erratic nutrition causes energy spikes and crashes. Mindful nutrition habits will sustain steady stamina.',
    'screen-free-wind-down': 'Late-night screen exposure delays melatonin and deep sleep. A screen-free wind-down will restore restorative rest.',
    default: 'Your sleep patterns, physical energy level, or daily disciplines are acting as a primary constraint.',
  },
  SAGE: {
    'stress-awareness': 'Unnoticed chronic tension creates mental fatigue. Early stress awareness will prevent emotional depletion.',
    'breathing-meditation': 'Lack of mindfulness practices makes nervous system recovery difficult. Intentional breathwork will reset your focus.',
    'journaling': 'Unprocessed mental chatter compounds stress. Regular reflective writing will declutter your mind.',
    'emotional-regulation': 'Emotional reactivity consumes valuable mental bandwidth. Practicing equanimity will preserve your inner calm.',
    'digital-detox': 'Constant notifications fracture attention. Setting strict digital boundaries will restore mental clarity.',
    'gratitude': 'Focusing on frustrations narrows perspective. Daily gratitude practice will reinforce mental resilience.',
    default: 'Your mindfulness, screen detox habit, or cognitive stress regulation is currently a primary constraint.',
  },
  CREATOR: {
    'project-output': 'Starting many concepts without finishing limits tangible growth. Focusing on project completion will compound your portfolio.',
    'curiosity': 'Staying strictly within comfort zones restricts innovative ideas. Exploring adjacent fields will spark new creativity.',
    'skill-practice': 'Lack of deliberate craft drills slows technique development. Dedicated skill exercises will accelerate creative mastery.',
    'finishing-drafts': 'Perfectionism prevents shipping early iterations. Pushing drafts to completion will unlock productive momentum.',
    'feedback': 'Hesitation to share work prevents external refinement. Seeking constructive critique will sharpen your craft.',
    'idea-capture': 'Unrecorded ideas slip away quickly. Carrying an idea capture system will ensure inspiration is never lost.',
    default: 'Your curiosity exploration, project outputs, or consistent creative work shows high friction.',
  },
};

const GOAL_TO_PATH: Record<string, Path> = {
  Study: 'SCHOLAR',
  Fitness: 'WARRIOR',
  'Mental Wellness': 'SAGE',
  Creativity: 'CREATOR',
};

const ALL_PATHS: Path[] = ['SCHOLAR', 'WARRIOR', 'SAGE', 'CREATOR'];

export function getHighestThemeScore(path: Path, themeScores: Record<string, number>): number {
  const themes = PATH_THEMES[path] || [];
  let max = -1;
  for (const t of themes) {
    const s = themeScores[t];
    if (typeof s === 'number' && s > max) {
      max = s;
    }
  }
  return max >= 0 ? max : 50;
}

export function getWeakestTheme(path: Path, themeScores: Record<string, number>): { theme: string; score: number } {
  const themes = PATH_THEMES[path] || [];
  let min = Infinity;
  let weakest = themes[0] || '';
  for (const t of themes) {
    const s = themeScores[t];
    if (typeof s === 'number' && s < min) {
      min = s;
      weakest = t;
    }
  }
  return {
    theme: weakest || themes[0] || 'general',
    score: min === Infinity ? 50 : min,
  };
}

export function suggestPath(
  scores: { scholar: number; warrior: number; sage: number; creator: number },
  themeScores: Record<string, number> = {},
  primaryGoal?: string | null
): PathSuggestionResult {
  const normalizedScores: Record<Path, number> = {
    SCHOLAR: scores.scholar ?? (scores as any).SCHOLAR ?? 0,
    WARRIOR: scores.warrior ?? (scores as any).WARRIOR ?? 0,
    SAGE: scores.sage ?? (scores as any).SAGE ?? 0,
    CREATOR: scores.creator ?? (scores as any).CREATOR ?? 0,
  };

  // 1. Determine recommended path
  const maxScore = Math.max(...ALL_PATHS.map((p) => normalizedScores[p]));
  // Contenders within 5 points of the top score
  const topContenders = ALL_PATHS.filter((p) => maxScore - normalizedScores[p] <= 5);

  let recommended: Path;
  if (topContenders.length === 1) {
    recommended = topContenders[0];
  } else {
    // TIE-BREAK 1 (scores within 5 points): Onboarding primaryGoal mapping
    const goalPath = primaryGoal ? GOAL_TO_PATH[primaryGoal] : undefined;
    if (goalPath && topContenders.includes(goalPath)) {
      recommended = goalPath;
    } else {
      // TIE-BREAK 2: The path whose highest-scoring theme is highest
      const maxThemeScore = Math.max(...topContenders.map((p) => getHighestThemeScore(p, themeScores)));
      const themeContenders = topContenders.filter(
        (p) => getHighestThemeScore(p, themeScores) === maxThemeScore
      );

      if (themeContenders.length === 1) {
        recommended = themeContenders[0];
      } else {
        // TIE-BREAK 3: Fixed order SCHOLAR, WARRIOR, SAGE, CREATOR
        recommended = ALL_PATHS.find((p) => themeContenders.includes(p))!;
      }
    }
  }

  // 2. Determine runnerUp path among remaining
  const remainingAfterRec = ALL_PATHS.filter((p) => p !== recommended);
  const secondMaxScore = Math.max(...remainingAfterRec.map((p) => normalizedScores[p]));
  const runnerUpContenders = remainingAfterRec.filter((p) => secondMaxScore - normalizedScores[p] <= 5);

  let runnerUp: Path;
  if (runnerUpContenders.length === 1) {
    runnerUp = runnerUpContenders[0];
  } else {
    const goalPath = primaryGoal ? GOAL_TO_PATH[primaryGoal] : undefined;
    if (goalPath && runnerUpContenders.includes(goalPath)) {
      runnerUp = goalPath;
    } else {
      const maxThemeScore = Math.max(...runnerUpContenders.map((p) => getHighestThemeScore(p, themeScores)));
      const themeContenders = runnerUpContenders.filter(
        (p) => getHighestThemeScore(p, themeScores) === maxThemeScore
      );
      if (themeContenders.length === 1) {
        runnerUp = themeContenders[0];
      } else {
        runnerUp = ALL_PATHS.find((p) => themeContenders.includes(p))!;
      }
    }
  }

  // 3. Determine growthArea (lowest path score)
  const minScore = Math.min(...ALL_PATHS.map((p) => normalizedScores[p]));
  const lowestPaths = ALL_PATHS.filter((p) => normalizedScores[p] === minScore);

  let growthArea: Path;
  if (lowestPaths.length === 1) {
    growthArea = lowestPaths[0];
  } else {
    // Deterministic tie-break for growthArea: lowest theme score, then reverse fixed order or fixed order
    let minTheme = Infinity;
    for (const p of lowestPaths) {
      const weakest = getWeakestTheme(p, themeScores).score;
      if (weakest < minTheme) minTheme = weakest;
    }
    const lowestThemePaths = lowestPaths.filter(
      (p) => getWeakestTheme(p, themeScores).score === minTheme
    );
    // If all scores equal, pick from remaining so ranking has 4 distinct paths
    const nonRecLowest = lowestThemePaths.filter((p) => p !== recommended && p !== runnerUp);
    if (nonRecLowest.length > 0) {
      // Pick the last in fixed order so Scholar isn't both top and bottom when equal
      growthArea = [...ALL_PATHS].reverse().find((p) => nonRecLowest.includes(p))!;
    } else {
      growthArea = ALL_PATHS.find((p) => lowestThemePaths.includes(p))!;
    }
  }

  // 4. Ranking
  const remainingForRanking = ALL_PATHS.filter((p) => p !== recommended && p !== runnerUp && p !== growthArea);
  const thirdPath = remainingForRanking[0];

  const ranking: PathRankingItem[] = [
    { path: recommended, score: normalizedScores[recommended] },
    { path: runnerUp, score: normalizedScores[runnerUp] },
    { path: thirdPath, score: normalizedScores[thirdPath] },
    { path: growthArea, score: normalizedScores[growthArea] },
  ];

  // 5. Confidence
  const diff = normalizedScores[recommended] - normalizedScores[runnerUp];
  let confidence: 'HIGH' | 'MEDIUM' | 'LOW';
  if (diff >= 15) {
    confidence = 'HIGH';
  } else if (diff >= 6) {
    confidence = 'MEDIUM';
  } else {
    confidence = 'LOW';
  }

  // 6. Reasons
  const recThemes = [...(PATH_THEMES[recommended] || [])];
  recThemes.sort((a, b) => {
    const sA = themeScores[a] ?? 50;
    const sB = themeScores[b] ?? 50;
    if (sB !== sA) return sB - sA;
    return a.localeCompare(b);
  });

  const reasons: string[] = [];
  const theme1 = recThemes[0];
  const theme2 = recThemes[1];

  if (theme1 && THEME_REASONS[theme1]) {
    reasons.push(THEME_REASONS[theme1]);
  }
  if (theme2 && THEME_REASONS[theme2]) {
    reasons.push(THEME_REASONS[theme2]);
  }

  if (confidence === 'LOW') {
    reasons.push('Your scores are close across multiple disciplines, so any choice is reasonable for your journey.');
  } else if (recThemes[2] && THEME_REASONS[recThemes[2]]) {
    reasons.push(THEME_REASONS[recThemes[2]]);
  }

  return {
    recommended,
    runnerUp,
    growthArea,
    ranking,
    confidence,
    reasons,
  };
}

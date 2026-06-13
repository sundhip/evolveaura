import { Quest } from '@prisma/client';

export function getDifficultyMultiplier(rank: string): number {
  switch (rank) {
    case 'S': return 2.0;
    case 'A': return 1.5;
    case 'B': return 1.2;
    case 'C': return 1.0;
    case 'D': return 0.8;
    default: return 0.5;
  }
}

export function getDynamicChallenge(dayOfWeek: number) {
  // 0 = Sunday, 1 = Monday ...
  const challenges = [
    { title: "Reflection Sabbath", desc: "Focus entirely on mindfulness and write a 100-char reflection.", path: "SAGE" },
    { title: "Focus Frenzy Monday", desc: "Complete 2 separate 25-minute Pomodoro study sessions today.", path: "SCHOLAR" },
    { title: "No Scroll Tuesday", desc: "Keep screen time to absolute minimum. Log active walk.", path: "WARRIOR" },
    { title: "Creator Day Wednesday", desc: "Spend 45 minutes on blueprints or code drafts for personal projects.", path: "CREATOR" },
    { title: "Deep Work Thursday", desc: "Complete 60 minutes of study on your weakest subject.", path: "SCHOLAR" },
    { title: "Fitness Friday", desc: "Complete 45 minutes of vigorous exercise and walk.", path: "WARRIOR" },
    { title: "Sovereign Saturday", desc: "Reflect on week's growth and plan next week's modules.", path: "SAGE" }
  ];
  return challenges[dayOfWeek];
}

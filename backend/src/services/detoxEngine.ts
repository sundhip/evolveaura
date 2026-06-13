export function calculateDetoxScore(metrics: {
  screenTimeSeconds: number;
  studyTimeSeconds: number;
  exerciseTimeSeconds: number;
  mindfulnessTimeSeconds: number;
  creationTimeSeconds: number;
}): number {
  const productiveSeconds =
    metrics.studyTimeSeconds +
    metrics.exerciseTimeSeconds +
    metrics.mindfulnessTimeSeconds +
    metrics.creationTimeSeconds;

  const totalTime = productiveSeconds + metrics.screenTimeSeconds;
  if (totalTime === 0) return 50;

  const weightedScreenTime = 0.6 * metrics.screenTimeSeconds;
  const score = (productiveSeconds / (productiveSeconds + weightedScreenTime)) * 100;

  return Math.min(100, Math.max(10, Math.round(score)));
}

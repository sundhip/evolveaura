export interface AssessmentAnswers {
  [key: string]: number;
}

export function calculatePathScores(answers: AssessmentAnswers) {
  let scholarSum = 0;
  let warriorSum = 0;
  let sageSum = 0;
  let creatorSum = 0;

  let sCount = 0, wCount = 0, saCount = 0, cCount = 0;

  for (const [key, val] of Object.entries(answers)) {
    const qNum = parseInt(key.replace('q', ''));
    if (qNum >= 1 && qNum <= 4) { scholarSum += val; sCount++; }
    else if (qNum >= 5 && qNum <= 8) { warriorSum += val; wCount++; }
    else if (qNum >= 9 && qNum <= 12) { sageSum += val; saCount++; }
    else if (qNum >= 13 && qNum <= 16) { creatorSum += val; cCount++; }
    // Adaptive questions
    else if (key.startsWith('scholar_add')) { scholarSum += val; sCount++; }
    else if (key.startsWith('warrior_add')) { warriorSum += val; wCount++; }
    else if (key.startsWith('sage_add')) { sageSum += val; saCount++; }
    else if (key.startsWith('creator_add')) { creatorSum += val; cCount++; }
  }

  const normalize = (sum: number, count: number) => {
    if (count === 0) return 50;
    return Math.round(((sum - count) / (count * 4)) * 100);
  };

  return {
    scholar: normalize(scholarSum, sCount),
    warrior: normalize(warriorSum, wCount),
    sage: normalize(sageSum, saCount),
    creator: normalize(creatorSum, cCount)
  };
}

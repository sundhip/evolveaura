export function getRank(score: number): string {
  if (score >= 96) return 'S';
  if (score >= 81) return 'A';
  if (score >= 61) return 'B';
  if (score >= 41) return 'C';
  if (score >= 21) return 'D';
  return 'E';
}

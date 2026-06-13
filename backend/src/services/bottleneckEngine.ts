export function detectBottleneck(scores: { scholar: number, warrior: number, sage: number, creator: number }): string {
  const list = [
    { name: "Scholar", val: scores.scholar },
    { name: "Warrior", val: scores.warrior },
    { name: "Sage", val: scores.sage },
    { name: "Creator", val: scores.creator }
  ];
  list.sort((a, b) => a.val - b.val);
  return list[0].name;
}

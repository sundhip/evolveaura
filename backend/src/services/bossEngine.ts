export function calculateDamage(actionType: 'TIMER' | 'SLEEP' | 'REFLECTION' | 'QUEST', payload?: number): number {
  switch (actionType) {
    case 'TIMER': // payload is focus minutes
      return (payload || 25) * 4; // 25 min = 100 dmg
    case 'SLEEP':
      return 50;
    case 'REFLECTION':
      return 25;
    case 'QUEST':
      return 150;
    default:
      return 10;
  }
}

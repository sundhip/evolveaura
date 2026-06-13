export function getDailyInsight(
  role: string,
  primaryGoal: string,
  bottleneck: string,
  streak: number
): string {
  const insights = [
    "According to Self-Determination Theory, motivation thrives on Competence. Today, complete one quest to feed your need for progress.",
    "Cognitive Load Theory shows multitasking ruins retention. When studying, close all other background tabs and focus.",
    "A habit requires a Cue, a Routine, and a Reward. Identify the Cue triggering your doom-scrolling, and replace it with a brief stretch.",
    "The Zeigarnik effect states that uncompleted tasks create mental tension. Log your quests early to offload cognitive debt.",
    "Growth Mindset means viewing failures as research. If you scrolled today, analyze what triggered it and tweak your physical space.",
    "Dopamine detox isn't about boredom; it's about resetting baseline sensitivity. Real activities like reading build sustained attention."
  ];

  if (bottleneck.toLowerCase().includes("sleep")) {
    return "Sleep is the ultimate cognitive multiplier. Unplug 45 minutes before bed to support natural melatonin secretion and reset your focus.";
  }
  if (bottleneck.toLowerCase().includes("focus")) {
    return "Attention is like a muscle. When you pull your mind away from a distraction and refocus, you are doing a mental rep. Keep repeating.";
  }

  return insights[streak % insights.length];
}

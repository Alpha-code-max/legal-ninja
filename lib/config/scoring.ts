export const SCORING = {
  base_points: {
    correct_answer: 10,
    wrong_answer_penalty: -3,
  },
  bonuses: {
    speed_bonus: { max_bonus: 8, description: "Faster answers = more points" },
    streak_bonus: { per_answer: 2, description: "Build unstoppable momentum" },
    perfect_round_bonus: 50,
  },
  grading_scale: [
    { grade: "A+", min: 95, max: 100, title: "Supreme Court Material" },
    { grade: "A",  min: 85, max: 94,  title: "Top Advocate" },
    { grade: "B",  min: 75, max: 84,  title: "Solid Counsel" },
    { grade: "C",  min: 65, max: 74,  title: "Needs More Practice" },
    { grade: "D",  min: 50, max: 64,  title: "Junior Associate" },
    { grade: "F",  min: 0,  max: 49,  title: "Back to Chambers" },
  ],
} as const;

export function getGrade(percentage: number) {
  return SCORING.grading_scale.find(
    (g) => percentage >= g.min && percentage <= g.max
  ) ?? SCORING.grading_scale[SCORING.grading_scale.length - 1];
}

export function calcSpeedBonus(timeRemainingMs: number, timeLimitMs: number): number {
  const ratio = timeRemainingMs / timeLimitMs;
  return Math.round(SCORING.bonuses.speed_bonus.max_bonus * ratio);
}

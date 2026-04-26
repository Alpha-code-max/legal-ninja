export const LEVELS = [
  { level: 1, name: "1L Rookie",        xp_required: 0,     min_questions: 0,    title: "Fresh Meat" },
  { level: 2, name: "Case Hunter",      xp_required: 250,   min_questions: 50,   title: "Bloodhound" },
  { level: 3, name: "Brief Writer",     xp_required: 600,   min_questions: 150,  title: "Wordsmith" },
  { level: 4, name: "Legal Warrior",    xp_required: 1200,  min_questions: 300,  title: "Courtroom Gladiator" },
  { level: 5, name: "Senior Advocate",  xp_required: 2500,  min_questions: 600,  title: "Silk" },
  { level: 6, name: "Legal Ninja",      xp_required: 5000,  min_questions: 1200, title: "Shadow Barrister" },
  { level: 7, name: "Supreme Sensei",   xp_required: 10000, min_questions: 2500, title: "Legend" },
] as const;

export const XP_SOURCES = {
  correct_answer: 10,
  speed_bonus: 8,
  streak_bonus: 2,
  perfect_round: 50,
  daily_login: 20,
  daily_challenge: 100,
  beating_personal_best: 50,
  quest_completion: 300,
  spaced_repetition_review: 15,
  bundle_purchase_bonus: 50,
} as const;

export const XP_MULTIPLIERS = {
  first_win_of_day: 1.5,
  weekend_bonus: 1.2,
} as const;

export const LEVEL_DYNAMICS = {
  demotion_failure_rate_threshold: 0.35,
  demotion_accuracy_threshold: 0.60,
  demotion_window: 30,
  demotion_accuracy_min_questions: 100,
  demotion_cooldown_hours: 24,
  stabilization_correct_streak: 10,
} as const;

export const BADGES = {
  subject_master: [
    "Contract Master",
    "Tort Titan",
    "Criminal Law Boss",
    "Procedure Pro",
    "Equity Emperor",
  ],
  achievement: [
    "Unbeaten Streak",
    "Speed Demon",
    "Perfect Score",
    "Comeback King",
    "Daily Grinder",
    "Leaderboard Assassin",
    "Quest Master",
    "Review Ninja",
  ],
} as const;

export type Level = (typeof LEVELS)[number];

export function getLevelForXP(xp: number, totalQuestions: number): Level {
  let current: Level = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xp_required && totalQuestions >= lvl.min_questions) {
      current = lvl;
    }
  }
  return current;
}

export function getNextLevel(currentLevel: number) {
  return LEVELS.find((l) => l.level === currentLevel + 1) ?? null;
}

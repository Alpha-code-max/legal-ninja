export const GAME_SETTINGS = {
  time_options_minutes: [10, 15, 20, 30, 45, 60],
  difficulty_levels: ["easy", "medium", "hard", "expert"] as const,
  question_counts: [5, 10, 15, 20],
  max_players_multiplayer: 4,
} as const;

export type Difficulty = (typeof GAME_SETTINGS.difficulty_levels)[number];

export const GAME_MODES = {
  solo_practice: {
    id: "solo_practice",
    name: "Solo Practice",
    description: "Train privately and stack XP",
    xp_multiplier: 1.0,
    icon: "⚔️",
  },
  duel: {
    id: "duel",
    name: "Duel",
    description: "1v1 against friends or random opponents",
    xp_multiplier: 1.3,
    icon: "🥷",
  },
  battle_royale: {
    id: "battle_royale",
    name: "Battle Royale",
    description: "Up to 4 players — last one standing wins big",
    xp_multiplier: 1.8,
    max_players: 4,
    icon: "🏆",
  },
  flashcard_review: {
    id: "flashcard_review",
    name: "Flashcard Review",
    description: "Spaced repetition flashcards from missed questions",
    xp_multiplier: 0.8,
    icon: "📚",
  },
  exam_simulation: {
    id: "exam_simulation",
    name: "Mock Exam",
    description: "Mixed MCQ & Essay under exam conditions",
    xp_multiplier: 2.0,
    icon: "🎓",
  },
  weak_area_focus: {
    id: "weak_area_focus",
    name: "Weak Area Focus",
    description: "Targeted questions on low-accuracy topics",
    xp_multiplier: 1.2,
    icon: "🎯",
  },
  daily_challenge: {
    id: "daily_challenge",
    name: "Daily Challenge",
    description: "One attempt per day — timed and locked",
    xp_multiplier: 1.5,
    icon: "🎯",
  },
} as const;

export type GameModeId = keyof typeof GAME_MODES;

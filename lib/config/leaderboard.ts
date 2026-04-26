export const LEADERBOARD_CONFIG = {
  types: [
    "global_all_time",
    "global_weekly",
    "daily",
    "subject_specific",
    "friends_only",
    "country_based",
  ] as const,
  ranking_metrics: [
    "total_xp",
    "win_rate",
    "current_streak",
    "highest_score",
    "total_matches_won",
    "total_questions_answered",
  ] as const,
  reset_rules: {
    daily: "resets_every_midnight",
    weekly: "resets_every_monday",
  },
  display_fields: [
    "rank",
    "username",
    "avatar",
    "level",
    "total_xp",
    "current_streak",
    "win_rate",
    "total_questions_answered",
  ] as const,
  top_3_highlights: true,
  rewards: {
    top_10_weekly: "Exclusive 'Weekly Champion' badge + XP multiplier",
    daily_winner: "Daily Crown + 100 bonus XP",
  },
} as const;

export type LeaderboardType = (typeof LEADERBOARD_CONFIG.types)[number];

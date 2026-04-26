"use client";
import { motion } from "framer-motion";
import { LevelBadge } from "./LevelBadge";
import { cn } from "@/lib/utils";

export interface LeaderboardEntry {
  rank: number;
  username: string;
  avatar_url: string;
  level: number;
  total_xp: number;
  current_streak: number;
  win_rate: number;
  total_questions_answered: number;
}

interface Props {
  entry: LeaderboardEntry;
  isCurrentUser?: boolean;
  index: number;
}

const rankColors: Record<number, string> = {
  1: "text-cyber-gold neon-text-gold",
  2: "text-gray-300",
  3: "text-amber-600",
};

export function LeaderboardRow({ entry, isCurrentUser, index }: Props) {
  const isTop3 = entry.rank <= 3;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all",
        isCurrentUser
          ? "border-cyber-cyan bg-cyber-cyan/5 shadow-neon-cyan"
          : isTop3
          ? "border-cyber-gold/30 bg-cyber-gold/5"
          : "border-cyber-border bg-cyber-card hover:border-cyber-border/80"
      )}
    >
      <span className={cn("w-8 text-center font-bold font-mono text-lg", rankColors[entry.rank] ?? "text-gray-500")}>
        {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : `#${entry.rank}`}
      </span>

      <div className="w-9 h-9 rounded-full bg-cyber-border flex items-center justify-center text-lg shrink-0">
        {entry.avatar_url ? (
          <img src={entry.avatar_url} alt={entry.username} className="w-full h-full rounded-full object-cover" />
        ) : "🥷"}
      </div>

      <LevelBadge level={entry.level} size="sm" />

      <div className="flex-1 min-w-0">
        <p className={cn("font-semibold text-sm truncate", isCurrentUser && "text-cyber-cyan")}>
          {entry.username} {isCurrentUser && "(You)"}
        </p>
        <p className="text-xs text-gray-500">{entry.total_xp.toLocaleString()} XP</p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs text-cyber-green font-mono">{entry.current_streak} 🔥</p>
        <p className="text-xs text-gray-500">{entry.win_rate}% WR</p>
      </div>
    </motion.div>
  );
}

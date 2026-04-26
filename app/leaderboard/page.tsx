"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardRow, type LeaderboardEntry } from "@/components/ui/LeaderboardRow";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LEADERBOARD_CONFIG, type LeaderboardType } from "@/lib/config/leaderboard";
import { cn } from "@/lib/utils";

const DEMO_ENTRIES: LeaderboardEntry[] = [
  { rank: 1, username: "ShadowBarrister",  avatar_url: "", level: 7, total_xp: 12400, current_streak: 45, win_rate: 94, total_questions_answered: 3200 },
  { rank: 2, username: "TortTitan",        avatar_url: "", level: 6, total_xp: 8900,  current_streak: 28, win_rate: 88, total_questions_answered: 2100 },
  { rank: 3, username: "CrimeLord99",      avatar_url: "", level: 6, total_xp: 7600,  current_streak: 19, win_rate: 82, total_questions_answered: 1850 },
  { rank: 4, username: "EquityEmperor",    avatar_url: "", level: 5, total_xp: 5200,  current_streak: 14, win_rate: 79, total_questions_answered: 1400 },
  { rank: 5, username: "LexWarrior",       avatar_url: "", level: 5, total_xp: 4800,  current_streak: 11, win_rate: 76, total_questions_answered: 1250 },
  { rank: 6, username: "Ninja (You)",      avatar_url: "", level: 1, total_xp: 0,     current_streak: 0,  win_rate: 0,  total_questions_answered: 0 },
];

const TYPE_LABELS: Record<LeaderboardType, string> = {
  global_all_time:  "All Time",
  global_weekly:    "Weekly",
  daily:            "Today",
  subject_specific: "Subject",
  friends_only:     "Friends",
  country_based:    "🇳🇬 Nigeria",
};

const PODIUM_COLORS = [
  "var(--cyber-purple)",  // 2nd (left)
  "var(--cyber-gold)",    // 1st (center)
  "var(--cyber-cyan)",    // 3rd (right)
];

const PODIUM_HEIGHTS = ["h-20", "h-28", "h-16"];
const PODIUM_EMOJIS  = ["🥈", "🥇", "🥉"];
const PODIUM_ORDER   = [1, 0, 2]; // [2nd, 1st, 3rd] for display

function PodiumIllustration() {
  const top3 = [DEMO_ENTRIES[1], DEMO_ENTRIES[0], DEMO_ENTRIES[2]];

  return (
    <div className="relative">
      {/* Glow beneath */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-64 h-10 blur-2xl opacity-30 rounded-full"
           style={{ background: "linear-gradient(90deg, var(--cyber-purple), var(--cyber-gold), var(--cyber-cyan))" }} />

      <div className="flex items-end justify-center gap-2 pb-1 relative z-10">
        {PODIUM_ORDER.map((entryIdx, pos) => {
          const entry  = top3[entryIdx];
          const color  = PODIUM_COLORS[pos];
          const height = PODIUM_HEIGHTS[pos];
          const emoji  = PODIUM_EMOJIS[pos];
          const isFirst = pos === 1;

          return (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * pos, type: "spring" }}
              className="flex flex-col items-center gap-1"
            >
              {/* Medal */}
              <motion.div
                animate={isFirst ? { y: [0, -4, 0] } : {}}
                transition={{ repeat: Infinity, duration: 2.5 }}
                className="text-2xl"
              >
                {emoji}
              </motion.div>

              {/* Avatar */}
              <div
                className={cn(
                  "w-12 h-12 rounded-full flex items-center justify-center text-xl border-2",
                  isFirst && "w-16 h-16 text-2xl"
                )}
                style={{
                  borderColor: color,
                  background:  `color-mix(in srgb, ${color} 15%, var(--cyber-surface))`,
                  boxShadow:   `0 0 16px color-mix(in srgb, ${color} 50%, transparent)`,
                }}
              >
                🥷
              </div>

              {/* Name */}
              <p className="text-[10px] font-black text-center w-20 truncate" style={{ color: "var(--text-base)" }}>
                {entry.username.split(" ")[0]}
              </p>

              {/* XP */}
              <p className="text-xs font-black font-mono" style={{ color }}>
                {(entry.total_xp / 1000).toFixed(1)}k
              </p>

              {/* Podium block */}
              <div
                className={cn("w-20 rounded-t-lg flex items-center justify-center font-black text-sm", height)}
                style={{
                  background:  `linear-gradient(180deg, color-mix(in srgb, ${color} 30%, transparent), color-mix(in srgb, ${color} 10%, transparent))`,
                  border:      `1px solid color-mix(in srgb, ${color} 40%, transparent)`,
                  color,
                }}
              >
                #{entry.rank}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const router = useRouter();
  const [activeType, setActiveType] = useState<LeaderboardType>("global_weekly");

  return (
    <div className="min-h-screen pb-36">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b h-16 flex items-center"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-2xl mx-auto w-full px-4 flex items-center justify-between">
          <button onClick={() => router.back()}
                  className="text-sm font-bold transition-colors"
                  style={{ color: "var(--text-muted)" }}>
            ← Back
          </button>
          <h1 className="text-xl font-black gradient-text">Leaderboard</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-5">

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LEADERBOARD_CONFIG.types.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={cn(
                "px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all",
                activeType === type
                  ? "border-cyber-cyan bg-cyber-cyan/10 shadow-neon-cyan"
                  : "border-cyber-border hover:border-cyber-cyan/50"
              )}
              style={{ color: activeType === type ? "var(--cyber-cyan)" : "var(--text-muted)" }}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Podium */}
        <motion.div
          key={activeType}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5"
        >
          <p className="text-[10px] uppercase font-black tracking-widest text-center mb-5"
             style={{ color: "var(--text-muted)" }}>
            {TYPE_LABELS[activeType]} Champions
          </p>
          <PodiumIllustration />
        </motion.div>

        {/* Full rankings */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeType}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-2"
          >
            {DEMO_ENTRIES.map((entry, i) => (
              <LeaderboardRow
                key={entry.rank}
                entry={entry}
                isCurrentUser={entry.username.includes("You")}
                index={i}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Weekly Rewards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="cyber-card p-5 relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-5"
               style={{ background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-red))" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="text-sm font-black neon-text-gold uppercase tracking-wider">Weekly Rewards</h3>
            </div>
            <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-center gap-2">
                <span className="text-base">🥇</span>
                <span>{LEADERBOARD_CONFIG.rewards.top_10_weekly}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-base">📅</span>
                <span>{LEADERBOARD_CONFIG.rewards.daily_winner}</span>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

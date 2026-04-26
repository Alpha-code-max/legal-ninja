"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { LeaderboardRow, type LeaderboardEntry } from "@/components/ui/LeaderboardRow";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LEADERBOARD_CONFIG, type LeaderboardType } from "@/lib/config/leaderboard";
import { useUserStore } from "@/lib/store/user-store";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const TYPE_LABELS: Record<LeaderboardType, string> = {
  global_all_time:  "All Time",
  global_weekly:    "Weekly",
  daily:            "Today",
  subject_specific: "Subject",
  friends_only:     "Friends",
  country_based:    "🇳🇬 Nigeria",
};

const PODIUM_COLORS = ["var(--cyber-purple)", "var(--cyber-gold)", "var(--cyber-cyan)"];
const PODIUM_HEIGHTS = ["h-20", "h-28", "h-16"];
const PODIUM_EMOJIS  = ["🥈", "🥇", "🥉"];
const PODIUM_ORDER   = [1, 0, 2];

function PodiumIllustration({ top3 }: { top3: LeaderboardEntry[] }) {
  if (top3.length < 3) return (
    <div className="flex items-center justify-center py-8">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>Not enough players yet. Be the first!</p>
    </div>
  );

  return (
    <div className="relative">
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
            <motion.div key={entryIdx} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * pos, type: "spring" }} className="flex flex-col items-center gap-1">
              <motion.div animate={isFirst ? { y: [0, -4, 0] } : {}} transition={{ repeat: Infinity, duration: 2.5 }} className="text-2xl">
                {emoji}
              </motion.div>
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center text-xl border-2", isFirst && "w-16 h-16 text-2xl")}
                   style={{ borderColor: color, background: `color-mix(in srgb, ${color} 15%, var(--cyber-surface))`, boxShadow: `0 0 16px color-mix(in srgb, ${color} 50%, transparent)` }}>
                🥷
              </div>
              <p className="text-[10px] font-black text-center w-20 truncate" style={{ color: "var(--text-base)" }}>
                {entry.username.split(" ")[0]}
              </p>
              <p className="text-xs font-black font-mono" style={{ color }}>
                {(entry.total_xp / 1000).toFixed(1)}k
              </p>
              <div className={cn("w-20 rounded-t-lg flex items-center justify-center font-black text-sm", height)}
                   style={{ background: `linear-gradient(180deg, color-mix(in srgb, ${color} 30%, transparent), color-mix(in srgb, ${color} 10%, transparent))`, border: `1px solid color-mix(in srgb, ${color} 40%, transparent)`, color }}>
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
  const user = useUserStore();
  const [activeType, setActiveType] = useState<LeaderboardType>("global_weekly");
  const [entries,    setEntries]    = useState<LeaderboardEntry[]>([]);
  const [myRank,     setMyRank]     = useState<{ rank: number; total_xp: number } | null>(null);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    setLoading(true);
    if (!user.uid) {
      setEntries([]);
      setLoading(false);
      return;
    }
    api.getLeaderboard(activeType)
      .then((data) => {
        setEntries((data.entries ?? []) as LeaderboardEntry[]);
        setMyRank(data.my_rank as { rank: number; total_xp: number } | null);
      })
      .catch(() => setEntries([]))
      .finally(() => setLoading(false));
  }, [activeType, user.uid]);

  const top3 = entries.slice(0, 3);

  return (
    <div className="min-h-screen pb-36">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b h-16 flex items-center"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-2xl mx-auto w-full px-4 flex items-center justify-between">
          <button onClick={() => router.back()} className="text-sm font-bold transition-colors" style={{ color: "var(--text-muted)" }}>← Back</button>
          <h1 className="text-xl font-black gradient-text">Leaderboard</h1>
          <ThemeToggle />
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-5">

        {/* My rank banner */}
        {myRank && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
            className="cyber-card p-3 flex items-center justify-between"
            style={{ borderColor: "color-mix(in srgb, var(--cyber-cyan) 40%, transparent)" }}>
            <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Your rank</span>
            <span className="text-lg font-black font-mono neon-text-cyan">#{myRank.rank}</span>
            <span className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>{myRank.total_xp.toLocaleString()} XP</span>
          </motion.div>
        )}

        {/* Type tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {LEADERBOARD_CONFIG.types.map((type) => (
            <button key={type} onClick={() => setActiveType(type)}
              className={cn("px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap border transition-all",
                activeType === type ? "border-cyber-cyan bg-cyber-cyan/10 shadow-neon-cyan" : "border-cyber-border hover:border-cyber-cyan/50")}
              style={{ color: activeType === type ? "var(--cyber-cyan)" : "var(--text-muted)" }}>
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>

        {/* Podium */}
        <motion.div key={activeType} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-5">
          <p className="text-[10px] uppercase font-black tracking-widest text-center mb-5" style={{ color: "var(--text-muted)" }}>
            {TYPE_LABELS[activeType]} Champions
          </p>
          {loading ? (
            <div className="flex justify-center py-8">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-3xl">⚖️</motion.div>
            </div>
          ) : (
            <PodiumIllustration top3={top3 as LeaderboardEntry[]} />
          )}
        </motion.div>

        {/* Rankings */}
        <AnimatePresence mode="wait">
          <motion.div key={activeType} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
            {!user.uid && (
              <div className="cyber-card p-5 text-center space-y-3">
                <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Sign in to see the live leaderboard and your rank</p>
                <NeonButton variant="cyan" size="sm" onClick={() => router.push("/auth/sign-in")}>Sign In</NeonButton>
              </div>
            )}
            {loading && user.uid && (
              <p className="text-center text-xs py-4" style={{ color: "var(--text-muted)" }}>Loading rankings…</p>
            )}
            {!loading && entries.length === 0 && user.uid && (
              <div className="cyber-card p-8 text-center">
                <p className="text-3xl mb-2">🏆</p>
                <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>No rankings yet — play a game to appear here!</p>
              </div>
            )}
            {!loading && entries.map((entry, i) => (
              <LeaderboardRow key={entry.rank} entry={entry}
                isCurrentUser={entry.username === user.username}
                index={i} />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Weekly Rewards */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="cyber-card p-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5" style={{ background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-red))" }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🏆</span>
              <h3 className="text-sm font-black neon-text-gold uppercase tracking-wider">Weekly Rewards</h3>
            </div>
            <div className="space-y-2 text-xs" style={{ color: "var(--text-muted)" }}>
              <div className="flex items-center gap-2"><span className="text-base">🥇</span><span>{LEADERBOARD_CONFIG.rewards.top_10_weekly}</span></div>
              <div className="flex items-center gap-2"><span className="text-base">📅</span><span>{LEADERBOARD_CONFIG.rewards.daily_winner}</span></div>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

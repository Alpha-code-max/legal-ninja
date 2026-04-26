"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState } from "react";
import { useUserStore, getTotalBalance } from "@/lib/store/user-store";
import { useGameStore } from "@/lib/store/game-store";
import { XPBar } from "@/components/ui/XPBar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { StreakCounter } from "@/components/ui/StreakCounter";
import { BalanceDisplay } from "@/components/ui/BalanceDisplay";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { NeonIcon, type IconColor } from "@/components/ui/NeonIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LEVELS } from "@/lib/config/progression";
import { TRACKS } from "@/lib/config/tracks";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";

const QUICK_ACTIONS = [
  { id: "solo_practice",   label: "Solo",     icon: "Sword",        color: "cyan",   emoji: "⚔️",  desc: "Train alone" },
  { id: "duel",            label: "Duel",     icon: "ShieldAlert",  color: "purple", emoji: "🥊",  desc: "1v1 battle" },
  { id: "battle_royale",   label: "Royale",   icon: "Trophy",       color: "gold",   emoji: "🏆",  desc: "4-way war" },
  { id: "daily_challenge", label: "Daily",    icon: "Target",       color: "green",  emoji: "🎯",  desc: "Daily quest" },
  { id: "store",           label: "Top Up",   icon: "Zap",          color: "cyan",   emoji: "💎",  desc: "Get qs" },
  { id: "weak_area_focus", label: "Grind",    icon: "BookOpen",     color: "red",    emoji: "🔥",  desc: "Weak areas" },
] as const;

const ACTION_GRADIENTS: Record<string, string> = {
  solo_practice:   "from-cyan-500/20 to-cyan-900/10",
  duel:            "from-purple-500/20 to-purple-900/10",
  battle_royale:   "from-yellow-500/20 to-yellow-900/10",
  daily_challenge: "from-green-500/20 to-green-900/10",
  store:           "from-sky-500/20 to-sky-900/10",
  weak_area_focus: "from-red-500/20 to-red-900/10",
};

const SUBJECT_ICONS: Record<string, { emoji: string; color: string }> = {
  civil_procedure:     { emoji: "⚖️",  color: "var(--cyber-cyan)" },
  criminal_procedure:  { emoji: "🔍",  color: "var(--cyber-red)" },
  property_law:        { emoji: "🏛️",  color: "var(--cyber-gold)" },
  corporate_law:       { emoji: "💼",  color: "var(--cyber-purple)" },
  legal_ethics:        { emoji: "📜",  color: "var(--cyber-green)" },
  constitutional_law:  { emoji: "🗳️",  color: "var(--cyber-cyan)" },
  evidence_law:        { emoji: "🔬",  color: "var(--cyber-purple)" },
  law_of_contract:     { emoji: "📋",  color: "var(--cyber-green)" },
  torts:               { emoji: "⚠️",  color: "var(--cyber-gold)" },
  criminal_law:        { emoji: "🗡️",  color: "var(--cyber-red)" },
  equity_and_trusts:   { emoji: "⚖️",  color: "var(--cyber-purple)" },
  family_law:          { emoji: "👨‍👩‍👧",  color: "var(--cyber-green)" },
};

function DailyMissionCard() {
  const game = useGameStore();
  const sessionsToday = 3; // In production: compute from store
  const progress = Math.min(game.status === "finished" ? 1 : 0, 3);
  const pct = Math.round((progress / 3) * 100);

  return (
    <GlassCard className="p-0 overflow-hidden" hover={false}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                 style={{ background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-red))" }}>
              🎯
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--cyber-gold)" }}>Daily Mission</h4>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Complete 3 solo battles</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-black font-mono" style={{ color: "var(--cyber-gold)" }}>{progress}/3</p>
            <p className="text-[9px] uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>+10 🎓 reward</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, var(--cyber-gold), var(--cyber-red))" }}
            initial={{ width: "0%" }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
          />
        </div>

        {/* Milestone dots */}
        <div className="flex justify-between mt-1 px-0.5">
          {[1, 2, 3].map((n) => (
            <div key={n}
                 className="w-3 h-3 rounded-full border-2 flex items-center justify-center text-[7px]"
                 style={{
                   borderColor: progress >= n ? "var(--cyber-gold)" : "var(--cyber-border)",
                   background:  progress >= n ? "var(--cyber-gold)" : "transparent",
                   color:       "#000",
                 }}>
              {progress >= n && "✓"}
            </div>
          ))}
        </div>
      </div>
    </GlassCard>
  );
}

function StreakProtectionBadge({ streak }: { streak: number }) {
  if (streak < 10) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="flex items-center gap-1 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-wider"
      style={{
        background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-red))",
        color: "#000",
      }}
    >
      🛡️ Demotion Shield Active
    </motion.div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const track = searchParams.get("track") ?? "law_school_track";
  const user = useUserStore();
  const currentLevel = LEVELS.find((l) => l.level === user.level) ?? LEVELS[0];
  const nextLevel = LEVELS.find((l) => l.level === user.level + 1);
  const trackData = TRACKS[track as keyof typeof TRACKS] ?? TRACKS.law_school_track;
  const xpToNext = nextLevel ? nextLevel.xp_required - user.xp : 0;

  const handleAction = (id: string) => {
    if (id === "store") { router.push("/store"); return; }
    router.push(`/quiz?mode=${id}&track=${track}`);
  };

  const containerVars = {
    hidden: { opacity: 0 },
    show:   { opacity: 1, transition: { staggerChildren: 0.06 } },
  };
  const itemVars = {
    hidden: { opacity: 0, y: 18 },
    show:   { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 260, damping: 22 } },
  };

  return (
    <div className="min-h-screen pb-40">

      {/* Fixed HUD Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] backdrop-blur-xl border-b h-20"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-xl mx-auto h-full flex items-center gap-3 px-4">
          <LevelBadge level={user.level} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1">
              <h1 className="font-black text-lg uppercase tracking-tight" style={{ color: "var(--text-base)" }}>
                {user.username || "Recruit"}
              </h1>
              <span className="text-[10px] font-bold neon-text-cyan opacity-80">
                {currentLevel.title}
              </span>
            </div>
            <XPBar xp={user.xp} level={user.level} showLabel={false} />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <BalanceDisplay compact />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-xl mx-auto px-4 pt-24 space-y-6"
      >

        {/* Status Hub */}
        <motion.div variants={itemVars}>
          <GlassCard className="p-5 border-l-4 overflow-hidden" hover={false}
                     style={{ borderLeftColor: "var(--cyber-cyan)" } as React.CSSProperties}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest mb-1"
                   style={{ color: "var(--text-muted)" }}>Current Sector</p>
                <h2 className="text-sm font-bold neon-text-cyan">{trackData.name}</h2>
                {nextLevel && (
                  <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>
                    {xpToNext.toLocaleString()} XP → {nextLevel.name}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-black tracking-widest mb-1"
                   style={{ color: "var(--text-muted)" }}>Streak</p>
                <StreakCounter streak={user.current_streak} />
                <div className="mt-1">
                  <StreakProtectionBadge streak={user.current_streak} />
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick Actions Grid */}
        <motion.div variants={itemVars} className="space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em]"
              style={{ color: "var(--text-muted)" }}>Battle Modes</h3>
          <div className="grid grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <motion.button
                key={action.id}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleAction(action.id)}
                className={cn(
                  "glass-card rounded-xl p-3 flex flex-col items-center justify-center gap-2 text-center",
                  "bg-gradient-to-br cursor-pointer aspect-square relative overflow-hidden",
                  ACTION_GRADIENTS[action.id]
                )}
              >
                {/* Glow orb */}
                <div className="absolute top-0 right-0 w-10 h-10 blur-xl rounded-full opacity-40"
                     style={{ background: `var(--cyber-${action.color})` }} />
                <div className="text-2xl relative z-10">{action.emoji}</div>
                <div className="relative z-10">
                  <p className="text-[11px] font-black uppercase tracking-wide"
                     style={{ color: `var(--cyber-${action.color})` }}>
                    {action.label}
                  </p>
                  <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>
                    {action.desc}
                  </p>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Daily Mission */}
        <motion.div variants={itemVars}>
          <DailyMissionCard />
        </motion.div>

        {/* XP booster banner */}
        <motion.div variants={itemVars}>
          <GlassCard className="p-4 relative overflow-hidden" hover={false}>
            <div className="absolute inset-0 opacity-10"
                 style={{ background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-purple))" }} />
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⚡</div>
                <div>
                  <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--cyber-gold)" }}>XP Multipliers</p>
                  <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                    Battle Royale 1.8× · Exam Mode 1.5× · Duel 1.3×
                  </p>
                </div>
              </div>
              <Lucide.ChevronRight size={16} style={{ color: "var(--cyber-gold)" }} />
            </div>
          </GlassCard>
        </motion.div>

        {/* Knowledge Spheres */}
        <motion.div variants={itemVars} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em]"
                style={{ color: "var(--text-muted)" }}>Knowledge Spheres</h3>
            <span className="text-[9px] font-bold neon-text-cyan uppercase tracking-wider">
              {trackData.subjects.length} subjects
            </span>
          </div>
          <div className="grid gap-2">
            {trackData.subjects.map((subject, i) => {
              const icon = SUBJECT_ICONS[subject.id] ?? { emoji: "📚", color: "var(--cyber-cyan)" };
              return (
                <motion.button
                  key={subject.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  whileHover={{ x: 4 }}
                  onClick={() => router.push(`/quiz?mode=solo_practice&track=${track}&subject=${subject.id}`)}
                  className="glass-card rounded-xl flex items-center justify-between py-3 px-4 cursor-pointer group transition-all w-full text-left"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                         style={{ background: `color-mix(in srgb, ${icon.color} 15%, transparent)`,
                                  border: `1px solid color-mix(in srgb, ${icon.color} 30%, transparent)` }}>
                      {icon.emoji}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-base)" }}>
                      {subject.name}
                    </span>
                  </div>
                  <Lucide.ChevronRight size={14} className="opacity-30 group-hover:opacity-100 transition-opacity"
                                       style={{ color: icon.color }} />
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Referral banner */}
        <motion.div variants={itemVars}>
          <GlassCard className="p-4 flex items-center gap-4" hover={false}>
            <div className="text-3xl">🎁</div>
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-wider neon-text-green">
                Refer a Friend
              </p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
                Earn 20 free questions per referral
              </p>
            </div>
            <NeonButton variant="green" size="sm">
              Share
            </NeonButton>
          </GlassCard>
        </motion.div>

      </motion.div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center font-black animate-pulse neon-text-cyan">
          BOOTING_SYSTEM...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}

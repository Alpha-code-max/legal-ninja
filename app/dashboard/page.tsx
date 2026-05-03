"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Suspense, useState, useEffect } from "react";
import { useUserStore, getTotalBalance } from "@/lib/store/user-store";
import { useGameStore } from "@/lib/store/game-store";
import { StudentOnboarding } from "@/components/onboarding/StudentOnboarding";
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
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";
import * as Lucide from "lucide-react";

const QUICK_ACTIONS = [
  { id: "solo_practice",   label: "Solo",     icon: "Sword",        color: "cyan",   emoji: "⚔️",  desc: "Train alone" },
  { id: "duel",            label: "Duel",     icon: "ShieldAlert",  color: "purple", emoji: "🥊",  desc: "1v1 battle" },
  { id: "battle_royale",   label: "Royale",   icon: "Trophy",       color: "gold",   emoji: "🏆",  desc: "4-way war" },
  { id: "daily_challenge", label: "Daily",    icon: "Target",       color: "green",  emoji: "🎯",  desc: "Daily quest" },
  { id: "exam_simulation", label: "Mock Exam",icon: "GraduationCap",color: "purple", emoji: "🎓",  desc: "Exam simulation" },
  { id: "weak_area_focus", label: "Grind",    icon: "BookOpen",     color: "red",    emoji: "🔥",  desc: "Weak areas" },
] as const;

const ACTION_GRADIENTS: Record<string, string> = {
  solo_practice:   "from-cyan-500/20 to-cyan-900/10",
  duel:            "from-purple-500/20 to-purple-900/10",
  battle_royale:   "from-yellow-500/20 to-yellow-900/10",
  daily_challenge: "from-green-500/20 to-green-900/10",
  exam_simulation: "from-fuchsia-500/20 to-fuchsia-900/10",
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

const BAR_SUBJECT_IDS = new Set(["property_law", "civil_procedure", "criminal_procedure", "corporate_law", "legal_ethics"]);

function DailyMissionCard() {
  const user = useUserStore();
  const [progress, setProgress] = useState(0);
  const TARGET = 3;

  useEffect(() => {
    if (!user.uid) return;
    api.getMe().then((me) => setProgress(me.daily_goal?.progress ?? 0)).catch(() => {});
  }, [user.uid]);

  const pct = Math.round((progress / TARGET) * 100);

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

function QuestCard() {
  const user = useUserStore();
  const [quests, setQuests] = useState<{ id: string; title: string; target: number; progress: number; status: string; reward_xp: number; reward_questions: number }[]>([]);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (!user.uid) return;
    api.getQuests().then(setQuests).catch(() => {});
  }, [user.uid]);

  const claim = async (id: string) => {
    setClaiming(id);
    try {
      const res = await api.claimQuest(id);
      user.addXP(res.reward_xp);
      user.addQuestions(0, 0, res.reward_questions);
      setQuests((q) => q.filter((x) => x.id !== id));
    } catch { /* ignore */ }
    finally { setClaiming(null); }
  };

  if (!user.uid || quests.length === 0) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-4 space-y-3" hover={false}>
        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: "var(--text-muted)" }}>Daily Quests</p>
        {quests.slice(0, 3).map((q) => {
          const pct = Math.round((q.progress / q.target) * 100);
          const done = q.status === "completed";
          return (
            <div key={q.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-bold flex-1" style={{ color: done ? "var(--cyber-green)" : "var(--text-base)" }}>{q.title}</p>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>{q.progress}/{q.target}</span>
                  {done && (
                    <NeonButton variant="green" size="sm" onClick={() => claim(q.id)} disabled={claiming === q.id}>
                      {claiming === q.id ? "…" : `+${q.reward_questions}q`}
                    </NeonButton>
                  )}
                </div>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
                <motion.div className="h-full rounded-full"
                  style={{ background: done ? "var(--cyber-green)" : "linear-gradient(90deg, var(--cyber-cyan), var(--cyber-purple))" }}
                  initial={{ width: "0%" }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
              </div>
            </div>
          );
        })}
      </GlassCard>
    </motion.div>
  );
}

function ReferralBanner() {
  const user = useUserStore();
  const [copied, setCopied] = useState(false);

  const copyLink = () => {
    const link = `${window.location.origin}/auth/sign-up?ref=${user.referral_code}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
      <GlassCard className="p-4 flex items-center gap-4" hover={false}>
        <div className="text-3xl">🎁</div>
        <div className="flex-1">
          <p className="text-xs font-black uppercase tracking-wider neon-text-green">Refer a Friend</p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            {user.uid ? `${user.referral_count} referred · ` : ""}Earn 20 free questions per referral
          </p>
        </div>
        <NeonButton variant="green" size="sm" onClick={copyLink}>
          {copied ? "Copied!" : "Share"}
        </NeonButton>
      </GlassCard>
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
    if (id === "duel" || id === "battle_royale") {
      router.push(`/lobby?mode=${id}&track=${track}`); return;
    }
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

  const [showOnboarding, setShowOnboarding] = useState(!user.university);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  return (
    <div className="min-h-screen pb-40">

      {showOnboarding && <StudentOnboarding onComplete={handleOnboardingComplete} />}

      {/* Fixed HUD Header */}
      <div className="fixed top-0 left-0 right-0 z-[60] backdrop-blur-xl border-b h-16 sm:h-20"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-xl mx-auto h-full flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
          <LevelBadge level={user.level} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-1 sm:gap-2 mb-0.5">
              <h1 className="font-black text-base sm:text-lg uppercase tracking-tight truncate" style={{ color: "var(--text-base)" }}>
                {user.username || "Recruit"}
              </h1>
              <span className="text-[9px] sm:text-[10px] font-bold neon-text-cyan opacity-80 whitespace-nowrap">
                {currentLevel.title}
              </span>
            </div>
            <XPBar xp={user.xp} level={user.level} showLabel={false} />
          </div>
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <BalanceDisplay compact />
            <button
              onClick={() => router.push("/ranks")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg hidden sm:flex"
              style={{ background: "color-mix(in srgb, var(--cyber-gold) 12%, transparent)", color: "var(--cyber-gold)" }}
              title="View ranks"
            >
              🥋
            </button>
            <button
              onClick={() => router.push("/info")}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center text-base sm:text-lg"
              style={{ background: "color-mix(in srgb, var(--cyber-cyan) 12%, transparent)", color: "var(--cyber-cyan)" }}
              title="Game info"
            >
              ℹ️
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <motion.div
        variants={containerVars}
        initial="hidden"
        animate="show"
        className="max-w-xl mx-auto px-3 sm:px-4 pt-20 sm:pt-24 space-y-6"
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
            {trackData.subjects
              .filter((subject) => user.role !== "bar_student" || BAR_SUBJECT_IDS.has(subject.id))
              .map((subject, i) => {
              const icon = SUBJECT_ICONS[subject.id] ?? { emoji: "📚", color: "var(--cyber-cyan)" };
              return (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.05 * i }}
                  className="glass-card rounded-xl flex items-center justify-between py-3 px-4 w-full"
                >
                  <button
                    onClick={() => router.push(`/quiz?mode=solo_practice&track=${track}&subject=${subject.id}`)}
                    className="flex items-center gap-3 flex-1 text-left cursor-pointer group transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                         style={{ background: `color-mix(in srgb, ${icon.color} 15%, transparent)`,
                                  border: `1px solid color-mix(in srgb, ${icon.color} 30%, transparent)` }}>
                      {icon.emoji}
                    </div>
                    <span className="font-semibold text-sm" style={{ color: "var(--text-base)" }}>
                      {subject.name}
                    </span>
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/quiz?mode=exam_simulation&track=${track}&subject=${subject.id}`)}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                      style={{ background: "color-mix(in srgb, var(--cyber-purple) 15%, transparent)", color: "var(--cyber-purple)" }}
                      title="Mock Exam"
                    >
                      🎓 Mock
                    </button>
                    <Lucide.ChevronRight size={14} className="opacity-30"
                                         style={{ color: icon.color }} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Quests */}
        <QuestCard />

        {/* Referral banner */}
        <ReferralBanner />

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

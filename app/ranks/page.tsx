"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";
import { LEVELS } from "@/lib/config/progression";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { NeonButton } from "@/components/ui/NeonButton";

const RANK_COLORS: Record<number, { primary: string; secondary: string }> = {
  1: { primary: "var(--cyber-green)", secondary: "rgba(34, 255, 136, 0.1)" },
  2: { primary: "var(--cyber-cyan)", secondary: "rgba(0, 245, 255, 0.1)" },
  3: { primary: "var(--cyber-purple)", secondary: "rgba(192, 38, 211, 0.1)" },
  4: { primary: "var(--cyber-gold)", secondary: "rgba(255, 215, 0, 0.1)" },
  5: { primary: "var(--cyber-red)", secondary: "rgba(255, 45, 85, 0.1)" },
  6: { primary: "#00FF88", secondary: "rgba(0, 255, 136, 0.15)" },
  7: { primary: "#FFD700", secondary: "rgba(255, 215, 0, 0.15)" },
};

const RANK_EMOJIS: Record<number, string> = {
  1: "🥋", 2: "🐕", 3: "📝", 4: "⚔️",
  5: "👔", 6: "🥷", 7: "👑",
};

export default function RanksPage() {
  const router = useRouter();
  const user = useUserStore();

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-black" style={{ color: "var(--cyber-cyan)" }}>
            Legal Ranks
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Master the law and climb the ranks. Every question answered brings you closer to legend status.
          </p>
        </motion.div>

        {/* Progress section */}
        {user.uid && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cyber-card p-6 text-center space-y-3"
          >
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Your Current Rank
            </p>
            <LevelBadge level={user.level} size="lg" showName />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {user.xp} XP • {user.total_questions_answered} Questions Answered
            </p>
          </motion.div>
        )}

        {/* All ranks */}
        <div className="space-y-4">
          {LEVELS.map((rank, idx) => {
            const isUnlocked = user.xp >= rank.xp_required && user.total_questions_answered >= rank.min_questions;
            const colors = RANK_COLORS[rank.level];

            return (
              <motion.div
                key={rank.level}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="cyber-card overflow-hidden transition-all hover:shadow-lg"
                style={{
                  borderColor: isUnlocked ? colors.primary : "var(--cyber-border)",
                  background: isUnlocked ? colors.secondary : "transparent",
                }}
              >
                <div className="p-5 flex items-start gap-4">
                  {/* Rank badge */}
                  <div
                    className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl shrink-0 font-black"
                    style={{
                      background: colors.secondary,
                      border: `2px solid ${colors.primary}`,
                      boxShadow: isUnlocked ? `0 0 20px ${colors.primary}40` : "none",
                    }}
                  >
                    {RANK_EMOJIS[rank.level]}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <p className="text-sm font-black" style={{ color: colors.primary }}>
                          Level {rank.level}
                        </p>
                        <p className="text-lg font-black leading-tight" style={{ color: "var(--text-base)" }}>
                          {rank.name}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                          {rank.title}
                        </p>
                      </div>
                      {isUnlocked && (
                        <div
                          className="px-2 py-1 rounded-lg text-xs font-black"
                          style={{
                            background: colors.primary,
                            color: "#000",
                          }}
                        >
                          ✓ Unlocked
                        </div>
                      )}
                    </div>

                    {/* Requirements */}
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      <div
                        className="px-3 py-2 rounded-lg text-xs"
                        style={{
                          background: "color-mix(in srgb, var(--cyber-cyan) 8%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                        }}
                      >
                        <p style={{ color: "var(--text-muted)" }}>XP Required</p>
                        <p
                          className="font-black font-mono text-sm mt-1"
                          style={{ color: "var(--cyber-cyan)" }}
                        >
                          {rank.xp_required.toLocaleString()}
                        </p>
                      </div>
                      <div
                        className="px-3 py-2 rounded-lg text-xs"
                        style={{
                          background: "color-mix(in srgb, var(--cyber-green) 8%, transparent)",
                          border: "1px solid color-mix(in srgb, var(--cyber-green) 20%, transparent)",
                        }}
                      >
                        <p style={{ color: "var(--text-muted)" }}>Questions Min</p>
                        <p
                          className="font-black font-mono text-sm mt-1"
                          style={{ color: "var(--cyber-green)" }}
                        >
                          {rank.min_questions.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Progress bars */}
                    {!isUnlocked && user.uid && (
                      <div className="mt-3 space-y-2">
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>XP Progress</p>
                            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              {Math.min(user.xp, rank.xp_required)}/{rank.xp_required}
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
                            <motion.div
                              className="h-full bg-gradient-xp rounded-full"
                              animate={{ width: `${Math.min(100, (user.xp / rank.xp_required) * 100)}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Questions Progress</p>
                            <p className="text-xs font-mono" style={{ color: "var(--text-muted)" }}>
                              {Math.min(user.total_questions_answered, rank.min_questions)}/{rank.min_questions}
                            </p>
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
                            <motion.div
                              className="h-full bg-gradient-primary rounded-full"
                              animate={{ width: `${Math.min(100, (user.total_questions_answered / rank.min_questions) * 100)}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2"
        >
          <NeonButton
            variant="cyan"
            fullWidth
            size="lg"
            onClick={() => router.push("/quiz")}
          >
            ⚔️ Start Training
          </NeonButton>
          <NeonButton
            variant="ghost"
            fullWidth
            onClick={() => router.back()}
          >
            Back
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
}

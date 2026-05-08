"use client";
import { motion } from "framer-motion";
import { NeonButton } from "@/components/ui/NeonButton";

interface Props {
  score: number;
  correctAnswer: string;
  feedback?: string;
  countdown: number | null;
  onSkip: () => void;
}

export function EssayCorrectionCard({ score, correctAnswer, feedback, countdown, onSkip }: Props) {
  const progressPercent = countdown !== null ? (countdown / 20) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="cyber-card p-6 w-full max-w-2xl mx-auto space-y-5"
    >
      {/* Header with score badge */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
              style={{
                color: score >= 50 ? "var(--cyber-green)" : "var(--cyber-red)",
                background: `color-mix(in srgb, ${score >= 50 ? "var(--cyber-green)" : "var(--cyber-red)"} 12%, transparent)`,
                border: `1px solid color-mix(in srgb, ${score >= 50 ? "var(--cyber-green)" : "var(--cyber-red)"} 25%, transparent)`,
              }}>
          CORRECTION
        </span>
        <span className="text-2xl font-black font-mono" style={{ color: score >= 50 ? "var(--cyber-green)" : "var(--cyber-red)" }}>
          {Math.round(score)}%
        </span>
      </div>

      {/* Model Answer Section */}
      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>
          ⚖️ Model Answer
        </label>
        <div className="rounded-xl p-4 border"
             style={{
               background: "color-mix(in srgb, var(--cyber-purple) 8%, transparent)",
               borderColor: "var(--cyber-purple)",
             }}>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-base)" }}>
            {correctAnswer || "Review the question and focus on key legal principles, relevant case law, and statutory references."}
          </p>
        </div>
      </div>

      {/* Feedback if available */}
      {feedback && (
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>
            Examiner's Note
          </label>
          <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {feedback}
          </p>
        </div>
      )}

      {/* Countdown bar */}
      {countdown !== null && (
        <div className="space-y-2">
          <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "color-mix(in srgb, var(--text-muted) 20%, transparent)" }}>
            <motion.div
              className="absolute top-0 left-0 h-full rounded-full"
              style={{
                background: "linear-gradient(to right, var(--cyber-green), var(--cyber-purple))",
                width: `${progressPercent}%`,
              }}
              transition={{ duration: 1, ease: "linear" }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
            <span>Next in {countdown}s</span>
            <span>Auto-advance</span>
          </div>
        </div>
      )}

      {/* Continue button */}
      <NeonButton
        variant="purple"
        fullWidth
        size="lg"
        onClick={onSkip}
      >
        Continue to Next Question →
      </NeonButton>
    </motion.div>
  );
}

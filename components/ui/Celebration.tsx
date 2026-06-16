"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { NeonButton } from "@/components/ui/NeonButton";

const CONFETTI_COLORS = [
  "var(--cyber-cyan)", "var(--cyber-purple)", "var(--cyber-gold)",
  "var(--cyber-green)", "var(--cyber-red)",
];

/**
 * Confetti — reusable falling-particle burst. Renders nothing when `show` is
 * false. Pieces fall from the top across the full viewport width.
 */
export function Confetti({ show, count = 28 }: { show: boolean; count?: number }) {
  if (!show) return null;
  const pieces = Array.from({ length: count }, (_, i) => ({
    id: i,
    x: 4 + (i % 10) * 10,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: i * 0.06,
    duration: 1.5 + Math.random(),
    rotate: Math.random() * 720,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-[80] overflow-hidden" aria-hidden>
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm top-0"
          style={{ left: `${p.x}%`, background: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotate, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

/**
 * LevelUpOverlay — a full-screen celebratory moment shown when the player ranks
 * up. Tap anywhere or press the button to dismiss.
 */
export function LevelUpOverlay({
  level,
  rankName,
  onDismiss,
}: {
  level: number;
  rankName?: string;
  onDismiss: () => void;
}) {
  // Auto-dismiss after a beat so it never blocks the user permanently.
  useEffect(() => {
    const t = setTimeout(onDismiss, 6000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onDismiss}
        className="fixed inset-0 z-[90] flex items-center justify-center px-6 cursor-pointer"
        style={{ background: "rgba(5, 10, 15, 0.82)", backdropFilter: "blur(6px)" }}
      >
        <Confetti show count={36} />
        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 18 }}
          className="cyber-card p-8 text-center flex flex-col items-center gap-4 max-w-xs w-full relative overflow-hidden"
          style={{ borderColor: "var(--cyber-gold)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 opacity-10"
            style={{ background: "radial-gradient(circle at 50% 30%, var(--cyber-gold), transparent 70%)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.18, 1], rotate: [0, -4, 4, 0] }}
            transition={{ repeat: Infinity, repeatDelay: 1.2, duration: 0.8 }}
            className="text-5xl relative z-10"
          >
            🎖️
          </motion.div>
          <p className="text-2xl font-black relative z-10 neon-text-gold">LEVEL UP!</p>
          <div className="relative z-10">
            <LevelBadge level={level} size="md" showName />
          </div>
          {rankName && (
            <p className="text-sm font-bold relative z-10" style={{ color: "var(--cyber-gold)" }}>
              {rankName}
            </p>
          )}
          <p className="text-xs relative z-10" style={{ color: "var(--text-muted)" }}>
            You&apos;ve advanced to the next rank. The dojo bows to you. 🥷
          </p>
          <div className="relative z-10 pt-1">
            <NeonButton variant="gold" onClick={onDismiss}>Keep Training</NeonButton>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

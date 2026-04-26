"use client";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  streak: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function StreakCounter({ streak, className, size = "md" }: Props) {
  const hot = streak >= 5;
  const onFire = streak >= 10;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={streak}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className={cn(
            "font-bold font-mono",
            size === "sm" && "text-sm",
            size === "md" && "text-xl",
            size === "lg" && "text-3xl",
            onFire ? "text-cyber-gold neon-text-gold" : hot ? "text-cyber-red" : "text-gray-400"
          )}
        >
          {streak}
        </motion.span>
      </AnimatePresence>
      <span
        className={cn(
          "transition-all",
          size === "sm" ? "text-base" : size === "md" ? "text-2xl" : "text-4xl",
          onFire ? "animate-streak-fire" : ""
        )}
      >
        {onFire ? "🔥" : hot ? "⚡" : "💧"}
      </span>
      <span className={cn("text-xs text-gray-500", size === "lg" && "text-sm")}>streak</span>
    </div>
  );
}

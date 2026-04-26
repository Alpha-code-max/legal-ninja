"use client";
import { motion } from "framer-motion";
import { LEVELS } from "@/lib/config/progression";
import { cn } from "@/lib/utils";

interface Props {
  level: number;
  size?: "sm" | "md" | "lg";
  showName?: boolean;
  className?: string;
}

const levelColors: Record<number, { border: string; glow: string; text: string; bg: string }> = {
  1: { border: "border-gray-500",       glow: "drop-shadow-[0_0_5px_rgba(156,163,175,0.3)]", text: "text-gray-400", bg: "bg-gray-500/10" },
  2: { border: "border-green-400",      glow: "drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]",  text: "text-green-400", bg: "bg-green-400/10" },
  3: { border: "border-cyber-cyan",     glow: "drop-shadow-[0_0_10px_rgba(0,245,255,0.5)]",  text: "text-cyber-cyan", bg: "bg-cyber-cyan/10" },
  4: { border: "border-blue-400",       glow: "drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]", text: "text-blue-400", bg: "bg-blue-400/10" },
  5: { border: "border-cyber-purple",   glow: "drop-shadow-[0_0_12px_rgba(192,38,211,0.5)]", text: "text-cyber-purple", bg: "bg-cyber-purple/10" },
  6: { border: "border-cyber-gold",     glow: "drop-shadow-[0_0_15px_rgba(255,215,0,0.5)]",  text: "text-cyber-gold", bg: "bg-cyber-gold/10" },
  7: { border: "border-cyber-red",      glow: "drop-shadow-[0_0_20px_rgba(255,45,85,0.6)]",  text: "text-cyber-red", bg: "bg-cyber-red/10" },
};

const sizes = { 
  sm: "w-8 h-9 text-[10px]", 
  md: "w-12 h-14 text-sm", 
  lg: "w-16 h-18 text-xl" 
};

export function LevelBadge({ level, size = "md", showName = false, className }: Props) {
  const lvlData = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const colors = levelColors[level] ?? levelColors[7];

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        className={cn(
          "relative flex items-center justify-center font-black font-mono",
          sizes[size],
          colors.text,
          "filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
        )}
      >
        {/* Outer Glow Overlay */}
        <div 
          className={cn("absolute inset-0 opacity-20 blur-md", colors.bg)}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          }}
        />

        {/* The Hexagon Body */}
        <div
          className="absolute inset-0 border-2"
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            background: 'var(--cyber-surface)',
            borderColor: 'rgba(255,255,255,0.15)',
            boxShadow: 'inset 0 0 10px rgba(255,255,255,0.08)'
          }}
        />

        {/* Inner Neon Border */}
        <div 
          className={cn("absolute inset-[3px]", colors.bg)}
          style={{
            clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
            border: '2px solid currentColor',
            filter: 'brightness(2) saturate(1.5)',
            opacity: 0.9
          }}
        />

        <span className="relative z-10 text-white drop-shadow-md">{level}</span>
      </motion.div>


      {showName && (
        <span className={cn("text-[10px] uppercase font-bold tracking-widest text-center", colors.text)}>
          {lvlData.title}
        </span>
      )}
    </div>
  );
}


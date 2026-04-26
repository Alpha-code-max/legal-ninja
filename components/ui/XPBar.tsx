"use client";
import { motion } from "framer-motion";
import { LEVELS, getNextLevel } from "@/lib/config/progression";
import { cn } from "@/lib/utils";

interface Props {
  xp: number;
  level: number;
  className?: string;
  showLabel?: boolean;
}

export function XPBar({ xp, level, className, showLabel = true }: Props) {
  const currentLvl = LEVELS.find((l) => l.level === level) ?? LEVELS[0];
  const nextLvl = getNextLevel(level);

  const currentXP = xp - currentLvl.xp_required;
  const neededXP = nextLvl ? nextLvl.xp_required - currentLvl.xp_required : 1;
  const progress = nextLvl ? Math.min(100, (currentXP / neededXP) * 100) : 100;

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-[10px] uppercase tracking-tighter text-gray-500 mb-1 font-bold">
          <span className="text-cyber-cyan">Progress to Level {level + 1}</span>
          <span>{Math.floor(progress)}%</span>
        </div>
      )}
      <div className="h-3 bg-cyber-bg border border-cyber-border p-[2px] relative overflow-hidden">
        {/* Background segments */}
        <div className="absolute inset-0 flex gap-[2px] opacity-10">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="flex-1 bg-cyber-cyan" />
          ))}
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full relative overflow-hidden"
        >
          {/* Active segments */}
          <div className="absolute inset-0 flex gap-[2px] w-[calc(100%)]">
            {Array.from({ length: 20 }).map((_, i) => (
              <div 
                key={i} 
                className="w-[calc(5%-2px)] shrink-0 bg-cyber-cyan shadow-[0_0_8px_rgba(0,245,255,0.8)]" 
              />
            ))}
          </div>
          
          {/* Shimmer overlay */}
          <div className="absolute inset-0 shimmer opacity-30" />
        </motion.div>
      </div>
      
      {showLabel && (
        <div className="mt-1 text-[9px] text-gray-600 flex justify-between font-mono">
          <span>{xp.toLocaleString()} XP</span>
          {nextLvl && <span>REQN: {nextLvl.xp_required.toLocaleString()}</span>}
        </div>
      )}
    </div>
  );
}


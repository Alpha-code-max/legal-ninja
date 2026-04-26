"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  durationSeconds: number;
  onExpire?: () => void;
  size?: number;
  className?: string;
}

export function TimerRing({ durationSeconds, onExpire, size = 80, className }: Props) {
  const [remaining, setRemaining] = useState(durationSeconds);
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = remaining / durationSeconds;
  const offset = circumference * (1 - progress);
  const isUrgent = remaining <= 10;

  useEffect(() => {
    if (remaining <= 0) { onExpire?.(); return; }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [remaining, onExpire]);

  const color = isUrgent ? "#FF2D55" : remaining <= 30 ? "#FFD700" : "#00F5FF";

  return (
    <div className={cn("relative flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className={cn(isUrgent && "animate-pulse")}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1A2D42" strokeWidth={6} />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={6}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
          transition={{ duration: 0.9, ease: "linear" }}
        />
      </svg>
      <span
        className={cn(
          "absolute font-mono font-bold",
          size >= 80 ? "text-xl" : "text-sm",
          isUrgent ? "text-cyber-red animate-pulse" : "text-cyber-cyan"
        )}
        style={{ color }}
      >
        {remaining}
      </span>
    </div>
  );
}

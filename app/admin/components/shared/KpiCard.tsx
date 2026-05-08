"use client";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number | string;
  color: "cyan" | "green" | "purple" | "gold" | "red";
  trend?: { direction: "up" | "down"; label: string };
  subtitle?: string;
  className?: string;
}

export function KpiCard({ label, value, color, trend, subtitle, className }: Props) {
  const colorVars = {
    cyan: "var(--cyber-cyan)",
    green: "var(--cyber-green)",
    purple: "var(--cyber-purple)",
    gold: "var(--cyber-gold)",
    red: "var(--cyber-red)",
  };

  const colorClass = {
    cyan: "neon-text-cyan",
    green: "neon-text-green",
    purple: "neon-text-purple",
    gold: "neon-text-gold",
    red: "text-cyber-red",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("cyber-card p-4 space-y-2", className)}
    >
      <p className="text-xs uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <p className={cn("text-3xl font-black font-mono", colorClass[color])}>
        {value}
      </p>
      {trend && (
        <p
          className="text-xs font-bold"
          style={{
            color: trend.direction === "up" ? "var(--cyber-green)" : "var(--cyber-red)",
          }}
        >
          {trend.direction === "up" ? "↑" : "↓"} {trend.label}
        </p>
      )}
      {subtitle && (
        <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
          {subtitle}
        </p>
      )}
    </motion.div>
  );
}

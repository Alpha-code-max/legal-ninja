"use client";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "cyan" | "purple" | "green" | "gold" | "ghost" | "red";

const variants: Record<Variant, string> = {
  cyan:   "border-cyber-cyan text-cyber-cyan hover:bg-cyber-cyan/10 shadow-[0_0_15px_rgba(0,245,255,0.3)]",
  purple: "border-cyber-purple text-cyber-purple hover:bg-cyber-purple/10 shadow-[0_0_15px_rgba(192,38,211,0.3)]",
  green:  "border-cyber-green text-cyber-green hover:bg-cyber-green/10 shadow-[0_0_15px_rgba(34,255,136,0.3)]",
  gold:   "border-cyber-gold text-cyber-gold hover:bg-cyber-gold/10 shadow-[0_0_15px_rgba(255,215,0,0.3)]",
  red:    "border-cyber-red text-cyber-red hover:bg-cyber-red/10 shadow-[0_0_15px_rgba(255,45,85,0.3)]",
  ghost:  "border-cyber-border text-gray-400 hover:border-cyber-cyan hover:text-cyber-cyan",
};

interface Props {
  children: ReactNode;
  variant?: Variant;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  type?: "button" | "submit" | "reset";
}

const sizes = { 
  sm: "px-3 py-1.5 text-xs", 
  md: "px-6 py-3 text-sm", 
  lg: "px-10 py-4 text-base" 
};

export function NeonButton({
  children, variant = "cyan", className, onClick, disabled, fullWidth, size = "md", glow = true, type = "button"
}: Props) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "relative font-exo font-bold tracking-widest uppercase transition-all duration-300",
        "disabled:opacity-40 disabled:cursor-not-allowed border",
        "before:absolute before:inset-0 before:bg-white/5 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        sizes[size],
        variants[variant],
        fullWidth && "w-full",
        // Corner-cut clip path
        "clip-path-polygon",
        className
      )}
      style={{
        clipPath: 'polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 100%, 0 10px)'
      }}
    >
      <div className="absolute inset-0 shimmer opacity-10 pointer-events-none" />
      {children}
    </motion.button>
  );
}


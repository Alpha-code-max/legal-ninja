"use client";
import * as Lucide from "lucide-react";
import { cn } from "@/lib/utils";

export type IconColor = "cyan" | "purple" | "green" | "gold" | "red";

interface Props {
  name: keyof typeof Lucide;
  color?: IconColor;
  size?: number;
  className?: string;
  glow?: boolean;
}

const colorMap: Record<IconColor, string> = {
  cyan:   "text-cyber-cyan drop-shadow-[0_0_8px_rgba(0,245,255,0.6)]",
  purple: "text-cyber-purple drop-shadow-[0_0_8px_rgba(192,38,211,0.6)]",
  green:  "text-cyber-green drop-shadow-[0_0_8px_rgba(34,255,136,0.6)]",
  gold:   "text-cyber-gold drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]",
  red:    "text-cyber-red drop-shadow-[0_0_8px_rgba(255,45,85,0.6)]",
};

export function NeonIcon({ 
  name, 
  color = "cyan", 
  size = 24, 
  className,
  glow = true
}: Props) {
  const Icon = Lucide[name] as React.ElementType;

  if (!Icon) return null;

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <Icon 
        size={size} 
        className={cn(
          "transition-all duration-300",
          glow && colorMap[color]
        )} 
      />
    </div>
  );
}

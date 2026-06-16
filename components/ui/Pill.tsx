"use client";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type Accent = "cyan" | "purple" | "green" | "gold" | "red";

/**
 * Pill — the small rounded accent tag used across the app (subjects, weak areas,
 * badges, statuses). Replaces dozens of repeated inline color-mix() blocks with a
 * single themed primitive. Colors derive from the active theme's CSS variables.
 */
export function Pill({
  children,
  accent = "cyan",
  className,
  fill = 10,
  border = 40,
}: {
  children: ReactNode;
  accent?: Accent;
  className?: string;
  /** Background tint strength (% of accent mixed into transparent) */
  fill?: number;
  /** Border tint strength (% of accent mixed into transparent) */
  border?: number;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border",
        className
      )}
      style={{
        background: `color-mix(in srgb, var(--cyber-${accent}) ${fill}%, transparent)`,
        borderColor: `color-mix(in srgb, var(--cyber-${accent}) ${border}%, transparent)`,
        color: `var(--cyber-${accent})`,
      }}
    >
      {children}
    </span>
  );
}

"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { NeonButton } from "@/components/ui/NeonButton";

type Accent = "cyan" | "purple" | "green" | "gold" | "red";

/* ─── Skeleton — pulsing placeholder block in the cyber theme ─────────────── */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("rounded-lg shimmer", className)}
      style={{ background: "var(--cyber-border)" }}
      aria-hidden
    />
  );
}

/* A skeleton shaped like a cyber-card, for list/page loading states */
export function SkeletonCard({ lines = 3 }: { lines?: number }) {
  return (
    <div className="cyber-card p-5 space-y-3">
      <Skeleton className="h-4 w-1/3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn("h-3", i === lines - 1 ? "w-2/3" : "w-full")} />
      ))}
    </div>
  );
}

/* ─── LoadingScreen — full-screen branded loader ──────────────────────────── */
export function LoadingScreen({ label = "Loading" }: { label?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1.1, ease: "linear" }}
        className="text-4xl"
      >
        ⚖️
      </motion.div>
      <p className="font-black uppercase tracking-[0.3em] text-sm neon-text-cyan animate-pulse">
        {label}…
      </p>
    </div>
  );
}

/* ─── InlineSpinner — small loader for in-place async (e.g. explanations) ──── */
export function InlineSpinner({ label }: { label?: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>
        ⚖️
      </motion.span>
      {label && <span className="text-xs" style={{ color: "var(--text-muted)" }}>{label}</span>}
    </div>
  );
}

/* ─── EmptyState — themed empty placeholder with optional CTA ──────────────── */
export function EmptyState({
  emoji = "🗂️",
  title,
  description,
  accent = "cyan",
  action,
}: {
  emoji?: string;
  title: string;
  description?: string;
  accent?: Accent;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="cyber-card p-8 text-center flex flex-col items-center gap-3"
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          background: `color-mix(in srgb, var(--cyber-${accent}) 12%, transparent)`,
          border: `1px solid color-mix(in srgb, var(--cyber-${accent}) 30%, transparent)`,
        }}
      >
        {emoji}
      </div>
      <h3 className="text-base font-black" style={{ color: "var(--text-base)" }}>{title}</h3>
      {description && (
        <p className="text-sm max-w-xs" style={{ color: "var(--text-muted)" }}>{description}</p>
      )}
      {action && <div className="pt-1">{action}</div>}
    </motion.div>
  );
}

/* ─── ErrorState — themed error with retry ────────────────────────────────── */
export function ErrorState({
  title = "Something glitched",
  description = "An unexpected error occurred. Our team has been notified.",
  onRetry,
  retryLabel = "Try Again",
  fullScreen = false,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
  fullScreen?: boolean;
}) {
  const body = (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="cyber-card p-8 text-center flex flex-col items-center gap-3 max-w-sm w-full"
      style={{ borderColor: "color-mix(in srgb, var(--cyber-red) 40%, transparent)" }}
    >
      <motion.div
        animate={{ rotate: [0, -8, 8, -8, 0] }}
        transition={{ repeat: Infinity, repeatDelay: 2.5, duration: 0.6 }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
        style={{
          background: "color-mix(in srgb, var(--cyber-red) 12%, transparent)",
          border: "1px solid color-mix(in srgb, var(--cyber-red) 35%, transparent)",
        }}
      >
        ⚠️
      </motion.div>
      <h3 className="text-lg font-black" style={{ color: "var(--cyber-red)" }}>{title}</h3>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>{description}</p>
      {onRetry && (
        <div className="pt-2">
          <NeonButton variant="red" onClick={onRetry}>{retryLabel}</NeonButton>
        </div>
      )}
    </motion.div>
  );

  if (fullScreen) {
    return <div className="min-h-screen flex items-center justify-center px-6">{body}</div>;
  }
  return body;
}

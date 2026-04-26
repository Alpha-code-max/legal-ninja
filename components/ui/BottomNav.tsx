"use client";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { NeonIcon } from "./NeonIcon";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "dashboard",   label: "Hub",    icon: "LayoutDashboard", color: "cyan"   },
  { id: "leaderboard", label: "Rank",   icon: "Trophy",          color: "gold"   },
  { id: "store",       label: "Armory", icon: "ShoppingBag",     color: "purple" },
  { id: "profile",     label: "Ninja",  icon: "User",            color: "cyan"   },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const router   = useRouter();

  if (
    pathname === "/" ||
    pathname?.startsWith("/quiz") ||
    pathname?.startsWith("/admin") ||
    pathname?.startsWith("/auth")
  ) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-2xl border-t pb-safe"
      style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}
    >
      <div className="max-w-xl mx-auto flex items-center justify-around py-2 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => router.push(`/${item.id}`)}
              className="flex flex-col items-center gap-1 relative group w-16 py-1"
            >
              {isActive && (
                <motion.div
                  layoutId="nav-glow"
                  className="absolute -top-2 w-12 h-12 blur-2xl rounded-full pointer-events-none"
                  style={{ background: `color-mix(in srgb, var(--cyber-${item.color}) 30%, transparent)` }}
                />
              )}

              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                isActive
                  ? "border"
                  : "border-transparent",
              )}
              style={isActive ? {
                background:   `color-mix(in srgb, var(--cyber-${item.color}) 15%, transparent)`,
                borderColor:  `color-mix(in srgb, var(--cyber-${item.color}) 35%, transparent)`,
              } : {}}>
                <NeonIcon
                  name={item.icon as any}
                  color={isActive ? (item.color as any) : "ghost"}
                  size={18}
                  glow={isActive}
                  className={cn(
                    "transition-all duration-200",
                    !isActive && "opacity-40"
                  )}
                />
              </div>

              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest transition-colors",
                isActive ? "" : "opacity-40"
              )}
              style={{ color: isActive ? `var(--cyber-${item.color})` : "var(--text-base)" }}>
                {item.label}
              </span>

              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute -bottom-2 w-8 h-0.5 rounded-full"
                  style={{
                    background: `var(--cyber-${item.color})`,
                    boxShadow:  `0 0 8px var(--cyber-${item.color})`,
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

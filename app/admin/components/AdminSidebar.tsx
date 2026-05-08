"use client";
import { cn } from "@/lib/utils";

type Tab = "overview" | "users" | "analytics" | "revenue" | "content" | "uploads" | "payments" | "system";

interface Props {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TABS: Array<{ id: Tab; label: string; emoji: string; description?: string }> = [
  { id: "overview", label: "Overview", emoji: "📊" },
  { id: "users", label: "Users", emoji: "👥" },
  { id: "analytics", label: "Analytics", emoji: "📈" },
  { id: "revenue", label: "Revenue", emoji: "💰" },
  { id: "content", label: "Content", emoji: "📚" },
  { id: "uploads", label: "Uploads", emoji: "⬆️" },
  { id: "payments", label: "Payments", emoji: "💳" },
  { id: "system", label: "System", emoji: "⚙️" },
];

export function AdminSidebar({ activeTab, onTabChange }: Props) {
  return (
    <div
      className="w-64 h-full flex flex-col gap-4 p-4 border-r overflow-y-auto"
      style={{
        background: "var(--cyber-card-bg)",
        borderColor: "var(--cyber-border)",
      }}
    >
      <div>
        <h2 className="text-xl font-black mb-1">Legal Ninja</h2>
        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
          Admin Control Center
        </p>
      </div>

      <div className="space-y-1">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "w-full px-4 py-3 rounded-lg text-left font-semibold text-sm transition-all border flex items-center gap-3",
              activeTab === tab.id
                ? "border-cyber-cyan shadow-neon-cyan"
                : "border-cyber-border hover:border-cyber-cyan/30"
            )}
            style={
              activeTab === tab.id
                ? { color: "var(--cyber-cyan)" }
                : { color: "var(--text-muted)" }
            }
          >
            <span className="text-lg">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t" style={{ borderColor: "var(--cyber-border)" }}>
        <div
          className="p-3 rounded-lg text-xs space-y-1"
          style={{ background: "rgba(0, 245, 255, 0.05)" }}
        >
          <p className="font-black" style={{ color: "var(--cyber-cyan)" }}>
            🔒 Secured
          </p>
          <p style={{ color: "var(--text-muted)" }}>
            All access requires admin key authentication
          </p>
        </div>
      </div>
    </div>
  );
}

export type { Tab };

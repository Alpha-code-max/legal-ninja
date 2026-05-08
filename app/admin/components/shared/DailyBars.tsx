"use client";
import { cn } from "@/lib/utils";

interface DataPoint {
  date: string;
  count: number;
}

interface Props {
  data: DataPoint[];
  label: string;
  color: "cyan" | "green" | "purple" | "gold" | "red";
  height?: number;
  showLabels?: boolean;
}

export function DailyBars({ data, label, color, height = 120, showLabels = false }: Props) {
  if (!data.length) return <div className="text-xs text-gray-500">No data</div>;

  const max = Math.max(...data.map((d) => d.count), 1);
  const colorVars = {
    cyan: "var(--cyber-cyan)",
    green: "var(--cyber-green)",
    purple: "var(--cyber-purple)",
    gold: "var(--cyber-gold)",
    red: "var(--cyber-red)",
  };

  const colorClass = {
    cyan: "bg-cyber-cyan",
    green: "bg-cyber-green",
    purple: "bg-cyber-purple",
    gold: "bg-cyber-gold",
    red: "bg-cyber-red",
  };

  return (
    <div className="space-y-3">
      <p className="text-xs uppercase font-black tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      <div className="flex items-end justify-between gap-1" style={{ height: `${height}px` }}>
        {data.map((d, i) => {
          const barHeight = (d.count / max) * (height - 20);
          return (
            <div key={i} className="flex flex-col items-center flex-1 gap-1 group">
              <div
                className={cn(
                  "w-full rounded-t-sm transition-all duration-300 hover:opacity-80 relative cursor-pointer",
                  colorClass[color]
                )}
                style={{ height: `${Math.max(2, barHeight)}px` }}
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-black/80 text-white text-[10px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  {d.count}
                </div>
              </div>
              {showLabels && d.count > 0 && (
                <p className="text-[9px] font-mono" style={{ color: colorVars[color] }}>
                  {d.count}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

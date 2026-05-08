"use client";

interface Item {
  label: string;
  value: number;
  max: number;
  color?: string;
  suffix?: string;
}

interface Props {
  items: Item[];
  title?: string;
}

export function BarChart({ items, title }: Props) {
  return (
    <div className="space-y-4">
      {title && (
        <p className="text-xs uppercase font-black tracking-widest" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
      )}
      <div className="space-y-3">
        {items.map((item, i) => {
          const percentage = (item.value / item.max) * 100;
          const color = item.color || "var(--cyber-cyan)";
          return (
            <div key={i} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-xs">
                <p className="font-semibold" style={{ color: "var(--text-base)" }}>
                  {item.label}
                </p>
                <p className="font-mono" style={{ color }}>
                  {item.value}
                  {item.suffix}
                </p>
              </div>
              <div
                className="h-2 rounded-sm overflow-hidden"
                style={{ background: "var(--cyber-border)" }}
              >
                <div
                  className="h-full transition-all duration-700 rounded-sm"
                  style={{
                    width: `${percentage}%`,
                    background: color,
                    boxShadow: `0 0 8px color-mix(in srgb, ${color} 60%, transparent)`,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

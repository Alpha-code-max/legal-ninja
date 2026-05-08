"use client";

interface Props {
  page: number;
  pages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, pages, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={() => onPageChange(Math.max(1, page - 1))}
        disabled={page === 1}
        className="px-3 py-2 rounded-lg border font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: "var(--cyber-border)",
          color: "var(--text-base)",
        }}
      >
        ← Prev
      </button>

      <div className="flex items-center gap-1">
        {Array.from({ length: pages }, (_, i) => i + 1)
          .filter((p) => p === 1 || p === pages || Math.abs(p - page) <= 1)
          .map((p, i, arr) => (
            <div key={i}>
              {i > 0 && arr[i - 1] !== p - 1 && (
                <span className="px-2" style={{ color: "var(--text-muted)" }}>
                  …
                </span>
              )}
              <button
                onClick={() => onPageChange(p)}
                className={`px-3 py-2 rounded-lg font-semibold text-sm transition-all ${
                  p === page
                    ? "neon-border-cyan"
                    : "border hover:border-cyber-cyan/30"
                }`}
                style={
                  p === page
                    ? {
                        borderColor: "var(--cyber-cyan)",
                        color: "var(--cyber-cyan)",
                      }
                    : {
                        borderColor: "var(--cyber-border)",
                        color: "var(--text-muted)",
                      }
                }
              >
                {p}
              </button>
            </div>
          ))}
      </div>

      <button
        onClick={() => onPageChange(Math.min(pages, page + 1))}
        disabled={page === pages}
        className="px-3 py-2 rounded-lg border font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          borderColor: "var(--cyber-border)",
          color: "var(--text-base)",
        }}
      >
        Next →
      </button>
    </div>
  );
}

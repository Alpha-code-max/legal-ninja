"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";

interface Props {
  adminKey: string;
}

export function ContentTab({ adminKey }: Props) {
  const [activeTab, setActiveTab] = useState<"banks" | "pending">("banks");
  const [loading, setLoading] = useState(true);
  const [banks, setBanks] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [b, p] = await Promise.all([
          adminApi.getBankStats(adminKey),
          fetch(`/api/admin/questions/pending`, {
            headers: { "x-admin-key": adminKey },
          }).then((r) => r.json()),
        ]);
        setBanks(b);
        setPending(p);
      } catch (err) {
        console.error("Failed to load content:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey]);

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "var(--cyber-border)" }}>
        <button
          onClick={() => setActiveTab("banks")}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "banks"
              ? "border-cyber-cyan text-cyber-cyan"
              : "border-transparent text-text-muted"
          }`}
          style={activeTab === "banks" ? {} : { color: "var(--text-muted)" }}
        >
          Question Banks
        </button>
        <button
          onClick={() => setActiveTab("pending")}
          className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
            activeTab === "pending"
              ? "border-cyber-cyan text-cyber-cyan"
              : "border-transparent text-text-muted"
          }`}
          style={activeTab === "pending" ? {} : { color: "var(--text-muted)" }}
        >
          Pending Review ({pending.length})
        </button>
      </div>

      {/* Banks */}
      {activeTab === "banks" && (
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : banks.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No banks</div>
          ) : (
            banks.map((bank) => (
              <div
                key={bank.subject}
                className="cyber-card p-4 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-black">{bank.subject.replace(/_/g, " ")}</h4>
                  <span className="text-sm font-mono neon-text-cyan">{bank.total} Q</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Easy</p>
                    <p className="neon-text-green">{bank.by_difficulty?.easy ?? 0}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Medium</p>
                    <p className="neon-text-gold">{bank.by_difficulty?.medium ?? 0}</p>
                  </div>
                  <div>
                    <p style={{ color: "var(--text-muted)" }}>Hard</p>
                    <p className="neon-text-red">{bank.by_difficulty?.hard ?? 0}</p>
                  </div>
                </div>
                <div className="text-xs">
                  <p style={{ color: "var(--text-muted)" }}>Essays: <span className="neon-text-purple">{bank.essays ?? 0}</span></p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Pending Review */}
      {activeTab === "pending" && (
        <div className="space-y-3">
          {loading ? (
            <div style={{ color: "var(--text-muted)" }}>Loading...</div>
          ) : pending.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No pending questions</div>
          ) : (
            pending.slice(0, 20).map((q: any) => (
              <div
                key={q._id}
                className="cyber-card p-4 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-black">{q.question.substring(0, 80)}...</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {q.subject} • {q.type.toUpperCase()} • {q.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/questions/${q._id}/approve`, {
                        method: "PATCH",
                        headers: { "x-admin-key": adminKey },
                      });
                      setPending(pending.filter((qq) => qq._id !== q._id));
                    }}
                    className="px-2 py-1 text-xs rounded border font-bold"
                    style={{
                      borderColor: "var(--cyber-green)",
                      color: "var(--cyber-green)",
                    }}
                  >
                    ✓
                  </button>
                  <button
                    onClick={async () => {
                      await fetch(`/api/admin/questions/${q._id}/reject`, {
                        method: "PATCH",
                        headers: { "x-admin-key": adminKey },
                      });
                      setPending(pending.filter((qq) => qq._id !== q._id));
                    }}
                    className="px-2 py-1 text-xs rounded border font-bold"
                    style={{
                      borderColor: "var(--cyber-red)",
                      color: "var(--cyber-red)",
                    }}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

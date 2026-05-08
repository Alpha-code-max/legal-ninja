"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { NeonButton } from "@/components/ui/NeonButton";

interface Props {
  adminKey: string;
}

export function SystemTab({ adminKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [questionDebug, setQuestionDebug] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [s, qd] = await Promise.all([
          adminApi.getStats(adminKey),
          fetch("/api/admin/debug/questions", {
            headers: { "x-admin-key": adminKey },
          }).then((r) => r.json()),
        ]);
        setStats(s);
        setQuestionDebug(qd);
      } catch (err) {
        console.error("Failed to load system info:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)" }}>Loading system info...</div>;
  }

  return (
    <div className="space-y-6">
      {/* System Stats */}
      {stats && (
        <div className="cyber-card p-6 space-y-4">
          <h3 className="text-lg font-black">System Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Users</p>
              <p className="text-2xl font-black neon-text-cyan">{stats.total_users}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Sessions</p>
              <p className="text-2xl font-black neon-text-green">{stats.total_sessions}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Cached Questions</p>
              <p className="text-2xl font-black neon-text-purple">{stats.total_questions_cached}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>PDFs</p>
              <p className="text-2xl font-black neon-text-gold">{stats.total_pdfs}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>PDF Chunks</p>
              <p className="text-2xl font-black neon-text-cyan">{stats.total_pdf_chunks}</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Revenue</p>
              <p className="text-2xl font-black neon-text-green">₦{stats.total_revenue_ngn}</p>
            </div>
          </div>
        </div>
      )}

      {/* Question Debug */}
      {questionDebug && (
        <div className="cyber-card p-6 space-y-4">
          <h3 className="text-lg font-black">Question Bank Debug</h3>

          {/* Counts by Subject */}
          {questionDebug.counts && questionDebug.counts.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>Counts by Subject:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {questionDebug.counts.map((c: any) => (
                  <div
                    key={c._id}
                    className="p-2 rounded"
                    style={{ background: "rgba(0, 245, 255, 0.05)", border: "1px solid var(--cyber-border)" }}
                  >
                    <p>{c._id}</p>
                    <p className="neon-text-cyan font-mono">{c.count}Q</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sample */}
          {questionDebug.sample && (
            <div className="space-y-2 p-3 rounded" style={{ background: "var(--cyber-bg)" }}>
              <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>Sample Question:</p>
              <p className="text-xs font-mono">{questionDebug.sample.subject}</p>
              <p className="text-xs mt-2">{questionDebug.sample.question.substring(0, 150)}...</p>
            </div>
          )}
        </div>
      )}

      {/* API Info */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">API Information</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span style={{ color: "var(--text-muted)" }}>API Base:</span>{" "}
            <span className="font-mono">{process.env.NEXT_PUBLIC_API_URL}</span>
          </p>
          <p style={{ color: "var(--text-muted)" }} className="text-xs">
            All admin endpoints require x-admin-key header authentication.
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">Admin Actions</h3>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Access additional admin tools through the other tabs or the API directly.
        </p>
        <div className="grid gap-2">
          <NeonButton
            variant="cyan"
            fullWidth
            onClick={() => {
              fetch("/api/admin/stats", {
                headers: { "x-admin-key": adminKey },
              })
                .then((r) => r.json())
                .then((d) => console.log("Stats:", d));
            }}
          >
            Refresh Stats
          </NeonButton>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { BarChart } from "../shared/BarChart";

interface Props {
  adminKey: string;
}

export function AnalyticsTab({ adminKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [sessions, setSessions] = useState<any>(null);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [sess, subj] = await Promise.all([
          adminApi.getSessionAnalytics(adminKey, days),
          adminApi.getSubjectAnalytics(adminKey),
        ]);
        setSessions(sess);
        setSubjects(subj);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey, days]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)" }}>Loading analytics...</div>;
  }

  if (!sessions) {
    return <div style={{ color: "var(--text-muted)" }}>Failed to load analytics</div>;
  }

  return (
    <div className="space-y-6">
      {/* Days Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((d) => (
          <button
            key={d}
            onClick={() => setDays(d)}
            className={`px-4 py-2 rounded-lg border font-semibold text-sm transition-all ${
              days === d ? "neon-border-cyan" : "border-cyber-border hover:border-cyber-cyan/30"
            }`}
            style={
              days === d
                ? { color: "var(--cyber-cyan)" }
                : { color: "var(--text-muted)" }
            }
          >
            {d}d
          </button>
        ))}
      </div>

      {/* Session Summary */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">Session Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total</p>
            <p className="text-2xl font-black neon-text-cyan">{sessions.summary.total}</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Avg Score</p>
            <p className="text-2xl font-black neon-text-green">{sessions.summary.avg_percentage.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>Avg XP</p>
            <p className="text-2xl font-black neon-text-purple">{sessions.summary.avg_xp.toFixed(0)}</p>
          </div>
        </div>
      </div>

      {/* By Mode */}
      {sessions.by_mode.length > 0 && (
        <div className="cyber-card p-6">
          <BarChart
            title="Sessions by Mode"
            items={sessions.by_mode.map((m: any) => ({
              label: m._id || "Unknown",
              value: m.count,
              max: Math.max(...sessions.by_mode.map((x: any) => x.count)),
              color: "var(--cyber-cyan)",
              suffix: " sessions",
            }))}
          />
        </div>
      )}

      {/* By Subject */}
      {sessions.by_subject.length > 0 && (
        <div className="cyber-card p-6">
          <BarChart
            title="Sessions by Subject"
            items={sessions.by_subject.map((s: any) => ({
              label: s._id || "Unknown",
              value: s.count,
              max: Math.max(...sessions.by_subject.map((x: any) => x.count)),
              color: "var(--cyber-green)",
              suffix: "",
            }))}
          />
        </div>
      )}

      {/* By Difficulty */}
      {sessions.by_difficulty.length > 0 && (
        <div className="cyber-card p-6">
          <BarChart
            title="Sessions by Difficulty"
            items={sessions.by_difficulty.map((d: any) => ({
              label: d._id || "Unknown",
              value: d.count,
              max: Math.max(...sessions.by_difficulty.map((x: any) => x.count)),
              color: "var(--cyber-purple)",
              suffix: "",
            }))}
          />
        </div>
      )}

      {/* Subjects Performance Table */}
      {subjects.length > 0 && (
        <div className="cyber-card p-6 space-y-4">
          <h3 className="text-lg font-black">Subject Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ borderBottom: "1px solid var(--cyber-border)" }}>
                  <th className="px-3 py-2 text-left font-black" style={{ color: "var(--text-muted)" }}>Subject</th>
                  <th className="px-3 py-2 text-center font-black" style={{ color: "var(--text-muted)" }}>Sessions</th>
                  <th className="px-3 py-2 text-center font-black" style={{ color: "var(--text-muted)" }}>Avg Accuracy</th>
                  <th className="px-3 py-2 text-center font-black" style={{ color: "var(--text-muted)" }}>Questions</th>
                  <th className="px-3 py-2 text-center font-black" style={{ color: "var(--text-muted)" }}>Approved</th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s, i) => (
                  <tr
                    key={s.subject}
                    style={{ borderBottom: i < subjects.length - 1 ? "1px solid var(--cyber-border)" : "none" }}
                  >
                    <td className="px-3 py-2">{s.subject.replace(/_/g, " ")}</td>
                    <td className="px-3 py-2 text-center neon-text-cyan">{s.sessions}</td>
                    <td className="px-3 py-2 text-center neon-text-green">{s.avg_accuracy.toFixed(1)}%</td>
                    <td className="px-3 py-2 text-center" style={{ color: "var(--cyber-purple)" }}>{s.total_questions}</td>
                    <td className="px-3 py-2 text-center" style={{ color: "var(--cyber-gold)" }}>{s.approved}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

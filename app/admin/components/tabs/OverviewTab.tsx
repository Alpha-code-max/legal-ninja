"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { KpiCard } from "../shared/KpiCard";
import { DailyBars } from "../shared/DailyBars";
import { formatNGN } from "@/lib/utils";

interface Props {
  adminKey: string;
}

export function OverviewTab({ adminKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [growth, setGrowth] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [ov, gr] = await Promise.all([
          adminApi.getOverviewAnalytics(adminKey),
          adminApi.getUserGrowth(adminKey, 30),
        ]);
        setOverview(ov);
        setGrowth(gr);
      } catch (err) {
        console.error("Failed to load overview:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)" }}>Loading...</div>;
  }

  if (!overview) {
    return <div style={{ color: "var(--text-muted)" }}>Failed to load overview</div>;
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Daily Active Users" value={overview.dau} color="cyan" />
        <KpiCard label="Monthly Active Users" value={overview.mau} color="green" />
        <KpiCard label="Avg Score (30d)" value={`${overview.avg_score_last_30d.toFixed(1)}%`} color="purple" />
        <KpiCard label="Sessions (24h)" value={overview.sessions_last_24h} color="gold" />
        <KpiCard label="Sessions (7d)" value={overview.sessions_last_7d} color="gold" />
        <KpiCard label="New Users (Month)" value={overview.new_users_month} color="green" />
      </div>

      {/* Growth Chart */}
      <div
        className="cyber-card p-6 space-y-4"
        style={{ minHeight: "300px" }}
      >
        <h3 className="text-lg font-black">User Registration Trend</h3>
        {growth.length > 0 ? (
          <DailyBars data={growth} label="Daily Registrations" color="cyan" height={200} />
        ) : (
          <div style={{ color: "var(--text-muted)" }}>No data</div>
        )}
      </div>
    </div>
  );
}

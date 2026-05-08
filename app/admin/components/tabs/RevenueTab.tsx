"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { DailyBars } from "../shared/DailyBars";
import { BarChart } from "../shared/BarChart";
import { formatNGN } from "@/lib/utils";

interface Props {
  adminKey: string;
}

export function RevenueTab({ adminKey }: Props) {
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);
  const [revenue, setRevenue] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const rev = await adminApi.getRevenueAnalytics(adminKey, days);
        setRevenue(rev);
      } catch (err) {
        console.error("Failed to load revenue analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey, days]);

  if (loading) {
    return <div style={{ color: "var(--text-muted)" }}>Loading revenue data...</div>;
  }

  if (!revenue) {
    return <div style={{ color: "var(--text-muted)" }}>Failed to load revenue data</div>;
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

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="cyber-card p-4 space-y-1">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Total Revenue</p>
          <p className="text-2xl font-black neon-text-cyan">
            {formatNGN(revenue.summary.total)}
          </p>
        </div>
        <div className="cyber-card p-4 space-y-1">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Transactions</p>
          <p className="text-2xl font-black neon-text-green">{revenue.summary.count}</p>
        </div>
        <div className="cyber-card p-4 space-y-1">
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Avg Transaction</p>
          <p className="text-2xl font-black neon-text-purple">
            {formatNGN(revenue.summary.avg_txn)}
          </p>
        </div>
      </div>

      {/* Daily Revenue Chart */}
      <div className="cyber-card p-6" style={{ minHeight: "300px" }}>
        <DailyBars
          data={revenue.daily.map((d: any) => ({ date: d.date, count: d.revenue }))}
          label="Daily Revenue (₦)"
          color="gold"
          height={200}
        />
      </div>

      {/* By Type Breakdown */}
      {revenue.by_type.length > 0 && (
        <div className="cyber-card p-6">
          <BarChart
            title="Revenue by Type"
            items={revenue.by_type.map((t: any) => ({
              label: t._id === "bundle" ? "Bundles" : `${t._id} Pass`,
              value: t.total_revenue,
              max: Math.max(...revenue.by_type.map((x: any) => x.total_revenue)),
              color: "var(--cyber-gold)",
              suffix: "",
            }))}
          />
        </div>
      )}

      {/* Transactions Table */}
      <div className="cyber-card p-6 space-y-4">
        <h3 className="text-lg font-black">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: "1px solid var(--cyber-border)" }}>
                <th className="px-3 py-2 text-left font-black" style={{ color: "var(--text-muted)" }}>Date</th>
                <th className="px-3 py-2 text-right font-black" style={{ color: "var(--text-muted)" }}>Amount</th>
                <th className="px-3 py-2 text-center font-black" style={{ color: "var(--text-muted)" }}>Questions</th>
              </tr>
            </thead>
            <tbody>
              {revenue.daily.slice(-10).reverse().map((d: any, i: number) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: "1px solid var(--cyber-border)",
                  }}
                >
                  <td className="px-3 py-2">{d.date}</td>
                  <td className="px-3 py-2 text-right font-mono neon-text-gold">
                    {formatNGN(d.revenue)}
                  </td>
                  <td className="px-3 py-2 text-center neon-text-green">{d.questions_added}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

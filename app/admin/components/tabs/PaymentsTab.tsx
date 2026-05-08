"use client";
import { useState, useEffect } from "react";
import { adminApi } from "@/lib/api/admin";
import { NeonButton } from "@/components/ui/NeonButton";
import { formatNGN } from "@/lib/utils";

interface Props {
  adminKey: string;
}

export function PaymentsTab({ adminKey }: Props) {
  const [activeTab, setActiveTab] = useState<"status" | "pending" | "failed">("status");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [failed, setFailed] = useState<any[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [st, pend, fail] = await Promise.all([
          adminApi.getPaymentStatus(adminKey),
          adminApi.getPendingPayments(adminKey),
          adminApi.getFailedPayments(adminKey),
        ]);
        setStatus(st);
        setPending(pend);
        setFailed(fail);
      } catch (err) {
        console.error("Failed to load payment data:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [adminKey]);

  const handleRecovery = async () => {
    setProcessing("recovery");
    try {
      await adminApi.triggerPaymentRecovery(adminKey);
      // Reload data
      const [st, pend] = await Promise.all([
        adminApi.getPaymentStatus(adminKey),
        adminApi.getPendingPayments(adminKey),
      ]);
      setStatus(st);
      setPending(pend);
    } catch (err) {
      console.error("Recovery failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  const handleProcessPayment = async (reference: string) => {
    setProcessing(reference);
    try {
      await adminApi.processPayment(adminKey, reference);
      const [pend, fail] = await Promise.all([
        adminApi.getPendingPayments(adminKey),
        adminApi.getFailedPayments(adminKey),
      ]);
      setPending(pend);
      setFailed(fail);
    } catch (err) {
      console.error("Processing failed:", err);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "var(--cyber-border)" }}>
        {[
          { id: "status", label: "Status" },
          { id: "pending", label: `Pending (${pending.length})` },
          { id: "failed", label: `Failed (${failed.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 font-bold text-sm transition-colors border-b-2 ${
              activeTab === tab.id
                ? "border-cyber-cyan text-cyber-cyan"
                : "border-transparent"
            }`}
            style={activeTab !== tab.id ? { color: "var(--text-muted)" } : {}}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ color: "var(--text-muted)" }}>Loading...</div>
      ) : activeTab === "status" ? (
        <div className="space-y-4">
          {status && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="cyber-card p-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Status</p>
                <p
                  className="text-lg font-black mt-1"
                  style={{
                    color:
                      status.status === "healthy"
                        ? "var(--cyber-green)"
                        : "var(--cyber-red)",
                  }}
                >
                  {status.status === "healthy" ? "✓ Healthy" : "⚠ Has Issues"}
                </p>
              </div>
              <div className="cyber-card p-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Pending</p>
                <p className="text-lg font-black mt-1 neon-text-yellow">{status.pending}</p>
              </div>
              <div className="cyber-card p-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Success</p>
                <p className="text-lg font-black mt-1 neon-text-green">{status.success}</p>
              </div>
              <div className="cyber-card p-4">
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Failed</p>
                <p className="text-lg font-black mt-1 neon-text-red">{status.failed}</p>
              </div>
            </div>
          )}

          <NeonButton
            variant="cyan"
            fullWidth
            onClick={handleRecovery}
            disabled={processing === "recovery"}
          >
            {processing === "recovery" ? "Processing..." : "Trigger Payment Recovery"}
          </NeonButton>
        </div>
      ) : activeTab === "pending" ? (
        <div className="space-y-3">
          {pending.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No pending payments</div>
          ) : (
            pending.map((p) => (
              <div
                key={p.id}
                className="cyber-card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{p.user_email}</p>
                  <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                    {formatNGN(p.amount_ngn)} • {p.pending_mins}m pending
                  </p>
                </div>
                <NeonButton
                  variant="green"
                  size="sm"
                  onClick={() => handleProcessPayment(p.reference)}
                  disabled={processing === p.reference}
                >
                  {processing === p.reference ? "..." : "Process"}
                </NeonButton>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {failed.length === 0 ? (
            <div style={{ color: "var(--text-muted)" }}>No failed payments</div>
          ) : (
            failed.map((f) => (
              <div
                key={f.id}
                className="cyber-card p-4"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{f.user_email}</p>
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {formatNGN(f.amount_ngn)}
                    </p>
                  </div>
                </div>
                {f.error_message && (
                  <p
                    className="text-xs mt-2"
                    style={{ color: "var(--cyber-red)" }}
                  >
                    {f.error_message}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

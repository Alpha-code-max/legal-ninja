"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminApi } from "@/lib/api/admin";
import { NeonButton } from "@/components/ui/NeonButton";
import { AdminSidebar, type Tab } from "./components/AdminSidebar";
import { OverviewTab } from "./components/tabs/OverviewTab";
import { UsersTab } from "./components/tabs/UsersTab";
import { AnalyticsTab } from "./components/tabs/AnalyticsTab";
import { RevenueTab } from "./components/tabs/RevenueTab";
import { ContentTab } from "./components/tabs/ContentTab";
import { UploadsTab } from "./components/tabs/UploadsTab";
import { PaymentsTab } from "./components/tabs/PaymentsTab";
import { SystemTab } from "./components/tabs/SystemTab";

export default function AdminPage() {
  const router = useRouter();
  const [adminKey, setAdminKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const handleLogin = async () => {
    setAuthError("");
    try {
      await adminApi.getStats(adminKey);
      setAuthed(true);
      localStorage.setItem("adminKey", adminKey);
    } catch {
      setAuthError("Invalid admin key");
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("adminKey");
    if (saved) {
      setAdminKey(saved);
      adminApi.getStats(saved).then(() => setAuthed(true)).catch(() => setAuthed(false));
    }
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div
          className="w-full max-w-md rounded-2xl p-8 space-y-6"
          style={{ background: "var(--cyber-surface)", border: "1px solid var(--cyber-border)" }}
        >
          <div className="text-center">
            <h1 className="text-2xl font-black mb-2">Legal Ninja Admin</h1>
            <p style={{ color: "var(--text-muted)" }}>Enter your admin key to continue</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              placeholder="Admin key"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              className="w-full p-3 rounded-lg border"
              style={{
                borderColor: "var(--cyber-border)",
                background: "var(--cyber-bg)",
                color: "var(--text-base)",
              }}
            />
            {authError && <p className="text-sm text-cyber-red">{authError}</p>}
            <NeonButton variant="cyan" fullWidth onClick={handleLogin}>
              Unlock Admin Panel
            </NeonButton>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-cyber-bg">
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{
            background: "var(--cyber-card-bg)",
            borderColor: "var(--cyber-border)",
          }}
        >
          <h2 className="text-lg font-black">Dashboard</h2>
          <button
            onClick={() => {
              localStorage.removeItem("adminKey");
              setAuthed(false);
              setAdminKey("");
            }}
            className="text-sm font-bold px-3 py-2 rounded-lg border transition-colors"
            style={{
              borderColor: "var(--cyber-border)",
              color: "var(--text-muted)",
            }}
          >
            Logout
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === "overview" && <OverviewTab adminKey={adminKey} />}
          {activeTab === "users" && <UsersTab adminKey={adminKey} />}
          {activeTab === "analytics" && <AnalyticsTab adminKey={adminKey} />}
          {activeTab === "revenue" && <RevenueTab adminKey={adminKey} />}
          {activeTab === "content" && <ContentTab adminKey={adminKey} />}
          {activeTab === "uploads" && <UploadsTab adminKey={adminKey} />}
          {activeTab === "payments" && <PaymentsTab adminKey={adminKey} />}
          {activeTab === "system" && <SystemTab adminKey={adminKey} />}
        </div>
      </div>
    </div>
  );
}

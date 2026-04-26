"use client";
import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";
import { NeonButton } from "@/components/ui/NeonButton";

function ResetPasswordContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [done, setDone]           = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (!token) { setError("Invalid reset link. Request a new one."); return; }
    setError(null);
    setLoading(true);
    try {
      await api.resetPassword({ token, password });
      setDone(true);
      setTimeout(() => router.push("/auth/sign-in"), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="cyber-card p-8 w-full max-w-md space-y-6"
      >
        <div className="text-center space-y-1">
          <div className="text-4xl">🔑</div>
          <h1 className="text-2xl font-black" style={{ color: "var(--cyber-purple)" }}>New Password</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Choose a strong password for your account.
          </p>
        </div>

        {done ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-xl p-5 text-center"
            style={{ background: "color-mix(in srgb, var(--cyber-green) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-green) 30%, transparent)" }}
          >
            <div className="text-3xl mb-2">✅</div>
            <p className="font-black text-sm" style={{ color: "var(--cyber-green)" }}>Password reset!</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Redirecting to sign in...</p>
          </motion.div>
        ) : (
          <>
            {!token && (
              <div className="rounded-xl p-3 text-sm text-center"
                   style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
                Invalid or missing reset token.{" "}
                <button onClick={() => router.push("/auth/forgot-password")} className="underline">
                  Request a new link.
                </button>
              </div>
            )}

            {error && (
              <div className="rounded-xl p-3 text-sm text-center"
                   style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label: "New Password",     value: password, onChange: setPassword, autoComplete: "new-password" },
                { label: "Confirm Password", value: confirm,  onChange: setConfirm,  autoComplete: "new-password" },
              ].map(({ label, value, onChange, autoComplete }) => (
                <div key={label} className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    {label}
                  </label>
                  <input
                    type="password"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Min 8 characters"
                    autoComplete={autoComplete}
                    className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border outline-none transition-all"
                    style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--cyber-purple)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--cyber-border)")}
                  />
                </div>
              ))}
              <NeonButton variant="purple" fullWidth size="lg" type="submit" disabled={loading || !token}>
                {loading ? "Resetting..." : "🔑 Reset Password"}
              </NeonButton>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center neon-text-purple font-black animate-pulse">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}

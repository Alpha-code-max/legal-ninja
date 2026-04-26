"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";
import { NeonButton } from "@/components/ui/NeonButton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail]   = useState("");
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
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
          <div className="text-4xl">🔐</div>
          <h1 className="text-2xl font-black" style={{ color: "var(--cyber-purple)" }}>Forgot Password</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Enter your email and we'll send a reset link.
          </p>
        </div>

        {sent ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-xl p-5 text-center space-y-2"
            style={{ background: "color-mix(in srgb, var(--cyber-green) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-green) 30%, transparent)" }}
          >
            <div className="text-3xl">📧</div>
            <p className="font-black text-sm" style={{ color: "var(--cyber-green)" }}>
              Check your inbox!
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              If an account exists for <span className="font-bold" style={{ color: "var(--text-base)" }}>{email}</span>, a reset link has been sent. It expires in 1 hour.
            </p>
            <NeonButton variant="ghost" size="sm" onClick={() => router.push("/auth/sign-in")}>
              Back to Sign In
            </NeonButton>
          </motion.div>
        ) : (
          <>
            {error && (
              <div className="rounded-xl p-3 text-sm text-center"
                   style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@lawschool.edu"
                  className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border outline-none transition-all"
                  style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--cyber-purple)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--cyber-border)")}
                />
              </div>
              <NeonButton variant="purple" fullWidth size="lg" type="submit" disabled={loading}>
                {loading ? "Sending..." : "📧 Send Reset Link"}
              </NeonButton>
            </form>

            <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
              Remembered it?{" "}
              <button
                onClick={() => router.push("/auth/sign-in")}
                className="font-bold hover:opacity-80"
                style={{ color: "var(--cyber-cyan)" }}
              >
                Sign In
              </button>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}

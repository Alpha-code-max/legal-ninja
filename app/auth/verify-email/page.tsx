"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api/client";
import { NeonButton } from "@/components/ui/NeonButton";

function VerifyEmailContent() {
  const router = useRouter();
  const params  = useSearchParams();
  const token   = params.get("token") ?? "";
  const pending = params.get("pending") === "true";
  const email   = params.get("email") ?? "";

  const [status, setStatus]     = useState<"idle" | "loading" | "success" | "error">(token ? "loading" : "idle");
  const [resent, setResent]     = useState(false);
  const [resending, setResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!token) return;
    api.verifyEmail(token)
      .then(() => setStatus("success"))
      .catch((err) => {
        setErrorMsg(err instanceof Error ? err.message : "Verification failed");
        setStatus("error");
      });
  }, [token]);

  const handleResend = async () => {
    if (!email || resending) return;
    setResending(true);
    try {
      await api.resendVerification(email);
      setResent(true);
    } catch { /* silent */ } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="cyber-card p-8 w-full max-w-md text-center space-y-6"
      >
        {/* Loading */}
        {status === "loading" && (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="text-5xl mx-auto"
            >⚖️</motion.div>
            <p className="font-black text-lg neon-text-cyan">Verifying your email...</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }} className="text-5xl">✅</motion.div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black" style={{ color: "var(--cyber-green)" }}>Email Verified!</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Your account is fully activated. Welcome to the dojo!
              </p>
            </div>
            <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/dashboard")}>
              ⚔️ Enter the Dojo
            </NeonButton>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="text-5xl">❌</div>
            <div className="space-y-1">
              <h1 className="text-2xl font-black" style={{ color: "var(--cyber-red)" }}>Link Expired</h1>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                {errorMsg || "This verification link is invalid or has expired."}
              </p>
            </div>
            {email && (
              <NeonButton variant="purple" fullWidth onClick={handleResend} disabled={resending || resent}>
                {resent ? "✅ New link sent!" : resending ? "Sending..." : "📧 Resend Verification"}
              </NeonButton>
            )}
            <NeonButton variant="ghost" fullWidth onClick={() => router.push("/dashboard")}>
              Continue Anyway
            </NeonButton>
          </>
        )}

        {/* Pending (after registration — no token yet) */}
        {status === "idle" && pending && (
          <>
            <div className="text-5xl">📧</div>
            <div className="space-y-2">
              <h1 className="text-2xl font-black" style={{ color: "var(--cyber-cyan)" }}>Check Your Email</h1>
              {email && (
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  We sent a verification link to{" "}
                  <span className="font-bold" style={{ color: "var(--text-base)" }}>{email}</span>.
                  Click it to unlock all features.
                </p>
              )}
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                You can still play while unverified — some features require a verified email.
              </p>
            </div>
            <div className="space-y-3">
              {resent ? (
                <p className="text-sm font-bold" style={{ color: "var(--cyber-green)" }}>✅ New link sent!</p>
              ) : (
                <NeonButton variant="ghost" fullWidth onClick={handleResend} disabled={resending || !email}>
                  {resending ? "Sending..." : "📧 Resend Link"}
                </NeonButton>
              )}
              <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/dashboard")}>
                ⚔️ Continue to Dashboard
              </NeonButton>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center neon-text-cyan font-black animate-pulse">Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}

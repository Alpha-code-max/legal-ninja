"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { api, setToken } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/user-store";
import { useGuestStore } from "@/lib/store/guest-store";
import { NeonButton } from "@/components/ui/NeonButton";

export default function SignInPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setGuest = useGuestStore((s) => s.setGuest);

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.login({ email, password });
      setToken(token);
      const u = user as Record<string, unknown>;
      setUser({
        uid:                      String(u._id ?? u.uid ?? ""),
        username:                 String(u.username ?? ""),
        avatar_url:               String(u.avatar_url ?? ""),
        xp:                       Number(u.xp ?? 0),
        level:                    Number(u.level ?? 1),
        current_streak:           Number(u.current_streak ?? 0),
        longest_streak:           Number(u.longest_streak ?? 0),
        badges:                   (u.badges as string[]) ?? [],
        country:                  String(u.country ?? "NG"),
        role:                     String(u.role ?? "law_student"),
        total_questions_answered: Number(u.total_questions_answered ?? 0),
        total_correct_answers:    Number(u.total_correct_answers ?? 0),
        free_questions_remaining: Number(u.free_questions_remaining ?? 100),
        paid_questions_balance:   Number(u.paid_questions_balance ?? 0),
        earned_questions_balance: Number(u.earned_questions_balance ?? 0),
        active_passes:            (u.active_passes as []) ?? [],
        weak_areas:               (u.weak_areas as string[]) ?? [],
        referral_count:           Number(u.referral_count ?? 0),
        recent_answers:           (u.recent_answers as boolean[]) ?? [],
      });
      setGuest(false);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-6 sm:py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
        className="cyber-card p-6 sm:p-8 w-full max-w-md space-y-4 sm:space-y-6"
      >
        {/* Logo */}
        <div className="text-center space-y-1">
          <div className="relative w-16 h-16 mx-auto mb-2">
            <Image
              src="/logo.png.png"
              alt="Legal Ninja Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-2xl font-black gradient-text">Sign In</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Back in the dojo, ninja.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl p-3 text-sm"
               style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
            <div className="font-bold mb-1">⚠️ {error.includes("Validation") ? "Validation Error" : "Sign In Failed"}</div>
            <div className="whitespace-pre-wrap text-left text-xs">
              {error.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@lawschool.edu"
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border outline-none transition-all"
              style={{
                borderColor: "var(--cyber-border)",
                color: "var(--text-base)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--cyber-cyan)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--cyber-border)")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Password
            </label>
            <input
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border outline-none transition-all"
              style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--cyber-cyan)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--cyber-border)")}
            />
          </div>

          <div className="text-right">
            <button
              type="button"
              onClick={() => router.push("/auth/forgot-password")}
              className="text-xs font-semibold transition-colors hover:opacity-80"
              style={{ color: "var(--cyber-cyan)" }}
            >
              Forgot password?
            </button>
          </div>

          <NeonButton variant="cyan" fullWidth size="lg" type="submit" disabled={loading}>
            {loading ? "Signing in..." : "⚔️ Sign In"}
          </NeonButton>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: "var(--cyber-border)" }} />
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "var(--cyber-border)" }} />
        </div>

        {/* OAuth placeholders */}
        <div className="space-y-3">
          <button
            disabled
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border text-sm font-semibold opacity-40 cursor-not-allowed"
            style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google <span className="text-[9px] ml-1" style={{ color: "var(--text-muted)" }}>(coming soon)</span>
          </button>
        </div>

        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          No account yet?{" "}
          <button
            onClick={() => router.push("/auth/sign-up")}
            className="font-bold hover:opacity-80 transition-colors"
            style={{ color: "var(--cyber-cyan)" }}
          >
            Sign Up Free
          </button>
        </p>
      </motion.div>
    </div>
  );
}

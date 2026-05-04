"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { api, setToken } from "@/lib/api/client";
import { useUserStore } from "@/lib/store/user-store";
import { useGuestStore } from "@/lib/store/guest-store";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

const TRACKS = [
  { id: "law_school_track",   label: "Law School",  emoji: "⚖️",  desc: "Bar Finals · LPA · BL" },
  { id: "undergraduate_track", label: "Undergrad",  emoji: "🎓",  desc: "LL.B · University" },
] as const;

const ROLES = [
  { id: "law_student",  label: "📖 Law Student",  desc: "All subjects",       color: "green" },
  { id: "bar_student",  label: "🎓 Bar Student",  desc: "Bar exam focused",   color: "gold" },
] as const;

export default function SignUpPage() {
  const router = useRouter();
  const setUser = useUserStore((s) => s.setUser);
  const setGuest = useGuestStore((s) => s.setGuest);

  const [username, setUsername]   = useState("");
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [track, setTrack]         = useState<"law_school_track" | "undergraduate_track">("law_school_track");
  const [role, setRole]           = useState<"law_student" | "bar_student">("law_student");
  const [referral, setReferral]   = useState("");
  const [error, setError]         = useState<string | null>(null);
  const [loading, setLoading]     = useState(false);
  const [success, setSuccess]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { token, user } = await api.register({
        username, email, password, track, role,
        ...(referral.trim() ? { referral_code: referral.trim().toUpperCase() } : {}),
      });
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
        track:                    String(u.track ?? track),
        role:                     String(u.role ?? role),
        university:               String(u.university ?? ""),
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
      setSuccess(true);
      // Redirect to verify-email notice; they can still use the app but email verification is pending
      setTimeout(() => router.push("/auth/verify-email?pending=true&email=" + encodeURIComponent(email)), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          <h1 className="text-2xl font-black gradient-text">Join Legal Ninja</h1>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            100 free questions. No credit card.
          </p>
        </div>

        {error && (
          <div className="rounded-xl p-3 text-sm"
               style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
            <div className="font-bold mb-1">⚠️ Validation Error</div>
            <div className="whitespace-pre-wrap text-left text-xs">
              {error.split("\n").map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          </div>
        )}

        {success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="rounded-xl p-4 text-center"
            style={{ color: "var(--cyber-green)", background: "color-mix(in srgb, var(--cyber-green) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-green) 30%, transparent)" }}
          >
            <div className="text-2xl mb-1">✅</div>
            <p className="font-black">Account created!</p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>Redirecting...</p>
          </motion.div>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Track selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Your Track
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TRACKS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      track === t.id
                        ? "border-cyber-cyan bg-cyber-cyan/10 shadow-neon-cyan"
                        : "border-cyber-border hover:border-cyber-cyan/40"
                    )}
                  >
                    <div className="text-xl mb-1">{t.emoji}</div>
                    <p className="text-xs font-black" style={{ color: track === t.id ? "var(--cyber-cyan)" : "var(--text-base)" }}>{t.label}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Role selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Student Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRole(r.id as typeof role)}
                    className={cn(
                      "p-3 rounded-xl border text-left transition-all",
                      role === r.id
                        ? `border-cyber-${r.color} bg-cyber-${r.color}/10 shadow-neon-${r.color}`
                        : "border-cyber-border hover:border-cyber-cyan/40"
                    )}
                  >
                    <p className="text-xs font-black" style={{ color: role === r.id ? `var(--cyber-${r.color})` : "var(--text-base)" }}>{r.label}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>{r.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Username */}
            <InputField label="Username" type="text" value={username} onChange={setUsername}
              placeholder="legalwarrior99" autoComplete="username"
              hint="3-30 characters. Letters, numbers, underscores only. No spaces or special chars." />

            {/* Email */}
            <InputField label="Email" type="email" value={email} onChange={setEmail}
              placeholder="you@lawschool.edu" autoComplete="email" />

            {/* Password */}
            <InputField label="Password" type="password" value={password} onChange={setPassword}
              placeholder="Min 8 characters" autoComplete="new-password"
              hint="Minimum 8 characters (max 72). Mix of uppercase, lowercase, numbers for security." />

            {/* Referral code */}
            <InputField label="Referral Code (optional)" type="text" value={referral} onChange={setReferral}
              placeholder="NINJA123" />

            <NeonButton variant="cyan" fullWidth size="lg" type="submit" disabled={loading}>
              {loading ? "Creating account..." : "🥷 Create Free Account"}
            </NeonButton>
          </form>
        )}

        <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>
          Already have an account?{" "}
          <button
            onClick={() => router.push("/auth/sign-in")}
            className="font-bold hover:opacity-80 transition-colors"
            style={{ color: "var(--cyber-cyan)" }}
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}

function InputField({
  label, type, value, onChange, placeholder, autoComplete, hint,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  autoComplete?: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={!label.includes("optional")}
        className="w-full px-4 py-3 rounded-xl text-sm bg-transparent border outline-none transition-all"
        style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
        onFocus={(e) => (e.target.style.borderColor = "var(--cyber-cyan)")}
        onBlur={(e) => (e.target.style.borderColor = "var(--cyber-border)")}
      />
      {hint && <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>{hint}</p>}
    </div>
  );
}

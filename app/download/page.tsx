"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { NeonButton } from "@/components/ui/NeonButton";
import { GlassCard } from "@/components/ui/GlassCard";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

const FEATURES = [
  { icon: "⚔️", title: "Competitive Duels", desc: "Challenge other law students in real-time quiz battles." },
  { icon: "📈", title: "7 Rank Levels", desc: "Rise from 1L Rookie all the way to Supreme Sensei." },
  { icon: "🏆", title: "Leaderboard", desc: "Compete nationally. See where you rank among all ninjas." },
  { icon: "🎯", title: "Dual Tracks", desc: "Law School (Bar Finals) and Undergraduate (LL.B) tracks." },
  { icon: "🔥", title: "Daily Streaks", desc: "Maintain streaks to earn free questions and bonus XP." },
  { icon: "🤖", title: "AI Questions", desc: "Questions generated and curated by advanced AI models." },
];

const SCREENSHOTS = [
  { label: "Dashboard", color: "var(--cyber-cyan)" },
  { label: "Quiz Duel", color: "var(--cyber-purple)" },
  { label: "Leaderboard", color: "var(--cyber-gold)" },
];

export default function DownloadPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [notified, setNotified] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleNotify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 900));
    setNotified(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center relative overflow-hidden px-4 py-16 pb-28">

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Background orbs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
           style={{ background: "var(--orb-a)" }} />
      <div className="absolute bottom-1/3 -right-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
           style={{ background: "var(--orb-b)" }} />

      {/* Rotating rings */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        className="absolute top-16 right-1/4 w-64 h-64 rounded-full border border-cyber-cyan/10 pointer-events-none"
        style={{ borderStyle: "dashed" }}
      />

      {/* HUD corners */}
      <div className="fixed top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed top-6 right-16 w-10 h-10 border-t-2 border-r-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-cyber-cyan/20 pointer-events-none" />

      <div className="w-full max-w-2xl space-y-10">

        {/* Back link */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push("/")}
          className="text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <span>←</span> Back to Home
        </motion.button>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          {/* Phone icon */}
          <div className="flex justify-center">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border"
              style={{
                borderColor: "var(--cyber-cyan)",
                background: "rgba(0,245,255,0.07)",
                boxShadow: "0 0 30px rgba(0,245,255,0.2)",
              }}
            >
              📱
            </div>
          </div>

          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] mb-2" style={{ color: "var(--cyber-cyan)" }}>
              Mobile App — Early Access
            </p>
            <h1 className="text-4xl md:text-5xl font-black gradient-text tracking-tight uppercase">
              Legal Ninja
            </h1>
            <p className="text-lg font-bold uppercase tracking-widest mt-1" style={{ color: "var(--cyber-purple)" }}>
              On Your Phone
            </p>
          </div>

          <p className="text-sm leading-relaxed max-w-md mx-auto" style={{ color: "var(--text-muted)" }}>
            Take your legal battles anywhere. The full Legal Ninja experience — duels, streaks, leaderboard — now in your pocket.
          </p>
        </motion.div>

        {/* Android APK Download */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <GlassCard hover={false} className="p-6 border"
            style={{ borderColor: "rgba(0,245,255,0.2)" } as React.CSSProperties}>
            <div className="flex items-start gap-4">
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0 border"
                style={{ borderColor: "var(--cyber-green)", background: "rgba(34,255,136,0.08)" }}
              >
                🤖
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h2 className="text-base font-black uppercase tracking-widest" style={{ color: "var(--cyber-green)" }}>
                    Android APK
                  </h2>
                  <span
                    className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
                    style={{ borderColor: "var(--cyber-green)", color: "var(--cyber-green)", background: "rgba(34,255,136,0.1)" }}
                  >
                    Available Now
                  </span>
                </div>
                <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
                  Download the APK and install directly on your Android device. Enable <strong className="text-white">"Install from unknown sources"</strong> in your device settings before installing.
                </p>

                {/* Install steps */}
                <div className="grid grid-cols-3 gap-2 mb-5">
                  {[
                    { step: "1", text: "Download APK" },
                    { step: "2", text: "Allow installs" },
                    { step: "3", text: "Install & play" },
                  ].map((s) => (
                    <div key={s.step} className="text-center p-2 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black mx-auto mb-1"
                        style={{ background: "var(--cyber-green)", color: "#050A0F" }}
                      >
                        {s.step}
                      </div>
                      <p className="text-[9px] uppercase tracking-wider font-bold" style={{ color: "var(--text-muted)" }}>
                        {s.text}
                      </p>
                    </div>
                  ))}
                </div>

                <a href="/downloads/legal-ninja.apk" download>
                  <NeonButton variant="green" fullWidth size="lg">
                    <span className="flex items-center justify-center gap-2">
                      <span>⬇</span>
                      Download APK
                    </span>
                  </NeonButton>
                </a>

                <p className="text-center text-[10px] mt-2 font-mono" style={{ color: "var(--text-muted)" }}>
                  Android 8.0+ required · ~35 MB
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Store badges — Coming Soon */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6 }}
          className="grid grid-cols-2 gap-4"
        >
          {/* Play Store */}
          <GlassCard hover={false} className="p-4 text-center border opacity-60 cursor-not-allowed"
            style={{ borderColor: "rgba(255,255,255,0.08)" } as React.CSSProperties}>
            <div className="text-3xl mb-2">▶</div>
            <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">Google Play</p>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ borderColor: "rgba(255,215,0,0.4)", color: "var(--cyber-gold)", background: "rgba(255,215,0,0.07)" }}
            >
              Coming Soon
            </span>
          </GlassCard>

          {/* App Store */}
          <GlassCard hover={false} className="p-4 text-center border opacity-60 cursor-not-allowed"
            style={{ borderColor: "rgba(255,255,255,0.08)" } as React.CSSProperties}>
            <div className="text-3xl mb-2">🍎</div>
            <p className="text-xs font-black uppercase tracking-widest text-white/60 mb-1">App Store</p>
            <span
              className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{ borderColor: "rgba(255,215,0,0.4)", color: "var(--cyber-gold)", background: "rgba(255,215,0,0.07)" }}
            >
              Coming Soon
            </span>
          </GlassCard>
        </motion.div>

        {/* Notify me form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6 }}
        >
          <GlassCard hover={false} className="p-6 border"
            style={{ borderColor: "rgba(192,38,211,0.2)" } as React.CSSProperties}>
            <h3 className="text-sm font-black uppercase tracking-widest mb-1" style={{ color: "var(--cyber-purple)" }}>
              Get Store Launch Alerts
            </h3>
            <p className="text-xs mb-4" style={{ color: "var(--text-muted)" }}>
              We&apos;ll notify you the moment we land on Play Store and App Store.
            </p>

            {notified ? (
              <div
                className="text-center py-4 rounded-lg border"
                style={{ borderColor: "rgba(34,255,136,0.3)", background: "rgba(34,255,136,0.07)" }}
              >
                <p className="text-2xl mb-1">✓</p>
                <p className="text-sm font-black uppercase tracking-widest" style={{ color: "var(--cyber-green)" }}>
                  You&apos;re on the list!
                </p>
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  We&apos;ll hit your inbox when we launch.
                </p>
              </div>
            ) : (
              <form onSubmit={handleNotify} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 px-4 py-3 rounded-lg text-sm font-mono outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(192,38,211,0.3)",
                    color: "var(--text-primary)",
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "var(--cyber-purple)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(192,38,211,0.3)")}
                />
                <NeonButton variant="purple" type="submit" disabled={submitting}>
                  {submitting ? "..." : "Notify Me"}
                </NeonButton>
              </form>
            )}
          </GlassCard>
        </motion.div>

        {/* App screenshot placeholders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-cyber-border" />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              App Screens
            </span>
            <div className="h-px flex-1 bg-cyber-border" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {SCREENSHOTS.map((s) => (
              <div key={s.label} className="flex flex-col items-center gap-2">
                <div
                  className="w-full aspect-[9/16] rounded-xl border flex items-center justify-center"
                  style={{
                    borderColor: `${s.color}30`,
                    background: `${s.color}08`,
                  }}
                >
                  <span className="text-[9px] font-black uppercase tracking-wider text-center px-2" style={{ color: s.color }}>
                    Screenshot
                    <br />
                    Coming Soon
                  </span>
                </div>
                <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="h-px flex-1 bg-cyber-border" />
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              What&apos;s Inside
            </span>
            <div className="h-px flex-1 bg-cyber-border" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + i * 0.07 }}
              >
                <GlassCard hover className="p-4 h-full">
                  <div className="text-xl mb-2">{f.icon}</div>
                  <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: "var(--text-primary)" }}>
                    {f.title}
                  </p>
                  <p className="text-[10px] leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {f.desc}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Web fallback CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-center space-y-3"
        >
          <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Don&apos;t want to wait?
          </p>
          <NeonButton variant="cyan" onClick={() => router.push("/auth/sign-up")} size="lg">
            <span className="flex items-center gap-2">
              <span>🌐</span>
              Play on the Web — It&apos;s Free
            </span>
          </NeonButton>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Full experience available at legalninja.app
          </p>
        </motion.div>

      </div>
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonIcon } from "@/components/ui/NeonIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useGuestStore } from "@/lib/store/guest-store";
import { useUserStore } from "@/lib/store/user-store";
import { cn } from "@/lib/utils";

function NinjaIllustration() {
  return (
    <svg viewBox="0 0 240 260" className="w-48 h-48 md:w-64 md:h-64 drop-shadow-2xl" aria-hidden>
      <defs>
        <radialGradient id="bg-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="var(--cyber-cyan)"   stopOpacity="0.35" />
          <stop offset="60%"  stopColor="var(--cyber-purple)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="transparent"          stopOpacity="0" />
        </radialGradient>
        <linearGradient id="cape" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor="var(--cyber-purple)" />
          <stop offset="100%" stopColor="var(--cyber-bg)"      stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="blade" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--cyber-cyan)" />
          <stop offset="100%" stopColor="var(--cyber-green)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <circle cx="120" cy="120" r="95" fill="url(#bg-halo)" />
      <circle cx="120" cy="120" r="90" fill="none" stroke="var(--cyber-cyan)" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 8" />
      <circle cx="120" cy="120" r="75" fill="none" stroke="var(--cyber-purple)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 6" />
      <path d="M75 155 Q55 195 48 245 L120 228 L192 245 Q185 195 165 155" fill="url(#cape)" />
      <ellipse cx="120" cy="175" rx="38" ry="52" fill="#0f0f1e" />
      <rect x="82" y="180" width="76" height="12" rx="6" fill="var(--cyber-gold)" opacity="0.85" />
      <rect x="112" y="177" width="16" height="18" rx="4" fill="var(--cyber-red)" />
      <circle cx="120" cy="105" r="34" fill="#0f0f1e" />
      <path d="M86 100 Q120 82 154 100 L154 116 Q120 134 86 116 Z" fill="var(--cyber-cyan)" opacity="0.9" />
      <rect x="86" y="89" width="68" height="12" rx="6" fill="var(--cyber-purple)" />
      <rect x="111" y="86" width="18" height="6" rx="3" fill="var(--cyber-gold)" />
      <text x="120" y="93" textAnchor="middle" fontSize="5" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">忍</text>
      <rect x="93"  y="97" width="18" height="7" rx="3.5" fill="var(--cyber-cyan)" filter="url(#glow)" />
      <rect x="129" y="97" width="18" height="7" rx="3.5" fill="var(--cyber-cyan)" filter="url(#glow)" />
      <line x1="82" y1="160" x2="55" y2="185" stroke="#0f0f1e" strokeWidth="14" strokeLinecap="round" />
      <g transform="translate(45, 193) rotate(20)" filter="url(#glow)">
        <path d="M0-14 L4-4 L14-4 L6 2 L10 12 L0 6 L-10 12 L-6 2 L-14-4 L-4-4 Z" fill="var(--cyber-cyan)" opacity="0.95" />
        <circle cx="0" cy="0" r="3" fill="var(--cyber-bg)" />
      </g>
      <line x1="158" y1="158" x2="195" y2="140" stroke="#0f0f1e" strokeWidth="14" strokeLinecap="round" />
      <line x1="188" y1="135" x2="232" y2="88" stroke="url(#blade)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
      <rect x="183" y="133" width="16" height="6" rx="3" fill="var(--cyber-gold)" transform="rotate(-45 191 136)" />
      <rect x="160" y="70" width="36" height="16" rx="8" fill="var(--cyber-green)" opacity="0.9" />
      <text x="178" y="82" textAnchor="middle" fontSize="7" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">+50 XP</text>
      <rect x="30" y="75" width="40" height="16" rx="8" fill="var(--cyber-gold)" opacity="0.9" />
      <text x="50" y="87" textAnchor="middle" fontSize="7" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">LVL UP!</text>
    </svg>
  );
}

// Generate particles only on client to avoid hydration mismatch
function generateParticles() {
  return Array.from({ length: 18 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 2 + Math.random() * 4,
    color: ["var(--cyber-cyan)", "var(--cyber-purple)", "var(--cyber-gold)", "var(--cyber-green)"][i % 4],
    delay: Math.random() * 4,
    duration: 3 + Math.random() * 4,
  }));
}

// Navigation Component
function Navigation() {
  const router = useRouter();
  const uid = useUserStore((s) => s.uid);
  const isLoggedIn = !!uid;

  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl border-b transition-all"
      style={{ borderColor: "var(--cyber-border)", background: "rgba(15, 15, 30, 0.7)" }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 hover:opacity-80 transition">
          <span className="text-xl font-black neon-text-cyan">⚔️ NINJA</span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-bold hover:neon-text-cyan transition" style={{ color: "var(--text-muted)" }}>Features</button>
          <button onClick={() => document.getElementById("howitworks")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-bold hover:neon-text-cyan transition" style={{ color: "var(--text-muted)" }}>How It Works</button>
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} className="text-sm font-bold hover:neon-text-cyan transition" style={{ color: "var(--text-muted)" }}>Pricing</button>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          {isLoggedIn ? (
            <NeonButton variant="cyan" size="sm" onClick={() => router.push("/dashboard")}>Dashboard</NeonButton>
          ) : (
            <>
              <button onClick={() => router.push("/auth/sign-in")} className="text-sm font-bold hidden sm:block" style={{ color: "var(--text-muted)" }}>Sign In</button>
              <NeonButton variant="cyan" size="sm" onClick={() => router.push("/auth/sign-up")}>Sign Up</NeonButton>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

// Hero Section
function HeroSection() {
  const [particles, setParticles] = useState<ReturnType<typeof generateParticles> | null>(null);
  const [mounted, setMounted] = useState(false);

  // Generate particles only on client after hydration
  useEffect(() => {
    setParticles(generateParticles());
    setMounted(true);
  }, []);

  const router = useRouter();
  const setGuest = useGuestStore((s) => s.setGuest);
  const uid = useUserStore((s) => s.uid);
  const isLoggedIn = !!uid;

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 pt-20">
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none" style={{ background: "var(--orb-a)" }} />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[140px] pointer-events-none" style={{ background: "var(--orb-b)" }} />

      <motion.div animate={{ rotate: 360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }} className="absolute w-[480px] h-[480px] rounded-full border border-cyber-cyan/10 pointer-events-none" style={{ borderStyle: "dashed" }} />
      <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute w-[320px] h-[320px] rounded-full border border-cyber-purple/10 pointer-events-none" style={{ borderStyle: "dashed" }} />

      {mounted && particles && particles.map((p) => (
        <motion.div key={p.id} className="absolute rounded-full pointer-events-none" style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, background: p.color, boxShadow: `0 0 ${p.size * 3}px ${p.color}` }} animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }} transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }} />
      ))}

      <div className="relative max-w-6xl grid md:grid-cols-2 gap-12 items-center">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-black leading-tight">
              <span className="gradient-text">Compete.</span> <span className="gradient-text">Learn.</span> <span className="gradient-text">Conquer.</span>
            </h1>

            <p className="text-lg md:text-xl" style={{ color: "var(--text-muted)" }}>
              Master Nigerian law through competitive battles. Battle other students in real-time, climb the leaderboard, and prepare for your bar exam or finals—all while earning XP.
            </p>

            <div className="pt-6 space-y-3">
              {isLoggedIn ? (
                <>
                  <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/dashboard?track=law_school_track")}>
                    ⚖️ Law School Track
                  </NeonButton>
                  <NeonButton variant="purple" fullWidth size="lg" onClick={() => router.push("/dashboard?track=undergraduate_track")}>
                    🎓 Undergrad Track
                  </NeonButton>
                </>
              ) : (
                <>
                  <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/auth/sign-up")}>
                    Start Free (100 Questions)
                  </NeonButton>
                  <NeonButton variant="ghost" fullWidth size="lg" onClick={() => router.push("/auth/sign-in")}>
                    Already have an account? Sign In
                  </NeonButton>
                  <div className="flex items-center gap-3 py-4">
                    <div className="h-px flex-1 bg-cyber-border" />
                    <span className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>OR PLAY AS GUEST</span>
                    <div className="h-px flex-1 bg-cyber-border" />
                  </div>
                  <button onClick={() => { setGuest(true); router.push("/dashboard?track=law_school_track"); }} className="w-full py-3 rounded-xl border font-bold transition" style={{ borderColor: "var(--cyber-gold)", color: "var(--cyber-gold)" }}>
                    ⚖️ Law School Guest (20 Q/day)
                  </button>
                </>
              )}
            </div>

            <p className="text-xs pt-4" style={{ color: "var(--text-muted)" }}>
              ✅ Trusted by 10K+ Nigerian Law Students
            </p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.8, x: 30 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: 0.4 }} className="relative flex justify-center">
          <NinjaIllustration />
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="absolute bottom-10 left-1/2 transform -translate-x-1/2 glass-card rounded-2xl px-8 py-4 flex items-center gap-8 flex-wrap justify-center">
        {[
          { val: "10K+", label: "Students", color: "var(--cyber-cyan)" },
          { val: "500+", label: "Questions", color: "var(--cyber-green)" },
          { val: "7", label: "Levels", color: "var(--cyber-gold)" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-lg md:text-2xl font-black font-mono" style={{ color: s.color }}>{s.val}</p>
            <p className="text-xs uppercase tracking-widest font-bold" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

// Value Proposition Section
function ValuePropSection() {
  const benefits = [
    { icon: "⚡", title: "Competitive Gaming", desc: "Battle other students in real-time duels. Track your rank, earn XP, climb the leaderboard." },
    { icon: "📚", title: "Exam-Aligned Questions", desc: "Past exam papers, bar prep materials, and AI-generated scenarios covering all topics." },
    { icon: "🎯", title: "Smart Learning Path", desc: "Weak area detection. Daily challenges. Spaced repetition. Built-in coaching." },
    { icon: "🏆", title: "Instant Feedback", desc: "Real-time scoring. Detailed explanations. Expert insights for every question." },
    { icon: "👥", title: "Community Features", desc: "Join study groups, share strategies, compete with friends. Real motivation." },
    { icon: "💎", title: "Premium Unlocked", desc: "Unlimited questions, advanced analytics, priority support. From ₦700/week." },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-gradient-to-b from-transparent via-cyan-500/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Why Choose Legal Ninja?</h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Everything you need to master law and ace your exams</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-6 space-y-3 hover:shadow-lg hover:shadow-cyan-500/20 transition"
            >
              <div className="text-4xl">{benefit.icon}</div>
              <h3 className="text-lg font-bold">{benefit.title}</h3>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>{benefit.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    { num: "1", title: "Sign Up", desc: "Create a free account, choose your track (Law School or Undergrad)" },
    { num: "2", title: "Pick Your Challenge", desc: "Select subject, difficulty, and game mode" },
    { num: "3", title: "Battle & Learn", desc: "Answer questions in duels, earn XP, see detailed explanations" },
    { num: "4", title: "Track Progress", desc: "View analytics, identify weak areas, earn badges and streaks" },
  ];

  return (
    <section id="howitworks" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">How It Works</h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Start your journey in 4 easy steps</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative"
            >
              <div className="cyber-card p-6 space-y-3 h-full">
                <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xl" style={{ background: "var(--cyber-cyan)", color: "#0f0f1e" }}>
                  {step.num}
                </div>
                <h3 className="text-lg font-bold">{step.title}</h3>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && <div className="hidden md:block absolute -right-2 top-1/2 transform -translate-y-1/2 text-2xl neon-text-cyan">→</div>}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Features Showcase Section
function FeaturesShowcaseSection() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto space-y-20">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <h3 className="text-3xl font-black gradient-text">Multiple Quiz Modes</h3>
            <ul className="space-y-3">
              {["⚔️ 1v1 Duels - Real-time battles", "🏆 Battle Royale - Last ninja standing", "🎯 Daily Challenges - Timed tests", "📚 Mock Exams - Full exam simulation"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="cyber-card p-8 text-center">
            <div className="text-6xl mb-4">⚡</div>
            <p style={{ color: "var(--text-muted)" }}>Choose your battle mode</p>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid md:grid-cols-2 gap-12 items-center md:grid-flow-dense">
          <div className="cyber-card p-8 text-center">
            <div className="text-6xl mb-4">📊</div>
            <p style={{ color: "var(--text-muted)" }}>Advanced analytics & insights</p>
          </div>
          <div className="space-y-4">
            <h3 className="text-3xl font-black gradient-text">Track Your Progress</h3>
            <ul className="space-y-3">
              {["📈 Personal dashboard", "🔍 Weak area detection", "🔥 Streak tracking", "🏅 Leaderboard ranking"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-lg">
                  <span>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    { name: "Chioma O.", track: "Law School", quote: "Went from 40% to 92% in 3 months using Legal Ninja. Game-changer!", rating: 5 },
    { name: "Tunde A.", track: "Bar Exam Prep", quote: "The daily challenges kept me motivated. Beat my study group friends 😅", rating: 5 },
    { name: "Ada U.", track: "Undergrad Finals", quote: "Best law study app in Nigeria. The leaderboard makes studying fun!", rating: 5 },
  ];

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-purple-500/5 to-transparent">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Loved by Law Students</h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Real feedback from our community</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="cyber-card p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>{t.track}</p>
                </div>
                <div className="text-lg">{"⭐".repeat(t.rating)}</div>
              </div>
              <p className="italic" style={{ color: "var(--text-muted)" }}>"{t.quote}"</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Pricing Section
function PricingSection() {
  const bundles = [
    { name: "Starter", questions: 50, price: 500, icon: "🎯" },
    { name: "Standard", questions: 100, price: 1000, icon: "⚡", popular: true },
    { name: "Pro", questions: 200, price: 1900, icon: "🔥", savings: "5%" },
    { name: "Supreme", questions: 500, price: 4500, icon: "👑", savings: "10%" },
  ];

  const passes = [
    { name: "7-Day Unlimited", duration: "7 days", price: 700, icon: "🌟", perDay: "₦100/day" },
    { name: "Subject Mastery", duration: "30 days", price: 800, icon: "🏆", perDay: "₦27/day", popular: true },
  ];

  const calcPricePerQuestion = (questions: number, price: number) => {
    return (price / questions).toFixed(2);
  };

  return (
    <section id="pricing" className="py-24 px-4 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-gradient-to-r from-[#00F0FF]/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-gradient-to-r from-[#C026D3]/10 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-5xl md:text-6xl font-black mb-4">
            <span className="bg-gradient-to-r from-[#00F0FF] via-[#C026D3] to-[#FF00FF] bg-clip-text text-transparent">
              Power-Up Your Arsenal
            </span>
          </h2>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Choose your battle pass and unlock unlimited questions
          </p>
        </motion.div>

        {/* Bundles Section */}
        <div className="mb-20">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-black mb-8 flex items-center gap-2"
          >
            <span className="text-2xl">💎</span> Question Bundles
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {bundles.map((bundle, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="relative group"
              >
                {/* Popular badge */}
                {bundle.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-3 py-1 rounded-full text-xs font-black text-[#0F0F1A]"
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #FF9500)",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.4)",
                      }}
                    >
                      MOST POPULAR
                    </motion.div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`rounded-xl backdrop-blur-md border transition-all duration-300 p-6 h-full
                    ${
                      bundle.popular
                        ? "bg-[rgba(26,20,40,0.8)] border-[#FFD700] shadow-[0_0_30px_rgba(255,215,0,0.3)]"
                        : "bg-[rgba(26,20,40,0.6)] border-[rgba(0,240,255,0.1)] shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]"
                    }
                    group-hover:shadow-[0_0_40px_rgba(0,240,255,0.4),0_20px_40px_-10px_rgba(0,240,255,0.3)]
                    group-hover:scale-105
                    group-hover:border-[rgba(0,240,255,0.3)]
                  `}
                >
                  {/* Icon & Title */}
                  <div className="mb-4">
                    <div className="text-4xl mb-2">{bundle.icon}</div>
                    <h4 className="text-xl font-black text-white mb-1">{bundle.name}</h4>
                    {bundle.savings && (
                      <p className="text-xs font-bold text-[#22FF88]">Save {bundle.savings}</p>
                    )}
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="text-3xl font-black text-white mb-1">
                      ₦{bundle.price.toLocaleString()}
                    </div>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      ₦{calcPricePerQuestion(bundle.questions, bundle.price)}/question
                    </p>
                  </div>

                  {/* Questions */}
                  <div className="mb-6 p-3 rounded-lg bg-[rgba(0,240,255,0.1)]">
                    <p className="text-2xl font-black text-[#00F0FF]">{bundle.questions}</p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>Questions</p>
                  </div>

                  {/* CTA */}
                  <NeonButton
                    variant={bundle.popular ? "cyan" : "ghost"}
                    fullWidth
                    onClick={() => window.location.href = "/store"}
                    className="w-full"
                  >
                    {bundle.popular ? "Buy Now" : "Choose"}
                  </NeonButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Passes Section */}
        <div className="mb-16">
          <motion.h3
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-2xl font-black mb-8 flex items-center gap-2"
          >
            <span className="text-2xl">⚡</span> Unlimited Passes
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {passes.map((pass, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Popular badge */}
                {pass.popular && (
                  <div className="absolute -top-3 right-6 z-10">
                    <motion.div
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="px-3 py-1 rounded-full text-xs font-black text-[#0F0F1A]"
                      style={{
                        background: "linear-gradient(135deg, #FFD700, #FF9500)",
                        boxShadow: "0 0 20px rgba(255, 215, 0, 0.4)",
                      }}
                    >
                      BEST VALUE
                    </motion.div>
                  </div>
                )}

                {/* Card */}
                <div
                  className={`rounded-xl backdrop-blur-md border transition-all duration-300 p-8 h-full
                    ${
                      pass.popular
                        ? "bg-[rgba(26,20,40,0.8)] border-[#FF9500] shadow-[0_0_30px_rgba(255,149,0,0.3)]"
                        : "bg-[rgba(26,20,40,0.6)] border-[rgba(0,240,255,0.1)] shadow-[0_20px_40px_-10px_rgba(0,240,255,0.25),0_8px_16px_-4px_rgba(0,0,0,0.6)]"
                    }
                    group-hover:scale-105
                    group-hover:border-[rgba(255,149,0,0.4)]
                  `}
                >
                  {/* Icon & Title */}
                  <div className="mb-6 flex items-start justify-between">
                    <div>
                      <div className="text-4xl mb-3">{pass.icon}</div>
                      <h4 className="text-2xl font-black text-white">{pass.name}</h4>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-black text-[#00F0FF]">∞</div>
                      <div>
                        <p className="font-bold text-white">Unlimited Questions</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          All categories included
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">⏱️</div>
                      <div>
                        <p className="font-bold text-white">{pass.duration}</p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          Auto-renews unless cancelled
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-8 p-4 rounded-lg bg-gradient-to-r from-[rgba(255,149,0,0.2)] to-[rgba(255,215,0,0.2)] border border-[rgba(255,149,0,0.2)]">
                    <div className="text-3xl font-black text-[#FF9500] mb-1">
                      ₦{pass.price}
                    </div>
                    <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
                      {pass.perDay}
                    </p>
                  </div>

                  {/* CTA */}
                  <NeonButton
                    variant={pass.popular ? "gold" : "purple"}
                    fullWidth
                    onClick={() => window.location.href = "/store"}
                    className="w-full"
                  >
                    Activate Pass
                  </NeonButton>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Free Tier Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-[rgba(34,255,136,0.1)] border border-[rgba(34,255,136,0.2)] rounded-xl p-8 text-center"
        >
          <h3 className="text-2xl font-black text-white mb-3">🎁 Start Free</h3>
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>
            Get 100 free questions instantly + daily quests for more
          </p>
          <NeonButton
            variant="green"
            onClick={() => window.location.href = "/auth/sign-up"}
            className="mt-4"
          >
            Begin Your Journey
          </NeonButton>
        </motion.div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const faqs = [
    { q: "How many free questions do I get?", a: "You get 100 free questions when you sign up, plus earning opportunities through daily challenges and quests." },
    { q: "Is this app suitable for bar exam prep?", a: "Absolutely! Legal Ninja is designed specifically for bar exam candidates with questions from past papers and comprehensive topics." },
    { q: "Can I use this on mobile?", a: "Yes, we have a full-featured mobile app available on iOS and Android with the same features as the web app." },
    { q: "How does the ranking system work?", a: "You earn XP by answering questions correctly. The more XP you earn, the higher you climb on our leaderboards." },
    { q: "Can I cancel my subscription anytime?", a: "Yes, you can cancel your premium subscription at any time. No hidden fees or long-term contracts." },
  ];

  return (
    <section className="py-24 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black mb-4 gradient-text">Frequently Asked</h2>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full cyber-card p-4 text-left flex items-center justify-between hover:border-cyber-cyan transition"
              >
                <span className="font-bold">{faq.q}</span>
                <span className="text-xl transition" style={{ transform: openIdx === i ? "rotate(180deg)" : "rotate(0)" }}>↓</span>
              </button>
              <AnimatePresence>
                {openIdx === i && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="cyber-card -mt-1 p-4 pt-0 border-t-0 border-t-transparent" style={{ borderColor: "var(--cyber-border)" }}>
                    <p style={{ color: "var(--text-muted)" }}>{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="border-t py-12 px-4" style={{ borderColor: "var(--cyber-border)" }}>
      <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <p className="font-black text-lg mb-2">⚔️ Legal Ninja</p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Master Nigerian law through competitive gaming.</p>
        </div>
        <div>
          <p className="font-bold mb-4">Links</p>
          <ul className="space-y-2 text-sm">
            {["Privacy Policy", "Terms of Service", "Contact", "Help"].map((link) => (
              <li key={link}><button style={{ color: "var(--text-muted)" }} className="hover:neon-text-cyan transition">{link}</button></li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-bold mb-4">Follow Us</p>
          <div className="flex gap-4">
            {["Twitter", "LinkedIn", "Instagram"].map((social) => (
              <button key={social} style={{ color: "var(--text-muted)" }} className="hover:neon-text-cyan transition text-sm font-bold">{social}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t pt-8 text-center text-sm" style={{ borderColor: "var(--cyber-border)", color: "var(--text-muted)" }}>
        <p>© 2026 Legal Ninja. All rights reserved. 🥷</p>
      </div>
    </footer>
  );
}

// Main Page
export default function SplashPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <Navigation />
      <HeroSection />
      <ValuePropSection />
      <HowItWorksSection />
      <FeaturesShowcaseSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <Footer />
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";
import { NeonIcon } from "@/components/ui/NeonIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { useGuestStore } from "@/lib/store/guest-store";
import { useUserStore } from "@/lib/store/user-store";

function NinjaIllustration() {
  return (
    <svg viewBox="0 0 240 260" className="w-44 h-44 md:w-56 md:h-56 drop-shadow-2xl" aria-hidden>
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

      {/* Halo */}
      <circle cx="120" cy="120" r="95" fill="url(#bg-halo)" />

      {/* Ring decorations */}
      <circle cx="120" cy="120" r="90" fill="none" stroke="var(--cyber-cyan)" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="4 8" />
      <circle cx="120" cy="120" r="75" fill="none" stroke="var(--cyber-purple)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="2 6" />

      {/* Cape */}
      <path d="M75 155 Q55 195 48 245 L120 228 L192 245 Q185 195 165 155" fill="url(#cape)" />

      {/* Body */}
      <ellipse cx="120" cy="175" rx="38" ry="52" fill="#0f0f1e" />

      {/* Belt sash */}
      <rect x="82" y="180" width="76" height="12" rx="6" fill="var(--cyber-gold)" opacity="0.85" />
      <rect x="112" y="177" width="16" height="18" rx="4" fill="var(--cyber-red)" />

      {/* Head */}
      <circle cx="120" cy="105" r="34" fill="#0f0f1e" />

      {/* Face mask / balaclava */}
      <path d="M86 100 Q120 82 154 100 L154 116 Q120 134 86 116 Z"
            fill="var(--cyber-cyan)" opacity="0.9" />

      {/* Headband */}
      <rect x="86" y="89" width="68" height="12" rx="6" fill="var(--cyber-purple)" />
      {/* Headband emblem */}
      <rect x="111" y="86" width="18" height="6" rx="3" fill="var(--cyber-gold)" />
      <text x="120" y="93" textAnchor="middle" fontSize="5" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">忍</text>

      {/* Eyes */}
      <rect x="93"  y="97" width="18" height="7" rx="3.5" fill="var(--cyber-cyan)" filter="url(#glow)" />
      <rect x="129" y="97" width="18" height="7" rx="3.5" fill="var(--cyber-cyan)" filter="url(#glow)" />

      {/* Left arm holding shuriken */}
      <line x1="82" y1="160" x2="55" y2="185" stroke="#0f0f1e" strokeWidth="14" strokeLinecap="round" />
      {/* Shuriken */}
      <g transform="translate(45, 193) rotate(20)" filter="url(#glow)">
        <path d="M0-14 L4-4 L14-4 L6 2 L10 12 L0 6 L-10 12 L-6 2 L-14-4 L-4-4 Z"
              fill="var(--cyber-cyan)" opacity="0.95" />
        <circle cx="0" cy="0" r="3" fill="var(--cyber-bg)" />
      </g>

      {/* Right arm — katana */}
      <line x1="158" y1="158" x2="195" y2="140" stroke="#0f0f1e" strokeWidth="14" strokeLinecap="round" />
      {/* Sword blade */}
      <line x1="188" y1="135" x2="232" y2="88" stroke="url(#blade)" strokeWidth="3.5" strokeLinecap="round" filter="url(#glow)" />
      {/* Guard */}
      <rect x="183" y="133" width="16" height="6" rx="3" fill="var(--cyber-gold)" transform="rotate(-45 191 136)" />

      {/* Floating XP chips */}
      <rect x="160" y="70" width="36" height="16" rx="8" fill="var(--cyber-green)" opacity="0.9" />
      <text x="178" y="82" textAnchor="middle" fontSize="7" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">+50 XP</text>

      <rect x="30" y="75" width="40" height="16" rx="8" fill="var(--cyber-gold)" opacity="0.9" />
      <text x="50" y="87" textAnchor="middle" fontSize="7" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">LVL UP!</text>
    </svg>
  );
}

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 2 + Math.random() * 4,
  color: ["var(--cyber-cyan)", "var(--cyber-purple)", "var(--cyber-gold)", "var(--cyber-green)"][i % 4],
  delay: Math.random() * 4,
  duration: 3 + Math.random() * 4,
}));

export default function SplashPage() {
  const router = useRouter();
  const setGuest = useGuestStore((s) => s.setGuest);
  const uid = useUserStore((s) => s.uid);
  const isLoggedIn = !!uid;

  const playAsGuest = (track: string) => {
    setGuest(true);
    router.push(`/dashboard?track=${track}`);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4 py-16">

      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top:  `${p.y}%`,
            width:  p.size,
            height: p.size,
            background: p.color,
            boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
          }}
          animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}

      {/* Large background orbs */}
      <div className="absolute top-1/4 -left-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
           style={{ background: "var(--orb-a)" }} />
      <div className="absolute bottom-1/4 -right-24 w-96 h-96 rounded-full blur-[140px] pointer-events-none"
           style={{ background: "var(--orb-b)" }} />

      {/* Rotating ring decoration */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[480px] h-[480px] rounded-full border border-cyber-cyan/10 pointer-events-none"
        style={{ borderStyle: "dashed" }}
      />
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[320px] h-[320px] rounded-full border border-cyber-purple/10 pointer-events-none"
        style={{ borderStyle: "dashed" }}
      />

      {/* Ninja illustration */}
      <motion.div
        initial={{ opacity: 0, scale: 0.6, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative mb-8"
      >
        <NinjaIllustration />
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="text-center mb-3 relative"
      >
        <h1 className="text-6xl md:text-7xl font-black gradient-text tracking-[0.1em] uppercase mb-1">
          Legal Ninja
        </h1>
        <div className="flex items-center justify-center gap-3">
          <div className="h-px w-10 bg-cyber-border" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-base-muted">
            Project_Shogun_v1.0
          </span>
          <div className="h-px w-10 bg-cyber-border" />
        </div>
      </motion.div>

      {/* Tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-center text-sm md:text-base mb-10 max-w-xs font-semibold uppercase tracking-wider leading-relaxed"
        style={{ color: "var(--text-muted)" }}
      >
        Master the law through{" "}
        <span className="neon-text-cyan font-bold">high-intensity</span> competitive duels.
      </motion.p>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.85 }}
        className="glass-card rounded-2xl px-6 py-3 flex items-center gap-6 mb-8"
      >
        {[
          { val: "10K+", label: "Students",  color: "var(--cyber-cyan)" },
          { val: "7",    label: "Levels",    color: "var(--cyber-gold)" },
          { val: "500+", label: "Questions", color: "var(--cyber-green)" },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-black font-mono" style={{ color: s.color }}>{s.val}</p>
            <p className="text-[9px] uppercase tracking-widest font-bold" style={{ color: "var(--text-muted)" }}>{s.label}</p>
          </div>
        ))}
      </motion.div>

      {/* CTA section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-sm space-y-4"
      >
        {isLoggedIn ? (
          /* Authenticated: go straight to dashboard */
          <>
            <div className="flex items-center gap-2 opacity-40 justify-center mb-4">
              <div className="h-px flex-1 bg-cyber-border" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap">Select Your Path</span>
              <div className="h-px flex-1 bg-cyber-border" />
            </div>
            <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/dashboard?track=law_school_track")}>
              <div className="flex items-center justify-center gap-3">
                <NeonIcon name="Scale" color="cyan" size={18} glow={false} />
                <div className="text-left">
                  <div>Law School Track</div>
                  <div className="text-[9px] opacity-60 font-normal tracking-wider normal-case">Bar Finals · LPA · BL</div>
                </div>
              </div>
            </NeonButton>
            <NeonButton variant="purple" fullWidth size="lg" onClick={() => router.push("/dashboard?track=undergraduate_track")}>
              <div className="flex items-center justify-center gap-3">
                <NeonIcon name="GraduationCap" color="purple" size={18} glow={false} />
                <div className="text-left">
                  <div>Undergrad Track</div>
                  <div className="text-[9px] opacity-60 font-normal tracking-wider normal-case">LL.B · University Finals</div>
                </div>
              </div>
            </NeonButton>
          </>
        ) : (
          /* Guest / unauthenticated */
          <>
            {/* Primary auth CTAs */}
            <div className="grid grid-cols-2 gap-3">
              <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/auth/sign-up")}>
                <div className="text-center">
                  <div>Sign Up</div>
                  <div className="text-[9px] opacity-60 font-normal normal-case">Free · 100 questions</div>
                </div>
              </NeonButton>
              <NeonButton variant="ghost" fullWidth size="lg" onClick={() => router.push("/auth/sign-in")}>
                Sign In
              </NeonButton>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-cyber-border" />
              <span className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                or play as guest
              </span>
              <div className="h-px flex-1 bg-cyber-border" />
            </div>

            {/* Guest play tracks */}
            <NeonButton variant="gold" fullWidth onClick={() => playAsGuest("law_school_track")}>
              <div className="flex items-center justify-center gap-3">
                <NeonIcon name="Scale" color="gold" size={16} glow={false} />
                <div className="text-left">
                  <div>Law School — Guest</div>
                  <div className="text-[9px] opacity-60 font-normal tracking-wider normal-case">
                    20 questions/day · No account needed
                  </div>
                </div>
              </div>
            </NeonButton>
            <NeonButton variant="ghost" fullWidth onClick={() => playAsGuest("undergraduate_track")}>
              <div className="flex items-center justify-center gap-3">
                <NeonIcon name="GraduationCap" color="purple" size={16} glow={false} />
                <div className="text-left">
                  <div>Undergrad — Guest</div>
                  <div className="text-[9px] opacity-60 font-normal tracking-wider normal-case">
                    20 questions/day · Progress not saved
                  </div>
                </div>
              </div>
            </NeonButton>
          </>
        )}
      </motion.div>

      {/* Get the App link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="mt-8 text-center"
      >
        <button
          onClick={() => router.push("/download")}
          className="flex items-center gap-2 mx-auto text-xs font-bold uppercase tracking-widest transition-colors hover:opacity-100 opacity-50"
          style={{ color: "var(--cyber-cyan)" }}
        >
          <span>📱</span>
          Get the Mobile App
          <span>→</span>
        </button>
      </motion.div>

      {/* HUD corners */}
      <div className="fixed top-6 left-6 w-10 h-10 border-t-2 border-l-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed top-6 right-16 w-10 h-10 border-t-2 border-r-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed bottom-6 left-6 w-10 h-10 border-b-2 border-l-2 border-cyber-cyan/20 pointer-events-none" />
      <div className="fixed bottom-6 right-6 w-10 h-10 border-b-2 border-r-2 border-cyber-cyan/20 pointer-events-none" />
    </div>
  );
}

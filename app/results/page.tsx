"use client";
import { useEffect, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { useUserStore } from "@/lib/store/user-store";
import { useGuestStore } from "@/lib/store/guest-store";
import { getGrade } from "@/lib/config/scoring";
import { LEVELS } from "@/lib/config/progression";
import { XPBar } from "@/components/ui/XPBar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

const GRADE_COLORS: Record<string, string> = {
  "A+": "var(--cyber-gold)",
  A:   "var(--cyber-green)",
  B:   "var(--cyber-cyan)",
  C:   "#d1d5db",
  D:   "#f59e0b",
  F:   "var(--cyber-red)",
};

const GRADE_EMOJIS: Record<string, string> = {
  "A+": "🏆", A: "⭐", B: "💪", C: "📚", D: "🔄", F: "🥷",
};

const MOTIVATIONAL: Record<string, string> = {
  "A+": "Supreme Court Material. The bench awaits! 🏛️",
  A:    "Top Advocate performance. Keep this momentum! ⚡",
  B:    "Solid Counsel. A little more focus and you crack A+. 💪",
  C:    "Needs more practice. The courtroom is brutal — train harder. 📚",
  D:    "Junior Associate energy. Review weak areas and return. 🔄",
  F:    "Back to Chambers. Every ninja falls before they rise. 🥷",
};

function TrophyIllustration({ grade }: { grade: string }) {
  if (!["A+", "A", "B"].includes(grade)) return null;
  return (
    <svg viewBox="0 0 120 120" className="w-20 h-20" aria-hidden>
      <defs>
        <linearGradient id="trophy-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="var(--cyber-gold)" />
          <stop offset="100%" stopColor="var(--cyber-red)" />
        </linearGradient>
        <filter id="trophy-glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      <path d="M35 20 Q35 70 60 80 Q85 70 85 20 Z" fill="url(#trophy-grad)" filter="url(#trophy-glow)" />
      <path d="M35 28 Q18 28 18 45 Q18 58 35 55" fill="none" stroke="url(#trophy-grad)" strokeWidth="5" strokeLinecap="round" />
      <path d="M85 28 Q102 28 102 45 Q102 58 85 55" fill="none" stroke="url(#trophy-grad)" strokeWidth="5" strokeLinecap="round" />
      <rect x="53" y="80" width="14" height="20" rx="3" fill="url(#trophy-grad)" />
      <rect x="38" y="99" width="44" height="8" rx="4" fill="url(#trophy-grad)" />
      <text x="60" y="55" textAnchor="middle" fontSize="20" fill="#0f0f1e" fontFamily="'Exo 2'" fontWeight="700">
        {grade === "A+" ? "★" : grade === "A" ? "⬟" : "◆"}
      </text>
    </svg>
  );
}

function ConfettiPieces({ show }: { show: boolean }) {
  if (!show) return null;
  const colors = ["var(--cyber-cyan)", "var(--cyber-purple)", "var(--cyber-gold)", "var(--cyber-green)", "var(--cyber-red)"];
  const pieces = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: 10 + (i % 8) * 11,
    color: colors[i % colors.length],
    delay: (i * 0.08),
    duration: 1.5 + Math.random() * 1,
    rotate: Math.random() * 720,
  }));
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-2 h-2 rounded-sm top-0"
          style={{ left: `${p.x}%`, background: p.color }}
          initial={{ y: -20, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", rotate: p.rotate, opacity: 0 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
        />
      ))}
    </div>
  );
}

function AnimatedNumber({ value, suffix = "" }: { value: number; suffix?: string }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const step = value / 30;
    let cur = 0;
    const t = setInterval(() => {
      cur = Math.min(cur + step, value);
      setDisplayed(Math.round(cur));
      if (cur >= value) clearInterval(t);
    }, 30);
    return () => clearInterval(t);
  }, [value]);
  return <>{displayed}{suffix}</>;
}

function LevelChangeNotice({ direction }: { direction: "up" | "down" | null }) {
  if (!direction) return null;
  const isUp = direction === "up";
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
      className="cyber-card p-5 text-center relative overflow-hidden"
      style={{ borderColor: isUp ? "var(--cyber-gold)" : "var(--cyber-red)" }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{ background: `radial-gradient(circle at 50% 50%, ${isUp ? "var(--cyber-gold)" : "var(--cyber-red)"}, transparent)` }}
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1] }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-4xl mb-2"
      >
        {isUp ? "🎖️" : "⚠️"}
      </motion.div>
      <p className="text-lg font-black" style={{ color: isUp ? "var(--cyber-gold)" : "var(--cyber-red)" }}>
        {isUp ? "LEVEL UP!" : "LEVEL DOWN"}
      </p>
      <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
        {isUp
          ? "You've advanced to the next rank. Keep training!"
          : "Your accuracy dropped below the threshold. 10 correct answers will stabilize your rank."}
      </p>
    </motion.div>
  );
}

function SpacedRepetitionHint({ wrongSubjects }: { wrongSubjects: string[] }) {
  if (wrongSubjects.length === 0) return null;
  const unique = [...new Set(wrongSubjects)].slice(0, 3);
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.1 }}
      className="cyber-card p-4"
      style={{ borderColor: "color-mix(in srgb, var(--cyber-purple) 50%, transparent)" }}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">🧠</span>
        <div>
          <p className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: "var(--cyber-purple)" }}>
            Spaced Repetition
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Focus your next session on:{" "}
            <span className="font-bold" style={{ color: "var(--text-base)" }}>
              {unique.map((s) => s.replace(/_/g, " ")).join(", ")}
            </span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function ResultsContent() {
  const router = useRouter();
  const game = useGameStore();
  const user = useUserStore();
  const guest = useGuestStore();
  const isGuest = guest.is_guest || !user.uid;

  const correct     = game.answers.filter((a) => a.correct).length;
  const total       = game.answers.length;
  const percentage  = total > 0 ? Math.round((correct / total) * 100) : 0;
  const grade       = getGrade(percentage);
  const isGoodGrade = ["A+", "A"].includes(grade.grade);
  const wrongAnswers = game.answers.filter((a) => !a.correct);
  const hasWrong    = wrongAnswers.length > 0;

  // Subjects of wrong answers for spaced repetition hint
  const wrongSubjects = wrongAnswers.map((a) => {
    const q = game.questions.find((q) => q.id === a.question_id);
    return q?.subject ?? "";
  }).filter(Boolean);

  // Level direction and new badges come directly from the server via game store
  const levelDirection = game.level_direction;
  const newBadges      = game.new_badges ?? [];

  useEffect(() => {
    if (game.status !== "finished") router.replace("/dashboard");
  }, [game.status, router]);

  const gradeColor = GRADE_COLORS[grade.grade] ?? "#d1d5db";

  return (
    <div className="min-h-screen px-4 py-10 pb-36">
      <ConfettiPieces show={isGoodGrade} />

      <div className="max-w-lg mx-auto space-y-5">

        {/* Guest results notice */}
        {isGuest && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl p-4 text-center"
            style={{ background: "color-mix(in srgb, var(--cyber-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-gold) 30%, transparent)" }}
          >
            <p className="text-sm font-bold" style={{ color: "var(--cyber-gold)" }}>
              🥷 Guest session — XP and progress not saved
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
              Sign up free to track your progress, earn XP, and climb the leaderboard.
            </p>
            <div className="mt-3">
              <NeonButton variant="cyan" size="sm" onClick={() => router.push("/auth/sign-up")}>
                Create Free Account
              </NeonButton>
            </div>
          </motion.div>
        )}

        {/* Hero Score Card */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 18, delay: 0.1 }}
          className="cyber-card p-7 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 opacity-10" style={{ background: `radial-gradient(circle at 50% 50%, ${gradeColor}, transparent 70%)` }} />
          <div className="relative z-10 flex flex-col items-center gap-2">
            <TrophyIllustration grade={grade.grade} />
            <motion.p
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.35 }}
              className="text-8xl font-black font-mono leading-none"
              style={{ color: gradeColor, textShadow: `0 0 30px ${gradeColor}66, 0 0 60px ${gradeColor}33` }}
            >
              {grade.grade}
            </motion.p>
            <p className="font-semibold" style={{ color: "var(--text-muted)" }}>{grade.title}</p>
            <motion.p
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="text-4xl font-black font-mono"
              style={{ color: "var(--cyber-cyan)" }}
            >
              <AnimatedNumber value={percentage} suffix="%" />
            </motion.p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>{correct} / {total} correct</p>
          </div>
        </motion.div>

        {/* Motivational */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="glass-card rounded-xl p-4 text-center"
        >
          <span className="text-2xl">{GRADE_EMOJIS[grade.grade]}</span>
          <p className="text-sm font-semibold mt-1" style={{ color: "var(--text-base)" }}>
            {MOTIVATIONAL[grade.grade]}
          </p>
        </motion.div>

        {/* Level change notice */}
        {!isGuest && <LevelChangeNotice direction={levelDirection} />}

        {/* XP earned (authenticated only) */}
        {!isGuest && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="cyber-card p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold" style={{ color: "var(--text-muted)" }}>XP Earned</span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.9, type: "spring" }}
                className="text-2xl font-black font-mono neon-text-green"
              >
                +<AnimatedNumber value={game.xp_earned} /> XP
              </motion.span>
            </div>
            <XPBar xp={user.xp} level={user.level} />
          </motion.div>
        )}

        {/* Level + Streak grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="cyber-card p-4 flex flex-col items-center gap-2">
            <LevelBadge level={isGuest ? 1 : user.level} size="md" showName />
          </div>
          <div className="cyber-card p-4 flex flex-col items-center justify-center gap-1">
            <p className="text-3xl font-black font-mono neon-text-gold">
              <AnimatedNumber value={isGuest ? 0 : user.current_streak} />
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>🔥 Streak</p>
          </div>
          <div className="cyber-card p-4 flex flex-col items-center justify-center gap-1">
            <p className="text-3xl font-black font-mono neon-text-purple">{correct}</p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>✓ Correct</p>
          </div>
        </motion.div>

        {/* New Badges earned this session */}
        {newBadges.length > 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8 }}
            className="cyber-card p-4 text-center space-y-2"
            style={{ borderColor: "color-mix(in srgb, var(--cyber-gold) 50%, transparent)" }}>
            <p className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--cyber-gold)" }}>🏅 New Badge{newBadges.length > 1 ? "s" : ""} Earned!</p>
            <div className="flex flex-wrap gap-2 justify-center">
              {newBadges.map((b) => (
                <span key={b} className="px-3 py-1 rounded-full text-xs font-bold border"
                  style={{ borderColor: "color-mix(in srgb, var(--cyber-gold) 40%, transparent)", background: "color-mix(in srgb, var(--cyber-gold) 10%, transparent)", color: "var(--cyber-gold)" }}>
                  {b}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Spaced Repetition Hint */}
        <SpacedRepetitionHint wrongSubjects={wrongSubjects} />

        {/* Essay Feedback (Mock Exam only) */}
        {game.mode === "exam_simulation" && game.answers.some(a => game.questions.find(q => q.id === a.question_id)?.type === "essay") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-widest px-1" style={{ color: "var(--cyber-purple)" }}>
              ⚖️ Essay Evaluations
            </h3>
            {game.answers.map((a, i) => {
              const q = game.questions.find(q => q.id === a.question_id);
              if (q?.type !== "essay") return null;
              return (
                <div key={a.question_id} className="cyber-card p-4 space-y-3 border-l-4" style={{ borderLeftColor: "var(--cyber-purple)" }}>
                  <div className="flex justify-between items-start">
                    <p className="text-xs font-bold leading-relaxed line-clamp-2 pr-4">{q.question}</p>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-black font-mono" style={{ color: "var(--cyber-purple)" }}>{a.score ?? 0}</p>
                      <p className="text-[9px] uppercase font-black" style={{ color: "var(--text-muted)" }}>Score</p>
                    </div>
                  </div>
                  
                  {a.feedback && (
                    <div className="text-xs space-y-2 p-3 rounded-lg" style={{ background: "color-mix(in srgb, var(--cyber-purple) 6%, var(--cyber-card-bg))" }}>
                      <p style={{ color: "var(--text-base)" }}><span className="font-bold">Examiner's Note:</span> {a.feedback}</p>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        <div>
                          <p className="text-[9px] font-black uppercase mb-1" style={{ color: "var(--cyber-green)" }}>Strengths</p>
                          <ul className="list-disc list-inside space-y-1 opacity-80">
                            {a.strengths?.map((s, idx) => <li key={idx}>{s}</li>)}
                          </ul>
                        </div>
                        <div>
                          <p className="text-[9px] font-black uppercase mb-1" style={{ color: "var(--cyber-red)" }}>Weaknesses</p>
                          <ul className="list-disc list-inside space-y-1 opacity-80">
                            {a.weaknesses?.map((w, idx) => <li key={idx}>{w}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </motion.div>
        )}

        {/* Session Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="cyber-card p-5 space-y-3"
        >
          <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
            Session Breakdown
          </h3>
          {game.answers.map((a, i) => {
            const q = game.questions[i];
            return (
              <motion.div
                key={a.question_id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 + i * 0.04 }}
                className="flex items-center gap-3 text-sm py-1 border-b last:border-0"
                style={{ borderColor: "var(--cyber-border)" }}
              >
                <div className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0",
                  a.correct ? "bg-cyber-green/20 text-cyber-green" : "bg-cyber-red/20 text-cyber-red"
                )}>
                  {a.correct ? "✓" : "✗"}
                </div>
                <span className="truncate flex-1 text-xs" style={{ color: "var(--text-base)" }}>
                  {q?.question.slice(0, 52)}...
                </span>
                <span className="text-[10px] font-mono shrink-0" style={{ color: "var(--text-muted)" }}>
                  {(a.time_taken_ms / 1000).toFixed(1)}s
                </span>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="space-y-3"
        >
          {/* Review Mistakes — only if there are wrong answers */}
          {hasWrong && (
            <NeonButton
              variant="purple"
              fullWidth
              size="lg"
              onClick={() => router.push("/review")}
            >
              🔍 Review {wrongAnswers.length} Mistake{wrongAnswers.length !== 1 ? "s" : ""}
            </NeonButton>
          )}

          <NeonButton variant="cyan" fullWidth size="lg" onClick={() => router.push("/quiz")}>
            ⚔️ Play Again
          </NeonButton>
          <NeonButton
            variant="ghost"
            fullWidth
            onClick={() => { game.resetSession(); router.push("/dashboard"); }}
          >
            Back to Dashboard
          </NeonButton>
        </motion.div>

      </div>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center neon-text-cyan font-black animate-pulse">
        Calculating results...
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}

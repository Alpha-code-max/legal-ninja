"use client";
import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore, type Question } from "@/lib/store/game-store";
import { useUserStore } from "@/lib/store/user-store";
import { useGuestStore, GUEST_DAILY_LIMIT } from "@/lib/store/guest-store";
import { QuestionCard } from "@/components/game/QuestionCard";
import { TimerRing } from "@/components/ui/TimerRing";
import { StreakCounter } from "@/components/ui/StreakCounter";
import { NeonButton } from "@/components/ui/NeonButton";
import { api } from "@/lib/api/client";
import { getFallbackQuestions } from "@/lib/data/fallback-questions";
import type { Difficulty, GameModeId } from "@/lib/config/game-settings";
import type { TrackId } from "@/lib/config/tracks";
import { GAME_SETTINGS } from "@/lib/config/game-settings";
import { cn } from "@/lib/utils";

// ─── BUBBLE POP ───
const BUBBLE_COUNT = 10;

function BubblePop({ correct, id }: { correct: boolean; id: number }) {
  const color = correct ? "var(--cyber-green)" : "var(--cyber-red)";
  const bubbles = Array.from({ length: BUBBLE_COUNT }, (_, i) => ({
    i,
    left: 10 + ((i * 8 + id * 3) % 80),
    size: 7 + (i % 4) * 5,
    delay: (i % 5) * 0.06,
    rise: 120 + (i % 3) * 60,
    drift: ((i % 5) - 2) * 40,
  }));

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {bubbles.map((b) => (
        <motion.div
          key={b.i}
          className="absolute rounded-full"
          style={{
            bottom: "40%",
            left: `${b.left}%`,
            width: b.size,
            height: b.size,
            background: color,
            boxShadow: `0 0 ${b.size * 1.5}px ${color}, 0 0 ${b.size * 3}px ${color}55`,
          }}
          initial={{ y: 0, x: 0, opacity: 1, scale: 0.4 }}
          animate={{ y: -b.rise, x: b.drift, opacity: 0, scale: [0.4, 1.3, 0.7] }}
          transition={{ duration: 0.65 + b.delay, delay: b.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

const MODE_META: Record<string, { label: string; emoji: string; desc: string; xp: string; color: string }> = {
  solo_practice:   { label: "Solo Practice",    emoji: "⚔️",  desc: "Train privately at your own pace",         xp: "1.0×", color: "cyan" },
  duel:            { label: "1v1 Duel",          emoji: "🥊",  desc: "Challenge another student in real time",    xp: "1.3×", color: "purple" },
  battle_royale:   { label: "Battle Royale",     emoji: "🏆",  desc: "Last ninja standing wins",                  xp: "1.8×", color: "gold" },
  daily_challenge: { label: "Daily Challenge",   emoji: "🎯",  desc: "Today's timed challenge — one attempt",     xp: "1.5×", color: "green" },
  weak_area_focus: { label: "Weak Area Grind",   emoji: "🔥",  desc: "Targeted questions on your weak subjects",  xp: "1.2×", color: "red" },
  flashcard_review:{ label: "Flashcard Review",  emoji: "📚",  desc: "Spaced repetition learning",                xp: "0.8×", color: "cyan" },
  exam_simulation: { label: "Exam Simulation",   emoji: "📝",  desc: "Full mock exam under timed conditions",     xp: "1.5×", color: "purple" },
};

const DIFF_META: Record<string, { label: string; color: string; desc: string }> = {
  easy:   { label: "Rookie",   color: "text-green-400",          desc: "Foundation concepts" },
  medium: { label: "Counsel",  color: "neon-text-cyan",          desc: "Standard bar questions" },
  hard:   { label: "Silk",     color: "text-cyber-purple",       desc: "Senior advocate level" },
  expert: { label: "Legend",   color: "text-cyber-gold",         desc: "Supreme court material" },
};

const SOURCE_OPTIONS = [
  { id: "mixed", label: "Mixed",      emoji: "🎲", color: "purple", desc: "Both pools" },
  { id: "past",  label: "Past Exams", emoji: "📚", color: "gold",   desc: "Real exam questions" },
  { id: "ai",    label: "AI Gen",     emoji: "🤖", color: "cyan",   desc: "From study materials" },
] as const;

function QuizContent() {
  const router = useRouter();
  const params = useSearchParams();
  const mode       = (params.get("mode")       ?? "solo_practice") as GameModeId;
  const track      = (params.get("track")      ?? "law_school_track") as TrackId;
  const subject    = params.get("subject")     ?? "";
  const difficulty = (params.get("difficulty") ?? "medium") as Difficulty;
  const count      = parseInt(params.get("count") ?? "5");
  const timeMins   = parseInt(params.get("time")  ?? "15");

  const [phase, setPhase]                   = useState<"setup" | "loading" | "active" | "finished">("setup");
  const [selectedCount, setSelectedCount]   = useState(count);
  const [selectedTime, setSelectedTime]     = useState(timeMins);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(difficulty);
  const [selectedSubject, setSelectedSubject]       = useState(subject);
  const [currentQuestion, setCurrentQuestion]       = useState<Question | null>(null);
  const [questionIndex, setQuestionIndex]           = useState(0);
  const [xpPopup, setXpPopup]               = useState<{ xp: number; correct: boolean } | null>(null);
  const [bubblePop, setBubblePop]           = useState<{ correct: boolean; id: number } | null>(null);
  const [countdown, setCountdown]           = useState<number | null>(null);
  const nextActionRef                        = useRef<(() => Promise<void>) | null>(null);
  const [sessionId, setSessionId]           = useState<string | null>(null);
  const [loadError, setLoadError]           = useState<string | null>(null);
  const [isRevealing, setIsRevealing]       = useState(false);
  const [offlineQueue, setOfflineQueue]     = useState<Question[]>([]);
  const [isOffline, setIsOffline]           = useState(false);
  const [combo, setCombo]                   = useState(0);
  const [dailyBlocked, setDailyBlocked]     = useState(false);
  const [selectedSource, setSelectedSource] = useState<string>("mixed");

  const game = useGameStore();
  const user = useUserStore();
  const guest = useGuestStore();
  const isGuest = guest.is_guest || !user.uid;

  // Detect mode-specific constraints on mount
  useEffect(() => {
    // Daily challenge: one attempt per day per user
    if (mode === "daily_challenge" && !isGuest) {
      const key = `daily_challenge_${user.uid}_${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) setDailyBlocked(true);
    }
    // Weak area focus: pre-select first weak area
    if (mode === "weak_area_focus" && user.weak_areas.length > 0) {
      setSelectedSubject(user.weak_areas[0]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Countdown tick — fires nextAction when it hits 0
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      nextActionRef.current?.();
      nextActionRef.current = null;
      setCountdown(null);
      return;
    }
    const t = setTimeout(() => setCountdown((c) => (c !== null ? c - 1 : null)), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const skipToNext = () => {
    if (!nextActionRef.current) return;
    nextActionRef.current();
    nextActionRef.current = null;
    setCountdown(null);
  };

  const fetchNextQuestion = useCallback(async (
    subj: string, diff: Difficulty, queue: Question[], queueIndex: number
  ): Promise<{ question: Question | null; fromOffline: boolean }> => {
    try {
      if (isGuest) {
        // Guest: check daily limit first
        const ok = guest.useGuestQuestion();
        if (!ok) {
          setPhase("setup");
          setLoadError(`Daily limit reached (${GUEST_DAILY_LIMIT} questions). Sign up to keep playing!`);
          return { question: null, fromOffline: false };
        }
        const data = await api.guestNextQuestion({ subject: subj || track, track, difficulty: diff, source: selectedSource });
        return { question: data.question as Question, fromOffline: false };
      }
      const data = await api.nextQuestion({ subject: subj || track, track, difficulty: diff, source: selectedSource });
      return { question: data.question as Question, fromOffline: false };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "INSUFFICIENT_BALANCE") {
        router.push("/store");
        return { question: null, fromOffline: false };
      }
      if (msg === "BANK_EMPTY") {
        setPhase("setup");
        setLoadError("No questions have been uploaded for this subject yet. Please check back later or choose a different subject.");
        return { question: null, fromOffline: false };
      }
      const isSpecificSubject = subj && subj !== track;
      if (isSpecificSubject) {
        // Never serve cross-subject fallbacks for specific subject mode
        setPhase("setup");
        setLoadError("Could not load questions for this subject. Check your connection and try again.");
        return { question: null, fromOffline: false };
      }
      // General (track) mode — use offline fallback pool
      const q = queue[queueIndex] ?? null;
      if (!q) {
        setPhase("setup");
        setLoadError("No questions available. Check your connection and try again.");
        return { question: null, fromOffline: false };
      }
      return { question: q, fromOffline: true };
    }
  }, [track, router, isGuest, guest, selectedSource]);

  const startGame = async () => {
    // Daily challenge: enforce one attempt per day
    if (mode === "daily_challenge" && !isGuest) {
      const key = `daily_challenge_${user.uid}_${new Date().toISOString().slice(0, 10)}`;
      if (localStorage.getItem(key)) {
        setLoadError("You've already completed today's challenge. Come back tomorrow!");
        return;
      }
    }
    // Weak area focus: require at least one weak area
    if (mode === "weak_area_focus" && user.weak_areas.length === 0 && !isGuest) {
      setLoadError("No weak areas detected yet — play more games to identify topics you need to review.");
      return;
    }
    if (isGuest) {
      guest.resetIfNewDay();
      const remaining = GUEST_DAILY_LIMIT - guest.daily_questions_used;
      if (remaining <= 0) {
        setLoadError(`Daily limit reached (${GUEST_DAILY_LIMIT} questions). Sign up to keep playing!`);
        return;
      }
    }
    setPhase("loading");
    setLoadError(null);
    const queue = getFallbackQuestions(selectedSubject || track, selectedDifficulty, selectedCount);
    setOfflineQueue(queue);
    let sid: string | null = null;
    if (!isGuest) {
      try {
        const res = await api.startSession({
          mode, track, subject: selectedSubject || undefined,
          difficulty: selectedDifficulty, time_limit_mins: selectedTime, question_count: selectedCount,
        });
        sid = res.session_id;
        setSessionId(sid);
      } catch { /* offline */ }
    }
    game.startSession({ mode, track, subject: selectedSubject, difficulty: selectedDifficulty, time_limit_minutes: selectedTime, question_count: selectedCount });
    const { question: q, fromOffline } = await fetchNextQuestion(selectedSubject || track, selectedDifficulty, queue, 0);
    if (!q) { setPhase("setup"); return; }
    setIsOffline(fromOffline);
    setCurrentQuestion(q);
    setQuestionIndex(0);
    setCombo(0);
    setPhase("active");
  };

  const handleAnswer = async (selected: string, answerTimeTakenMs?: number) => {
    if (!currentQuestion || isRevealing) return;
    setIsRevealing(true);

    let correctOption: "A" | "B" | "C" | "D" | undefined;
    let explanation: string | null = null;

    // Reveal for all users (guests get correct_option + explanation too)
    if (!isOffline) {
      try {
        const revealed = isGuest
          ? await api.guestRevealAnswer(currentQuestion.id)
          : await api.revealAnswer(currentQuestion.id);
        correctOption = revealed.correct_option as "A" | "B" | "C" | "D";
        explanation  = revealed.explanation ?? null;
      } catch { /* fall through — correctOption stays undefined */ }
    }

    // Push correct_option + explanation back onto currentQuestion so QuestionCard re-renders
    if (correctOption) {
      const updated: Question = {
        ...currentQuestion,
        correct_option: correctOption,
        ...(explanation ? { explanation } : {}),
      };
      setCurrentQuestion(updated);
      game.setQuestionCorrectOption(currentQuestion.id, correctOption);
      if (explanation) game.setQuestionExplanation(currentQuestion.id, explanation);
    }

    const timeTakenMs = answerTimeTakenMs ?? 15000;
    const correct = selected === correctOption;
    const { xp_gained } = game.submitAnswer(selected, timeTakenMs);
    if (!isGuest) {
      user.recordAnswer(correct);
      user.addXP(xp_gained);
    }
    if (correct) setCombo((c) => c + 1); else setCombo(0);
    if (sessionId && !isOffline && !isGuest) {
      api.submitAnswer({ session_id: sessionId, question_id: currentQuestion.id, selected, correct_option: correctOption ?? selected, time_taken_ms: timeTakenMs, streak: game.streak }).catch(console.error);
    }
    setXpPopup({ xp: xp_gained, correct });
    setTimeout(() => setXpPopup(null), 1400);
    setBubblePop({ correct, id: questionIndex });
    setTimeout(() => setBubblePop(null), 900);
    const nextIndex = questionIndex + 1;
    if (nextIndex >= selectedCount) {
      nextActionRef.current = async () => {
        let endResult: { levelDirection?: "up" | "down" | null; newBadges?: string[] } = {};
        if (sessionId && !isOffline && !isGuest) {
          try {
            const r = await api.endSession(sessionId);
            endResult = { levelDirection: r.levelDirection, newBadges: r.newBadges };
            if (r.newBadges?.length) user.addBadges(r.newBadges);
          } catch { /* offline */ }
        }
        // Mark daily challenge as completed for today
        if (mode === "daily_challenge" && !isGuest && user.uid) {
          const key = `daily_challenge_${user.uid}_${new Date().toISOString().slice(0, 10)}`;
          localStorage.setItem(key, "1");
        }
        game.endSession(endResult);
        router.push("/results");
      };
      setCountdown(20);
      return;
    }
    nextActionRef.current = async () => {
      const { question: q, fromOffline } = await fetchNextQuestion(selectedSubject || track, selectedDifficulty, offlineQueue, nextIndex);
      if (q) { setIsOffline(fromOffline); setCurrentQuestion(q); setQuestionIndex(nextIndex); }
      setIsRevealing(false);
    };
    setCountdown(20);
  };

  const handleTimeUp = async () => {
    if (sessionId) { try { await api.endSession(sessionId); } catch { /* offline */ } }
    game.endSession();
    router.push("/results");
  };

  // ─── SETUP SCREEN ───
  if (phase === "setup") {
    const meta = MODE_META[mode] ?? MODE_META.solo_practice;
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 220, damping: 22 }}
          className="cyber-card p-6 w-full max-w-md space-y-5"
        >
          {/* Mode badge */}
          <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--cyber-border)" }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-3xl"
                 style={{ background: `color-mix(in srgb, var(--cyber-${meta.color}) 15%, transparent)`,
                          border: `1px solid color-mix(in srgb, var(--cyber-${meta.color}) 30%, transparent)` }}>
              {meta.emoji}
            </div>
            <div>
              <h1 className="text-xl font-black" style={{ color: `var(--cyber-${meta.color})` }}>{meta.label}</h1>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>{meta.desc}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-xs font-black uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>XP Rate</p>
              <p className="text-lg font-black font-mono" style={{ color: `var(--cyber-${meta.color})` }}>{meta.xp}</p>
            </div>
          </div>

          {isGuest && (
            <div className="rounded-xl p-3 text-xs text-center"
                 style={{ background: "color-mix(in srgb, var(--cyber-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-gold) 25%, transparent)", color: "var(--cyber-gold)" }}>
              🥷 Guest Mode — {Math.max(0, GUEST_DAILY_LIMIT - guest.daily_questions_used)} / {GUEST_DAILY_LIMIT} questions left today · Progress not saved
            </div>
          )}

          {/* Daily challenge — already played today */}
          {mode === "daily_challenge" && dailyBlocked && (
            <div className="rounded-xl p-4 text-center space-y-2"
               style={{ color: "var(--cyber-gold)", background: "color-mix(in srgb, var(--cyber-gold) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-gold) 30%, transparent)" }}>
              <p className="text-2xl">🎯</p>
              <p className="text-sm font-black">Daily challenge complete!</p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>You've already taken today's challenge. Come back tomorrow for a fresh set.</p>
            </div>
          )}

          {/* Weak area focus — show target subjects */}
          {mode === "weak_area_focus" && !isGuest && user.weak_areas.length > 0 && (
            <div className="rounded-xl p-3 text-xs"
               style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 8%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 25%, transparent)" }}>
              <p className="font-black mb-1">🔥 Targeting your weak area:</p>
              <p className="font-bold">{user.weak_areas[0].replace(/_/g, " ")}</p>
            </div>
          )}

          {loadError && (
            <div className="rounded-xl p-3 text-xs text-center space-y-2"
               style={{ color: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)", border: "1px solid color-mix(in srgb, var(--cyber-red) 30%, transparent)" }}>
              <p>{loadError}</p>
              {loadError.includes("limit") && (
                <NeonButton variant="cyan" size="sm" onClick={() => router.push("/auth/sign-up")}>
                  Sign Up Free
                </NeonButton>
              )}
            </div>
          )}

          {/* Difficulty */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black mb-2" style={{ color: "var(--text-muted)" }}>Difficulty</p>
            <div className="grid grid-cols-4 gap-2">
              {GAME_SETTINGS.difficulty_levels.map((d) => {
                const dm = DIFF_META[d];
                return (
                  <button key={d} onClick={() => setSelectedDifficulty(d)}
                    className={cn(
                      "py-2.5 rounded-xl text-xs font-bold border transition-all capitalize flex flex-col items-center gap-0.5",
                      selectedDifficulty === d
                        ? "border-cyber-cyan bg-cyber-cyan/10 shadow-neon-cyan"
                        : "border-cyber-border hover:border-cyber-cyan/50"
                    )}
                    style={{ color: selectedDifficulty === d ? "var(--cyber-cyan)" : "var(--text-muted)" }}
                  >
                    <span>{dm?.label ?? d}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Question Source */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black mb-2" style={{ color: "var(--text-muted)" }}>Question Source</p>
            <div className="grid grid-cols-3 gap-2">
              {SOURCE_OPTIONS.map((s) => (
                <button key={s.id} onClick={() => setSelectedSource(s.id)}
                  className={cn(
                    "py-3 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1",
                    selectedSource === s.id
                      ? `border-cyber-${s.color} bg-cyber-${s.color}/10 shadow-neon-${s.color}`
                      : "border-cyber-border hover:border-cyber-cyan/50"
                  )}
                  style={{ color: selectedSource === s.id ? `var(--cyber-${s.color})` : "var(--text-muted)" }}
                >
                  <span className="text-lg">{s.emoji}</span>
                  <span>{s.label}</span>
                  <span className="text-[9px] opacity-60">{s.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question count */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black mb-2" style={{ color: "var(--text-muted)" }}>Questions</p>
            <div className="grid grid-cols-4 gap-2">
              {GAME_SETTINGS.question_counts.map((c) => (
                <button key={c} onClick={() => setSelectedCount(c)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-black border transition-all",
                    selectedCount === c
                      ? "border-cyber-cyan text-cyber-cyan shadow-neon-cyan bg-cyber-cyan/10"
                      : "border-cyber-border hover:border-cyber-cyan/50"
                  )}
                  style={{ color: selectedCount === c ? "var(--cyber-cyan)" : "var(--text-muted)" }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* Time limit */}
          <div>
            <p className="text-[10px] uppercase tracking-widest font-black mb-2" style={{ color: "var(--text-muted)" }}>Time Limit</p>
            <div className="grid grid-cols-3 gap-2">
              {[10, 15, 20, 30, 45, 60].map((t) => (
                <button key={t} onClick={() => setSelectedTime(t)}
                  className={cn(
                    "py-2.5 rounded-xl text-sm font-black border transition-all",
                    selectedTime === t
                      ? "border-cyber-purple text-cyber-purple shadow-neon-purple bg-cyber-purple/10"
                      : "border-cyber-border hover:border-cyber-purple/50"
                  )}
                  style={{ color: selectedTime === t ? "var(--cyber-purple)" : "var(--text-muted)" }}
                >
                  {t}m
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <NeonButton variant={meta.color as any} fullWidth size="lg" onClick={startGame}>
              {meta.emoji} Enter Battle
            </NeonButton>
            <NeonButton variant="ghost" fullWidth onClick={() => router.back()}>
              Cancel
            </NeonButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── LOADING ───
  if (phase === "loading") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <motion.div
          animate={{ rotate: 360, scale: [1, 1.15, 1] }}
          transition={{ rotate: { repeat: Infinity, duration: 1.2, ease: "linear" }, scale: { repeat: Infinity, duration: 0.8 } }}
          className="text-6xl"
        >⚔️</motion.div>
        <div className="text-center space-y-1">
          <p className="font-black text-sm uppercase tracking-widest neon-text-cyan">
            Preparing Battle
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>Loading {selectedCount} questions...</p>
        </div>
        {/* Loading bar */}
        <div className="w-48 h-1.5 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
          <motion.div
            className="h-full rounded-full bg-gradient-xp"
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />
        </div>
      </div>
    );
  }

  // ─── ACTIVE ───
  if (phase === "active" && currentQuestion) {
    return (
      <div className="min-h-screen px-4 py-5">
        {/* Top HUD */}
        <div className="max-w-2xl mx-auto flex items-center justify-between mb-5 gap-3">
          {/* Streak + combo */}
          <div className="flex items-center gap-2">
            <StreakCounter streak={game.streak} size="sm" />
            {combo >= 3 && (
              <motion.div
                key={combo}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider"
                style={{ background: "linear-gradient(135deg, var(--cyber-gold), var(--cyber-red))", color: "#000" }}
              >
                {combo}× Combo 🔥
              </motion.div>
            )}
            {isOffline && (
              <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold"
                    style={{ color: "var(--text-muted)", borderColor: "var(--cyber-border)" }}>
                offline
              </span>
            )}
          </div>

          {/* Progress */}
          <div className="flex-1 text-center">
            <p className="text-xs font-bold font-mono mb-1" style={{ color: "var(--text-muted)" }}>
              {questionIndex + 1} / {selectedCount}
            </p>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
              <motion.div
                className="h-full rounded-full bg-gradient-xp"
                animate={{ width: `${((questionIndex + 1) / selectedCount) * 100}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
          </div>

          <TimerRing durationSeconds={selectedTime * 60} onExpire={handleTimeUp} size={54} />
        </div>

        {/* Bubble pop */}
        <AnimatePresence>
          {bubblePop && (
            <BubblePop key={bubblePop.id} correct={bubblePop.correct} id={bubblePop.id} />
          )}
        </AnimatePresence>

        {/* XP popup */}
        <AnimatePresence>
          {xpPopup && (
            <motion.div
              initial={{ y: 0, opacity: 1, scale: 0.8 }}
              animate={{ y: -50, opacity: 0, scale: 1.2 }}
              exit={{ opacity: 0 }}
              className="fixed top-20 right-6 font-black text-xl pointer-events-none z-50 font-mono"
              style={{ color: xpPopup.correct ? "var(--cyber-green)" : "var(--cyber-red)" }}
            >
              {xpPopup.correct ? `+${xpPopup.xp} XP ⚡` : "-3 ☠️"}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Combo burst */}
        <AnimatePresence>
          {combo > 0 && combo % 5 === 0 && (
            <motion.div
              key={`burst-${combo}`}
              initial={{ scale: 0.5, opacity: 1 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 pointer-events-none flex items-center justify-center z-40"
            >
              <div className="text-6xl">⚡</div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            questionNumber={questionIndex + 1}
            total={selectedCount}
            onAnswer={handleAnswer}
            disabled={isRevealing}
            isGuest={isGuest}
          />
        </AnimatePresence>

        {/* Countdown bar + Skip button */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="max-w-2xl mx-auto mt-4 px-1 space-y-2"
            >
              {/* Bar track */}
              <div className="relative h-2 rounded-full overflow-hidden" style={{ background: "var(--cyber-border)" }}>
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: "linear-gradient(90deg, var(--cyber-cyan), var(--cyber-purple))" }}
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: countdown, ease: "linear" }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono" style={{ color: "var(--text-muted)" }}>
                  Next in <span className="neon-text-cyan">{countdown}s</span>
                </span>
                <button
                  onClick={skipToNext}
                  className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all hover:shadow-neon-cyan"
                  style={{
                    color: "var(--cyber-cyan)",
                    borderColor: "color-mix(in srgb, var(--cyber-cyan) 40%, transparent)",
                    background: "color-mix(in srgb, var(--cyber-cyan) 8%, transparent)",
                  }}
                >
                  Next →
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loadError && (
          <p className="text-center text-xs mt-4" style={{ color: "var(--cyber-red)" }}>{loadError}</p>
        )}
      </div>
    );
  }

  return null;
}

export default function QuizPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center neon-text-cyan font-black animate-pulse">
        Loading battle...
      </div>
    }>
      <QuizContent />
    </Suspense>
  );
}

"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/lib/store/user-store";
import { motion, AnimatePresence } from "framer-motion";
import { useGameStore } from "@/lib/store/game-store";
import { api } from "@/lib/api/client";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

interface ReviewItem {
  question: string;
  subject: string;
  options: { A: string; B: string; C: string; D: string };
  your_answer: string;
  correct_answer: "A" | "B" | "C" | "D";
  explanation: string | null;
  loadingExplanation: boolean;
}

function ReviewCard({ item, index, onFetchExplanation, isGuest }: {
  item: ReviewItem;
  index: number;
  onFetchExplanation: (i: number) => void;
  isGuest: boolean;
}) {
  const [open, setOpen] = useState(false);
  const OPTION_KEYS = ["A", "B", "C", "D"] as const;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="cyber-card p-5 space-y-4"
    >
      {/* Subject badge + number */}
      <div className="flex items-center justify-between">
        <span
          className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full"
          style={{
            color: "var(--cyber-red)",
            background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)",
            border: "1px solid color-mix(in srgb, var(--cyber-red) 25%, transparent)",
          }}
        >
          {item.subject.replace(/_/g, " ")}
        </span>
        <span className="text-xs font-bold font-mono" style={{ color: "var(--text-muted)" }}>
          #{index + 1}
        </span>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold leading-snug" style={{ color: "var(--text-base)" }}>
        {item.question}
      </p>

      {/* Options */}
      <div className="grid gap-2">
        {OPTION_KEYS.map((key) => {
          const isCorrect = key === item.correct_answer;
          const isWrong   = key === item.your_answer && !isCorrect;
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl border text-xs font-medium",
                isCorrect && "border-cyber-green bg-cyber-green/10",
                isWrong   && "border-cyber-red bg-cyber-red/10 opacity-80",
                !isCorrect && !isWrong && "border-cyber-border opacity-40"
              )}
              style={{ color: isCorrect ? "var(--cyber-green)" : isWrong ? "var(--cyber-red)" : "var(--text-muted)" }}
            >
              <span
                className="w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-black shrink-0"
                style={{
                  borderColor: isCorrect ? "var(--cyber-green)" : isWrong ? "var(--cyber-red)" : "var(--cyber-border)",
                }}
              >
                {key}
              </span>
              <span className="flex-1">{item.options[key]}</span>
              {isCorrect && <span className="shrink-0">✅</span>}
              {isWrong   && <span className="shrink-0">❌ Your answer</span>}
            </div>
          );
        })}
      </div>

      {/* Explanation section */}
      {isGuest ? (
        <div
          className="rounded-xl p-4 text-center space-y-2"
          style={{
            background: "color-mix(in srgb, var(--cyber-purple) 8%, var(--cyber-card-bg))",
            border: "1px solid color-mix(in srgb, var(--cyber-purple) 35%, transparent)",
          }}
        >
          <p className="text-sm font-black" style={{ color: "var(--cyber-purple)" }}>
            ⚖️ Why did you get this wrong?
          </p>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            Log in to unlock AI-powered legal explanations with case references and statute citations.
          </p>
          <div className="flex gap-2 justify-center pt-1">
            <a href="/auth/sign-in"
              className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all"
              style={{ color: "var(--cyber-cyan)", borderColor: "color-mix(in srgb, var(--cyber-cyan) 40%, transparent)", background: "color-mix(in srgb, var(--cyber-cyan) 8%, transparent)" }}>
              Sign In
            </a>
            <a href="/auth/sign-up"
              className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all"
              style={{ color: "var(--cyber-purple)", borderColor: "color-mix(in srgb, var(--cyber-purple) 40%, transparent)", background: "color-mix(in srgb, var(--cyber-purple) 8%, transparent)" }}>
              Sign Up Free
            </a>
          </div>
        </div>
      ) : (
        <div>
          <button
            onClick={() => {
              setOpen((o) => !o);
              if (!open && !item.explanation && !item.loadingExplanation) {
                onFetchExplanation(index);
              }
            }}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border transition-all"
            style={{
              background: "color-mix(in srgb, var(--cyber-cyan) 6%, var(--cyber-card-bg))",
              borderColor: "color-mix(in srgb, var(--cyber-cyan) 30%, transparent)",
            }}
          >
            <span className="text-xs font-black uppercase tracking-wider neon-text-cyan">
              ⚖️ Legal Explanation
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} className="text-xs" style={{ color: "var(--cyber-cyan)" }}>
              ▼
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="px-4 py-3 text-sm rounded-b-xl"
                  style={{
                    background: "color-mix(in srgb, var(--cyber-cyan) 4%, var(--cyber-card-bg))",
                    borderLeft: "3px solid var(--cyber-cyan)",
                    borderRight: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                    borderBottom: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                  }}
                >
                  {item.loadingExplanation ? (
                    <div className="flex items-center gap-2 py-1">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}>⚖️</motion.span>
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>Consulting case law...</span>
                    </div>
                  ) : (
                    <p style={{ color: "var(--text-base)" }}>
                      {item.explanation ?? "Explanation unavailable — check your internet connection and try again."}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

function ReviewContent() {
  const router = useRouter();
  const game = useGameStore();
  const uid = useUserStore((s) => s.uid);
  const isGuest = !uid;
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [retrySubject, setRetrySubject] = useState<string>("");

  useEffect(() => {
    if (game.status !== "finished") {
      router.replace("/dashboard");
      return;
    }
    const wrongAnswers = game.answers.filter((a) => !a.correct);
    const built: ReviewItem[] = wrongAnswers.map((a) => {
      const q = game.questions.find((q) => q.id === a.question_id);
      return {
        question: q?.question ?? "Unknown question",
        subject: q?.subject ?? "unknown",
        options: q?.options ?? { A: "", B: "", C: "", D: "" },
        your_answer: a.selected,
        correct_answer: q?.correct_option ?? "A",
        explanation: q?.explanation ?? null,
        loadingExplanation: false,
      };
    });
    setItems(built);
    // Get the first unique subject from failed questions
    const subjects = [...new Set(wrongAnswers.map((a) => game.questions.find((q) => q.id === a.question_id)?.subject).filter(Boolean))];
    setRetrySubject(subjects[0] ?? "");
  }, [game.status, game.answers, game.questions, router]);

  const fetchExplanation = async (i: number) => {
    const item = items[i];
    if (!item || item.explanation || item.loadingExplanation) return;
    setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, loadingExplanation: true } : it));
    try {
      const res = await api.getExplanation({
        question: item.question,
        wrong_answer: item.options[item.your_answer as "A" | "B" | "C" | "D"] ?? "",
        correct_answer: item.options[item.correct_answer],
        subject: item.subject,
      });
      setItems((prev) => prev.map((it, idx) => idx === i ? { ...it, explanation: res.explanation, loadingExplanation: false } : it));
    } catch {
      setItems((prev) => prev.map((it, idx) => idx === i ? {
        ...it,
        explanation: "Explanation unavailable — check your internet connection and try again.",
        loadingExplanation: false,
      } : it));
    }
  };

  const retrySubjects = [...new Set(items.map((it) => it.subject))];

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      <div className="max-w-lg mx-auto space-y-5">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-1"
        >
          <div className="text-4xl">🔍</div>
          <h1 className="text-2xl font-black" style={{ color: "var(--cyber-red)" }}>
            Mistake Review
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            {items.length} question{items.length !== 1 ? "s" : ""} to review
          </p>
        </motion.div>

        {/* Review cards */}
        {items.map((item, i) => (
          <ReviewCard
            key={i}
            item={item}
            index={i}
            onFetchExplanation={fetchExplanation}
            isGuest={isGuest}
          />
        ))}

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: items.length * 0.08 + 0.3 }}
          className="space-y-3"
        >
          <NeonButton
            variant="red"
            fullWidth
            size="lg"
            onClick={() => {
              // Preserve game mode and subject when retrying
              const params = new URLSearchParams();
              params.set("mode", game.mode === "exam_simulation" ? "exam_simulation" : "solo_practice");
              params.set("track", game.track);
              params.set("subject", retrySubject);
              params.set("difficulty", game.difficulty);
              // If it was a mock exam with essays, retry with essays only
              if (game.mode === "exam_simulation") {
                params.set("type", "essay");
              }
              router.push(`/quiz?${params.toString()}`);
            }}
          >
            🔁 Retry These Questions
          </NeonButton>
          <NeonButton
            variant="cyan"
            fullWidth
            onClick={() => router.push("/quiz")}
          >
            ⚔️ Continue to Next Session
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

export default function ReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center neon-text-cyan font-black animate-pulse">
        Loading review...
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}

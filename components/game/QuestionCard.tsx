"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Question } from "@/lib/store/game-store";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

const OPTION_KEYS = ["A", "B", "C", "D"] as const;

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  onAnswer: (option: string, timeTakenMs: number) => void;
  disabled?: boolean;
  isGuest?: boolean;
}

export function QuestionCard({ question, questionNumber, total, onAnswer, disabled, isGuest }: Props) {
  const [selected, setSelected]               = useState<string | null>(null);
  const [revealed, setRevealed]               = useState(false);
  const [explanationOpen, setExplanationOpen] = useState(false);
  const [explanation, setExplanation]         = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const questionStartRef = useRef<number>(Date.now());

  // Sync explanation from parent once the reveal comes back (question prop updates)
  useEffect(() => {
    if (question.explanation) setExplanation(question.explanation);
  }, [question.explanation]);

  // Auto-open explanation panel once the correct option is known and the answer was wrong
  useEffect(() => {
    if (revealed && question.correct_option && selected && selected !== question.correct_option) {
      setExplanationOpen(true);
    }
  }, [question.correct_option, revealed, selected]);

  // correct_option is undefined while waiting for reveal; truthy once parent updates it
  const correctOption = question.correct_option;
  const isChecking = revealed && !correctOption;
  const isWrong    = !isChecking && selected !== null && selected !== correctOption;

  const handleSelect = (key: string) => {
    if (disabled || selected) return;
    const timeTakenMs = Date.now() - questionStartRef.current;
    setSelected(key);
    setRevealed(true);
    // Call parent immediately — parent does the reveal API call and updates question prop
    setTimeout(() => onAnswer(key, timeTakenMs), 300);
  };

  const fetchExplanation = async () => {
    if (explanation || loadingExplanation || !correctOption) return;
    setLoadingExplanation(true);
    try {
      const res = await api.getExplanation({
        question:      question.question,
        wrong_answer:  question.options[selected as "A" | "B" | "C" | "D"] ?? "",
        correct_answer: question.options[correctOption],
        subject:       question.subject,
      });
      setExplanation(res.explanation);
    } catch {
      setExplanation("Explanation unavailable — check your internet connection and try again.");
    } finally {
      setLoadingExplanation(false);
    }
  };

  const toggleExplanation = () => {
    const next = !explanationOpen;
    setExplanationOpen(next);
    if (next && !explanation && !loadingExplanation) fetchExplanation();
  };

  const getOptionStyle = (key: string): React.CSSProperties => {
    if (!revealed) return {};
    // Waiting for server reveal — pulse the selected option cyan, dim others
    if (isChecking) {
      if (key === selected) return { borderColor: "var(--cyber-cyan)", background: "color-mix(in srgb, var(--cyber-cyan) 10%, transparent)" };
      return { opacity: 0.3 };
    }
    if (key === correctOption)
      return { borderColor: "var(--cyber-green)", background: "color-mix(in srgb, var(--cyber-green) 12%, transparent)", boxShadow: "0 0 16px color-mix(in srgb, var(--cyber-green) 30%, transparent)" };
    if (key === selected)
      return { borderColor: "var(--cyber-red)", background: "color-mix(in srgb, var(--cyber-red) 12%, transparent)", boxShadow: "0 0 16px color-mix(in srgb, var(--cyber-red) 30%, transparent)" };
    return { opacity: 0.35 };
  };

  const getOptionClass = (key: string) => {
    if (!revealed || isChecking) return revealed ? "" : "border-cyber-border hover:border-cyber-cyan hover:shadow-neon-cyan";
    if (key === correctOption) return "animate-slash-in";
    if (key === selected) return "animate-burst";
    return "";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="cyber-card p-6 w-full max-w-2xl mx-auto space-y-5"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
              style={{
                color: "var(--cyber-cyan)",
                background: "color-mix(in srgb, var(--cyber-cyan) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--cyber-cyan) 25%, transparent)",
              }}>
          {question.subject.replace(/_/g, " ")}
        </span>
        <span className="text-xs font-bold font-mono" style={{ color: "var(--text-muted)" }}>
          {questionNumber} / {total}
        </span>
      </div>

      {/* Passage block */}
      {question.passage && (
        <div className="p-4 rounded-lg text-xs leading-relaxed"
             style={{ background: "color-mix(in srgb, var(--cyber-cyan) 6%, transparent)",
                      border: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                      color: "var(--text-muted)" }}>
          <p className="text-[9px] font-black uppercase tracking-widest mb-3"
             style={{ color: "var(--cyber-cyan)" }}>📄 Read the passage</p>
          <p className="whitespace-pre-wrap">{question.passage}</p>
        </div>
      )}

      {/* Question text */}
      <p className="text-lg font-semibold leading-snug" style={{ color: "var(--text-base)" }}>
        {question.question}
      </p>

      {/* Options */}
      <div className="grid gap-3">
        {OPTION_KEYS.map((key) => (
          <motion.button
            key={key}
            whileHover={!selected ? { scale: 1.015 } : {}}
            whileTap={!selected ? { scale: 0.99 } : {}}
            onClick={() => handleSelect(key)}
            disabled={!!selected || disabled}
            className={cn(
              "w-full text-left px-4 py-3.5 rounded-xl border transition-all duration-200",
              "font-medium text-sm flex items-center gap-3",
              "disabled:cursor-not-allowed",
              getOptionClass(key)
            )}
            style={{
              borderColor: revealed ? undefined : "var(--cyber-border)",
              color: "var(--text-base)",
              ...getOptionStyle(key),
            }}
          >
            {/* Key badge */}
            <span
              className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black shrink-0 transition-all"
              style={{
                borderColor: !isChecking && revealed && key === correctOption  ? "var(--cyber-green)"
                           : !isChecking && revealed && key === selected       ? "var(--cyber-red)"
                           : isChecking  && key === selected                   ? "var(--cyber-cyan)"
                           : "var(--cyber-border)",
                color:       !isChecking && revealed && key === correctOption  ? "var(--cyber-green)"
                           : !isChecking && revealed && key === selected       ? "var(--cyber-red)"
                           : isChecking  && key === selected                   ? "var(--cyber-cyan)"
                           : "var(--text-muted)",
              }}
            >
              {key}
            </span>
            <span>{question.options[key]}</span>

            {/* Checking spinner on selected option */}
            {isChecking && key === selected && (
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                className="ml-auto text-base">⚖️</motion.span>
            )}
            {!isChecking && revealed && key === correctOption && (
              <span className="ml-auto text-base">✅</span>
            )}
            {!isChecking && revealed && key === selected && key !== correctOption && (
              <span className="ml-auto text-base">❌</span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Explanation panel — only shown when wrong */}
      <AnimatePresence>
        {revealed && isWrong && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {/* Guest — login CTA instead of explanation */}
            {isGuest ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
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
                  <a
                    href="/auth/sign-in"
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all"
                    style={{
                      color: "var(--cyber-cyan)",
                      borderColor: "color-mix(in srgb, var(--cyber-cyan) 40%, transparent)",
                      background: "color-mix(in srgb, var(--cyber-cyan) 8%, transparent)",
                    }}
                  >
                    Sign In
                  </a>
                  <a
                    href="/auth/sign-up"
                    className="px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all"
                    style={{
                      color: "var(--cyber-purple)",
                      borderColor: "color-mix(in srgb, var(--cyber-purple) 40%, transparent)",
                      background: "color-mix(in srgb, var(--cyber-purple) 8%, transparent)",
                    }}
                  >
                    Sign Up Free
                  </a>
                </div>
              </motion.div>
            ) : (
              <>
                {/* Tap-to-expand toggle for logged-in users */}
                <button
                  onClick={toggleExplanation}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl border transition-all"
                  style={{
                    background: "color-mix(in srgb, var(--cyber-cyan) 6%, var(--cyber-card-bg))",
                    borderColor: "color-mix(in srgb, var(--cyber-cyan) 30%, transparent)",
                  }}
                >
                  <span className="text-xs font-black uppercase tracking-wider neon-text-cyan">
                    ⚖️ Legal Explanation
                  </span>
                  <motion.span
                    animate={{ rotate: explanationOpen ? 180 : 0 }}
                    className="text-xs font-black"
                    style={{ color: "var(--cyber-cyan)" }}
                  >
                    ▼
                  </motion.span>
                </button>

                <AnimatePresence>
                  {explanationOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div
                        className="px-4 py-3 rounded-b-xl text-sm"
                        style={{
                          background: "color-mix(in srgb, var(--cyber-cyan) 4%, var(--cyber-card-bg))",
                          borderLeft: "3px solid var(--cyber-cyan)",
                          borderRight: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                          borderBottom: "1px solid color-mix(in srgb, var(--cyber-cyan) 20%, transparent)",
                        }}
                      >
                        {loadingExplanation ? (
                          <div className="flex items-center gap-2 py-1">
                            <motion.span
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                              className="text-base"
                            >⚖️</motion.span>
                            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                              Consulting case law...
                            </span>
                          </div>
                        ) : (
                          <p style={{ color: "var(--text-base)" }}>
                            {explanation ?? "Explanation unavailable — check your internet connection and try again."}
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

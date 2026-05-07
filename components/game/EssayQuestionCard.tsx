"use client";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import type { Question } from "@/lib/store/game-store";
import { NeonButton } from "@/components/ui/NeonButton";

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  onAnswer: (text: string, timeTakenMs: number) => void;
  disabled?: boolean;
}

export function EssayQuestionCard({ question, questionNumber, total, onAnswer, disabled }: Props) {
  const [text, setText] = useState("");
  const startTimeRef = useRef(Date.now());

  useEffect(() => {
    startTimeRef.current = Date.now();
  }, [question.id]);

  const charCount = text.trim().length;
  const minChars = 30;
  const maxChars = 5000;
  const isValid = charCount >= minChars && charCount <= maxChars && !disabled;

  const handleSubmit = () => {
    if (!isValid) return;
    onAnswer(text.trim(), Date.now() - startTimeRef.current);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      className="cyber-card p-6 w-full max-w-2xl mx-auto space-y-5"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-black uppercase tracking-widest px-2 py-1 rounded-full"
              style={{
                color: "var(--cyber-purple)",
                background: "color-mix(in srgb, var(--cyber-purple) 12%, transparent)",
                border: "1px solid color-mix(in srgb, var(--cyber-purple) 25%, transparent)",
              }}>
          {question.subject.replace(/_/g, " ")} — ESSAY
        </span>
        <span className="text-xs font-bold font-mono" style={{ color: "var(--text-muted)" }}>
          {questionNumber} / {total}
        </span>
      </div>

      <p className="text-lg font-semibold leading-snug" style={{ color: "var(--text-base)" }}>
        {question.question}
      </p>

      <div className="space-y-3">
        <label className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>
          Your Response
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={disabled}
          maxLength={maxChars}
          placeholder="Type your legal analysis here... cite relevant cases or statutes if applicable."
          className="w-full h-64 bg-transparent border border-cyber-border rounded-xl p-4 text-sm focus:outline-none focus:border-cyber-purple transition-all resize-none"
          style={{ color: "var(--text-base)" }}
        />
        <div className="flex justify-between items-center text-[10px] font-mono" style={{ color: "var(--text-muted)" }}>
          <span style={{ color: charCount < minChars && text.trim() ? "var(--cyber-red)" : "var(--text-muted)" }}>
            {charCount < minChars && text.trim() ? `${minChars - charCount} more characters` : `${charCount} characters`}
          </span>
          <span>{maxChars - charCount} remaining</span>
        </div>
      </div>

      <NeonButton
        variant="purple"
        fullWidth
        size="lg"
        onClick={handleSubmit}
        disabled={!isValid}
        title={charCount < minChars ? `Minimum ${minChars} characters required` : charCount > maxChars ? `Maximum ${maxChars} characters allowed` : ""}
      >
        {disabled && text.trim().length > 0 ? "Grading…" : charCount < minChars ? `Submit Response (${minChars - charCount} more)` : "Submit Response"}
      </NeonButton>
    </motion.div>
  );
}

import { create } from "zustand";
import type { Difficulty, GameModeId } from "@/lib/config/game-settings";
import type { TrackId } from "@/lib/config/tracks";

export interface Question {
  id: string;
  type?: "mcq" | "essay";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  model_answer?: string;
  rubric?: string;
  difficulty: Difficulty;
  subject: string;
  topic: string;
  passage?: string;
  explanation?: string;
}

export interface GameSession {
  mode: GameModeId | "exam_simulation";
  track: TrackId;
  subject: string;
  difficulty: Difficulty;
  time_limit_minutes: number;
  question_count: number;
  questions: Question[];
  current_index: number;
  answers: Array<{
    question_id: string;
    selected: string;
    correct: boolean;
    time_taken_ms: number;
    score?: number;
    feedback?: string;
    strengths?: string[];
    weaknesses?: string[];
  }>;
  score: number;
  streak: number;
  xp_earned: number;
  started_at: number;
  ended_at: number | null;
  status: "idle" | "lobby" | "active" | "finished";
  level_direction: "up" | "down" | null;
  new_badges: string[];
}

interface GameActions {
  startSession: (config: Omit<GameSession, "questions" | "current_index" | "answers" | "score" | "streak" | "xp_earned" | "started_at" | "ended_at" | "status" | "level_direction" | "new_badges">) => void;
  setQuestions: (questions: Question[]) => void;
  submitAnswer: (selected: string, time_taken_ms: number) => { correct: boolean; xp_gained: number };
  endSession: (result?: { levelDirection?: "up" | "down" | null; newBadges?: string[]; answers?: Array<{question_id: string; selected: string; correct: boolean; time_taken_ms: number; score?: number; feedback?: string; strengths?: string[]; weaknesses?: string[]; xp_gained: number}> }) => void;
  resetSession: () => void;
  setQuestionExplanation: (question_id: string, explanation: string) => void;
  setQuestionCorrectOption: (question_id: string, correct_option: string) => void;
}

const DEFAULT_SESSION: GameSession = {
  mode: "solo_practice",
  track: "law_school_track",
  subject: "",
  difficulty: "medium",
  time_limit_minutes: 15,
  question_count: 10,
  questions: [],
  current_index: 0,
  answers: [],
  score: 0,
  streak: 0,
  xp_earned: 0,
  started_at: 0,
  ended_at: null,
  status: "idle",
  level_direction: null,
  new_badges: [],
};

export const useGameStore = create<GameSession & GameActions>()((set, get) => ({
  ...DEFAULT_SESSION,

  startSession: (config) =>
    set({ ...DEFAULT_SESSION, ...config, started_at: Date.now(), status: "lobby" }),

  setQuestions: (questions) => set({ questions, status: "active" }),

  submitAnswer: (selected, time_taken_ms) => {
    const s = get();
    const question = s.questions[s.current_index];
    if (!question) return { correct: false, xp_gained: 0 };

    const isEssay = question.type === "essay";
    const correct = isEssay ? true : selected === question.correct_option; // Essay "correct" is determined by AI at end
    
    // For Essays, we don't calculate XP/Score immediately on client
    const basePoints = isEssay ? 0 : (correct ? 10 : -3);
    const streakBonus = (!isEssay && correct) ? s.streak * 2 : 0;
    const speedBonus = (!isEssay && correct) ? Math.round(8 * Math.max(0, 1 - time_taken_ms / 30000)) : 0;
    const xp_gained = Math.max(0, basePoints + streakBonus + speedBonus);

    set((prev) => ({
      answers: [
        ...prev.answers,
        { question_id: question.id, selected, correct, time_taken_ms },
      ],
      score: prev.score + basePoints,
      streak: isEssay ? prev.streak : (correct ? prev.streak + 1 : 0),
      xp_earned: prev.xp_earned + xp_gained,
      current_index: prev.current_index + 1,
    }));

    return { correct, xp_gained };
  },

  endSession: (result?) => set({ ended_at: Date.now(), status: "finished", level_direction: result?.levelDirection ?? null, new_badges: result?.newBadges ?? [], answers: result?.answers ?? get().answers }),

  resetSession: () => set(DEFAULT_SESSION),

  setQuestionExplanation: (question_id, explanation) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === question_id ? { ...q, explanation } : q
      ),
    })),

  setQuestionCorrectOption: (question_id, correct_option) =>
    set((s) => ({
      questions: s.questions.map((q) =>
        q.id === question_id ? { ...q, correct_option: correct_option as Question["correct_option"] } : q
      ),
    })),
}));

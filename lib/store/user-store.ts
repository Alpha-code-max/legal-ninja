import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getLevelForXP, getNextLevel, LEVEL_DYNAMICS } from "@/lib/config/progression";

export interface UserState {
  uid: string;
  username: string;
  avatar_url: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  badges: string[];
  country: string;
  track: string;
  role: string;
  law_school?: string;
  university?: string;
  total_questions_answered: number;
  total_correct_answers: number;
  free_questions_remaining: number;
  paid_questions_balance: number;
  earned_questions_balance: number;
  active_passes: ActivePass[];
  weak_areas: string[];
  last_demotion_timestamp: number | null;
  referral_count: number;
  referral_code: string;
  recent_answers: boolean[];
}

export interface ActivePass {
  id: string;
  name: string;
  expires_at: number;
  subject_specific: boolean;
  subject_id?: string;
}

interface UserActions {
  addXP: (amount: number) => void;
  deductQuestion: () => boolean;
  addQuestions: (free: number, paid: number, earned: number) => void;
  recordAnswer: (correct: boolean) => { levelChanged: boolean; direction: "up" | "down" | null };
  resetStreak: () => void;
  addBadge: (badge: string) => void;
  addBadges: (badges: string[]) => void;
  setUser: (user: Partial<UserState>) => void;
  updateUser: (user: Partial<UserState>) => void;
}

const DEFAULT_USER: UserState = {
  uid: "",
  username: "Ninja",
  avatar_url: "",
  xp: 0,
  level: 1,
  current_streak: 0,
  longest_streak: 0,
  badges: [],
  country: "NG",
  track: "law_school_track",
  role: "law_student",
  law_school: "",
  university: "",
  total_questions_answered: 0,
  total_correct_answers: 0,
  free_questions_remaining: 100,
  paid_questions_balance: 0,
  earned_questions_balance: 0,
  active_passes: [],
  weak_areas: [],
  last_demotion_timestamp: null,
  referral_count: 0,
  referral_code: "",
  recent_answers: [],
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_USER,

      setUser: (user) => set((s) => ({ ...s, ...user })),

      updateUser: (user) => set((s) => ({ ...s, ...user })),

      addXP: (amount) =>
        set((s) => {
          const newXP = s.xp + amount;
          const newLevel = getLevelForXP(newXP, s.total_questions_answered);
          return { xp: newXP, level: newLevel.level };
        }),

      deductQuestion: () => {
        const s = get();
        const now = Date.now();
        const hasActivePass = s.active_passes.some((p) => p.expires_at > now);
        if (hasActivePass) return true;

        if (s.earned_questions_balance > 0) {
          set((s) => ({ earned_questions_balance: s.earned_questions_balance - 1 }));
          return true;
        }
        if (s.paid_questions_balance > 0) {
          set((s) => ({ paid_questions_balance: s.paid_questions_balance - 1 }));
          return true;
        }
        if (s.free_questions_remaining > 0) {
          set((s) => ({ free_questions_remaining: s.free_questions_remaining - 1 }));
          return true;
        }
        return false;
      },

      addQuestions: (free, paid, earned) =>
        set((s) => ({
          free_questions_remaining: s.free_questions_remaining + free,
          paid_questions_balance: s.paid_questions_balance + paid,
          earned_questions_balance: s.earned_questions_balance + earned,
        })),

      recordAnswer: (correct) => {
        const s = get();
        const newTotal = s.total_questions_answered + 1;
        const newCorrect = correct ? s.total_correct_answers + 1 : s.total_correct_answers;
        const newStreak = correct ? s.current_streak + 1 : 0;
        const longest = Math.max(newStreak, s.longest_streak);
        const recentAnswers = [...s.recent_answers.slice(-29), correct];

        const oldLevel = s.level;
        const newXPLevel = getLevelForXP(s.xp, newTotal);

        // Check demotion
        let newLevel: number = newXPLevel.level;
        let direction: "up" | "down" | null = null;

        if (newLevel > oldLevel) {
          direction = "up";
        } else if (newTotal >= LEVEL_DYNAMICS.demotion_accuracy_min_questions) {
          const accuracy = newCorrect / newTotal;
          const recentFailRate =
            recentAnswers.length >= 30
              ? recentAnswers.filter((a) => !a).length / recentAnswers.length
              : 0;
          const cooldownOk =
            !s.last_demotion_timestamp ||
            Date.now() - s.last_demotion_timestamp > LEVEL_DYNAMICS.demotion_cooldown_hours * 3600000;
          const stabilized = s.current_streak >= LEVEL_DYNAMICS.stabilization_correct_streak;

          if (
            !stabilized &&
            cooldownOk &&
            (recentFailRate > LEVEL_DYNAMICS.demotion_failure_rate_threshold ||
              accuracy < LEVEL_DYNAMICS.demotion_accuracy_threshold)
          ) {
            newLevel = Math.max(1, oldLevel - 1);
            direction = "down";
          }
        }

        set({
          total_questions_answered: newTotal,
          total_correct_answers: newCorrect,
          current_streak: correct ? newStreak : 0,
          longest_streak: longest,
          recent_answers: recentAnswers,
          level: newLevel,
          ...(direction === "down" ? { last_demotion_timestamp: Date.now() } : {}),
        });

        return { levelChanged: newLevel !== oldLevel, direction };
      },

      resetStreak: () => set({ current_streak: 0 }),

      addBadge: (badge) =>
        set((s) => ({
          badges: s.badges.includes(badge) ? s.badges : [...s.badges, badge],
        })),

      addBadges: (newBadges) =>
        set((s) => ({
          badges: [...new Set([...s.badges, ...newBadges])],
        })),
    }),
    { name: "legal-ninja-user" }
  )
);

export function getTotalBalance(s: UserState): number {
  return s.free_questions_remaining + s.paid_questions_balance + s.earned_questions_balance;
}

import { create } from "zustand";
import { persist } from "zustand/middleware";

const GUEST_DAILY_LIMIT = 20;

interface GuestState {
  is_guest: boolean;
  daily_questions_used: number;
  daily_date: string; // YYYY-MM-DD
}

interface GuestActions {
  setGuest: (value: boolean) => void;
  canPlayAsGuest: () => boolean;
  useGuestQuestion: () => boolean;
  resetIfNewDay: () => void;
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export const useGuestStore = create<GuestState & GuestActions>()(
  persist(
    (set, get) => ({
      is_guest: false,
      daily_questions_used: 0,
      daily_date: today(),

      setGuest: (value) => set({ is_guest: value }),

      canPlayAsGuest: () => {
        const s = get();
        s.resetIfNewDay();
        return s.daily_questions_used < GUEST_DAILY_LIMIT;
      },

      useGuestQuestion: () => {
        const s = get();
        s.resetIfNewDay();
        if (s.daily_questions_used >= GUEST_DAILY_LIMIT) return false;
        set((prev) => ({ daily_questions_used: prev.daily_questions_used + 1 }));
        return true;
      },

      resetIfNewDay: () => {
        const s = get();
        const t = today();
        if (s.daily_date !== t) {
          set({ daily_questions_used: 0, daily_date: t });
        }
      },
    }),
    { name: "legal-ninja-guest" }
  )
);

export { GUEST_DAILY_LIMIT };

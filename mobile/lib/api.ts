import { storage } from "./storage";

const API_BASE    = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000/api";
export const SOCKET_BASE = API_BASE.replace(/\/api$/, "");

// Set by the root layout so any 401 anywhere auto-redirects to sign-in
let unauthorizedHandler: (() => void) | null = null;
export function setUnauthorizedHandler(fn: () => void) {
  unauthorizedHandler = fn;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = await storage.getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  } catch {
    throw new Error("Network error. Check your connection.");
  }

  if (res.status === 401) {
    await storage.deleteToken();
    await storage.clearGuest();
    unauthorizedHandler?.();
    throw new Error("Session expired. Please sign in again.");
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as any).error ?? (data as any).message;
    throw new Error(msg ?? `Server error (${res.status})`);
  }
  return data as T;
}

export interface UserProfile {
  id: string; username: string; email: string; avatar_url: string;
  xp: number; level: number; current_streak: number; longest_streak: number;
  total_questions_answered: number; total_correct_answers: number;
  free_questions_remaining: number; paid_questions_balance: number; earned_questions_balance: number;
  badges: string[]; weak_areas: string[]; referral_count: number; referral_code: string;
  track: string; role?: string; active_passes: unknown[];
  daily_goal: { progress: number; target: number; completed: boolean };
}

export const mobileApi = {
  // Auth
  register: (email: string, username: string, password: string, track: string, role?: string, referral_code?: string) =>
    request<{ token: string; user: UserProfile }>("/auth/register", { method: "POST", body: JSON.stringify({ email, username, password, track, role: role ?? "law_student", referral_code }) }),
  login: (email: string, password: string) =>
    request<{ token: string; user: UserProfile }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  forgotPassword: (email: string) =>
    request<{ sent: boolean }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  // User
  getMe: () => request<UserProfile>("/users/me"),
  updateMe: (b: { username?: string; track?: string; role?: string }) =>
    request<UserProfile>("/users/me", { method: "PATCH", body: JSON.stringify(b) }),
  getBalance: () => request<{ free_questions_remaining: number; paid_questions_balance: number; earned_questions_balance: number; total: number; active_passes: unknown[] }>("/users/balance"),
  getQuests: () => request<{ id: string; title: string; target: number; progress: number; status: string; reward_xp: number; reward_questions: number }[]>("/users/quests"),
  claimQuest: (id: string) => request<{ claimed: boolean; reward_xp: number; reward_questions: number }>(`/users/quests/${id}/claim`, { method: "POST" }),

  // Questions
  nextQuestion: (b: { subject: string; track: string; difficulty: string; source?: string; year?: number }) =>
    request<{ question: unknown }>("/questions/next", { method: "POST", body: JSON.stringify(b) }),
  guestNextQuestion: (b: { subject: string; track: string; difficulty: string; source?: string; year?: number }) =>
    request<{ question: unknown }>("/questions/guest-next", { method: "POST", body: JSON.stringify(b) }),
  revealAnswer: (question_id: string) =>
    request<{ correct_option: string; explanation: string | null }>("/questions/reveal", { method: "POST", body: JSON.stringify({ question_id }) }),
  guestRevealAnswer: (question_id: string) =>
    request<{ correct_option: string; explanation: string | null }>("/questions/guest-reveal", { method: "POST", body: JSON.stringify({ question_id }) }),

  // Sessions
  startSession: (b: { mode: string; track: string; subject?: string; difficulty: string; time_limit_mins: number; question_count: number }) =>
    request<{ session_id: string }>("/sessions/start", { method: "POST", body: JSON.stringify(b) }),
  submitAnswer: (b: { session_id: string; question_id: string; selected: string; correct_option: string; time_taken_ms: number; streak: number }) =>
    request<{ correct: boolean; xpGained: number; newStreak: number; levelChanged: boolean; direction: "up" | "down" | null }>("/sessions/answer", { method: "POST", body: JSON.stringify(b) }),
  endSession: (session_id: string) =>
    request<{ grade: string; percentage: number; xpEarned: number; newBadges: string[]; levelDirection: "up" | "down" | null }>("/sessions/end", { method: "POST", body: JSON.stringify({ session_id }) }),

  // Leaderboard
  getLeaderboard: (type: string) =>
    request<{ entries: unknown[]; my_rank: { rank: number; total_xp: number } | null }>(`/leaderboard/${type}`),

  // Store
  buyBundle: (bundle_index: number) =>
    request<{ authorization_url: string; reference: string }>("/store/buy/bundle", { method: "POST", body: JSON.stringify({ bundle_index }) }),
  buyPass: (pass_id: string) =>
    request<{ authorization_url: string; reference: string }>("/store/buy/pass", { method: "POST", body: JSON.stringify({ pass_id }) }),
};

export const api = mobileApi;

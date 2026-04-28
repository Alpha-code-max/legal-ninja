const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ln_token");
}

export function setToken(token: string): void {
  localStorage.setItem("ln_token", token);
}

export function clearToken(): void {
  localStorage.removeItem("ln_token");
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const api = {
  // Auth
  register: (body: { username: string; email: string; password: string; track: string; role?: string; referral_code?: string }) =>
    request<{ token: string; user: unknown; email_verification_sent: boolean }>("/auth/register", { method: "POST", body: JSON.stringify({ role: "law_student", ...body }) }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: unknown }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),

  verifyEmail: (token: string) =>
    request<{ verified: boolean }>("/auth/verify-email", { method: "POST", body: JSON.stringify({ token }) }),

  resendVerification: (email: string) =>
    request<{ sent: boolean }>("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),

  forgotPassword: (email: string) =>
    request<{ sent: boolean }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),

  resetPassword: (body: { token: string; password: string }) =>
    request<{ reset: boolean }>("/auth/reset-password", { method: "POST", body: JSON.stringify(body) }),

  // User
  getMe: () => request<{
    id: string; username: string; email: string; avatar_url: string; country: string; track: string; role?: string;
    xp: number; level: number; current_streak: number; longest_streak: number;
    total_questions_answered: number; total_correct_answers: number;
    free_questions_remaining: number; paid_questions_balance: number; earned_questions_balance: number;
    active_passes: { pass_type: string; pass_name: string; subject_id?: string; expires_at: string }[];
    badges: string[]; weak_areas: string[]; referral_count: number; referral_code: string;
    daily_goal: { progress: number; target: number; completed: boolean };
  }>("/users/me"),
  updateMe: (body: { username?: string; avatar_url?: string; country?: string; track?: string; role?: string }) =>
    request<unknown>("/users/me", { method: "PATCH", body: JSON.stringify(body) }),
  getBalance: () => request<{
    free_questions_remaining: number;
    paid_questions_balance: number;
    earned_questions_balance: number;
    total: number;
    active_passes: unknown[];
  }>("/users/balance"),
  getQuests: () => request<{ id: string; title: string; target: number; progress: number; status: string; reward_xp: number; reward_questions: number; expires_at: string | null }[]>("/users/quests"),
  claimQuest: (id: string) =>
    request<{ claimed: boolean; reward_xp: number; reward_questions: number }>(`/users/quests/${id}/claim`, { method: "POST" }),
  verifyTransaction: (reference: string) =>
    request<{ status: string; questions_added: number; pass_activated: string | null }>(`/store/verify/${reference}`),

  // Questions
  nextQuestion: (body: { subject: string; track: string; difficulty: string; count?: number; source?: string; year?: number }) =>
    request<{ question: unknown }>("/questions/next", { method: "POST", body: JSON.stringify(body) }),

  guestNextQuestion: (body: { subject: string; track: string; difficulty: string; source?: string; year?: number }) =>
    request<{ question: unknown }>("/questions/guest-next", { method: "POST", body: JSON.stringify(body) }),
  revealAnswer: (question_id: string) =>
    request<{ correct_option: string; explanation: string | null }>("/questions/reveal", {
      method: "POST",
      body: JSON.stringify({ question_id }),
    }),

  guestRevealAnswer: (question_id: string) =>
    request<{ correct_option: string; explanation: string | null }>("/questions/guest-reveal", {
      method: "POST",
      body: JSON.stringify({ question_id }),
    }),
  getExplanation: (body: { question: string; wrong_answer: string; correct_answer: string; subject: string }) =>
    request<{ explanation: string }>("/questions/explain", { method: "POST", body: JSON.stringify(body) }),

  // Sessions
  startSession: (body: { mode: string; track: string; subject?: string; difficulty: string; time_limit_mins: number; question_count: number }) =>
    request<{ session_id: string }>("/sessions/start", { method: "POST", body: JSON.stringify(body) }),
  submitAnswer: (body: { session_id: string; question_id: string; selected: string; correct_option: string; time_taken_ms: number; streak: number }) =>
    request<{ correct: boolean; xpGained: number; newStreak: number; levelChanged: boolean; direction: "up" | "down" | null }>(
      "/sessions/answer", { method: "POST", body: JSON.stringify(body) }
    ),
  endSession: (session_id: string) =>
    request<{ grade: string; percentage: number; xpEarned: number; newBadges: string[]; levelDirection: "up" | "down" | null }>(
      "/sessions/end", { method: "POST", body: JSON.stringify({ session_id }) }
    ),
  getSessionHistory: () => request<unknown[]>("/sessions/history"),

  // Leaderboard
  getLeaderboard: (type: string, params?: { subject?: string; limit?: number }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ entries: unknown[]; my_rank: unknown }>(`/leaderboard/${type}${qs ? `?${qs}` : ""}`);
  },

  // Store
  buyBundle: (bundle_index: number) =>
    request<{ authorization_url: string; reference: string }>("/store/buy/bundle", {
      method: "POST",
      body: JSON.stringify({ bundle_index }),
    }),
  buyPass: (pass_id: string, subject_id?: string) =>
    request<{ authorization_url: string; reference: string }>("/store/buy/pass", {
      method: "POST",
      body: JSON.stringify({ pass_id, subject_id }),
    }),
  getTransactions: () => request<unknown[]>("/store/transactions"),

  // Rooms (multiplayer)
  createRoom: (body: { mode: string; track: string; subject?: string; difficulty: string; question_count: number }) =>
    request<{ id: string; code: string }>("/rooms/create", { method: "POST", body: JSON.stringify(body) }),
  joinRoom: (code: string) =>
    request<{ room_id: string }>("/rooms/join", { method: "POST", body: JSON.stringify({ code }) }),
  getRoom: (id: string) => request<unknown>(`/rooms/${id}`),
};

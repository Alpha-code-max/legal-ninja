export interface AuthUser {
  uid: string;
  username: string;
  email: string;
  level: number;
}

// Augment Express so req.user is AuthUser everywhere — no custom AuthRequest needed
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      rawBody?: string;
    }
  }
}

export interface DbUser {
  uid: string;
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  country: string;
  track: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  total_questions_answered: number;
  total_correct_answers: number;
  free_questions_remaining: number;
  paid_questions_balance: number;
  earned_questions_balance: number;
  badges: string[];
  weak_areas: string[];
  recent_answers: boolean[];
  last_demotion_at: Date | null;
  last_login_at: Date;
  referral_count: number;
  referral_code: string;
  referred_by: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface DbGameSession {
  id: string;
  user_id: string;
  mode: string;
  track: string;
  subject: string | null;
  difficulty: string;
  time_limit_mins: number;
  question_count: number;
  score: number;
  correct_answers: number;
  total_answers: number;
  xp_earned: number;
  grade: string | null;
  percentage: number | null;
  max_streak: number;
  answers: AnswerRecord[];
  started_at: Date;
  ended_at: Date | null;
  status: "active" | "finished" | "abandoned";
}

export interface AnswerRecord {
  question_id: string;
  selected: string;
  correct: boolean;
  time_taken_ms: number;
  xp_gained: number;
}

export interface DbQuestion {
  id: string;
  subject: string;
  track: string;
  difficulty: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  topic: string | null;
}

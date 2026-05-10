const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api";

export interface PdfDocument {
  id: string;
  original_name: string;
  subject: string;
  track: string;
  page_count: number;
  chunk_count: number;
  file_size_bytes: number;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  total_sessions: number;
  total_questions_cached: number;
  total_pdfs: number;
  total_pdf_chunks: number;
  total_revenue_ngn: number;
}

export interface PaymentStatus {
  status: "healthy" | "has_pending";
  pending: number;
  success: number;
  failed: number;
  total: number;
  oldest_pending_mins: number | null;
}

export interface Transaction {
  id: string;
  reference: string;
  user_email?: string;
  status: "pending" | "success" | "failed";
  amount_ngn: number;
  questions_added: number;
  pass_activated: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  completed_at: string | null;
  pending_mins?: number;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  track?: string;
  university?: string;
  created_at: string;
  last_login_at?: string;
  free_questions_remaining: number;
  paid_questions_balance: number;
  earned_questions_balance: number;
}

export interface AdminUserDetail extends AdminUser {
  law_school?: string;
  active_passes?: any[];
  recent_sessions: {
    id: string;
    mode: string;
    subject: string;
    created_at: string;
    status: string;
    score: number;
    total_questions: number;
  }[];
  recent_transactions: {
    id: string;
    created_at: string;
    amount_ngn: number;
    questions_added: number;
    status: string;
    type: string;
  }[];
}

export interface UserListResponse {
  users: AdminUser[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface OverviewAnalytics {
  dau: number;
  mau: number;
  new_users_today: number;
  new_users_week: number;
  new_users_month: number;
  sessions_last_24h: number;
  sessions_last_7d: number;
  avg_score_last_30d: number;
}

export interface SessionAnalytics {
  by_mode: any[];
  by_subject: any[];
  by_difficulty: any[];
  grade_distribution: any[];
  summary: {
    total: number;
    avg_percentage: number;
    avg_xp: number;
    total_xp: number;
  };
}

export interface SubjectAnalytics {
  subject: string;
  sessions: number;
  avg_accuracy: number;
  total_xp: number;
  total_questions: number;
  used_count: number;
  approved: number;
  pending: number;
}

export interface GrowthData {
  date: string;
  count: number;
}

export interface RevenueAnalytics {
  daily: {
    date: string;
    revenue: number;
    count: number;
    questions_added: number;
  }[];
  by_type: any[];
  summary: {
    total: number;
    count: number;
    avg_txn: number;
    max_txn: number;
  };
}

export interface PendingQuestion {
  id: string;
  type: "mcq" | "essay";
  subject: string;
  difficulty: string;
  track: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  model_answer: string | null;
  rubric: string | null;
  topic: string | null;
  validated: boolean;
  created_at: string;
}

export interface PendingQuestionsResponse {
  questions: PendingQuestion[];
  total: number;
  page: number;
  pages: number;
}

async function adminRequest<T>(path: string, options: RequestInit = {}, key: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key,
      ...(options.headers ?? {}),
    },
  });

  let data: any;
  const contentType = res.headers.get("content-type");

  if (contentType?.includes("application/json")) {
    try {
      data = await res.json();
    } catch (err) {
      throw new Error(`Invalid JSON response: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    const text = await res.text();
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${text.substring(0, 200)}`);
    }
    throw new Error(`Expected JSON but got ${contentType || "unknown content type"}`);
  }

  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export const adminApi = {
  getStats: (key: string) =>
    adminRequest<AdminStats>("/admin/stats", {}, key),

  listPdfs: (key: string, subject?: string) =>
    adminRequest<PdfDocument[]>(`/admin/pdfs${subject ? `?subject=${subject}` : ""}`, {}, key),

  uploadPdf: async (key: string, file: File, subject: string, track: string) => {
    const form = new FormData();
    form.append("pdf", file);
    form.append("subject", subject);
    form.append("track", track);

    const res = await fetch(`${API_BASE}/admin/pdfs/upload`, {
      method: "POST",
      headers: { "x-admin-key": key },
      body: form,
    });

    let data: any;
    try {
      data = await res.json();
    } catch (err) {
      const text = await res.text();
      throw new Error(`Failed to parse response: ${text || `HTTP ${res.status}`}`);
    }

    if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
    return data as { documentId: string; chunkCount: number; pageCount: number; message: string };
  },

  deletePdf: (key: string, id: string) =>
    adminRequest<{ deleted: boolean }>(`/admin/pdfs/${id}`, { method: "DELETE" }, key),

  getChunks: (key: string, docId: string) =>
    adminRequest<{ id: string; chunk_index: number; word_count: number; used_count: number; preview: string }[]>(
      `/admin/pdfs/${docId}/chunks`, {}, key
    ),

  getBankStats: (key: string) =>
    adminRequest<{ subject: string; total: number; by_difficulty: Record<string, number>; by_type: Record<string, number>; essays: number }[]>(
      `/admin/banks`, {}, key
    ),

  repopulateBank: (key: string, docId: string) =>
    adminRequest<{ message: string }>(`/admin/pdfs/${docId}/repopulate`, { method: "POST" }, key),

  purgeSubject: (key: string, subject: string) =>
    adminRequest<{ deleted: number; repopulating: boolean; message: string }>(
      `/admin/questions/purge/${subject}`, { method: "DELETE" }, key
    ),

  regenerateSubject: (key: string, subject: string) =>
    adminRequest<{ started: boolean; documents_found?: number; message: string }>(
      `/admin/questions/regenerate/${subject}`, { method: "POST" }, key
    ),

  generateMixed: (key: string, subject: string, track: string, count: number = 10) =>
    adminRequest<{ created: any[]; type: string }>(
      `/admin/questions/generate`,
      { method: "POST", body: JSON.stringify({ subject, track, difficulty: "medium", count, type: "mixed" }) },
      key
    ),

  importPastQuestions: async (key: string, params: {
    subject?: string;
    track?: string;
    year?: number;
    questions?: any[];
    file?: File;
  }) => {
    const { file, ...rest } = params;
    if (file) {
      const form = new FormData();
      form.append("pdf", file);
      if (rest.subject) form.append("subject", rest.subject);
      if (rest.track) form.append("track", rest.track);
      if (rest.year) form.append("year", String(rest.year));

      const res = await fetch(`${API_BASE}/admin/import-past-questions`, {
        method: "POST",
        headers: { "x-admin-key": key },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
      return data;
    } else {
      return adminRequest<any>("/admin/import-past-questions", {
        method: "POST",
        body: JSON.stringify(rest),
      }, key);
    }
  },

  // Payment monitoring endpoints
  getPaymentStatus: (key: string) =>
    adminRequest<PaymentStatus>("/admin/payments/status", {}, key),

  getPendingPayments: (key: string) =>
    adminRequest<Transaction[]>("/admin/payments/pending", {}, key),

  getFailedPayments: (key: string) =>
    adminRequest<Transaction[]>("/admin/payments/failed", {}, key),

  triggerPaymentRecovery: (key: string) =>
    adminRequest<{ recovery_result: any; message: string }>(
      "/admin/payments/recover", { method: "POST" }, key
    ),

  processPayment: (key: string, reference: string) =>
    adminRequest<{ success: boolean; message: string }>(
      `/admin/payments/${reference}/process`, { method: "POST" }, key
    ),

  // User management endpoints
  listUsers: (key: string, params?: { page?: number; limit?: number; search?: string; role?: string; track?: string }) => {
    const qs = new URLSearchParams();
    if (params?.page) qs.set("page", String(params.page));
    if (params?.limit) qs.set("limit", String(params.limit));
    if (params?.search) qs.set("search", params.search);
    if (params?.role) qs.set("role", params.role);
    if (params?.track) qs.set("track", params.track);
    return adminRequest<UserListResponse>(`/admin/users?${qs.toString()}`, {}, key);
  },

  getUser: (key: string, id: string) =>
    adminRequest<AdminUserDetail>(`/admin/users/${id}`, {}, key),

  updateBalance: (key: string, id: string, field: string, delta: number) =>
    adminRequest<{ id: string; free_questions_remaining: number; paid_questions_balance: number; earned_questions_balance: number }>(
      `/admin/users/${id}/balance`,
      { method: "PATCH", body: JSON.stringify({ field, delta }) },
      key
    ),

  updateRole: (key: string, id: string, role: string) =>
    adminRequest<{ id: string; role: string }>(
      `/admin/users/${id}/role`,
      { method: "PATCH", body: JSON.stringify({ role }) },
      key
    ),

  // Analytics endpoints
  getOverviewAnalytics: (key: string) =>
    adminRequest<OverviewAnalytics>("/admin/analytics/overview", {}, key),

  getSessionAnalytics: (key: string, days: number = 30) =>
    adminRequest<SessionAnalytics>(`/admin/analytics/sessions?days=${days}`, {}, key),

  getSubjectAnalytics: (key: string) =>
    adminRequest<SubjectAnalytics[]>("/admin/analytics/subjects", {}, key),

  getPendingQuestions: (key: string, page: number = 1, limit: number = 10) =>
    adminRequest<PendingQuestionsResponse>(`/admin/questions/pending?page=${page}&limit=${limit}`, {}, key),

  deleteQuestion: (key: string, id: string) =>
    adminRequest<{ deleted: boolean; id: string }>(
      `/admin/questions/${id}`,
      { method: "DELETE" },
      key
    ),

  editQuestion: (key: string, id: string, data: Partial<Omit<PendingQuestion, "id" | "created_at">>) =>
    adminRequest<{ updated: boolean; id: string }>(
      `/admin/questions/${id}`,
      { method: "PATCH", body: JSON.stringify(data) },
      key
    ),

  getUserGrowth: (key: string, days: number = 30) =>
    adminRequest<GrowthData[]>(`/admin/analytics/users/growth?days=${days}`, {}, key),

  getRevenueAnalytics: (key: string, days: number = 30) =>
    adminRequest<RevenueAnalytics>(`/admin/analytics/revenue?days=${days}`, {}, key),
};

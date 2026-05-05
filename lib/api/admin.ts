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

async function adminRequest<T>(path: string, options: RequestInit = {}, key: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": key,
      ...(options.headers ?? {}),
    },
  });
  const data = await res.json();
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
    const data = await res.json();
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
};

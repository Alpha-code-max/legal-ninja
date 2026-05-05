import { Router, type Request } from "express";
import multer from "multer";
import path from "path";
import os from "os";
import { requireAdmin } from "../middleware/admin";
import {
  extractAndStoreChunks,
  listDocuments,
  deleteDocument,
  populateQuestionBankFromPdf,
  extractPastQuestionsFromPdf,
  getQuestionBankStats,
} from "../services/pdf";
import { generateQuestion, questionPassesStrictCheck } from "../services/ai";
import { getPaymentStats, manuallyProcessPayment, recoverStuckPayments } from "../services/payment-recovery";
import { PdfChunk } from "../models/PdfChunk";
import { User } from "../models/User";
import { GameSession } from "../models/GameSession";
import { Question } from "../models/Question";
import { PdfDocument } from "../models/PdfDocument";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";

const router = Router();

// Store uploads in OS temp dir — deleted after parsing
const upload = multer({
  dest: os.tmpdir(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf" || path.extname(file.originalname).toLowerCase() === ".pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are accepted"));
    }
  },
});

const VALID_SUBJECTS = [
  "civil_procedure", "criminal_procedure", "property_law", "corporate_law",
  "legal_ethics", "constitutional_law", "evidence_law",
  "law_of_contract", "law_of_torts", "criminal_law", "equity_and_trusts", "family_law",
];
const VALID_TRACKS = ["law_school_track", "undergraduate_track"];

// POST /api/admin/pdfs/upload
router.post(
  "/pdfs/upload",
  requireAdmin,
  upload.single("pdf"),
  async (req: Request, res) => {
    if (!req.file) {
      res.status(400).json({ error: "No PDF file uploaded" });
      return;
    }

    const { subject, track } = req.body as { subject: string; track: string };

    if (!VALID_SUBJECTS.includes(subject)) {
      res.status(400).json({ error: "Invalid subject" });
      return;
    }
    if (!VALID_TRACKS.includes(track)) {
      res.status(400).json({ error: "Invalid track" });
      return;
    }

    try {
      const result = await extractAndStoreChunks({
        filePath: req.file.path,
        originalName: req.file.originalname,
        subject,
        track,
        uploadedBy: req.user?.uid ?? null,
      });

      res.status(201).json({
        message: "PDF uploaded and processed. Question bank is being populated in the background.",
        ...result,
      });

      // Fire-and-forget: populate question bank from all chunks
      populateQuestionBankFromPdf({
        documentId: result.documentId,
        subject,
        track,
      }).catch((err) => console.error("Bank population error:", err));

    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("PDF processing error:", msg);
      res.status(500).json({ error: `PDF processing failed: ${msg}` });
    }
  }
);

// GET /api/admin/pdfs
router.get("/pdfs", requireAdmin, async (req: Request, res) => {
  try {
    const subjectRaw = req.query.subject;
    const subject = Array.isArray(subjectRaw)
      ? String(subjectRaw[0])
      : typeof subjectRaw === "string"
      ? subjectRaw
      : undefined;
    const docs = await listDocuments(subject);
    res.json(docs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list PDFs" });
  }
});

// GET /api/admin/pdfs/:id/chunks
router.get("/pdfs/:id/chunks", requireAdmin, async (req: Request, res) => {
  try {
    const docId = new mongoose.Types.ObjectId(String(req.params.id));
    const chunks = await PdfChunk.find({ document_id: docId })
      .sort({ chunk_index: 1 })
      .select("chunk_index word_count used_count content")
      .lean();
    const result = chunks.map((c) => ({
      id:          String(c._id),
      chunk_index: c.chunk_index,
      word_count:  c.word_count,
      used_count:  c.used_count,
      preview:     c.content.slice(0, 200),
    }));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch chunks" });
  }
});

// DELETE /api/admin/pdfs/:id
router.delete("/pdfs/:id", requireAdmin, async (req: Request, res) => {
  try {
    const deleted = await deleteDocument(String(req.params.id));
    if (!deleted) {
      res.status(404).json({ error: "PDF not found" });
      return;
    }
    res.json({ deleted: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete PDF" });
  }
});

// POST /api/admin/pdfs/:id/repopulate — re-run bank generation for an existing PDF
router.post("/pdfs/:id/repopulate", requireAdmin, async (req: Request, res) => {
  try {
    const doc = await PdfDocument.findById(String(req.params.id));
    if (!doc) { res.status(404).json({ error: "PDF not found" }); return; }
    res.json({ message: "Repopulation started in background", documentId: String(doc._id) });
    populateQuestionBankFromPdf({
      documentId: String(doc._id),
      subject: doc.subject,
      track:   doc.track,
    }).catch((err) => console.error("Repopulate error:", err));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start repopulation" });
  }
});

// DELETE /api/admin/questions/purge/:subject
// Wipes ALL questions for a subject and immediately re-generates them from existing PDF chunks.
// Use this to flush dirty/off-subject questions that were stored before strict validation was added.
router.delete("/questions/purge/:subject", requireAdmin, async (req: Request, res) => {
  const { subject } = req.params as { subject: string };
  if (!VALID_SUBJECTS.includes(subject)) {
    res.status(400).json({ error: "Invalid subject" });
    return;
  }
  try {
    const deleted = await Question.deleteMany({ subject });
    const docs = await PdfDocument.find({ subject }).lean();

    if (docs.length === 0) {
      res.json({
        deleted: deleted.deletedCount,
        repopulating: false,
        message: "Questions deleted. No PDFs found for this subject — upload a PDF to repopulate.",
      });
      return;
    }

    res.json({
      deleted: deleted.deletedCount,
      repopulating: true,
      documents_found: docs.length,
      message: `Deleted ${deleted.deletedCount} questions. Repopulating from ${docs.length} PDF(s) in the background.`,
    });

    for (const doc of docs) {
      populateQuestionBankFromPdf({
        documentId: String(doc._id),
        subject: doc.subject,
        track:   doc.track,
      }).catch((err) => console.error(`[Purge repopulate] Error for doc ${doc._id}:`, err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Purge failed" });
  }
});

// POST /api/admin/questions/regenerate/:subject
// Runs generation from existing PDFs WITHOUT deleting existing questions.
// Safe to use repeatedly — adds new unique questions each time.
router.post("/questions/regenerate/:subject", requireAdmin, async (req: Request, res) => {
  const { subject } = req.params as { subject: string };
  if (!VALID_SUBJECTS.includes(subject)) {
    res.status(400).json({ error: "Invalid subject" });
    return;
  }
  try {
    const docs = await PdfDocument.find({ subject }).lean();
    if (docs.length === 0) {
      res.json({ started: false, message: "No PDFs found for this subject — upload a PDF first." });
      return;
    }
    res.json({ started: true, documents_found: docs.length, message: `Generating questions from ${docs.length} PDF(s) in the background. Check back in ~2 minutes.` });
    for (const doc of docs) {
      populateQuestionBankFromPdf({
        documentId: String(doc._id),
        subject: doc.subject,
        track:   doc.track,
      }).catch((err) => console.error(`[Regenerate] Error for doc ${doc._id}:`, err));
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Regeneration failed" });
  }
});

// GET /api/admin/debug/questions — raw question counts by subject (for diagnosing empty banks)
router.get("/debug/questions", requireAdmin, async (_req, res) => {
  try {
    const counts = await Question.aggregate([
      { $group: { _id: "$subject", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    const sample = await Question.findOne().select("subject difficulty question").lean();
    res.json({ counts, sample });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// GET /api/admin/banks — per-subject question bank counts
router.get("/banks", requireAdmin, async (_req, res) => {
  try {
    const stats = await getQuestionBankStats();
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch bank stats" });
  }
});

// GET /api/admin/stats
router.get("/stats", requireAdmin, async (_req, res) => {
  try {
    const [totalUsers, totalSessions, totalQuestions, totalPdfs, totalChunks, revenueResult] =
      await Promise.all([
        User.countDocuments(),
        GameSession.countDocuments(),
        Question.countDocuments(),
        PdfDocument.countDocuments(),
        PdfChunk.countDocuments(),
        Transaction.aggregate([
          { $match: { status: "success" } },
          { $group: { _id: null, total: { $sum: "$amount_ngn" } } },
        ]),
      ]);

    res.json({
      total_users:             totalUsers,
      total_sessions:          totalSessions,
      total_questions_cached:  totalQuestions,
      total_pdfs:              totalPdfs,
      total_pdf_chunks:        totalChunks,
      total_revenue_ngn:       revenueResult[0]?.total ?? 0,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stats" });
  }
});

// ─── Payment Monitoring ────────────────────────────────────────────────────────

// GET /api/admin/payments/status — payment system health and stats
router.get("/payments/status", requireAdmin, async (_req, res) => {
  try {
    const stats = await getPaymentStats();
    res.json({
      status: stats.pending === 0 ? "healthy" : "has_pending",
      ...stats,
      oldest_pending_mins: stats.oldestPending
        ? Math.floor((Date.now() - stats.oldestPending.getTime()) / 1000 / 60)
        : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch payment stats" });
  }
});

// GET /api/admin/payments/pending — list pending transactions
router.get("/payments/pending", requireAdmin, async (_req, res) => {
  try {
    const pending = await Transaction.find({ status: "pending" })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const enriched = await Promise.all(
      pending.map(async (txn) => {
        const user = await User.findById(txn.user_id).select("email").lean();
        const mins = Math.floor((Date.now() - new Date(txn.created_at).getTime()) / 1000 / 60);
        return { ...txn, id: String(txn._id), user_email: user?.email, pending_mins: mins };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending payments" });
  }
});

// GET /api/admin/payments/failed — list failed transactions
router.get("/payments/failed", requireAdmin, async (_req, res) => {
  try {
    const failed = await Transaction.find({ status: "failed" })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();

    const enriched = await Promise.all(
      failed.map(async (txn) => {
        const user = await User.findById(txn.user_id).select("email").lean();
        return { ...txn, id: String(txn._id), user_email: user?.email };
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch failed payments" });
  }
});

// POST /api/admin/payments/recover — manually trigger stuck payment recovery
router.post("/payments/recover", requireAdmin, async (_req, res) => {
  try {
    console.log("[Admin] Manual payment recovery triggered");
    const result = await recoverStuckPayments();
    res.json({
      recovery_result: result,
      message: `Processed ${result.processed} transactions: ${result.succeeded} succeeded, ${result.failed} failed`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Recovery failed" });
  }
});

// POST /api/admin/payments/:reference/process — manually process a single payment
router.post("/payments/:reference/process", requireAdmin, async (req: Request, res) => {
  try {
    const reference = String(req.params.reference);
    const result = await manuallyProcessPayment(reference);
    if (result.success) {
      res.json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Processing failed" });
  }
});

// Admin: approve or create questions (small endpoints to support admin workflows)

// POST /api/admin/questions — create or import a single question (MCQ or Essay)
router.post("/questions", requireAdmin, async (req: Request, res) => {
  try {
    const body = req.body as any;
    const type = body.type ?? "mcq";

    // Validate essay has required fields
    if (type === "essay" && (!body.question || !body.model_answer)) {
      res.status(400).json({ error: "Essay questions require 'question' and 'model_answer' fields" });
      return;
    }

    // Validate MCQ has required fields
    if (type === "mcq" && (!body.question || !body.options || !body.correct_option)) {
      res.status(400).json({ error: "MCQ questions require 'question', 'options', and 'correct_option' fields" });
      return;
    }

    const q = await Question.create({
      subject: body.subject,
      track: body.track,
      difficulty: body.difficulty,
      type,
      question: body.question,
      model_answer: body.model_answer ?? null,
      rubric: body.rubric ?? null,
      options: body.options,
      correct_option: body.correct_option,
      explanation: body.explanation ?? null,
      topic: body.topic ?? null,
      source: body.source ?? "past",
      allowed_roles: body.allowed_roles ?? undefined,
      approved: body.approved ?? true,
      validated: body.validated ?? true,
      created_by: req.user?.uid ?? null,
    });
    res.status(201).json({ id: String(q._id), type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create question" });
  }
});

// POST /api/admin/questions/approve/:id — mark question approved
router.post("/questions/approve/:id", requireAdmin, async (req: Request, res) => {
  try {
    const id = String(req.params.id);
    const updated = await Question.findByIdAndUpdate(id, { approved: true, validated: true }, { new: true }).lean();
    if (!updated) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ approved: true, id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve question" });
  }
});

// POST /api/admin/questions/generate
// Generates MCQ or Essay questions based on type parameter
router.post("/questions/generate", requireAdmin, async (req: Request, res) => {
  try {
    const { subject, track, difficulty, count = 5, pdfContext, allowed_roles, type = "mcq" } = req.body as any;
    const VALID = [
      "civil_procedure", "criminal_procedure", "property_law", "corporate_law",
      "legal_ethics", "constitutional_law", "evidence_law",
      "law_of_contract", "law_of_torts", "criminal_law", "equity_and_trusts", "family_law",
    ];
    if (!VALID.includes(subject)) { res.status(400).json({ error: "Invalid subject" }); return; }
    if (!["law_school_track","undergraduate_track"].includes(track)) { res.status(400).json({ error: "Invalid track" }); return; }
    if (!["mcq", "essay", "mixed"].includes(type)) { res.status(400).json({ error: "Invalid type (mcq/essay/mixed)" }); return; }

    const created: any[] = [];
    for (let i = 0; i < Math.min(20, Number(count)); i++) {
      try {
        // Determine which type to generate
        let generateType: "mcq" | "essay" = "mcq";
        if (type === "mixed") {
          generateType = Math.random() > 0.5 ? "essay" : "mcq";
        } else {
          generateType = type as "mcq" | "essay";
        }

        const aiq = await generateQuestion({ subject, difficulty, track, pdfContext, type: generateType });

        // Validate based on question type
        let validated = true;
        if (generateType === "mcq") {
          const fullText = [aiq.question, aiq.options?.A ?? "", aiq.options?.B ?? "", aiq.options?.C ?? "", aiq.options?.D ?? "", aiq.explanation ?? "", aiq.topic ?? ""].join(" ");
          validated = questionPassesStrictCheck(fullText, subject);
        } else {
          // For essays, validate the question and model answer
          const fullText = [aiq.question, aiq.model_answer ?? "", aiq.explanation ?? "", aiq.topic ?? ""].join(" ");
          validated = questionPassesStrictCheck(fullText, subject);
        }

        const q = await Question.create({
          subject: aiq.subject,
          track: aiq.track,
          difficulty: aiq.difficulty,
          type: generateType,
          question: aiq.question,
          model_answer: aiq.model_answer ?? null,
          rubric: aiq.rubric ?? null,
          options: aiq.options,
          correct_option: aiq.correct_option,
          explanation: aiq.explanation ?? null,
          topic: aiq.topic ?? null,
          source: "ai",
          allowed_roles: allowed_roles ?? undefined,
          approved: false,
          validated,
          created_by: req.user?.uid ?? null,
        });
        created.push({ id: String(q._id), type: generateType, validated });
      } catch (err) {
        console.error("AI generation item failed:", String(err));
      }
    }
    res.json({ created, type });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate questions" });
  }
});
// POST /api/admin/questions/generate-essays — dedicated essay generation endpoint
router.post("/questions/generate-essays", requireAdmin, async (req: Request, res) => {
  try {
    const { subject, track, difficulty, count = 5, pdfContext, allowed_roles } = req.body as any;
    const VALID = [
      "civil_procedure", "criminal_procedure", "property_law", "corporate_law",
      "legal_ethics", "constitutional_law", "evidence_law",
      "law_of_contract", "law_of_torts", "criminal_law", "equity_and_trusts", "family_law",
    ];
    if (!VALID.includes(subject)) { res.status(400).json({ error: "Invalid subject" }); return; }
    if (!["law_school_track","undergraduate_track"].includes(track)) { res.status(400).json({ error: "Invalid track" }); return; }

    const created: any[] = [];
    for (let i = 0; i < Math.min(20, Number(count)); i++) {
      try {
        const aiq = await generateQuestion({ subject, difficulty, track, pdfContext, type: "essay" });

        // Validate essay question
        const fullText = [aiq.question, aiq.model_answer ?? "", aiq.explanation ?? "", aiq.topic ?? ""].join(" ");
        const validated = questionPassesStrictCheck(fullText, subject);

        const q = await Question.create({
          subject: aiq.subject,
          track: aiq.track,
          difficulty: aiq.difficulty,
          type: "essay",
          question: aiq.question,
          model_answer: aiq.model_answer ?? null,
          rubric: aiq.rubric ?? null,
          options: aiq.options,
          correct_option: aiq.correct_option,
          explanation: aiq.explanation ?? null,
          topic: aiq.topic ?? null,
          source: "ai",
          allowed_roles: allowed_roles ?? undefined,
          approved: false,
          validated,
          created_by: req.user?.uid ?? null,
        });
        created.push({ id: String(q._id), validated, model_answer: aiq.model_answer ? true : false });
      } catch (err) {
        console.error("Essay generation item failed:", String(err));
      }
    }
    res.json({ created, count: created.length, type: "essay" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate essay questions" });
  }
});

// ─── Bulk import past exam questions (supports JSON or PDF) ──────────────────
router.post("/import-past-questions", requireAdmin, upload.single("pdf"), async (req: Request, res) => {
  try {
    const { subject, track, year: globalYear, questions: jsonQuestions } = req.body as {
      subject?: string;
      track?: string;
      questions?: any[];
      year?: number;
    };

    // Case 1: PDF Upload
    if (req.file) {
      if (!subject || !track) {
        res.status(400).json({ error: "subject and track are required for PDF upload" });
        return;
      }
      if (!VALID_SUBJECTS.includes(subject)) {
        res.status(400).json({ error: "Invalid subject" });
        return;
      }
      if (!VALID_TRACKS.includes(track)) {
        res.status(400).json({ error: "Invalid track" });
        return;
      }

      const result = await extractAndStoreChunks({
        filePath: req.file.path,
        originalName: req.file.originalname,
        subject,
        track,
        uploadedBy: req.user?.uid ?? null,
      });

      res.status(201).json({
        message: "PDF uploaded for past question extraction. Processing in background.",
        documentId: result.documentId,
      });

      // Background process
      extractPastQuestionsFromPdf({
        documentId: result.documentId,
        subject,
        track,
        year: globalYear ? Number(globalYear) : undefined,
      }).catch((err) => console.error("Past question extraction error:", err));

      return;
    }

    // Case 2: JSON Import (original logic)
    if (!Array.isArray(jsonQuestions) || jsonQuestions.length === 0) {
      res.status(400).json({ error: "questions array OR pdf file required" });
      return;
    }

    const docs = jsonQuestions.map((q) => ({
      subject:        q.subject || subject,
      track:          q.track || track,
      difficulty:     q.difficulty || "medium",
      question:       q.question,
      options:        q.options,
      correct_option: q.correct_option,
      explanation:    q.explanation ?? null,
      topic:          q.topic ?? null,
      source:         "past",
      year:           q.year ?? globalYear ?? null,
      approved:       true,
      validated:      true,
      allowed_roles:  ["all"],
      used_count:     0,
      created_by:     req.user?.uid ?? null,
    }));

    const result = await Question.insertMany(docs, { ordered: false });
    res.json({ imported: result.length });
  } catch (err) {
    console.error("Past question import failed:", err);
    res.status(500).json({ error: "Failed to import questions" });
  }
});

// ─── Review / approve AI-generated questions ──────────────────────────────────
router.patch("/questions/:id/approve", requireAdmin, async (req: Request, res) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: { approved: true } },
      { new: true }
    );
    if (!q) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ approved: true, id: String(q._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to approve question" });
  }
});

router.patch("/questions/:id/reject", requireAdmin, async (req: Request, res) => {
  try {
    const q = await Question.findByIdAndUpdate(
      req.params.id,
      { $set: { approved: false } },
      { new: true }
    );
    if (!q) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ rejected: true, id: String(q._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reject question" });
  }
});

// ─── List unapproved AI questions for review ──────────────────────────────────
router.get("/questions/pending", requireAdmin, async (_req: Request, res) => {
  try {
    const questions = await Question.find({ source: "ai", approved: false })
      .sort({ created_at: -1 })
      .limit(50)
      .lean();
    res.json(questions.map((q) => ({ ...q, id: String(q._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch pending questions" });
  }
});

export default router;

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
  getQuestionBankStats,
} from "../services/pdf";
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

export default router;

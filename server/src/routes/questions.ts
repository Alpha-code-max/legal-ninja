import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { getOrGenerateQuestions, checkAndDeductQuestion } from "../services/question";
import { Question } from "../models/Question";
import { User } from "../models/User";
import { isSubjectAllowed } from "../config/subjects";

const router = Router();

const GenerateSchema = z.object({
  subject:    z.string().min(1).max(60),
  track:      z.enum(["law_school_track", "undergraduate_track"]),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  count:      z.number().int().min(1).max(20).default(10),
  source:     z.enum(["past", "ai", "mixed"]).default("mixed"),
  year:       z.number().int().min(1990).max(2030).optional(),
  mode:       z.string().optional(),
  type:       z.enum(["mcq", "essay", "mixed"]).default("mixed"),
});

// Guest endpoint — no auth, just serves a question from the DB (no balance deduction)
router.post("/guest-next", validate(GenerateSchema), async (req: Request, res) => {
  try {
    const questions = await getOrGenerateQuestions({
      subject:    req.body.subject,
      track:      req.body.track,
      difficulty: req.body.difficulty,
      count:      req.body.count ?? 1,
      source:     req.body.source ?? "mixed",
      year:       req.body.year,
      mode:       req.body.mode,
      type:       req.body.type,
    });
    if (questions.length === 0) {
      res.status(503).json({ error: "BANK_EMPTY" });
      return;
    }
    const q = questions[0];
    const obj = typeof q.toObject === "function" ? q.toObject() : q;
    const { correct_option: _hidden, explanation: _exp, ...safeQuestion } = obj;
    res.json({ question: { ...safeQuestion, id: String(q._id) } });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("Guest question error:", msg);
    res.status(500).json({ error: msg });
  }
});

router.post("/next", requireAuth, validate(GenerateSchema), async (req: Request, res) => {
  try {
    // Server-side subject validation based on user role
    const subj = req.body.subject as string;
    const user = await User.findById(req.user!.uid).select("role").lean();
    const role = (user as any)?.role ?? "law_student";
    if (subj !== "mixed" && !isSubjectAllowed(subj, role)) {
      res.status(403).json({ error: "SUBJECT_NOT_ALLOWED" });
      return;
    }

    await checkAndDeductQuestion(req.user!.uid);

    const questions = await getOrGenerateQuestions({
      subject:    req.body.subject,
      track:      req.body.track,
      difficulty: req.body.difficulty,
      count:      req.body.count ?? 1,
      userId:     req.user!.uid,
      source:     req.body.source ?? "mixed",
      year:       req.body.year,
      mode:       req.body.mode,
      type:       req.body.type,
    });

    if (questions.length === 0) {
      res.status(503).json({ error: "BANK_EMPTY" });
      return;
    }

    const q = questions[0];
    const obj = typeof q.toObject === "function" ? q.toObject() : q;
    const { correct_option: _hidden, explanation: _exp, ...safeQuestion } = obj;
    res.json({ question: { ...safeQuestion, id: String(q._id) } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message === "INSUFFICIENT_BALANCE") {
      res.status(402).json({ error: "INSUFFICIENT_BALANCE" });
      return;
    }
    console.error("Question error:", err);
    res.status(500).json({ error: "Failed to get question" });
  }
});

router.post("/reveal", requireAuth, async (req: Request, res) => {
  try {
    const { question_id } = req.body as { question_id: string };
    const question = await Question.findById(question_id).select("correct_option explanation");
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ correct_option: question.correct_option, explanation: question.explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to reveal answer" });
  }
});

// Guest reveal — no auth required. Guests can't see explanation but need the correct option
// to receive visual feedback. The question_id is already public (served to the client).
router.post("/guest-reveal", async (req: Request, res) => {
  try {
    const { question_id } = req.body as { question_id: string };
    const question = await Question.findById(question_id).select("correct_option explanation");
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }
    res.json({ correct_option: question.correct_option, explanation: question.explanation });
  } catch (err) {
    res.status(500).json({ error: "Failed to reveal answer" });
  }
});

// ─── Get available years for past questions (public) ──────────────────────────
router.get("/years", async (req: Request, res) => {
  try {
    const subject = req.query.subject as string | undefined;
    const match: Record<string, unknown> = {
      source: { $in: ["past", "bank"] },
      year: { $ne: null, $exists: true },
    };
    if (subject && subject !== "mixed" && subject !== "all") {
      match.subject = subject;
    }
    const years = await Question.distinct("year", match);
    res.json({ years: years.filter(Boolean).sort((a: number, b: number) => b - a) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get years" });
  }
});

export default router;

import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { getOrGenerateQuestions, checkAndDeductQuestion } from "../services/question";
import { generateExplanation } from "../services/ai";
import { Question } from "../models/Question";

const router = Router();

const GenerateSchema = z.object({
  subject:    z.string().min(1).max(60),
  track:      z.enum(["law_school_track", "undergraduate_track"]),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]),
  count:      z.number().int().min(1).max(20).default(10),
});

const ExplanationSchema = z.object({
  question:      z.string().max(500),
  wrong_answer:  z.string().max(200),
  correct_answer:z.string().max(200),
  subject:       z.string().max(60),
});

// Guest endpoint — no auth, just serves a question from the DB (no balance deduction)
router.post("/guest-next", validate(GenerateSchema), async (req: Request, res) => {
  try {
    const questions = await getOrGenerateQuestions({
      subject:    req.body.subject,
      track:      req.body.track,
      difficulty: req.body.difficulty,
      count:      1,
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
    await checkAndDeductQuestion(req.user!.uid);

    const questions = await getOrGenerateQuestions({
      subject:    req.body.subject,
      track:      req.body.track,
      difficulty: req.body.difficulty,
      count:      1,
      userId:     req.user!.uid,
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

router.post("/explain", requireAuth, validate(ExplanationSchema), async (req: Request, res) => {
  try {
    const { question, wrong_answer, correct_answer, subject } = req.body as z.infer<typeof ExplanationSchema>;
    const explanation = await generateExplanation(question, wrong_answer, correct_answer, subject);
    res.json({ explanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate explanation" });
  }
});

export default router;

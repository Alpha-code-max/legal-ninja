import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { submitAnswer, endGameSession } from "../services/game";
import { GameSession } from "../models/GameSession";
import { Question } from "../models/Question";
import { generateDeepExplanation, gradeEssay } from "../services/ai";
import { isSubjectAllowed } from "../config/subjects";
import { User } from "../models/User";
import mongoose from "mongoose";

const router = Router();

const StartSchema = z.object({
  mode:            z.enum(["solo_practice", "duel", "battle_royale", "flashcard_review", "exam_simulation", "weak_area_focus", "daily_challenge"]),
  track:           z.enum(["law_school_track", "undergraduate_track"]),
  subject:         z.string().max(60).optional(),
  difficulty:      z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  time_limit_mins: z.number().int().min(5).max(60),
  question_count:  z.number().int().min(1).max(20),
});

const AnswerSchema = z.object({
  session_id:     z.string().min(1),
  question_id:    z.string().min(1),
  selected:       z.string().min(1), // Changed from enum to string for essay support
  correct_option: z.string().optional(),
  time_taken_ms:  z.number().int().min(0).max(600000),
  streak:         z.number().int().min(0),
});

const EssayAnswerSchema = z.object({
  session_id:     z.string().min(1),
  question_id:    z.string().min(1),
  answer_text:    z.string()
    .transform(s => s.trim())
    .pipe(z.string().min(20, "Answer must be at least 20 characters").max(5000, "Answer cannot exceed 5000 characters")),
  time_taken_ms:  z.number().int().min(0).max(600000),
  streak:         z.number().int().min(0),
});

router.post("/start", requireAuth, validate(StartSchema), async (req: Request, res) => {
  try {
    const { mode, track, subject, difficulty, time_limit_mins, question_count } = req.body as z.infer<typeof StartSchema>;

    // Validate subject by user role
    if (subject && subject !== "mixed") {
      const user = await User.findById(req.user!.uid).select("role").lean();
      const role = (user as any)?.role ?? "law_student";
      if (!isSubjectAllowed(subject, role)) {
        res.status(403).json({ error: "SUBJECT_NOT_ALLOWED" });
        return;
      }
    }

    const session = await GameSession.create({
      user_id:        new mongoose.Types.ObjectId(req.user!.uid),
      mode, track,
      subject:        subject ?? null,
      difficulty,
      time_limit_mins,
      question_count,
      status:         "active",
    });
    res.status(201).json({ session_id: String(session._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start session" });
  }
});

router.post("/answer", requireAuth, validate(AnswerSchema), async (req: Request, res) => {
  try {
    // Resolve canonical correct option server-side to avoid trusting the client
    const questionDoc = await (await import("../models/Question")).Question.findById(req.body.question_id).select("correct_option");
    if (!questionDoc) { res.status(404).json({ error: "Question not found" }); return; }
    const canonical = questionDoc.correct_option;
    const result = await submitAnswer({
      sessionId:     req.body.session_id,
      userId:        req.user!.uid,
      questionId:    req.body.question_id,
      selected:      req.body.selected,
      correctOption: canonical,
      timeTakenMs:   req.body.time_taken_ms,
      streak:        req.body.streak,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answer" });
  }
});

router.post("/answer/essay", requireAuth, validate(EssayAnswerSchema), async (req: Request, res) => {
  try {
    const { session_id, question_id, answer_text, time_taken_ms, streak } = req.body;

    // Validate question type
    const question = await Question.findById(question_id).select("type model_answer rubric question");
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }
    if (question.type !== "essay") { res.status(400).json({ error: "Not an essay question" }); return; }

    // Submit answer (marks as pending grading)
    await submitAnswer({
      sessionId: session_id,
      userId: req.user!.uid,
      questionId: question_id,
      selected: answer_text,
      correctOption: "",
      timeTakenMs: time_taken_ms,
      streak,
    });

    // Grade essay synchronously
    const grade = await gradeEssay({
      question: question.question,
      modelAnswer: question.model_answer || "",
      rubric: question.rubric || "",
      userAnswer: answer_text,
    });

    const correct = grade.score >= 50;
    const xpGained = Math.round(grade.score / 2);

    // Save grade to session answer
    await GameSession.updateOne(
      { _id: new mongoose.Types.ObjectId(session_id), "answers.question_id": question_id },
      { $set: {
          "answers.$.score": grade.score,
          "answers.$.feedback": grade.feedback,
          "answers.$.strengths": grade.strengths,
          "answers.$.weaknesses": grade.weaknesses,
          "answers.$.correct": correct,
          "answers.$.xp_gained": xpGained,
      }}
    );

    // Update user XP if grading succeeded
    if (xpGained > 0) {
      await User.findByIdAndUpdate(req.user!.uid, { $inc: { xp: xpGained } });
    }

    res.json({
      correct,
      score: grade.score,
      feedback: grade.feedback,
      correct_answer: grade.correct_answer,
      strengths: grade.strengths,
      weaknesses: grade.weaknesses,
      xpGained,
    });
  } catch (err) {
    console.error("Essay grading error:", err);
    res.status(500).json({ error: "Failed to grade essay" });
  }
});

router.post("/end", requireAuth, async (req: Request, res) => {
  try {
    const { session_id } = req.body as { session_id: string };
    if (!session_id) { res.status(400).json({ error: "session_id required" }); return; }
    const result = await endGameSession({ sessionId: session_id, userId: req.user!.uid });
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "";
    if (message.includes("not found")) { res.status(404).json({ error: message }); return; }
    console.error(err);
    res.status(500).json({ error: "Failed to end session" });
  }
});

router.get("/history", requireAuth, async (req: Request, res) => {
  try {
    const sessions = await GameSession.find(
      { user_id: new mongoose.Types.ObjectId(req.user!.uid) },
      { answers: 0 }
    ).sort({ started_at: -1 }).limit(20).lean();
    res.json(sessions.map((s) => ({ ...s, id: String(s._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// Step 9: Deep explanation endpoint (premium feature)
router.post("/:sessionId/answer/:questionId/explain", requireAuth, async (req: Request, res) => {
  try {
    const sessionId = String(req.params.sessionId);
    const questionId = String(req.params.questionId);

    // Verify session ownership
    const session = await GameSession.findOne({
      _id: new mongoose.Types.ObjectId(sessionId),
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
    });
    if (!session) { res.status(404).json({ error: "Session not found" }); return; }

    // Find the answer in the session
    const answer = session.answers.find(a => a.question_id === questionId);
    if (!answer) { res.status(404).json({ error: "Answer not found in session" }); return; }

    // Get the question
    const question = await Question.findById(questionId);
    if (!question) { res.status(404).json({ error: "Question not found" }); return; }

    // Only allow explanations for wrong MCQ answers
    if (question.type === "essay" || answer.correct) {
      res.status(400).json({ error: "Deep explanations only available for incorrect MCQ answers" });
      return;
    }

    // Generate deep explanation
    const correctText = String((question.options as any)?.[question.correct_option] || "");
    const selectedText = String((question.options as any)?.[answer.selected] || answer.selected);

    const deepExplanation = await generateDeepExplanation({
      question: question.question,
      correctOption: question.correct_option,
      correctText,
      selectedOption: answer.selected,
      selectedText,
      subject: question.subject,
    });

    // Save to session
    await GameSession.updateOne(
      { _id: new mongoose.Types.ObjectId(sessionId), "answers.question_id": questionId },
      { $set: { "answers.$.deep_explanation": deepExplanation } }
    );

    res.json({ deep_explanation: deepExplanation });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate deep explanation" });
  }
});

export default router;

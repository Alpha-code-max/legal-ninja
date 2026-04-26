import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { submitAnswer, endGameSession } from "../services/game";
import { GameSession } from "../models/GameSession";
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
  selected:       z.enum(["A", "B", "C", "D"]),
  correct_option: z.enum(["A", "B", "C", "D"]),
  time_taken_ms:  z.number().int().min(0).max(600000),
  streak:         z.number().int().min(0),
});

router.post("/start", requireAuth, validate(StartSchema), async (req: Request, res) => {
  try {
    const { mode, track, subject, difficulty, time_limit_mins, question_count } = req.body as z.infer<typeof StartSchema>;
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
    const result = await submitAnswer({
      sessionId:     req.body.session_id,
      userId:        req.user!.uid,
      questionId:    req.body.question_id,
      selected:      req.body.selected,
      correctOption: req.body.correct_option,
      timeTakenMs:   req.body.time_taken_ms,
      streak:        req.body.streak,
    });
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to submit answer" });
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

export default router;

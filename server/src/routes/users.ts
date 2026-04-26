import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { User } from "../models/User";
import { Quest } from "../models/Quest";
import { GameSession } from "../models/GameSession";
import mongoose from "mongoose";

const router = Router();

const UpdateProfileSchema = z.object({
  username:   z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country:    z.string().length(2).optional(),
  track:      z.enum(["law_school_track", "undergraduate_track"]).optional(),
});

// GET /api/users/me
router.get("/me", requireAuth, async (req: Request, res) => {
  try {
    const user = await User.findById(req.user!.uid)
      .select("-password_hash -email_verification_token -password_reset_token -email_verification_expires -password_reset_expires")
      .lean();
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    // Daily goal: count finished sessions today
    const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
    const sessionsToday = await GameSession.countDocuments({
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
      status: "finished",
      started_at: { $gte: todayStart },
    });
    const dailyGoal = { progress: Math.min(sessionsToday, 3), target: 3, completed: sessionsToday >= 3 };

    const now = new Date();
    const activePasses = (user.active_passes ?? []).filter((p) => p.expires_at > now);

    res.json({ ...user, id: String(user._id), active_passes: activePasses, daily_goal: dailyGoal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// PATCH /api/users/me
router.patch("/me", requireAuth, validate(UpdateProfileSchema), async (req: Request, res) => {
  try {
    const updates = req.body as z.infer<typeof UpdateProfileSchema>;
    const user = await User.findByIdAndUpdate(
      req.user!.uid,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password_hash -email_verification_token -password_reset_token");
    if (!user) { res.status(404).json({ error: "User not found" }); return; }
    res.json(user);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("duplicate") || msg.includes("unique")) {
      res.status(409).json({ error: "Username already taken" }); return;
    }
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// GET /api/users/balance
router.get("/balance", requireAuth, async (req: Request, res) => {
  try {
    const user = await User.findById(req.user!.uid)
      .select("free_questions_remaining paid_questions_balance earned_questions_balance active_passes")
      .lean();
    if (!user) { res.status(404).json({ error: "Not found" }); return; }

    const now = new Date();
    const activePasses = (user.active_passes ?? []).filter((p) => p.expires_at > now);
    const total = user.free_questions_remaining + user.paid_questions_balance + user.earned_questions_balance;
    res.json({ ...user, total, active_passes: activePasses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

// GET /api/users/quests
router.get("/quests", requireAuth, async (req: Request, res) => {
  try {
    // Auto-seed daily quests if none exist for today
    await seedDailyQuests(req.user!.uid);

    const quests = await Quest.find({
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
      status: { $in: ["active", "completed"] },
    }).sort({ created_at: -1 }).lean();

    res.json(quests.map((q) => ({ ...q, id: String(q._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

// POST /api/users/quests/:id/claim
router.post("/quests/:id/claim", requireAuth, async (req: Request, res) => {
  try {
    const quest = await Quest.findOneAndUpdate(
      { _id: req.params.id, user_id: new mongoose.Types.ObjectId(req.user!.uid), status: "completed" },
      { $set: { status: "claimed", claimed_at: new Date() } },
      { new: true }
    );
    if (!quest) { res.status(404).json({ error: "Quest not found or not claimable" }); return; }

    await User.findByIdAndUpdate(req.user!.uid, {
      $inc: { xp: quest.reward_xp, earned_questions_balance: quest.reward_questions },
    });
    res.json({ claimed: true, reward_xp: quest.reward_xp, reward_questions: quest.reward_questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to claim quest" });
  }
});

// GET /api/users/session-history — last 20 finished sessions
router.get("/session-history", requireAuth, async (req: Request, res) => {
  try {
    const sessions = await GameSession.find(
      { user_id: new mongoose.Types.ObjectId(req.user!.uid), status: "finished" },
      { answers: 0 }
    ).sort({ started_at: -1 }).limit(20).lean();
    res.json(sessions.map((s) => ({ ...s, id: String(s._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ─── Quest seeding helper ─────────────────────────────────────────────────────
export async function seedDailyQuests(userId: string): Promise<void> {
  const uid = new mongoose.Types.ObjectId(userId);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today.getTime() + 86400000);
  const dateKey = today.toISOString().slice(0, 10);

  const DAILY = [
    { quest_id: `daily_q_${dateKey}`,  quest_type: "questions_answered", title: "Answer 10 questions today",   target: 10, reward_xp: 50,  reward_questions: 2 },
    { quest_id: `daily_c_${dateKey}`,  quest_type: "correct_answers",    title: "Get 7 correct answers today", target: 7,  reward_xp: 80,  reward_questions: 3 },
    { quest_id: `daily_b_${dateKey}`,  quest_type: "battles_completed",  title: "Complete 3 battles today",    target: 3,  reward_xp: 100, reward_questions: 5 },
  ];

  for (const q of DAILY) {
    await Quest.findOneAndUpdate(
      { user_id: uid, quest_id: q.quest_id },
      { $setOnInsert: { ...q, user_id: uid, expires_at: tomorrow, created_at: new Date() } },
      { upsert: true }
    ).catch(() => {}); // Ignore duplicate key errors
  }
}

export default router;

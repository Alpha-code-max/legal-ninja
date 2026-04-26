import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { query, queryOne } from "../db/client";
import type { DbUser } from "../types";

const router = Router();

const UpdateProfileSchema = z.object({
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
  avatar_url: z.string().url().max(500).optional(),
  country: z.string().length(2).optional(),
  track: z.enum(["law_school_track", "undergraduate_track"]).optional(),
});

router.get("/me", requireAuth, async (req: Request, res) => {
  try {
    const user = await queryOne<DbUser>(
      `SELECT uid, username, email, avatar_url, country, track, xp, level,
              current_streak, longest_streak, total_questions_answered, total_correct_answers,
              free_questions_remaining, paid_questions_balance, earned_questions_balance,
              badges, weak_areas, last_demotion_at, referral_count, referral_code, created_at
       FROM users WHERE uid = $1`,
      [req.user!.uid]
    );
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const passes = await query(
      `SELECT id, pass_type, pass_name, subject_id, expires_at FROM active_passes
       WHERE user_id = $1 AND expires_at > NOW()`,
      [req.user!.uid]
    );

    const todayGoal = await queryOne(
      `SELECT progress, target, completed FROM daily_goals WHERE user_id = $1 AND date = CURRENT_DATE`,
      [req.user!.uid]
    );

    res.json({ ...user, active_passes: passes, daily_goal: todayGoal });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

router.patch("/me", requireAuth, validate(UpdateProfileSchema), async (req: Request, res) => {
  try {
    const updates = req.body as z.infer<typeof UpdateProfileSchema>;
    const fields = Object.entries(updates).filter(([, v]) => v !== undefined);
    if (fields.length === 0) { res.status(400).json({ error: "No fields to update" }); return; }

    const setClause = fields.map(([k], i) => `${k} = $${i + 2}`).join(", ");
    const values = fields.map(([, v]) => v);

    const [updated] = await query<DbUser>(
      `UPDATE users SET ${setClause} WHERE uid = $1 RETURNING uid, username, avatar_url, country, track`,
      [req.user!.uid, ...values]
    );
    res.json(updated);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.includes("unique")) { res.status(409).json({ error: "Username already taken" }); return; }
    console.error(err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

router.get("/balance", requireAuth, async (req: Request, res) => {
  try {
    const user = await queryOne<{
      free_questions_remaining: number;
      paid_questions_balance: number;
      earned_questions_balance: number;
    }>(
      `SELECT free_questions_remaining, paid_questions_balance, earned_questions_balance FROM users WHERE uid = $1`,
      [req.user!.uid]
    );
    if (!user) { res.status(404).json({ error: "Not found" }); return; }

    const passes = await query(
      `SELECT pass_type, pass_name, subject_id, expires_at FROM active_passes
       WHERE user_id = $1 AND expires_at > NOW()`,
      [req.user!.uid]
    );

    const total = user.free_questions_remaining + user.paid_questions_balance + user.earned_questions_balance;
    res.json({ ...user, total, active_passes: passes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch balance" });
  }
});

router.get("/quests", requireAuth, async (req: Request, res) => {
  try {
    const quests = await query(
      `SELECT id, quest_id, quest_type, title, target, progress, status, reward_xp, reward_questions, expires_at
       FROM quests WHERE user_id = $1 AND status IN ('active','completed') ORDER BY created_at DESC`,
      [req.user!.uid]
    );
    res.json(quests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch quests" });
  }
});

router.post("/quests/:id/claim", requireAuth, async (req: Request, res) => {
  try {
    const [quest] = await query<{ reward_xp: number; reward_questions: number }>(
      `UPDATE quests SET status = 'claimed', claimed_at = NOW()
       WHERE id = $1 AND user_id = $2 AND status = 'completed'
       RETURNING reward_xp, reward_questions`,
      [req.params.id, req.user!.uid]
    );
    if (!quest) { res.status(404).json({ error: "Quest not found or not claimable" }); return; }

    await query(
      `UPDATE users SET xp = xp + $1, earned_questions_balance = earned_questions_balance + $2 WHERE uid = $3`,
      [quest.reward_xp, quest.reward_questions, req.user!.uid]
    );
    res.json({ claimed: true, reward_xp: quest.reward_xp, reward_questions: quest.reward_questions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to claim quest" });
  }
});

export default router;

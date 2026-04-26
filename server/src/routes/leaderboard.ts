import { Router, type Request } from "express";
import { requireAuth } from "../middleware/auth";
import { query } from "../db/client";


const router = Router();

const VALID_TYPES = ["global_all_time", "global_weekly", "daily", "subject_specific", "friends_only", "country_based"];

function getPeriodStart(type: string): string {
  if (type === "daily") return new Date().toISOString().slice(0, 10);
  if (type === "global_weekly") {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  }
  return "2024-01-01";
}

router.get("/:type", requireAuth, async (req: Request, res) => {
  const type = String(req.params.type);
  if (!VALID_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid leaderboard type" });
    return;
  }

  const subject = Array.isArray(req.query.subject) ? req.query.subject[0] : (req.query.subject as string | undefined);
  const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const limit = Math.min(parseInt(limitRaw as string) || 50, 100);
  const periodStart = getPeriodStart(type);

  try {
    const entries = await query(
      `SELECT
         u.username, u.avatar_url, u.level, u.country,
         le.rank, le.total_xp, le.win_rate, le.current_streak, le.total_questions_answered
       FROM leaderboard_entries le
       JOIN users u ON u.uid = le.user_id
       WHERE le.leaderboard_type = $1
         AND le.period_start = $2
         ${subject ? "AND le.subject = $4" : ""}
       ORDER BY le.rank ASC
       LIMIT $3`,
      subject ? [type, periodStart, limit, subject] : [type, periodStart, limit]
    );

    // Find current user's rank
    const myEntry = await query(
      `SELECT rank, total_xp FROM leaderboard_entries
       WHERE user_id = $1 AND leaderboard_type = $2 AND period_start = $3`,
      [req.user!.uid, type, periodStart]
    );

    res.json({ entries, my_rank: myEntry[0] ?? null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;

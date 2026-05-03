/// <reference types="node" />
import { Router, type Request } from "express";
import { requireAuth } from "../middleware/auth";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { User } from "../models/User";
import mongoose from "mongoose";

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

  const subject   = req.query.subject as string | undefined;
  const limit     = Math.min(parseInt(req.query.limit as string) || 50, 100);
  const periodStart = getPeriodStart(type === "country_based" ? "global_all_time" : type);

  try {
    let entries: ReturnType<typeof formatEntry>[] = [];

    if (type === "country_based") {
      // Filter by requesting user's country
      const me = await User.findById(req.user!.uid, "country").lean();
      const country = me?.country ?? "NG";
      const raw = await LeaderboardEntry.aggregate([
        { $match: { leaderboard_type: "global_all_time", period_start: "2024-01-01" } },
        { $lookup: { from: "users", localField: "user_id", foreignField: "_id", as: "u" } },
        { $unwind: "$u" },
        { $match: { "u.country": country } },
        { $sort: { total_xp: -1 } },
        { $limit: limit },
        { $project: { rank: 1, total_xp: 1, win_rate: 1, current_streak: 1, total_questions_answered: 1, "u.username": 1, "u.avatar_url": 1, "u.level": 1 } },
      ]);
      entries = raw.map((e) => ({
        rank: e.rank,
        total_xp: e.total_xp,
        win_rate: e.win_rate,
        current_streak: e.current_streak,
        total_questions_answered: e.total_questions_answered,
        username: e.u?.username ?? "Unknown",
        avatar_url: e.u?.avatar_url ?? "",
        level: e.u?.level ?? 1,
      }));
    } else {
      const filter: Record<string, unknown> = { leaderboard_type: type, period_start: periodStart };
      if (subject) filter.subject = subject;

      const raw = await LeaderboardEntry.find(filter)
        .sort({ rank: 1 })
        .limit(limit)
        .populate<{ user_id: { username: string; avatar_url: string; level: number } }>("user_id", "username avatar_url level")
        .lean();

      entries = raw.map(formatEntry);
    }

    // My own rank in this leaderboard
    const myEntry = await LeaderboardEntry.findOne({
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
      leaderboard_type: type === "country_based" ? "global_all_time" : type,
      period_start: periodStart,
    }).lean();

    res.json({
      entries,
      my_rank: myEntry ? { rank: myEntry.rank, total_xp: myEntry.total_xp } : null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

function formatEntry(e: { rank: number | null; total_xp: number; win_rate: number; current_streak: number; total_questions_answered: number; user_id: { username: string; avatar_url: string; level: number } | mongoose.Types.ObjectId }) {
  const user = e.user_id as { username: string; avatar_url: string; level: number } | null;
  return {
    rank: e.rank,
    total_xp: e.total_xp,
    win_rate: e.win_rate,
    current_streak: e.current_streak,
    total_questions_answered: e.total_questions_answered,
    username: user && "username" in user ? user.username : "Unknown",
    avatar_url: user && "avatar_url" in user ? user.avatar_url : "",
    level: user && "level" in user ? user.level : 1,
  };
}

export default router;

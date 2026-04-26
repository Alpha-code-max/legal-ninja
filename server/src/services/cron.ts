import cron from "node-cron";
import { User } from "../models/User";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { XP_SOURCES } from "./progression";

export function startCronJobs(): void {
  // Daily login XP at midnight WAT (23:00 UTC)
  cron.schedule("0 23 * * *", async () => {
    console.log("[cron] Daily reset...");
    try {
      const yesterday = new Date(Date.now() - 86400000);
      await User.updateMany(
        { last_login_at: { $gte: yesterday } },
        { $inc: { xp: XP_SOURCES.daily_login } }
      );
      console.log("[cron] Daily reset complete");
    } catch (err) {
      console.error("[cron] Daily reset error:", err);
    }
  });

  // Weekly: award badge to top-10 players
  cron.schedule("0 0 * * 1", async () => {
    console.log("[cron] Weekly badge award...");
    try {
      const lastWeekStart = new Date(Date.now() - 7 * 86400000);
      const weekStr = lastWeekStart.toISOString().slice(0, 10);
      const topEntries = await LeaderboardEntry.find({
        leaderboard_type: "global_weekly",
        period_start: weekStr,
        rank: { $lte: 10 },
      });
      for (const entry of topEntries) {
        await User.findByIdAndUpdate(entry.user_id, {
          $addToSet: { badges: "Weekly Champion" },
        });
      }
      console.log("[cron] Weekly badges awarded");
    } catch (err) {
      console.error("[cron] Weekly badge error:", err);
    }
  });

  // Hourly: remove expired passes
  cron.schedule("0 * * * *", async () => {
    await User.updateMany(
      { "active_passes.expires_at": { $lt: new Date() } },
      { $pull: { active_passes: { expires_at: { $lt: new Date() } } } }
    ).catch(console.error);
  });

  console.log("[cron] Cron jobs registered");
}

import cron from "node-cron";
import { User } from "../models/User";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { XP_SOURCES } from "./progression";
import { recoverStuckPayments } from "./payment-recovery";

export function startCronJobs(): void {
  // Daily reset at midnight WAT (23:00 UTC): award login XP + break missed streaks
  cron.schedule("0 23 * * *", async () => {
    console.log("[cron] Daily reset...");
    try {
      const yesterday = new Date(Date.now() - 86400000);
      // Award daily login XP to users who logged in today
      await User.updateMany(
        { last_login_at: { $gte: yesterday } },
        { $inc: { xp: XP_SOURCES.daily_login } }
      );
      // Break streaks for users who didn't answer any question yesterday
      // (last_login_at older than 48h AND current_streak > 0)
      const twoDaysAgo = new Date(Date.now() - 2 * 86400000);
      await User.updateMany(
        { last_login_at: { $lt: twoDaysAgo }, current_streak: { $gt: 0 } },
        { $set: { current_streak: 0 } }
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

  // Every 5 minutes: recover stuck payments (pending transactions paid on Paystack)
  cron.schedule("*/5 * * * *", async () => {
    try {
      const result = await recoverStuckPayments();
      if (result.processed > 0) {
        console.log(
          `[cron] Payment recovery: ${result.succeeded} recovered, ${result.failed} failed, ${result.pending} still pending`
        );
      }
    } catch (err) {
      console.error("[cron] Payment recovery error:", err);
    }
  });

  console.log("[cron] Cron jobs registered");
}

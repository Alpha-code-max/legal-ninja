import { GameSession } from "../models/GameSession";
import { User } from "../models/User";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { Quest } from "../models/Quest";
import mongoose from "mongoose";
import { LEVEL_DYNAMICS, LEVELS, XP_SOURCES } from "./progression";

export async function submitAnswer(params: {
  sessionId: string;
  userId: string;
  questionId: string;
  selected: string;
  correctOption: string;
  timeTakenMs: number;
  streak: number;
}): Promise<{
  correct: boolean;
  xpGained: number;
  newStreak: number;
  levelChanged: boolean;
  direction: "up" | "down" | null;
}> {
  const { sessionId, userId, questionId, selected, correctOption, timeTakenMs, streak } = params;
  const correct = selected === correctOption;

  const xpGained = correct
    ? XP_SOURCES.correct_answer + streak * XP_SOURCES.streak_bonus + Math.round(8 * Math.max(0, 1 - timeTakenMs / 30000))
    : 0;
  const newStreak = correct ? streak + 1 : 0;
  const scoreDelta = correct ? 10 : -3;

  // Update session
  await GameSession.findByIdAndUpdate(sessionId, {
    $inc: {
      score: scoreDelta,
      correct_answers: correct ? 1 : 0,
      total_answers: 1,
      xp_earned: xpGained,
    },
    $max: { max_streak: newStreak },
    $push: { answers: { question_id: questionId, selected, correct, time_taken_ms: timeTakenMs, xp_gained: xpGained } },
  });

  // Fetch user for level dynamics
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const newTotal = user.total_questions_answered + 1;
  const newCorrect = correct ? user.total_correct_answers + 1 : user.total_correct_answers;
  const newXP = user.xp + xpGained;
  const recentAnswers = [...user.recent_answers.slice(-29), correct];

  const oldLevel = user.level;
  let newLevel = computeLevel(newXP, newTotal);
  let direction: "up" | "down" | null = null;

  if (newLevel > oldLevel) {
    direction = "up";
  } else {
    const { shouldDemote } = checkDemotion(user, newTotal, newCorrect, recentAnswers, newStreak);
    if (shouldDemote) {
      newLevel = Math.max(1, oldLevel - 1);
      direction = "down";
    }
  }

  const session = await GameSession.findById(sessionId, { subject: 1 });
  const subject = session?.subject;

  await User.findByIdAndUpdate(userId, {
    $set: {
      xp: newXP,
      level: newLevel,
      current_streak: newStreak,
      total_questions_answered: newTotal,
      total_correct_answers: newCorrect,
      recent_answers: recentAnswers,
      ...(direction === "down" ? { last_demotion_at: new Date() } : {}),
    },
    $max: { longest_streak: newStreak },
    ...(!correct && subject ? { $addToSet: { weak_areas: subject } } : {}),
  });

  // Update quest progress
  await updateQuestProgress(userId, "questions_answered", 1);
  if (correct) await updateQuestProgress(userId, "correct_answers", 1);

  // Daily goal
  const today = new Date().toISOString().slice(0, 10);
  await User.findByIdAndUpdate(userId, {
    $inc: { [`daily_goal_${today}`]: 1 },
  }).catch(() => {});

  return { correct, xpGained, newStreak, levelChanged: newLevel !== oldLevel, direction };
}

export async function endGameSession(params: {
  sessionId: string;
  userId: string;
}): Promise<{
  grade: string;
  percentage: number;
  xpEarned: number;
  newBadges: string[];
  levelDirection: "up" | "down" | null;
}> {
  const session = await GameSession.findOneAndUpdate(
    { _id: params.sessionId, user_id: new mongoose.Types.ObjectId(params.userId), status: "active" },
    { $set: { status: "finished", ended_at: new Date() } },
    { new: true }
  );
  if (!session) throw new Error("Session not found or already finished");

  const percentage = session.total_answers > 0
    ? Math.round((session.correct_answers / session.total_answers) * 100) : 0;
  const grade = computeGrade(percentage);

  let bonusXP = 0;
  if (percentage === 100) bonusXP = XP_SOURCES.perfect_round;
  if (bonusXP > 0) {
    await User.findByIdAndUpdate(params.userId, { $inc: { xp: bonusXP } });
    await GameSession.findByIdAndUpdate(params.sessionId, { $inc: { xp_earned: bonusXP } });
  }

  await GameSession.findByIdAndUpdate(params.sessionId, { $set: { grade, percentage } });

  const newBadges = await checkAndAwardBadges(params.userId, { grade, streak: session.max_streak });
  updateLeaderboard(params.userId).catch(console.error);

  // Update battles_completed quest progress
  await Quest.updateMany(
    { user_id: new mongoose.Types.ObjectId(params.userId), quest_type: "battles_completed", status: "active" },
    [{ $set: { progress: { $min: ["$target", { $add: ["$progress", 1] }] } } }],
    { updatePipeline: true } as any
  );
  await Quest.updateMany(
    { user_id: new mongoose.Types.ObjectId(params.userId), status: "active", $expr: { $gte: ["$progress", "$target"] } },
    { $set: { status: "completed", completed_at: new Date() } }
  );

  // Compute level direction from latest user state
  const updatedUser = await User.findById(params.userId, "level").lean();
  const finalLevel = updatedUser?.level ?? 1;
  const sessionDoc = await GameSession.findById(params.sessionId, "xp_earned").lean();
  const levelDirection: "up" | "down" | null =
    finalLevel > (session.xp_earned > 0 ? 1 : 1) ? null : null; // computed below
  void levelDirection; // suppress unused warning — we derive it properly:

  // Compute by comparing level before vs after session
  const xpBeforeSession = (updatedUser ? (updatedUser as { xp?: number }).xp ?? 0 : 0) - (sessionDoc?.xp_earned ?? 0) - bonusXP;
  const levelBefore = computeLevel(Math.max(0, xpBeforeSession), Math.max(0, (updatedUser as { total_questions_answered?: number } | null)?.total_questions_answered ?? 0));
  const derivedDirection: "up" | "down" | null = finalLevel > levelBefore ? "up" : finalLevel < levelBefore ? "down" : null;

  return { grade, percentage, xpEarned: session.xp_earned + bonusXP, newBadges, levelDirection: derivedDirection };
}

async function updateQuestProgress(userId: string, type: string, increment: number) {
  await Quest.updateMany(
    { user_id: new mongoose.Types.ObjectId(userId), quest_type: type, status: "active" },
    [{ $set: { progress: { $min: ["$target", { $add: ["$progress", increment] }] } } }],
    { updatePipeline: true } as any
  );
  await Quest.updateMany(
    { user_id: new mongoose.Types.ObjectId(userId), status: "active", $expr: { $gte: ["$progress", "$target"] } },
    { $set: { status: "completed", completed_at: new Date() } }
  );
}

async function checkAndAwardBadges(userId: string, stats: { grade: string; streak: number }): Promise<string[]> {
  const user = await User.findById(userId, { badges: 1, longest_streak: 1 });
  if (!user) return [];
  const earned: string[] = [];
  if (stats.grade === "A+" && !user.badges.includes("Perfect Score")) earned.push("Perfect Score");
  if (user.longest_streak >= 10 && !user.badges.includes("Unbeaten Streak")) earned.push("Unbeaten Streak");
  if (earned.length > 0) {
    await User.findByIdAndUpdate(userId, { $addToSet: { badges: { $each: earned } } });
  }
  return earned;
}

export async function updateLeaderboard(userId: string): Promise<void> {
  const user = await User.findById(userId, { xp: 1, current_streak: 1, total_questions_answered: 1, total_correct_answers: 1 });
  if (!user) return;

  const winRate = user.total_questions_answered > 0
    ? Math.round((user.total_correct_answers / user.total_questions_answered) * 100) : 0;

  const types = ["global_all_time", "global_weekly", "daily"] as const;
  for (const type of types) {
    const periodStart = getPeriodStart(type);
    await LeaderboardEntry.findOneAndUpdate(
      { user_id: user._id, leaderboard_type: type, period_start: periodStart },
      { $set: { total_xp: user.xp, win_rate: winRate, current_streak: user.current_streak, total_questions_answered: user.total_questions_answered, updated_at: new Date() } },
      { upsert: true }
    );
  }

  // Recompute ranks per type
  for (const type of types) {
    const periodStart = getPeriodStart(type);
    const entries = await LeaderboardEntry.find({ leaderboard_type: type, period_start: periodStart }).sort({ total_xp: -1 });
    for (let i = 0; i < entries.length; i++) {
      entries[i].rank = i + 1;
      await entries[i].save();
    }
  }
}

function getPeriodStart(type: string): string {
  if (type === "daily") return new Date().toISOString().slice(0, 10);
  if (type === "global_weekly") {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay() + 1);
    return d.toISOString().slice(0, 10);
  }
  return "2024-01-01";
}

function computeLevel(xp: number, totalQ: number): number {
  let level = 1;
  for (const l of LEVELS) {
    if (xp >= l.xp_required && totalQ >= l.min_questions) level = l.level;
  }
  return level;
}

function checkDemotion(user: { level: number; last_demotion_at: Date | null }, newTotal: number, newCorrect: number, recentAnswers: boolean[], newStreak: number) {
  if (newTotal < LEVEL_DYNAMICS.demotion_accuracy_min_questions) return { shouldDemote: false };
  const accuracy = newCorrect / newTotal;
  const recentFailRate = recentAnswers.length >= 30
    ? recentAnswers.filter((a) => !a).length / recentAnswers.length : 0;
  const cooldownOk = !user.last_demotion_at ||
    Date.now() - new Date(user.last_demotion_at).getTime() > LEVEL_DYNAMICS.demotion_cooldown_hours * 3600000;
  const stabilized = newStreak >= LEVEL_DYNAMICS.stabilization_correct_streak;
  return {
    shouldDemote: !stabilized && cooldownOk &&
      (recentFailRate > LEVEL_DYNAMICS.demotion_failure_rate_threshold ||
       accuracy < LEVEL_DYNAMICS.demotion_accuracy_threshold),
  };
}

function computeGrade(pct: number): string {
  if (pct >= 95) return "A+";
  if (pct >= 85) return "A";
  if (pct >= 75) return "B";
  if (pct >= 65) return "C";
  if (pct >= 50) return "D";
  return "F";
}

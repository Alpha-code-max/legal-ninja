import { GameSession } from "../models/GameSession";
import { User } from "../models/User";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { Quest } from "../models/Quest";
import { Question } from "../models/Question";
import mongoose from "mongoose";
import { LEVEL_DYNAMICS, LEVELS, XP_SOURCES } from "./progression";
import { gradeEssay } from "./ai";

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
  
  const question = await Question.findById(questionId);
  const isEssay = question?.type === "essay";

  let correct = false;
  let xpGained = 0;
  let newStreak = streak;
  let scoreDelta = 0;

  if (isEssay) {
    // Essay: score/XP/streak update happens at endGameSession
    correct = false; // Pending grading
    xpGained = 0;
    newStreak = streak; // Streak is unaffected by essays during the session
    scoreDelta = 0;
  } else {
    correct = selected === correctOption;
    xpGained = correct
      ? XP_SOURCES.correct_answer + streak * XP_SOURCES.streak_bonus + Math.round(8 * Math.max(0, 1 - timeTakenMs / 30000))
      : 0;
    newStreak = correct ? streak + 1 : 0;
    scoreDelta = correct ? 10 : -3;
  }

  // Update session
  await GameSession.findByIdAndUpdate(sessionId, {
    $inc: {
      score: scoreDelta,
      correct_answers: correct ? 1 : 0,
      total_answers: 1,
      xp_earned: xpGained,
    },
    $max: { max_streak: newStreak },
    $push: {
      answers: {
        question_id: questionId,
        selected,
        correct,
        time_taken_ms: timeTakenMs,
        xp_gained: xpGained,
        score: isEssay ? 0 : (correct ? 10 : 0) // Default score for MCQs
      }
    },
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
    ...(!correct && !isEssay && subject ? { $addToSet: { weak_areas: subject } } : {}),
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
  answers: any[];
}> {
  const session = await GameSession.findOneAndUpdate(
    { _id: params.sessionId, user_id: new mongoose.Types.ObjectId(params.userId), status: "active" },
    { $set: { status: "finished", ended_at: new Date() } },
    { new: true }
  );
  if (!session) throw new Error("Session not found or already finished");

  // Identify all essay answers in the session.
  const questionIds = session.answers.map(a => a.question_id);
  const questions = await Question.find({ _id: { $in: questionIds } });
  const questionMap = new Map(questions.map(q => [q._id.toString(), q]));

  let essayXP = 0;
  let essayScore = 0;
  let essayCorrectCount = 0;
  let maxPossibleScore = 0;
  let totalPointsEarned = 0;

  // Grade essays and calculate max possible score
  for (const answer of session.answers) {
    const question = questionMap.get(answer.question_id);
    if (!question) continue;

    if (question.type === "essay") {
      maxPossibleScore += 100;
      try {
        const grade = await gradeEssay({
          question: question.question,
          modelAnswer: question.model_answer || "",
          rubric: question.rubric || "",
          userAnswer: answer.selected,
        });

        answer.score = grade.score;
        answer.feedback = grade.feedback;
        answer.strengths = grade.strengths;
        answer.weaknesses = grade.weaknesses;
        answer.correct = grade.score >= 50; // Pass threshold
        answer.xp_gained = Math.round(grade.score / 2);

        essayXP += answer.xp_gained;
        essayScore += answer.score;
        totalPointsEarned += answer.score;
        if (answer.correct) essayCorrectCount++;
      } catch (err) {
        console.error(`Failed to grade essay for question ${answer.question_id}:`, err);
        // On AI failure, we leave it as 0
      }
    } else {
      maxPossibleScore += 10;
      totalPointsEarned += answer.correct ? 10 : 0;
    }
  }

  // Update session with essay results
  session.score += essayScore;
  session.xp_earned += essayXP;
  session.correct_answers += essayCorrectCount;
  
  const percentage = maxPossibleScore > 0
    ? Math.round((totalPointsEarned / maxPossibleScore) * 100) : 0;
  const grade = computeGrade(percentage);

  session.percentage = percentage;
  session.grade = grade;
  
  // Save the updated answers with grades
  await session.save();

  let bonusXP = 0;
  if (percentage === 100) bonusXP = XP_SOURCES.perfect_round;
  if (bonusXP > 0) {
    await User.findByIdAndUpdate(params.userId, { $inc: { xp: bonusXP } });
    session.xp_earned += bonusXP;
    await session.save();
  }

  const newBadges = await checkAndAwardBadges(params.userId, { grade, streak: session.max_streak });
  updateLeaderboard(params.userId).catch(console.error);

  // Identify weak areas from failed essays
  const weakAreas: string[] = [];
  for (const answer of session.answers) {
    const question = questionMap.get(answer.question_id);
    if (question?.type === "essay" && !answer.correct && question.subject) {
      weakAreas.push(question.subject);
    }
  }

  // Update user stats for essays (MCQ stats were already updated in submitAnswer)
  if (essayXP > 0 || essayCorrectCount > 0 || weakAreas.length > 0) {
    await User.findByIdAndUpdate(params.userId, { 
      $inc: { 
        xp: essayXP,
        total_correct_answers: essayCorrectCount
      },
      ...(weakAreas.length > 0 ? { $addToSet: { weak_areas: { $each: weakAreas } } } : {})
    });
  }

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
  const updatedUser = await User.findById(params.userId, "level xp total_questions_answered").lean() as any;
  const finalLevel = updatedUser?.level ?? 1;
  
  // Compute by comparing level before vs after session
  const totalXPGainedInSession = session.xp_earned;
  const xpBeforeSession = (updatedUser?.xp ?? 0) - totalXPGainedInSession;
  const levelBefore = computeLevel(Math.max(0, xpBeforeSession), Math.max(0, (updatedUser?.total_questions_answered ?? 0) - session.total_answers));
  const derivedDirection: "up" | "down" | null = finalLevel > levelBefore ? "up" : finalLevel < levelBefore ? "down" : null;

  return {
    grade,
    percentage,
    xpEarned: session.xp_earned,
    newBadges,
    levelDirection: derivedDirection,
    answers: session.answers.map(a => ({
      question_id: a.question_id,
      selected: a.selected,
      correct: a.correct,
      time_taken_ms: a.time_taken_ms,
      score: a.score,
      feedback: a.feedback,
      strengths: a.strengths,
      weaknesses: a.weaknesses,
      xp_gained: a.xp_gained,
    }))
  };
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

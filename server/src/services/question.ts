import { Question, type IQuestion } from "../models/Question";
import { GameSession } from "../models/GameSession";
import { User } from "../models/User";
import { questionPassesStrictCheck } from "./ai";
import mongoose from "mongoose";

const REUSE_THRESHOLD = 50;

const TRACK_SUBJECTS: Record<string, string[]> = {
  law_school_track: [
    "civil_procedure", "criminal_procedure", "property_law",
    "corporate_law", "legal_ethics", "constitutional_law", "evidence_law",
  ],
  undergraduate_track: [
    "law_of_contract", "law_of_torts", "criminal_law",
    "constitutional_law", "equity_and_trusts", "family_law",
  ],
};

const TRACK_IDS = new Set(Object.keys(TRACK_SUBJECTS));

function isGeneralMode(subject: string): boolean {
  return TRACK_IDS.has(subject);
}

async function getSeenIds(userId: string): Promise<mongoose.Types.ObjectId[]> {
  const sessions = await GameSession.find(
    { user_id: new mongoose.Types.ObjectId(userId) },
    { "answers.question_id": 1 }
  ).limit(50).lean();

  return sessions
    .flatMap((s) => s.answers.map((a) => a.question_id))
    .filter(Boolean)
    .map((id) => { try { return new mongoose.Types.ObjectId(id); } catch { return null; } })
    .filter(Boolean) as mongoose.Types.ObjectId[];
}

async function incrementUsedCount(questions: IQuestion[]) {
  const ids = questions.map((q) => q._id).filter(Boolean);
  if (ids.length > 0) {
    await Question.updateMany({ _id: { $in: ids } }, { $inc: { used_count: 1 } });
  }
}

// ─── Serve from pre-built question banks only — no live AI generation ─────────

export async function getOrGenerateQuestions(params: {
  subject: string;
  track: string;
  difficulty: string;
  count: number;
  userId?: string;
}): Promise<IQuestion[]> {
  const { subject, track, difficulty, count, userId } = params;

  const seenIds = userId ? await getSeenIds(userId) : [];
  const seenFilter = seenIds.length > 0 ? { _id: { $nin: seenIds } } : {};

  // ── GENERAL MODE: pull from any subject in the track ─────────────────────
  if (isGeneralMode(subject)) {
    const subjects = TRACK_SUBJECTS[track] ?? TRACK_SUBJECTS.law_school_track;
    const results = await Question.aggregate<IQuestion>([
      {
        $match: {
          track,
          subject: { $in: subjects },
          difficulty,
          used_count: { $lt: REUSE_THRESHOLD },
          ...seenFilter,
        },
      },
      { $sample: { size: count } },
    ]);
    await incrementUsedCount(results);
    return results;
  }

  // ── SPECIFIC SUBJECT MODE: serve ONLY from this subject's bank ───────────
  const fetchFromBank = async (matchDifficulty: boolean) =>
    Question.aggregate<IQuestion>([
      {
        $match: {
          subject,
          track, // enforce track so constitutional_law doesn't bleed across tracks
          ...(matchDifficulty ? { difficulty } : {}),
          used_count: { $lt: REUSE_THRESHOLD },
          ...seenFilter,
        },
      },
      { $sample: { size: count * 3 } },
    ]);

  // Try exact difficulty first, fall back to any difficulty in the bank
  let raw = await fetchFromBank(true);
  if (raw.length === 0) raw = await fetchFromBank(false);

  const results = raw
    .filter((q) => {
      // Validate against full question text including all options and explanation
      const fullText = [
        q.question,
        q.options?.A ?? "", q.options?.B ?? "", q.options?.C ?? "", q.options?.D ?? "",
        q.explanation ?? "",
        q.topic ?? "",
      ].join(" ");
      return questionPassesStrictCheck(fullText, subject);
    })
    .slice(0, count);

  await incrementUsedCount(results);
  return results;
}

// ─── Balance check & deduction ────────────────────────────────────────────────

export async function checkAndDeductQuestion(userId: string): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new Error("User not found");

  const now = new Date();
  const hasPass = user.active_passes.some((p) => p.expires_at > now);
  if (hasPass) return;

  const total = user.free_questions_remaining + user.paid_questions_balance + user.earned_questions_balance;
  if (total <= 0) throw new Error("INSUFFICIENT_BALANCE");

  if (user.earned_questions_balance > 0) {
    await User.findByIdAndUpdate(userId, { $inc: { earned_questions_balance: -1 } });
  } else if (user.paid_questions_balance > 0) {
    await User.findByIdAndUpdate(userId, { $inc: { paid_questions_balance: -1 } });
  } else {
    await User.findByIdAndUpdate(userId, { $inc: { free_questions_remaining: -1 } });
  }
}

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
  return TRACK_IDS.has(subject) || subject === "mixed";
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
  source?: "past" | "ai" | "mixed";
  year?: number;
  mode?: string;
  type?: "mcq" | "essay" | "mixed";
  exclude_ids?: string[];
}): Promise<IQuestion[]> {
  const { subject, track, difficulty, count, userId, source, year, mode, type, exclude_ids = [] } = params;

  const seenIds = userId ? await getSeenIds(userId) : [];
  const excludeIdSet = new Set([...seenIds.map(id => id.toString()), ...exclude_ids]);
  const seenFilter = excludeIdSet.size > 0 ? { _id: { $nin: Array.from(excludeIdSet) } } : {};

  // Determine role for filtering (defaults to law_student)
  let role = "law_student";
  if (userId) {
    const u = await User.findById(userId).select("role").lean();
    if (u && (u as any).role) role = (u as any).role;
  }

  const allowedRolesClause = {
    $or: [
      { allowed_roles: { $exists: false } }, // backwards compatibility
      { allowed_roles: { $in: ["all", role] } },
    ],
  };

  // Build source filter based on requested source type
  const sourceFilter: Record<string, unknown> = {};
  if (source === "past") {
    sourceFilter.source = { $in: ["past", "bank"] };
  } else if (source === "ai") {
    sourceFilter.source = "ai";
  }
  // "mixed" or undefined → no source filter (both pools)

  // Build year filter if specified
  const yearFilter: Record<string, unknown> = {};
  if (year) {
    yearFilter.year = year;
  }

  // approved: { $ne: false } matches true AND undefined (backwards-compatible)
  const approvedClause = { approved: { $ne: false } };

  // ── EXAM SIMULATION: Essay-only questions from the specific subject ─────────
  if (mode === "exam_simulation") {
    const results = await fetchQuestions({
      ...params,
      count: 1,
      type: "essay",
      seenFilter,
      allowedRolesClause,
      sourceFilter,
      yearFilter,
      approvedClause
    });

    await incrementUsedCount(results);
    return results;
  }

  // Convert "mixed" to undefined so fetchQuestions doesn't filter by type
  const typeFilter = type && type !== "mixed" ? type : undefined;

  const results = await fetchQuestions({
    ...params,
    count,
    type: typeFilter,
    seenFilter,
    allowedRolesClause,
    sourceFilter,
    yearFilter,
    approvedClause
  });
  await incrementUsedCount(results);
  return results;
}

async function fetchQuestions(params: {
  subject: string;
  track: string;
  difficulty: string;
  count: number;
  type?: "mcq" | "essay";
  seenFilter: any;
  allowedRolesClause: any;
  sourceFilter: any;
  yearFilter: any;
  approvedClause: any;
}): Promise<IQuestion[]> {
  const { subject, track, difficulty, count, type, seenFilter, allowedRolesClause, sourceFilter, yearFilter, approvedClause } = params;
  const typeFilter = type ? { type } : {};

  // Essay questions don't have difficulty levels — ignore difficulty filter for essays
  const shouldIgnoreDifficulty = type === "essay";

  // ── GENERAL MODE: pull from any subject in the track ─────────────────────
  if (isGeneralMode(subject)) {
    const subjects = TRACK_SUBJECTS[track] ?? TRACK_SUBJECTS.law_school_track;

    // Try strict mode first (with approval filter)
    let results = await Question.aggregate<IQuestion>([
      {
        $match: {
          track,
          subject: { $in: subjects },
          ...(shouldIgnoreDifficulty ? {} : { difficulty }),
          used_count: { $lt: REUSE_THRESHOLD },
          ...typeFilter,
          ...approvedClause,
          ...seenFilter,
          ...allowedRolesClause,
          ...sourceFilter,
          ...yearFilter,
        },
      },
      { $sample: { size: count } },
    ]);

    // Fallback: if no results, try without approval filter
    if (results.length === 0) {
      results = await Question.aggregate<IQuestion>([
        {
          $match: {
            track,
            subject: { $in: subjects },
            ...(shouldIgnoreDifficulty ? {} : { difficulty }),
            used_count: { $lt: REUSE_THRESHOLD },
            ...typeFilter,
            ...seenFilter,
            $or: [{ allowed_roles: { $exists: false } }, { allowed_roles: { $in: ["all", "law_student"] } }],
            ...sourceFilter,
            ...yearFilter,
          },
        },
        { $sample: { size: count } },
      ]);
    }

    return results;
  }

  // ── SPECIFIC SUBJECT MODE: serve ONLY from this subject's bank ───────────
  const fetchFromBank = async (matchDifficulty: boolean, strict: boolean = true) =>
    Question.aggregate<IQuestion>([
      {
        $match: {
          subject,
          track,
          ...(matchDifficulty && !shouldIgnoreDifficulty ? { difficulty } : {}),
          used_count: { $lt: REUSE_THRESHOLD },
          ...typeFilter,
          ...(strict ? approvedClause : {}),
          ...seenFilter,
          ...(strict ? allowedRolesClause : { $or: [{ allowed_roles: { $exists: false } }, { allowed_roles: { $in: ["all", "law_student"] } }] }),
          ...sourceFilter,
          ...yearFilter,
        },
      },
      { $sample: { size: count * 3 } },
    ]);

  let raw = await fetchFromBank(true);
  if (raw.length === 0) raw = await fetchFromBank(false);
  // If still empty, try without strict approval filter
  if (raw.length === 0) raw = await fetchFromBank(true, false);
  if (raw.length === 0) raw = await fetchFromBank(false, false);

  return raw
    .filter((q) => {
      // Skip strict check for essay questions (they're manually curated)
      if (q.type === "essay") return true;

      const fullText = [
        q.question,
        q.options?.A ?? "", q.options?.B ?? "", q.options?.C ?? "", q.options?.D ?? "",
        q.explanation ?? "",
        q.topic ?? "",
      ].join(" ");
      return questionPassesStrictCheck(fullText, subject);
    })
    .slice(0, count);
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

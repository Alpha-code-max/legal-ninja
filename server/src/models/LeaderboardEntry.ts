/// <reference types="node" />
import mongoose, { Schema, type Document } from "mongoose";

export interface ILeaderboardEntry extends Document {
  user_id: mongoose.Types.ObjectId;
  leaderboard_type: string;
  subject: string | null;
  period_start: string;
  rank: number | null;
  total_xp: number;
  win_rate: number;
  current_streak: number;
  total_questions_answered: number;
  updated_at: Date;
}

const LeaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    user_id:                  { type: Schema.Types.ObjectId, ref: "User", required: true },
    leaderboard_type:         { type: String, required: true },
    subject:                  { type: String, default: null },
    period_start:             { type: String, required: true },
    rank:                     { type: Number, default: null },
    total_xp:                 { type: Number, default: 0 },
    win_rate:                 { type: Number, default: 0 },
    current_streak:           { type: Number, default: 0 },
    total_questions_answered: { type: Number, default: 0 },
    updated_at:               { type: Date, default: Date.now },
  },
  { timestamps: false }
);

LeaderboardEntrySchema.index({ leaderboard_type: 1, period_start: 1, rank: 1 });
LeaderboardEntrySchema.index({ user_id: 1, leaderboard_type: 1, period_start: 1 }, { unique: true });

export const LeaderboardEntry = mongoose.model<ILeaderboardEntry>("LeaderboardEntry", LeaderboardEntrySchema);

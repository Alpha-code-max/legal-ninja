/// <reference types="node" />
import mongoose, { Schema, type Document } from "mongoose";

export interface IAnswerRecord {
  question_id: string;
  selected: string;
  correct: boolean;
  time_taken_ms: number;
  xp_gained: number;
  // Essay fields
  score?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
  // AI evaluation fields
  ai_evaluation?: string;      // Step 8: feedback for wrong MCQ answers
  deep_explanation?: string;   // Step 9: premium deep legal explanation
}

export interface IGameSession extends Document {
  user_id: mongoose.Types.ObjectId;
  mode: string;
  track: string;
  subject: string | null;
  difficulty: string;
  time_limit_mins: number;
  question_count: number;
  score: number;
  correct_answers: number;
  total_answers: number;
  xp_earned: number;
  grade: string | null;
  percentage: number | null;
  max_streak: number;
  answers: IAnswerRecord[];
  started_at: Date;
  ended_at: Date | null;
  status: "active" | "finished" | "abandoned";
}

const GameSessionSchema = new Schema<IGameSession>(
  {
    user_id:        { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    mode:           { type: String, required: true },
    track:          { type: String, required: true },
    subject:        { type: String, default: null },
    difficulty:     { type: String, default: "medium" },
    time_limit_mins:{ type: Number, required: true },
    question_count: { type: Number, required: true },
    score:          { type: Number, default: 0 },
    correct_answers:{ type: Number, default: 0 },
    total_answers:  { type: Number, default: 0 },
    xp_earned:      { type: Number, default: 0 },
    grade:          { type: String, default: null },
    percentage:     { type: Number, default: null },
    max_streak:     { type: Number, default: 0 },
    answers: [{
      question_id:  String,
      selected:     String,
      correct:      Boolean,
      time_taken_ms:Number,
      xp_gained:    Number,
      score:        Number,
      feedback:     String,
      strengths:    [String],
      weaknesses:   [String],
      ai_evaluation:String,      // Step 8: feedback for wrong MCQ answers
      deep_explanation:String,   // Step 9: premium deep legal explanation
    }],
    started_at:     { type: Date, default: Date.now },
    ended_at:       { type: Date, default: null },
    status:         { type: String, enum: ["active", "finished", "abandoned"], default: "active" },
  },
  { timestamps: false }
);

export const GameSession = mongoose.model<IGameSession>("GameSession", GameSessionSchema);

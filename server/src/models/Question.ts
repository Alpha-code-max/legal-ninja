import mongoose, { Schema, type Document } from "mongoose";
import type { Types } from "mongoose";

export interface IQuestion extends Document {
  subject: string;
  track: string;
  difficulty: string;
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  topic: string | null;
  used_count: number;
  source_document_id: mongoose.Types.ObjectId | null;
  created_at: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subject:        { type: String, required: true, index: true },
    track:          { type: String, required: true, index: true },
    difficulty:     { type: String, required: true, index: true },
    question:       { type: String, required: true },
    options:        { A: String, B: String, C: String, D: String },
    correct_option: { type: String, enum: ["A", "B", "C", "D"], required: true },
    explanation:    { type: String, default: null },
    topic:          { type: String, default: null },
    used_count:          { type: Number, default: 0 },
    source_document_id:  { type: Schema.Types.ObjectId, ref: "PdfDocument", default: null, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

QuestionSchema.index({ subject: 1, difficulty: 1, used_count: 1 });

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);

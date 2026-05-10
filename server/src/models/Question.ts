import mongoose, { Schema, type Document } from "mongoose";
import type { Types } from "mongoose";

export interface IQuestion extends Document {
  subject: string;
  track: string;
  difficulty: string;
  type: "mcq" | "essay";
  question: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
  model_answer?: string;
  rubric?: string;
  topic: string | null;
  passage?: string | null;
  used_count: number;
  source_document_id: mongoose.Types.ObjectId | null;
  // New fields for proposal
  source: "bank" | "ai" | "past";
  year?: number; // exam year (for past questions)
  allowed_roles?: string[]; // e.g., ["bar_student"], ["law_student"], ["all"]
  approved?: boolean;
  validated?: boolean;
  created_by?: mongoose.Types.ObjectId | null;
  created_at: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    subject:        { type: String, required: true, index: true },
    track:          { type: String, required: true, index: true },
    difficulty:     { type: String, required: true, index: true },
    type:           { type: String, enum: ["mcq", "essay"], default: "mcq", index: true },
    question:       { type: String, required: true },
    options:        { A: String, B: String, C: String, D: String },
    correct_option: { type: String, enum: ["A", "B", "C", "D"] },
    explanation:    { type: String, default: null },
    model_answer:   { type: String, default: null },
    rubric:         { type: String, default: null },
    topic:          { type: String, default: null },
    passage:        { type: String, default: null },
    used_count:          { type: Number, default: 0 },
    source_document_id:  { type: Schema.Types.ObjectId, ref: "PdfDocument", default: null, index: true },
    // Proposal fields
    source:              { type: String, enum: ["bank", "ai", "past"], default: "bank", index: true },
    year:                { type: Number, default: null, index: true },
    allowed_roles:       { type: [String], default: undefined }, // undefined => visible to all (backwards compatible)
    approved:            { type: Boolean, default: true },
    validated:           { type: Boolean, default: true },
    created_by:          { type: Schema.Types.ObjectId, ref: "User", default: null, index: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: false } }
);

QuestionSchema.index({ subject: 1, difficulty: 1, used_count: 1 });

export const Question = mongoose.model<IQuestion>("Question", QuestionSchema);

import mongoose, { Schema, type Document } from "mongoose";

export interface IQuest extends Document {
  user_id: mongoose.Types.ObjectId;
  quest_id: string;
  quest_type: string;
  title: string;
  target: number;
  progress: number;
  status: "active" | "completed" | "claimed";
  reward_xp: number;
  reward_questions: number;
  expires_at: Date | null;
  completed_at: Date | null;
  claimed_at: Date | null;
  created_at: Date;
}

const QuestSchema = new Schema<IQuest>(
  {
    user_id:          { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    quest_id:         { type: String, required: true },
    quest_type:       { type: String, required: true },
    title:            { type: String, required: true },
    target:           { type: Number, required: true },
    progress:         { type: Number, default: 0 },
    status:           { type: String, enum: ["active", "completed", "claimed"], default: "active" },
    reward_xp:        { type: Number, default: 0 },
    reward_questions: { type: Number, default: 0 },
    expires_at:       { type: Date, default: null },
    completed_at:     { type: Date, default: null },
    claimed_at:       { type: Date, default: null },
    created_at:       { type: Date, default: Date.now },
  },
  { timestamps: false }
);

QuestSchema.index({ user_id: 1, quest_id: 1 }, { unique: true });

export const Quest = mongoose.model<IQuest>("Quest", QuestSchema);

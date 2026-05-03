/// <reference types="node" />
import mongoose, { Schema, type Document } from "mongoose";

export interface ITransaction extends Document {
  user_id: mongoose.Types.ObjectId;
  reference: string;
  gateway: string;
  amount_ngn: number;
  questions_added: number;
  pass_activated: string | null;
  bonus_xp: number;
  status: "pending" | "success" | "failed";
  gateway_response: unknown;
  created_at: Date;
  completed_at: Date | null;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    user_id:          { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    reference:        { type: String, required: true, unique: true },
    gateway:          { type: String, required: true },
    amount_ngn:       { type: Number, required: true },
    questions_added:  { type: Number, default: 0 },
    pass_activated:   { type: String, default: null },
    bonus_xp:         { type: Number, default: 0 },
    status:           { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    gateway_response: { type: Schema.Types.Mixed },
    created_at:       { type: Date, default: Date.now },
    completed_at:     { type: Date, default: null },
  },
  { timestamps: false }
);

export const Transaction = mongoose.model<ITransaction>("Transaction", TransactionSchema);

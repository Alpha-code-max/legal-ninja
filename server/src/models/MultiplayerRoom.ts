/// <reference types="node" />
import mongoose, { Schema, type Document } from "mongoose";

export interface IMultiplayerRoom extends Document {
  code: string;
  host_id: mongoose.Types.ObjectId;
  mode: string;
  track: string;
  subject: string | null;
  difficulty: string;
  max_players: number;
  status: "waiting" | "active" | "finished";
  questions: unknown[];
  players: {
    user_id: mongoose.Types.ObjectId;
    username: string;
    score: number;
    correct: number;
    streak: number;
    joined_at: Date;
  }[];
  created_at: Date;
  started_at: Date | null;
  ended_at: Date | null;
}

const MultiplayerRoomSchema = new Schema<IMultiplayerRoom>(
  {
    code:       { type: String, required: true, unique: true },
    host_id:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    mode:       { type: String, default: "duel" },
    track:      { type: String, required: true },
    subject:    { type: String, default: null },
    difficulty: { type: String, default: "medium" },
    max_players:{ type: Number, default: 2 },
    status:     { type: String, enum: ["waiting", "active", "finished"], default: "waiting" },
    questions:  { type: [Schema.Types.Mixed], default: [] },
    players: [{
      user_id:   { type: Schema.Types.ObjectId, ref: "User" },
      username:  String,
      score:     { type: Number, default: 0 },
      correct:   { type: Number, default: 0 },
      streak:    { type: Number, default: 0 },
      joined_at: { type: Date, default: Date.now },
    }],
    created_at: { type: Date, default: Date.now },
    started_at: { type: Date, default: null },
    ended_at:   { type: Date, default: null },
  },
  { timestamps: false }
);

export const MultiplayerRoom = mongoose.model<IMultiplayerRoom>("MultiplayerRoom", MultiplayerRoomSchema);

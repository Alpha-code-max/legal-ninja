import mongoose, { Schema, type Document } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password_hash: string;
  avatar_url: string;
  country: string;
  track: string;
  role?: "law_student" | "bar_student" | "admin";
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  total_questions_answered: number;
  total_correct_answers: number;
  free_questions_remaining: number;
  paid_questions_balance: number;
  earned_questions_balance: number;
  active_passes: {
    pass_type: string;
    pass_name: string;
    subject_id?: string;
    expires_at: Date;
  }[];
  badges: string[];
  weak_areas: string[];
  recent_answers: boolean[];
  last_demotion_at: Date | null;
  last_login_at: Date;
  referral_count: number;
  referral_code: string;
  referred_by: mongoose.Types.ObjectId | null;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_expires: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  created_at: Date;
  updated_at: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username:                  { type: String, required: true, unique: true, trim: true, maxlength: 30 },
    email:                     { type: String, required: true, unique: true, lowercase: true },
    password_hash:             { type: String, required: true },
    avatar_url:                { type: String, default: "" },
    country:                   { type: String, default: "NG", maxlength: 2 },
    track:                     { type: String, default: "law_school_track" },
    role:                      { type: String, enum: ["law_student","bar_student","admin"], default: "law_student" },
    xp:                        { type: Number, default: 0 },
    level:                     { type: Number, default: 1 },
    current_streak:            { type: Number, default: 0 },
    longest_streak:            { type: Number, default: 0 },
    total_questions_answered:  { type: Number, default: 0 },
    total_correct_answers:     { type: Number, default: 0 },
    free_questions_remaining:  { type: Number, default: 100 },
    paid_questions_balance:    { type: Number, default: 0 },
    earned_questions_balance:  { type: Number, default: 0 },
    active_passes: [{
      pass_type:   { type: String, required: true },
      pass_name:   { type: String, required: true },
      subject_id:  { type: String },
      expires_at:  { type: Date, required: true },
    }],
    badges:          { type: [String], default: [] },
    weak_areas:      { type: [String], default: [] },
    recent_answers:  { type: [Boolean], default: [] },
    last_demotion_at: { type: Date, default: null },
    last_login_at:   { type: Date, default: Date.now },
    referral_count:  { type: Number, default: 0 },
    referral_code:   { type: String, unique: true, sparse: true },
    referred_by:              { type: Schema.Types.ObjectId, ref: "User", default: null },
    email_verified:           { type: Boolean, default: false },
    email_verification_token: { type: String, default: null },
    email_verification_expires: { type: Date, default: null },
    password_reset_token:     { type: String, default: null },
    password_reset_expires:   { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

export const User = mongoose.model<IUser>("User", UserSchema);

import { Router, type Request } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import crypto from "crypto";
import { User } from "../models/User";
import { signToken } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { sendVerificationEmail, sendPasswordResetEmail } from "../services/email";

const router = Router();

const RegisterSchema = z.object({
  username:      z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/),
  email:         z.string().email(),
  password:      z.string().min(8).max(72),
  track:         z.enum(["law_school_track", "undergraduate_track"]).default("law_school_track"),
  referral_code: z.string().optional(),
});

const LoginSchema = z.object({
  email:    z.string().email(),
  password: z.string(),
});

const ForgotPasswordSchema = z.object({
  email: z.string().email(),
});

const ResetPasswordSchema = z.object({
  token:    z.string().min(1),
  password: z.string().min(8).max(72),
});

const VerifyEmailSchema = z.object({
  token: z.string().min(1),
});

router.post("/register", validate(RegisterSchema), async (req: Request, res) => {
  try {
    const { username, email, password, track, referral_code } = req.body as z.infer<typeof RegisterSchema>;

    if (await User.exists({ $or: [{ email }, { username }] })) {
      res.status(409).json({ error: "Email or username already taken" });
      return;
    }

    const password_hash = await bcrypt.hash(password, 12);
    const referral_code_gen = Math.random().toString(36).slice(2, 14).toUpperCase();
    const verification_token = crypto.randomBytes(32).toString("hex");
    const verification_expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    let referredBy = null;
    if (referral_code) {
      const referrer = await User.findOne({ referral_code });
      if (referrer) {
        referredBy = referrer._id;
        await User.findByIdAndUpdate(referrer._id, {
          $inc: { earned_questions_balance: 20, referral_count: 1 },
        });
      }
    }

    const user = await User.create({
      username, email, password_hash, track,
      referral_code: referral_code_gen,
      referred_by: referredBy,
      email_verification_token: verification_token,
      email_verification_expires: verification_expires,
      ...(referredBy ? { earned_questions_balance: 20 } : {}),
    });

    await sendVerificationEmail(email, username, verification_token).catch(console.error);

    const token = signToken({ uid: String(user._id), username: user.username, email: user.email, level: user.level });
    const { password_hash: _, email_verification_token: _vt, password_reset_token: _rt, ...safeUser } = user.toObject();
    res.status(201).json({ token, user: safeUser, email_verification_sent: true });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/login", validate(LoginSchema), async (req: Request, res) => {
  try {
    const { email, password } = req.body as z.infer<typeof LoginSchema>;
    const user = await User.findOne({ email }).select("+password_hash");
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    await User.findByIdAndUpdate(user._id, { last_login_at: new Date() });
    const token = signToken({ uid: String(user._id), username: user.username, email: user.email, level: user.level });
    const { password_hash: _, email_verification_token: _vt, password_reset_token: _rt, ...safeUser } = user.toObject();
    res.json({ token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

router.post("/verify-email", validate(VerifyEmailSchema), async (req: Request, res) => {
  try {
    const { token } = req.body as z.infer<typeof VerifyEmailSchema>;
    const user = await User.findOne({
      email_verification_token: token,
      email_verification_expires: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification link" });
      return;
    }
    await User.findByIdAndUpdate(user._id, {
      email_verified: true,
      email_verification_token: null,
      email_verification_expires: null,
    });
    res.json({ verified: true });
  } catch (err) {
    console.error("Verify email error:", err);
    res.status(500).json({ error: "Email verification failed" });
  }
});

router.post("/resend-verification", async (req: Request, res) => {
  try {
    const { email } = req.body as { email: string };
    if (!email) { res.status(400).json({ error: "Email required" }); return; }
    const user = await User.findOne({ email });
    if (!user) { res.json({ sent: true }); return; } // Don't reveal if email exists
    if (user.email_verified) { res.status(400).json({ error: "Email already verified" }); return; }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, {
      email_verification_token: token,
      email_verification_expires: expires,
    });
    await sendVerificationEmail(email, user.username, token).catch(console.error);
    res.json({ sent: true });
  } catch (err) {
    console.error("Resend verification error:", err);
    res.status(500).json({ error: "Failed to resend verification" });
  }
});

router.post("/forgot-password", validate(ForgotPasswordSchema), async (req: Request, res) => {
  try {
    const { email } = req.body as z.infer<typeof ForgotPasswordSchema>;
    const user = await User.findOne({ email });
    // Always return success to avoid email enumeration
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const expires = new Date(Date.now() + 60 * 60 * 1000);
      await User.findByIdAndUpdate(user._id, {
        password_reset_token: token,
        password_reset_expires: expires,
      });
      await sendPasswordResetEmail(email, user.username, token).catch(console.error);
    }
    res.json({ sent: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to process request" });
  }
});

router.post("/reset-password", validate(ResetPasswordSchema), async (req: Request, res) => {
  try {
    const { token, password } = req.body as z.infer<typeof ResetPasswordSchema>;
    const user = await User.findOne({
      password_reset_token: token,
      password_reset_expires: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset link" });
      return;
    }
    const password_hash = await bcrypt.hash(password, 12);
    await User.findByIdAndUpdate(user._id, {
      password_hash,
      password_reset_token: null,
      password_reset_expires: null,
    });
    res.json({ reset: true });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Password reset failed" });
  }
});

export default router;

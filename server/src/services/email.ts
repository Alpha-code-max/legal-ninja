/// <reference types="node" />
import nodemailer from "nodemailer";

function createTransport() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host:   process.env.SMTP_HOST,
      port:   parseInt(process.env.SMTP_PORT ?? "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  // Dev: log to console instead of sending
  return null;
}

const FROM = process.env.EMAIL_FROM ?? "Legal Ninja <noreply@legalninja.app>";
const APP_URL = process.env.FRONTEND_URL ?? "http://localhost:3000";

async function send(to: string, subject: string, html: string): Promise<void> {
  const transport = createTransport();
  if (!transport) {
    console.log(`[EMAIL] To: ${to}\nSubject: ${subject}\n${html.replace(/<[^>]+>/g, "")}`);
    return;
  }
  await transport.sendMail({ from: FROM, to, subject, html });
}

export async function sendVerificationEmail(to: string, username: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/verify-email?token=${token}`;
  await send(to, "Verify your Legal Ninja account", `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#00F5FF">Welcome, ${username}! ⚔️</h2>
      <p>Click the link below to verify your email and unlock full features:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#00F5FF;color:#000;border-radius:8px;font-weight:700;text-decoration:none">Verify Email</a>
      <p style="color:#888;font-size:12px;margin-top:24px">Link expires in 24 hours. If you didn't register, ignore this email.</p>
    </div>
  `);
}

export async function sendPasswordResetEmail(to: string, username: string, token: string): Promise<void> {
  const link = `${APP_URL}/auth/reset-password?token=${token}`;
  await send(to, "Reset your Legal Ninja password", `
    <div style="font-family:sans-serif;max-width:480px;margin:auto">
      <h2 style="color:#C026D3">Password Reset 🔐</h2>
      <p>Hi ${username}, click below to reset your password:</p>
      <a href="${link}" style="display:inline-block;padding:12px 24px;background:#C026D3;color:#fff;border-radius:8px;font-weight:700;text-decoration:none">Reset Password</a>
      <p style="color:#888;font-size:12px;margin-top:24px">Link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  `);
}

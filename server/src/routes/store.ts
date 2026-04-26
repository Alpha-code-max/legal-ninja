import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { initPaystackPayment, verifyPaystackSignature, processPaystackWebhook } from "../services/payment";
import { query, queryOne } from "../db/client";
import type { DbUser } from "../types";
import { v4 as uuid } from "uuid";

const router = Router();

const BundleSchema = z.object({
  bundle_index: z.number().int().min(0).max(3),
});

const PassSchema = z.object({
  pass_id: z.enum(["7_day_unlimited", "subject_mastery"]),
  subject_id: z.string().max(60).optional(),
});

const BUNDLES = [
  { questions: 50,  price_ngn: 500  },
  { questions: 100, price_ngn: 1000 },
  { questions: 200, price_ngn: 1900 },
  { questions: 500, price_ngn: 4500 },
];

const PASSES: Record<string, { price_ngn: number; name: string }> = {
  "7_day_unlimited": { price_ngn: 700,  name: "7-Day Unlimited" },
  "subject_mastery": { price_ngn: 800,  name: "Subject Mastery Pack" },
};

// Initiate bundle purchase
router.post("/buy/bundle", requireAuth, validate(BundleSchema), async (req: Request, res) => {
  try {
    const bundle = BUNDLES[req.body.bundle_index];
    if (!bundle) { res.status(400).json({ error: "Invalid bundle" }); return; }

    const user = await queryOne<{ email: string }>(`SELECT email FROM users WHERE uid = $1`, [req.user!.uid]);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const reference = `LN-${uuid().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    await query(
      `INSERT INTO transactions (user_id, reference, gateway, amount_ngn, questions_added, status)
       VALUES ($1, $2, 'paystack', $3, $4, 'pending')`,
      [req.user!.uid, reference, bundle.price_ngn, bundle.questions]
    );

    const result = await initPaystackPayment({
      userId: req.user!.uid,
      email: user.email,
      amountNGN: bundle.price_ngn,
      questionsToAdd: bundle.questions,
      reference,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// Initiate pass purchase
router.post("/buy/pass", requireAuth, validate(PassSchema), async (req: Request, res) => {
  try {
    const pass = PASSES[req.body.pass_id];
    if (!pass) { res.status(400).json({ error: "Invalid pass" }); return; }

    const user = await queryOne<{ email: string }>(`SELECT email FROM users WHERE uid = $1`, [req.user!.uid]);
    if (!user) { res.status(404).json({ error: "User not found" }); return; }

    const reference = `LN-${uuid().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    await query(
      `INSERT INTO transactions (user_id, reference, gateway, amount_ngn, questions_added, pass_activated, status)
       VALUES ($1, $2, 'paystack', $3, 0, $4, 'pending')`,
      [req.user!.uid, reference, pass.price_ngn, req.body.pass_id]
    );

    const result = await initPaystackPayment({
      userId: req.user!.uid,
      email: user.email,
      amountNGN: pass.price_ngn,
      questionsToAdd: 0,
      passType: req.body.pass_id,
      reference,
    });

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to initiate pass purchase" });
  }
});

// Paystack webhook — raw body required for signature verification
router.post("/webhook/paystack", async (req, res) => {
  const signature = req.headers["x-paystack-signature"] as string;
  const rawBody = (req as Request & { rawBody?: string }).rawBody;

  if (!rawBody || !verifyPaystackSignature(rawBody, signature)) {
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  try {
    await processPaystackWebhook(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook processing error:", err);
    res.sendStatus(500);
  }
});

// Transaction history
router.get("/transactions", requireAuth, async (req: Request, res) => {
  try {
    const txns = await query(
      `SELECT reference, gateway, amount_ngn, questions_added, pass_activated, status, created_at, completed_at
       FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20`,
      [req.user!.uid]
    );
    res.json(txns);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

export default router;

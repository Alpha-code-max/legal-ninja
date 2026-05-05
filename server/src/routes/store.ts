import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { initPaystackPayment, verifyPaystackSignature, processPaystackWebhook } from "../services/payment";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import mongoose from "mongoose";
import { v4 as uuid } from "uuid";

const router = Router();

const BundleSchema = z.object({
  bundle_index: z.number().int().min(0).max(3),
});

const PassSchema = z.object({
  pass_id:    z.enum(["7_day_unlimited", "subject_mastery"]),
  subject_id: z.string().max(60).optional(),
});

const BUNDLES = [
  { questions: 50,  price_ngn: 500  },
  { questions: 100, price_ngn: 1000 },
  { questions: 200, price_ngn: 1900 },
  { questions: 500, price_ngn: 4500 },
];

const PASSES: Record<string, { price_ngn: number; name: string; days: number }> = {
  "7_day_unlimited": { price_ngn: 700,  name: "7-Day Unlimited",     days: 7  },
  "subject_mastery": { price_ngn: 800,  name: "Subject Mastery Pack", days: 30 },
};

// POST /api/store/buy/bundle
router.post("/buy/bundle", requireAuth, validate(BundleSchema), async (req: Request, res) => {
  try {
    const bundle = BUNDLES[req.body.bundle_index];
    if (!bundle) {
      console.warn(`[Store] Invalid bundle index: ${req.body.bundle_index}`);
      res.status(400).json({ error: "Invalid bundle index" });
      return;
    }

    const user = await User.findById(req.user!.uid, "email").lean();
    if (!user) {
      console.error(`[Store] User ${req.user!.uid} not found`);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const reference = `LN-${uuid().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    await Transaction.create({
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
      reference,
      gateway: "paystack",
      amount_ngn: bundle.price_ngn,
      questions_added: bundle.questions,
      status: "pending",
    });

    console.log(`[Store] Initiating bundle purchase: ${reference}, ${bundle.questions} questions @ ₦${bundle.price_ngn}`);

    const result = await initPaystackPayment({
      userId: req.user!.uid,
      email: user.email,
      amountNGN: bundle.price_ngn,
      questionsToAdd: bundle.questions,
      reference,
    });

    res.json(result);
  } catch (err) {
    console.error("[Store] Bundle purchase error:", err);
    res.status(500).json({ error: "Failed to initiate payment" });
  }
});

// POST /api/store/buy/pass
router.post("/buy/pass", requireAuth, validate(PassSchema), async (req: Request, res) => {
  try {
    const pass = PASSES[req.body.pass_id];
    if (!pass) {
      console.warn(`[Store] Invalid pass ID: ${req.body.pass_id}`);
      res.status(400).json({ error: `Invalid pass ID: ${req.body.pass_id}` });
      return;
    }

    const user = await User.findById(req.user!.uid, "email").lean();
    if (!user) {
      console.error(`[Store] User ${req.user!.uid} not found`);
      res.status(404).json({ error: "User not found" });
      return;
    }

    const reference = `LN-${uuid().replace(/-/g, "").slice(0, 16).toUpperCase()}`;

    await Transaction.create({
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
      reference,
      gateway: "paystack",
      amount_ngn: pass.price_ngn,
      questions_added: 0,
      pass_activated: req.body.pass_id,
      status: "pending",
    });

    console.log(`[Store] Initiating pass purchase: ${reference}, ${pass.name} (${pass.days} days) @ ₦${pass.price_ngn}`);

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
    console.error("[Store] Pass purchase error:", err);
    res.status(500).json({ error: "Failed to initiate pass purchase" });
  }
});

// POST /api/store/webhook/paystack — raw body required for signature verification
router.post("/webhook/paystack", async (req, res) => {
  const startTime = Date.now();
  const signature = req.headers["x-paystack-signature"] as string;
  const rawBody = (req as Request & { rawBody?: string }).rawBody;
  const reference = req.body?.data?.reference ?? "unknown";

  console.log(`[Webhook] Received Paystack webhook: ${reference}`);

  // ===== VALIDATION: Raw body exists =====
  if (!rawBody) {
    console.error(`[Webhook] Missing raw body for ${reference}`);
    res.status(400).json({ error: "Missing request body" });
    return;
  }

  // ===== VALIDATION: Signature verification =====
  if (!signature) {
    console.error(`[Webhook] Missing signature header for ${reference}`);
    res.status(401).json({ error: "Missing signature" });
    return;
  }

  if (!verifyPaystackSignature(rawBody, signature)) {
    console.error(`[Webhook] Invalid signature for ${reference}`);
    res.status(401).json({ error: "Invalid signature" });
    return;
  }

  console.log(`[Webhook] ✓ Signature verified for ${reference}`);

  // ===== PROCESSING =====
  try {
    const event = req.body;

    // Validate event structure
    if (!event.event || !event.data) {
      console.error(`[Webhook] Invalid event structure for ${reference}`);
      res.status(400).json({ error: "Invalid event structure" });
      return;
    }

    console.log(`[Webhook] Processing event: ${event.event}`);

    await processPaystackWebhook(event);

    const duration = Date.now() - startTime;
    console.log(`[Webhook] ✅ Processed successfully in ${duration}ms`);
    res.status(200).json({ status: "ok" });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    const message = err.message || String(err);
    console.error(`[Webhook] ❌ Processing failed for ${reference} (${duration}ms):`, message);

    // Always return 200 to acknowledge receipt (Paystack will retry if we return error)
    // The actual processing error is logged and should be monitored
    res.status(200).json({
      status: "received",
      note: "Processing failed but webhook acknowledged. Check logs for details.",
    });
  }
});

// GET /api/store/transactions
router.get("/transactions", requireAuth, async (req: Request, res) => {
  try {
    const txns = await Transaction.find({ user_id: new mongoose.Types.ObjectId(req.user!.uid) })
      .sort({ created_at: -1 })
      .limit(20)
      .lean();
    res.json(txns.map((t) => ({ ...t, id: String(t._id) })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch transactions" });
  }
});

// GET /api/store/verify/:reference — frontend polls this after Paystack redirect
router.get("/verify/:reference", requireAuth, async (req: Request, res) => {
  try {
    const txn = await Transaction.findOne({
      reference: req.params.reference,
      user_id: new mongoose.Types.ObjectId(req.user!.uid),
    }).lean();
    if (!txn) { res.status(404).json({ error: "Transaction not found" }); return; }
    res.json({ status: txn.status, questions_added: txn.questions_added, pass_activated: txn.pass_activated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to verify transaction" });
  }
});

export default router;

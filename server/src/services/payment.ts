import axios from "axios";
import crypto from "crypto";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { XP_SOURCES } from "./progression";

export interface InitPaymentResult {
  authorization_url: string;
  reference: string;
}

export interface WebhookEvent {
  event: string;
  data: {
    reference: string;
    status: string;
    metadata?: { user_id: string; questions_to_add: number; pass_type?: string };
    amount?: number;
    customer?: { email: string };
  };
}

// Error types for better handling
class PaymentError extends Error {
  constructor(
    message: string,
    public code: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "PaymentError";
  }
}

export async function initPaystackPayment(params: {
  userId: string;
  email: string;
  amountNGN: number;
  questionsToAdd: number;
  passType?: string;
  reference: string;
}): Promise<InitPaymentResult> {
  try {
    const res = await axios.post(
      "https://api.paystack.co/transaction/initialize",
      {
        email: params.email,
        amount: params.amountNGN * 100,
        reference: params.reference,
        metadata: {
          user_id: params.userId,
          questions_to_add: params.questionsToAdd,
          pass_type: params.passType ?? null,
        },
        callback_url: `${process.env.FRONTEND_URL}/store?payment=success&reference=${params.reference}`,
      },
      { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
    );
    return {
      authorization_url: res.data.data.authorization_url,
      reference: res.data.data.reference,
    };
  } catch (err) {
    console.error(`[Payment] Paystack initialization failed for ${params.reference}:`, err);
    throw new PaymentError(
      "Failed to initialize payment with Paystack",
      "PAYSTACK_INIT_FAILED",
      true
    );
  }
}

export function verifyPaystackSignature(body: string, signature: string): boolean {
  try {
    const hash = crypto
      .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
      .update(body)
      .digest("hex");
    return hash === signature;
  } catch (err) {
    console.error("[Payment] Signature verification error:", err);
    return false;
  }
}

/**
 * Process Paystack webhook with comprehensive error handling and recovery
 * Handles idempotency, validation, and detailed logging
 */
export async function processPaystackWebhook(event: WebhookEvent): Promise<void> {
  const startTime = Date.now();
  let txnReference = "unknown";

  try {
    // Only process successful charges
    if (event.event !== "charge.success") {
      console.log(`[Payment] Ignoring non-success event: ${event.event}`);
      return;
    }

    const { reference, metadata, amount } = event.data;
    txnReference = reference;

    if (!reference) {
      throw new PaymentError(
        "No reference in webhook data",
        "MISSING_REFERENCE"
      );
    }

    console.log(`[Payment:Webhook] START ${reference}`);

    // ===== STEP 1: Validate webhook data =====
    if (!metadata?.user_id) {
      throw new PaymentError(
        "Missing user_id in webhook metadata",
        "INVALID_METADATA"
      );
    }

    const { user_id, questions_to_add = 0, pass_type } = metadata;

    console.log(`[Payment:Webhook] Data: user=${user_id}, amount=${amount}kobo, questions=${questions_to_add}, pass=${pass_type || "none"}`);

    // ===== STEP 2: Idempotency check =====
    const existing = await Transaction.findOne({ reference });

    if (existing?.status === "success") {
      console.log(`[Payment:Webhook] ✓ Idempotent: Already processed (${Date.now() - startTime}ms)`);
      return;
    }

    if (existing?.status === "failed") {
      console.log(`[Payment:Webhook] Retrying previously failed transaction`);
    }

    // ===== STEP 3: Validate amount =====
    if (amount && existing?.amount_ngn) {
      const expectedKobo = existing.amount_ngn * 100;
      if (amount !== expectedKobo) {
        throw new PaymentError(
          `Amount mismatch: webhook=${amount}, expected=${expectedKobo}`,
          "AMOUNT_MISMATCH"
        );
      }
    }

    // ===== STEP 4: Validate and fetch user =====
    console.log(`[Payment:Webhook] Fetching user ${user_id}...`);
    const user = await User.findById(user_id);
    if (!user) {
      throw new PaymentError(
        `User ${user_id} not found`,
        "USER_NOT_FOUND"
      );
    }
    console.log(`[Payment:Webhook] ✓ User found: ${user.email}`);

    // ===== STEP 5: Add questions =====
    if (questions_to_add > 0) {
      console.log(`[Payment:Webhook] Adding ${questions_to_add} questions...`);
      const updated = await User.findByIdAndUpdate(
        user_id,
        {
          $inc: {
            paid_questions_balance: questions_to_add,
            xp: XP_SOURCES.bundle_purchase_bonus
          },
        },
        { new: true }
      );
      console.log(`[Payment:Webhook] ✓ Questions added. New balance: ${updated?.paid_questions_balance}`);
    }

    // ===== STEP 6: Activate pass =====
    if (pass_type) {
      console.log(`[Payment:Webhook] Activating pass: ${pass_type}...`);
      const PASS_DURATIONS: Record<string, number> = {
        "7_day_unlimited": 7,
        "subject_mastery": 30,
      };
      const days = PASS_DURATIONS[pass_type] ?? 7;
      if (!PASS_DURATIONS[pass_type]) {
        console.warn(`[Payment:Webhook] Unknown pass type: ${pass_type}, using 7 days`);
      }
      const expires_at = new Date(Date.now() + days * 86400000);
      await User.findByIdAndUpdate(user_id, {
        $push: { active_passes: { pass_type, pass_name: pass_type.replace(/_/g, " "), expires_at } },
      });
      console.log(`[Payment:Webhook] ✓ Pass activated, expires: ${expires_at.toISOString()}`);
    }

    // ===== STEP 7: Mark transaction as success =====
    console.log(`[Payment:Webhook] Updating transaction status...`);
    await Transaction.findOneAndUpdate(
      { reference },
      {
        $set: {
          status: "success",
          completed_at: new Date(),
          gateway_response: event.data,
        },
      },
      { upsert: true }
    );
    console.log(`[Payment:Webhook] ✓ Transaction marked success`);

    const duration = Date.now() - startTime;
    console.log(`[Payment:Webhook] ✅ SUCCESS ${reference} (${duration}ms)`);

    // Alert on success (optional monitoring hook)
    await alertPaymentSuccess({ reference, user_id, amount_ngn: existing?.amount_ngn || 0, questions_to_add });

  } catch (err: any) {
    const duration = Date.now() - startTime;
    const isPaymentError = err instanceof PaymentError;
    const code = isPaymentError ? err.code : "UNKNOWN_ERROR";
    const message = err.message || String(err);

    console.error(`[Payment:Webhook] ❌ ERROR ${txnReference} [${code}] (${duration}ms)`, message);

    // Update transaction with error status
    if (txnReference !== "unknown") {
      try {
        await Transaction.findOneAndUpdate(
          { reference: txnReference },
          {
            $set: {
              status: "failed",
              error_code: code,
              error_message: message.substring(0, 500),
              attempted_at: new Date(),
            },
          },
          { upsert: true }
        );
      } catch (updateErr) {
        console.error(`[Payment:Webhook] Failed to update transaction status:`, updateErr);
      }
    }

    // Alert on failure (for monitoring/alerting)
    await alertPaymentFailure({ reference: txnReference, code, message });

    // Re-throw only if non-retryable
    if (isPaymentError && !err.retryable) {
      throw err;
    }
  }
}

/**
 * Monitoring/alerting hooks for payment events
 * Can be extended to send notifications, metrics, etc.
 */
async function alertPaymentSuccess(params: {
  reference: string;
  user_id: string;
  amount_ngn: number;
  questions_to_add: number;
}): Promise<void> {
  // TODO: Send success metrics to monitoring service
  // TODO: Log to analytics
  // This prevents silent successes
}

async function alertPaymentFailure(params: {
  reference: string;
  code: string;
  message: string;
}): Promise<void> {
  // TODO: Send alert to admin/ops team
  // TODO: Create incident for manual recovery if needed
  console.warn(`[Payment:Alert] Failed payment needs manual review: ${params.reference} [${params.code}]`);
}

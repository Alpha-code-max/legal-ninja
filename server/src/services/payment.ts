import axios from "axios";
import crypto from "crypto";
import { User } from "../models/User";
import { Transaction } from "../models/Transaction";
import { XP_SOURCES } from "./progression";

export interface InitPaymentResult {
  authorization_url: string;
  reference: string;
}

export async function initPaystackPayment(params: {
  userId: string;
  email: string;
  amountNGN: number;
  questionsToAdd: number;
  passType?: string;
  reference: string;
}): Promise<InitPaymentResult> {
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
      callback_url: `${process.env.FRONTEND_URL}/store?payment=success`,
    },
    { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
  );
  return {
    authorization_url: res.data.data.authorization_url,
    reference: res.data.data.reference,
  };
}

export function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY!)
    .update(body)
    .digest("hex");
  return hash === signature;
}

export async function processPaystackWebhook(event: {
  event: string;
  data: {
    reference: string;
    status: string;
    metadata: { user_id: string; questions_to_add: number; pass_type?: string };
    amount: number;
  };
}): Promise<void> {
  if (event.event !== "charge.success") return;
  const { reference, metadata, amount } = event.data;
  const { user_id, questions_to_add, pass_type } = metadata;

  // Idempotency check
  const existing = await Transaction.findOne({ reference });
  if (existing?.status === "success") return;

  if (questions_to_add > 0) {
    await User.findByIdAndUpdate(user_id, {
      $inc: { paid_questions_balance: questions_to_add, xp: XP_SOURCES.bundle_purchase_bonus },
    });
  }

  if (pass_type) {
    const PASS_DURATIONS: Record<string, number> = {
      "7_day_unlimited": 7,
      "subject_mastery": 30,
    };
    const days = PASS_DURATIONS[pass_type] ?? 7;
    const expires_at = new Date(Date.now() + days * 86400000);
    await User.findByIdAndUpdate(user_id, {
      $push: { active_passes: { pass_type, pass_name: pass_type.replace(/_/g, " "), expires_at } },
    });
  }

  await Transaction.findOneAndUpdate(
    { reference },
    { $set: { status: "success", completed_at: new Date(), gateway_response: event.data } },
    { upsert: true }
  );
}

import axios from "axios";
import { Transaction } from "../models/Transaction";
import { User } from "../models/User";
import { processPaystackWebhook } from "./payment";

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY;

export interface RecoveryResult {
  processed: number;
  succeeded: number;
  failed: number;
  pending: number;
  errors: Array<{ reference: string; reason: string }>;
}

/**
 * Find and recover stuck payments (pending transactions that have been paid on Paystack)
 * Runs periodically to detect and fix webhook failures
 */
export async function recoverStuckPayments(): Promise<RecoveryResult> {
  console.log("\n[PaymentRecovery] Starting stuck payment recovery...");
  const startTime = Date.now();

  const result: RecoveryResult = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    pending: 0,
    errors: [],
  };

  try {
    // Find all pending transactions older than 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const stuckTransactions = await Transaction.find({
      status: "pending",
      created_at: { $lt: fiveMinutesAgo },
    }).lean();

    console.log(`[PaymentRecovery] Found ${stuckTransactions.length} potentially stuck transactions`);

    if (stuckTransactions.length === 0) {
      console.log("[PaymentRecovery] No stuck payments to recover");
      return result;
    }

    // Check each pending transaction with Paystack
    for (const txn of stuckTransactions) {
      try {
        result.processed++;

        console.log(`[PaymentRecovery] Checking ${txn.reference} on Paystack...`);

        const paystackRes = await axios.get(
          `https://api.paystack.co/transaction/verify/${txn.reference}`,
          { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
        );

        const psData = paystackRes.data.data;
        const psStatus = psData.status;

        console.log(`[PaymentRecovery] ${txn.reference} on Paystack: ${psStatus}`);

        if (psStatus === "success") {
          console.log(`[PaymentRecovery] Recovering ${txn.reference}...`);

          // Reconstruct webhook event and process it
          const event = {
            event: "charge.success",
            data: {
              reference: txn.reference,
              status: "success",
              amount: txn.amount_ngn * 100,
              metadata: {
                user_id: txn.user_id.toString(),
                questions_to_add: txn.questions_added,
                pass_type: txn.pass_activated,
              },
            },
          };

          await processPaystackWebhook(event);
          result.succeeded++;
          console.log(`[PaymentRecovery] ✓ Recovered ${txn.reference}`);

        } else if (psStatus === "pending") {
          result.pending++;
          console.log(`[PaymentRecovery] ${txn.reference} still pending on Paystack, will retry later`);

        } else {
          // Transaction failed on Paystack
          result.failed++;
          result.errors.push({
            reference: txn.reference,
            reason: `Paystack status: ${psStatus}`,
          });
          console.warn(`[PaymentRecovery] ${txn.reference} failed on Paystack (${psStatus})`);
        }

      } catch (err: any) {
        result.failed++;
        result.errors.push({
          reference: txn.reference,
          reason: err.message,
        });
        console.error(`[PaymentRecovery] Error checking ${txn.reference}:`, err.message);
      }
    }

    const duration = Date.now() - startTime;
    console.log(`[PaymentRecovery] Recovery complete (${duration}ms)`);
    console.log(`[PaymentRecovery] Results: ${result.succeeded} recovered, ${result.failed} failed, ${result.pending} still pending`);

    return result;

  } catch (err: any) {
    console.error("[PaymentRecovery] Fatal error:", err);
    throw err;
  }
}

/**
 * Get recovery statistics
 */
export async function getPaymentStats(): Promise<{
  pending: number;
  success: number;
  failed: number;
  total: number;
  oldestPending: Date | null;
}> {
  const [pending, success, failed, total] = await Promise.all([
    Transaction.countDocuments({ status: "pending" }),
    Transaction.countDocuments({ status: "success" }),
    Transaction.countDocuments({ status: "failed" }),
    Transaction.countDocuments(),
  ]);

  const oldestPending = await Transaction.findOne({ status: "pending" })
    .sort({ created_at: 1 })
    .select("created_at")
    .lean();

  return {
    pending,
    success,
    failed,
    total,
    oldestPending: oldestPending?.created_at || null,
  };
}

/**
 * Manually process a failed transaction (for admin recovery)
 */
export async function manuallyProcessPayment(reference: string): Promise<{ success: boolean; message: string }> {
  try {
    console.log(`[PaymentRecovery] Manually processing ${reference}...`);

    const txn = await Transaction.findOne({ reference });
    if (!txn) {
      return { success: false, message: "Transaction not found" };
    }

    if (txn.status === "success") {
      return { success: false, message: "Transaction already successful" };
    }

    // Verify with Paystack
    const paystackRes = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
    );

    const psData = paystackRes.data.data;

    if (psData.status !== "success") {
      return {
        success: false,
        message: `Paystack shows status: ${psData.status}. Only successful payments can be processed.`,
      };
    }

    // Process it
    const event = {
      event: "charge.success",
      data: {
        reference: txn.reference,
        status: "success",
        amount: txn.amount_ngn * 100,
        metadata: {
          user_id: txn.user_id.toString(),
          questions_to_add: txn.questions_added,
          pass_type: txn.pass_activated,
        },
      },
    };

    await processPaystackWebhook(event);

    return { success: true, message: `Successfully processed ${reference}` };

  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

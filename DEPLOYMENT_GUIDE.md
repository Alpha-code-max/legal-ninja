# Webhook Fix - Deployment Guide

## What Was Fixed

Your payment webhook handler had critical issues that caused payments to get stuck. We've implemented comprehensive error handling, logging, and automatic recovery.

---

## Files Modified

### Core Payment System
1. **`server/src/services/payment.ts`** — Enhanced webhook processing
   - Custom error types for better tracking
   - Step-by-step logging with timestamps
   - Validation of amounts and user existence
   - Monitoring hooks for alerting

2. **`server/src/routes/store.ts`** — Improved webhook route
   - Better signature verification logging
   - Event structure validation
   - Always acknowledges webhook (returns 200)
   - Duration tracking

### Recovery System
3. **`server/src/services/payment-recovery.ts`** (NEW)
   - Auto-recovery of stuck payments
   - Checks Paystack for actual payment status
   - Replays webhook if Paystack says success

4. **`server/src/services/cron.ts`** — Recovery job
   - Runs every 5 minutes
   - Finds and recovers stuck payments
   - Logs recovery results

### Data Model
5. **`server/src/models/Transaction.ts`**
   - Added `error_code` field
   - Added `error_message` field
   - Added `attempted_at` field
   - New indexes for fast lookups

### Admin Monitoring
6. **`server/src/routes/admin.ts`** — Payment endpoints (NEW)
   - `GET /api/admin/payments/status` — System health
   - `GET /api/admin/payments/pending` — List stuck payments
   - `GET /api/admin/payments/failed` — List failed payments
   - `POST /api/admin/payments/recover` — Manual recovery
   - `POST /api/admin/payments/:reference/process` — Process single payment

---

## How to Deploy

### Step 1: Update Code
```bash
cd C:\Users\Hp\Desktop\Legal Ninja
git add -A
git commit -m "Fix webhook handler: add error logging, recovery system, and admin monitoring"
git push
```

### Step 2: Restart Backend
On your Render deployment:
```bash
# Render will automatically rebuild and redeploy on git push
# Or manually trigger a redeployment in Render dashboard
```

### Step 3: Verify Deployment
```bash
# Test the health endpoint
curl https://legal-ninja.onrender.com/health

# Check payment status (requires admin token)
curl -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  https://legal-ninja.onrender.com/api/admin/payments/status
```

---

## What Happens Now

### Automatic Recovery (Every 5 Minutes)
```
[cron] Payment recovery: 5 recovered, 0 failed, 2 still pending
└─ 5 users just got their questions back automatically
```

### Detailed Logging
Every webhook now logs each step:
```
[Payment:Webhook] START LN-9A1BDB9F52D14267
[Payment:Webhook] Data: user=..., amount=50000, questions=50
[Payment:Webhook] ✓ Signature verified
[Payment:Webhook] ✓ User found: orji8112002@gmail.com
[Payment:Webhook] Adding 50 questions...
[Payment:Webhook] ✓ Questions added. New balance: 50
[Payment:Webhook] ✅ SUCCESS (145ms)
```

### Manual Recovery
If a payment gets stuck, admin can:
```bash
# View all pending payments
GET /api/admin/payments/pending

# Manually trigger recovery
POST /api/admin/payments/recover

# Process single payment
POST /api/admin/payments/LN-9A1BDB9F52D14267/process
```

---

## Monitoring

### Admin Dashboard
Check this regularly to ensure no payments are stuck:
```bash
curl -H "Authorization: Bearer $ADMIN_TOKEN" \
  https://legal-ninja.onrender.com/api/admin/payments/status
```

Expected response:
```json
{
  "status": "healthy",
  "pending": 0,
  "success": 156,
  "failed": 1,
  "total": 157,
  "oldest_pending_mins": null
}
```

- ✅ `pending: 0` → All payments processed
- ✅ `oldest_pending_mins: null` → No stuck payments
- ⚠️ `pending > 0` → Something stuck, needs investigation

### What To Watch For
1. **Increasing "pending" count** → Webhook processing is failing
2. **"oldest_pending_mins" > 10** → Recovery not working
3. **High "failed" count** → Something wrong with Paystack integration

---

## Testing the Fix

### Test 1: Verify Logging
1. Make a small test payment
2. Check server logs for webhook entries
3. Should see `[Payment:Webhook]` messages
4. Should end with `✅ SUCCESS`

### Test 2: Test Recovery
1. Simulate a stuck payment by:
   - Creating a transaction manually in the database with `status: "pending"`
   - Making payment on Paystack so webhook has proof of success
2. Wait for cron job to run (5 minute intervals)
3. Check if transaction is now `status: "success"`
4. Verify questions were added to user

### Test 3: Manual Recovery
```bash
# Admin manually triggers recovery
POST /api/admin/payments/recover

# Should show something like:
{
  "recovery_result": {
    "processed": 2,
    "succeeded": 1,
    "failed": 0,
    "pending": 1,
    "errors": []
  }
}
```

---

## Troubleshooting

### "Pending transactions not clearing"
1. Check cron job is running: look for `[cron] Payment recovery:` logs
2. Check Paystack API access: verify `PAYSTACK_SECRET_KEY` is correct
3. Manually trigger: `POST /api/admin/payments/recover`

### "Still seeing webhook errors"
1. Check database connection is working
2. Verify user exists in database
3. Check amount validation: webhook amount must match transaction amount
4. Look for specific error codes in transaction.error_code

### "Manual recovery failed"
1. Verify reference number is correct (format: `LN-xxxxxxxxxxxxxxxx`)
2. Check that payment actually succeeded on Paystack
3. Verify user account exists
4. Look at error message for specific issue

---

## Rollback Plan

If something goes wrong:

```bash
# Revert the commit
git revert <commit_hash>
git push

# Or manually restore previous version
git checkout <previous_commit> -- server/src/services/payment.ts
git commit -m "Rollback webhook fix"
git push
```

The old code will still work, payments will just get stuck again (but at least they won't fail).

---

## Future Improvements

1. **Slack Alerts**
   - Send alert when payment stuck
   - Daily report of payment health

2. **Email Notifications**
   - Notify user when payment recovered
   - Admin gets error summary daily

3. **Retry Logic**
   - Automatic retries with exponential backoff
   - Better handling of transient failures

4. **Analytics Dashboard**
   - Payment success rate over time
   - Peak payment times
   - Common failure reasons

---

## Success Metrics

After deployment:
- ✅ `pending` payment count should be 0 or decreasing
- ✅ `oldest_pending_mins` should be < 5 minutes
- ✅ Server logs should show detailed webhook processing
- ✅ No more user complaints about stuck payments

---

## Questions?

Check the logs:
- Render logs: `Your Render dashboard → Logs tab`
- Local logs: `console output from npm run dev`
- Look for `[Payment:Webhook]` and `[cron]` prefixes

All important payment events are now logged and traceable.

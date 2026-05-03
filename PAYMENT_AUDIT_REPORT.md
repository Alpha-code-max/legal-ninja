# 🔴 CRITICAL PAYMENT SYSTEM AUDIT REPORT

## Executive Summary
Found **5 critical issues** where users pay for bundles/passes that don't exist or don't match what they receive. These discrepancies create fraud risks and user complaints.

---

## 🔴 **ISSUE 1: Mobile Bundle Prices Don't Match Server (CRITICAL)**

### The Problem
Mobile app shows DIFFERENT bundle quantities and prices than what the server processes.

### Mobile Shows (mobile/app/(tabs)/store.tsx:10-14):
```
Index 0: 50 questions   @ ₦500
Index 1: 200 questions  @ ₦1,500    ❌ WRONG
Index 2: 500 questions  @ ₦3,000    ❌ WRONG
Index 3: 1500 questions @ ₦8,000    ❌ DOESN'T EXIST
```

### Server Actually Has (server/src/routes/store.ts:22-27):
```
Index 0: 50 questions   @ ₦500      ✅ Correct
Index 1: 100 questions  @ ₦1,000    ❌ Mobile shows 200 @ ₦1,500
Index 2: 200 questions  @ ₦1,900    ❌ Mobile shows 500 @ ₦3,000
Index 3: 500 questions  @ ₦4,500    ❌ Mobile shows 1500 @ ₦8,000
```

### Impact
- **Mobile user buys "Index 1"**: Sees 200 questions for ₦1,500 but receives only 100 questions
- **Mobile user buys "Index 2"**: Sees 500 questions for ₦3,000 but receives only 200 questions  
- **Mobile user buys "Index 3"**: Pays ₦8,000 for non-existent bundle, transaction fails at server

### What User Gets
- Mobile Index 0 → Server Index 0 ✅ (50 @ ₦500)
- Mobile Index 1 → Server Index 1 ❌ (expects 200, gets 100)
- Mobile Index 2 → Server Index 2 ❌ (expects 500, gets 200)
- Mobile Index 3 → Server Index 3 ❌ (expects 1500, gets 500)

---

## 🔴 **ISSUE 2: Mobile Pass IDs Don't Match Server (CRITICAL)**

### Mobile Shows (mobile/app/(tabs)/store.tsx:16-20):
```
- daily_pass      (₦200, 1 day)
- weekly_pass     (₦800, 7 days)
- monthly_pass    (₦2,500, 30 days)
```

### Server Has (server/src/routes/store.ts:29-32):
```
- 7_day_unlimited (₦700, 7 days)
- subject_mastery (₦800, 30 days)
```

### Pass ID Mapping Issue:
- Mobile "daily_pass" → Server has NO "daily_pass" ID ❌ **WILL FAIL**
- Mobile "weekly_pass" → Server has NO "weekly_pass" ID ❌ **WILL FAIL**
- Mobile "monthly_pass" → Server has NO "monthly_pass" ID ❌ **WILL FAIL**

### Impact
Mobile users trying to buy ANY pass will get: **"Invalid pass"** error from server.

---

## 🔴 **ISSUE 3: Webapp Prices Don't Match Mobile (Price Mismatch)**

### Webapp Shows (lib/config/monetization.ts):
```
Bundle 1: 50 questions   @ ₦500
Bundle 2: 100 questions  @ ₦1,000   ✅ Matches server
Bundle 3: 200 questions  @ ₦1,900   ✅ Matches server
Bundle 4: 500 questions  @ ₦4,500   ✅ Matches server
```

### Mobile Shows:
```
Bundle 1: 50 questions   @ ₦500
Bundle 2: 200 questions  @ ₦1,500   ❌ Different
Bundle 3: 500 questions  @ ₦3,000   ❌ Different
Bundle 4: 1500 questions @ ₦8,000   ❌ Doesn't exist
```

### Conclusion
**Webapp prices are correct, mobile prices are completely wrong.**

---

## 🔴 **ISSUE 4: Pass Duration Mismatch**

### Mobile "monthly_pass" Claims:
- Duration: "30 days"
- Price: "₦2,500"

### Server "subject_mastery" Pass:
- Duration: 30 days ✅ Correct
- Price: ₦800 ❌ Mobile shows ₦2,500
- BUT: Pass ID "monthly_pass" doesn't exist on server!

### The Real Problem
Mobile will try to buy "monthly_pass" (₦2,500) but:
1. Server doesn't recognize "monthly_pass" ID
2. Server returns "Invalid pass" error
3. User paid nothing but saw they were charged ₦2,500

---

## 🔴 **ISSUE 5: Pass Day Durations Not Synced**

### Server PASS_DURATIONS mapping (server/src/services/payment.ts:73-76):
```typescript
const PASS_DURATIONS: Record<string, number> = {
  "7_day_unlimited": 7,
  "subject_mastery": 30,
};
```

### Missing Entries:
Mobile tries to buy:
- "daily_pass" → Not in PASS_DURATIONS, defaults to 7 days ❌
- "weekly_pass" → Not in PASS_DURATIONS, defaults to 7 days ✅ (Accidentally correct)
- "monthly_pass" → Not in PASS_DURATIONS, defaults to 7 days ❌

---

## 🟡 **ISSUE 6: Balance Deduction Order (Minor Issue)**

### Current Order (server/src/services/question.ts:225-243):
```typescript
// Deduction order: earned → paid → free
if (user.earned_questions_balance > 0) {
  deduct from earned
} else if (user.paid_questions_balance > 0) {
  deduct from paid
} else {
  deduct from free
}
```

### The Issue
- Users who buy premium questions expect them to be used first
- But if they've earned any questions, earned ones get used first
- This might be intentional, but should be documented to users

### Expectation
Users might expect: **paid → earned → free** (use what they paid for first)

---

## 📊 TRANSACTION VERIFICATION LOGIC (POTENTIAL ISSUE)

### Webhook Idempotency Check (server/src/services/payment.ts:63-64):
```typescript
const existing = await Transaction.findOne({ reference });
if (existing?.status === "success") return;
```

### Risk
If webhook is called twice with same reference:
1. First call: Creates transaction, adds questions ✅
2. Second call: Finds existing success, returns early ✅
3. BUT: What if first call got network error after adding questions but before saving transaction?

**Recommendation**: Add database transaction/atomic operations

---

## ✅ WHAT'S WORKING CORRECTLY

1. **Paystack Integration**: Signature verification is correct
2. **Free Questions**: 100 free questions awarded on signup ✅
3. **Pass Expiration**: Checked correctly with `p.expires_at > now`
4. **Earned Questions**: Reward system exists (daily_goal, referral, etc.)
5. **Webhook Security**: HMAC-SHA512 signature verification in place ✅

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### 1. **FIX MOBILE BUNDLES** (CRITICAL)
Update `mobile/app/(tabs)/store.tsx` lines 10-14 to match server:
```typescript
const BUNDLES = [
  { index: 0, label: "Starter Pack",  qty: 50,   price: "₦500",   color: "#00F5FF" },
  { index: 1, label: "Standard Pack", qty: 100,  price: "₦1,000", color: "#22FF88" },
  { index: 2, label: "Pro Pack",      qty: 200,  price: "₦1,900", color: "#C026D3" },
  { index: 3, label: "Supreme Pack",  qty: 500,  price: "₦4,500", color: "#FFD700" },
];
```

### 2. **FIX MOBILE PASSES** (CRITICAL)
Update `mobile/app/(tabs)/store.tsx` lines 16-20 to match server:
```typescript
const PASSES = [
  { id: "7_day_unlimited",  label: "7-Day Unlimited",     duration: "7 days",  price: "₦700",  color: "#00F5FF", emoji: "⚡" },
  { id: "subject_mastery",  label: "Subject Mastery Pack", duration: "30 days", price: "₦800",  color: "#C026D3", emoji: "🎓" },
];
```

### 3. **UPDATE PASS DURATIONS** (CRITICAL)
Update `server/src/services/payment.ts` lines 73-76 if mobile will have new IDs:
```typescript
const PASS_DURATIONS: Record<string, number> = {
  "7_day_unlimited": 7,
  "subject_mastery": 30,
  // Add new ones if mobile is expanded
};
```

### 4. **ADD BALANCE DEDUCTION DOCUMENTATION** (Minor)
Document in store UI the deduction order:
```
Questions used in this order:
1. Earned (from activities & quests)
2. Paid (what you purchased)
3. Free (starter questions)
```

### 5. **ENHANCE TRANSACTION SAFETY** (Medium)
- Use database transactions for payment processing
- Add retry logic for failed webhook processing
- Log all payment operations for auditing

---

## 🧪 TEST CASES TO RUN

1. **Bundle Purchase Test**:
   - Mobile: Buy Index 1 → Should get 100 questions (not 200)
   - Webapp: Buy Index 1 → Should get 100 questions
   - Verify both show same quantity

2. **Pass Purchase Test**:
   - Mobile: Try to buy "daily_pass" → Should fail with "Invalid pass"
   - Mobile: Buy "7_day_unlimited" → Should work
   - Verify pass expires after 7 days

3. **Balance Deduction Test**:
   - User with: 10 earned, 20 paid, 30 free
   - Answer 1 question → Should deduct from earned (leaving 9 earned)
   - Verify balance shows: earned=9, paid=20, free=30

4. **Webhook Idempotency Test**:
   - Simulate webhook called twice with same reference
   - Verify user only gets questions once
   - Verify transaction marked as success once

---

## 💰 FINANCIAL IMPACT

### Potential Loss Scenarios:
1. **Mobile user wants 500 questions**: Sees ₦3,000 (500 qty) but gets ₦4,500 worth of questions at ₦3,000 (Good for user, bad for business)
2. **Mobile user wants to buy pass**: Transaction fails, confusing user experience
3. **Webhook called twice**: User gets questions twice but charged once (Bad for business)

---

## 📋 FILES TO UPDATE

1. `mobile/app/(tabs)/store.tsx` - Bundle and Pass definitions
2. `server/src/services/payment.ts` - Pass durations mapping
3. `lib/config/monetization.ts` - Verify bundles/passes are synced
4. Create comprehensive API documentation

---

**Report Generated**: 2026-05-02  
**Status**: 🔴 CRITICAL - Blocks mobile purchases  
**Next Steps**: Implement fixes in priority order

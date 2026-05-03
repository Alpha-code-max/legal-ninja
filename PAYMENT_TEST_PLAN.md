# 🧪 PAYMENT SYSTEM TEST PLAN

## Pre-Test Checklist
- [ ] Server is running
- [ ] Mobile app is built and running
- [ ] Webapp is running
- [ ] All payment fixes have been deployed
- [ ] Paystack sandbox account is configured

---

## TEST 1: Bundle Purchase Flow (Mobile)

### Objective
Verify mobile users see correct bundle quantities and prices, and receive what they pay for.

### Steps

**Test 1.1 - Bundle Selection**
1. Open mobile app → Armory (Store tab)
2. Verify bundle display:
   ```
   Bundle 0: Starter Pack    - 50 questions  @ ₦500
   Bundle 1: Standard Pack   - 100 questions @ ₦1,000   ✅ MUST BE 100, not 200
   Bundle 2: Pro Pack        - 200 questions @ ₦1,900   ✅ MUST BE 200, not 500
   Bundle 3: Supreme Pack    - 500 questions @ ₦4,500   ✅ MUST BE 500, not 1500
   ```
3. ✅ Expected: All quantities and prices match (should not show 1500 questions)

**Test 1.2 - Bundle 1 Purchase**
1. Tap "Buy" on Bundle 1 (Standard Pack - 100 questions @ ₦1,000)
2. Redirected to Paystack checkout
3. Complete test payment with card: `4111 1111 1111 1111` (Paystack test card)
4. Return to app
5. Check user balance:
   ```
   Before:  Paid: 0
   After:   Paid: 100  ✅ MUST BE 100, not 200
   ```
6. ✅ Expected: User receives exactly 100 questions, not 200

**Test 1.3 - Bundle 2 Purchase**
1. Tap "Buy" on Bundle 2 (Pro Pack - 200 questions @ ₦1,900)
2. Complete Paystack payment
3. Check balance:
   ```
   Before:  Paid: 100
   After:   Paid: 300  ✅ MUST be 100+200=300
   ```
4. ✅ Expected: Receives exactly 200 additional questions

**Test 1.4 - Bundle 3 Purchase**
1. Tap "Buy" on Bundle 3 (Supreme Pack - 500 questions @ ₦4,500)
2. Complete Paystack payment
3. Check balance:
   ```
   Before:  Paid: 300
   After:   Paid: 800  ✅ MUST be 300+500=800
   ```
4. ✅ Expected: Receives exactly 500 additional questions

### Expected Results
- ✅ All bundles match server definitions
- ✅ Users receive exactly what they purchased
- ✅ No over/under-delivery of questions

---

## TEST 2: Pass Purchase Flow (Mobile)

### Objective
Verify mobile pass purchases work and passes activate correctly.

### Steps

**Test 2.1 - Pass Availability**
1. Open mobile app → Armory (Store tab)
2. Scroll to "Unlimited Passes" section
3. Verify passes available:
   ```
   Pass 1: 7-Day Unlimited      @ ₦700   ✅ (not "daily_pass")
   Pass 2: Subject Mastery Pack @ ₦800   ✅ (not "monthly_pass")
   ```
4. ✅ Expected: Only 2 passes available (not 3 like before)

**Test 2.2 - 7-Day Pass Purchase**
1. Tap "Get Pass" on 7-Day Unlimited (₦700)
2. Paystack redirects (note the reference shown)
3. Complete payment
4. Return to app
5. Check user's active passes:
   ```
   Must see: "7-Day Unlimited" pass active
   Expiration: Today + 7 days
   ```
6. Try to answer a question:
   - Without expiration date, should deduct from balance
   - With active pass, should NOT deduct from balance ✅

**Test 2.3 - Subject Mastery Pass Purchase**
1. Tap "Get Pass" on Subject Mastery Pack (₦800)
2. Complete Paystack payment
3. Check active passes:
   ```
   Must see: "Subject Mastery" pass active
   Expiration: Today + 30 days
   ```

### Expected Results
- ✅ Both pass types available
- ✅ Passes activate immediately after payment
- ✅ Passes correctly prevent balance deduction
- ✅ Pass expiration dates are correct (7 and 30 days)

---

## TEST 3: Balance Deduction Order

### Objective
Verify questions are deducted in correct order: Earned → Paid → Free

### Steps

**Test 3.1 - Setup Test User**
1. Create new test user or use existing with known balances
2. Manually set balances in database for testing:
   ```
   free_questions_remaining: 10
   paid_questions_balance: 20
   earned_questions_balance: 30
   Total: 60
   ```

**Test 3.2 - Answer Questions in Order**
1. User answers Question 1:
   - Check balance before: Free=10, Paid=20, Earned=30
   - Expected after: Free=10, Paid=20, Earned=29 ✅ (Earned deducted)

2. User answers Questions 2-30 (30 more questions):
   - Earned should go from 29 → -1
   - Then Paid should start being deducted
   - Check after question 30: Free=10, Paid=20, Earned=0

3. User answers Questions 31-50 (20 more questions):
   - Paid should go from 20 → 0
   - Check after: Free=10, Paid=0, Earned=0

4. User answers Questions 51-60 (10 more questions):
   - Free should go from 10 → 0
   - Check after: Free=0, Paid=0, Earned=0

### Expected Results
- ✅ Deduction order: Earned → Paid → Free (as documented)
- ✅ Balances decrease in correct order
- ✅ No balance goes negative
- ✅ User runs out of questions when total = 0

---

## TEST 4: Webapp Bundle/Pass Display

### Objective
Verify webapp shows same bundles/passes as mobile and server.

### Steps

**Test 4.1 - Webapp Bundle Display**
1. Open webapp → Armory (Store page)
2. Click "Bundles" tab
3. Verify bundles:
   ```
   Bundle 0: 50 questions   @ ₦500
   Bundle 1: 100 questions  @ ₦1,000   ✅ (popular - should be marked)
   Bundle 2: 200 questions  @ ₦1,900   (5% savings)
   Bundle 3: 500 questions  @ ₦4,500   (10% savings)
   ```
4. ✅ Expected: Matches mobile exactly

**Test 4.2 - Webapp Pass Display**
1. Click "Passes" tab
2. Verify passes:
   ```
   Pass 1: 7-Day Unlimited      @ ₦700
   Pass 2: Subject Mastery Pack @ ₦800
   ```
3. ✅ Expected: Only 2 passes, matches mobile

**Test 4.3 - Webapp Balance Deduction Documentation**
1. Scroll to "Your Arsenal" section
2. Verify text shows:
   ```
   "Questions used in order: Earned → Paid → Free"
   ```
3. ✅ Expected: Clear documentation visible to users

---

## TEST 5: Webhook Processing & Idempotency

### Objective
Verify webhook handles payments correctly and doesn't double-credit.

### Steps

**Test 5.1 - Normal Payment Flow**
1. Check server logs before payment:
   ```
   [Payment] Processing webhook for LN-XXXXX: 100 questions, pass: none
   [Payment] Added 100 questions to user...
   [Payment] Transaction LN-XXXXX marked as success
   ```
2. Make a test purchase
3. Verify logs show payment processing
4. ✅ Expected: One "marked as success" log entry

**Test 5.2 - Duplicate Webhook Prevention**
1. Make a test purchase
2. Note the transaction reference (e.g., LN-XXXXX)
3. Manually trigger webhook with same reference twice
4. Check logs:
   ```
   First call:
   [Payment] Processing webhook for LN-XXXXX
   [Payment] Added 100 questions
   [Payment] Transaction marked as success
   
   Second call:
   [Payment] Processing webhook for LN-XXXXX
   [Payment] Transaction LN-XXXXX already processed, skipping
   ```
5. ✅ Expected: Second call detected as duplicate, skipped
6. ✅ Verify user only received questions once (100, not 200)

---

## TEST 6: Error Handling

### Objective
Verify clear error messages for invalid purchases.

### Steps

**Test 6.1 - Invalid Bundle**
1. Manually craft API call with invalid bundle index (e.g., 99)
2. POST to `/api/store/buy/bundle` with `bundle_index: 99`
3. Check response:
   ```
   Status: 400
   Error: "Invalid bundle index"
   ```
4. ✅ Expected: Clear error message about bundle

**Test 6.2 - Invalid Pass**
1. Old mobile app might try: `{ pass_id: "daily_pass" }`
2. Check response:
   ```
   Status: 400
   Error: "Invalid pass ID: daily_pass"
   ```
3. ✅ Expected: Clear error showing which pass failed
4. Check server logs show:
   ```
   [Store] Invalid pass ID: daily_pass
   ```

---

## TEST 7: Price Consistency

### Objective
Verify all platforms show same prices (no discrepancies).

### Steps

**Test 7.1 - Price Sync Check**
1. Create spreadsheet with prices:
   ```
   Mobile  | Webapp  | Server  | Match?
   --------|---------|---------|--------
   ₦500    | ₦500    | ₦500    | ✅
   ₦1,000  | ₦1,000  | ₦1,000  | ✅
   ₦1,900  | ₦1,900  | ₦1,900  | ✅
   ₦4,500  | ₦4,500  | ₦4,500  | ✅
   ₦700    | ₦700    | ₦700    | ✅
   ₦800    | ₦800    | ₦800    | ✅
   ```
2. ✅ Expected: All prices match across platforms

---

## TEST 8: Transaction History

### Objective
Verify transactions are recorded correctly.

### Steps

**Test 8.1 - Transaction Recording**
1. Make a test purchase
2. Open Webapp → Armory → Check transaction history
3. Verify transaction shows:
   ```
   Reference: LN-XXXXX
   Type: Bundle
   Amount: ₦1,000
   Questions: 100
   Status: success
   ```
4. ✅ Expected: Correct information recorded

**Test 8.2 - Mobile Transaction Tracking**
1. After payment, mobile should show in store:
   "✅ Payment received! Your questions will appear shortly."
2. ✅ Expected: Confirmation message shows

---

## REGRESSION TESTS

### Test Existing Features Don't Break

**Test R1 - Quiz Still Works**
1. User with questions answers a quiz
2. Questions deduct correctly ✅
3. Answers recorded ✅
4. Results show correctly ✅

**Test R2 - Free Questions Still Work**
1. New guest user (100 free questions)
2. Can answer exactly 100 questions ✅
3. On question 101, gets error ✅

**Test R3 - Earned Questions Work**
1. User completes daily quest (earns 10 questions)
2. Balance increases by 10 ✅
3. Earned questions deduct correctly ✅

---

## SUMMARY OF CRITICAL CHECKS

| Test | Status | Notes |
|------|--------|-------|
| Mobile bundles show correct quantities | ⏳ | Bundle 1 must show 100, not 200 |
| Mobile bundles show correct prices | ⏳ | Bundle 1 must show ₦1,000, not ₦1,500 |
| Mobile passes work (7-day) | ⏳ | Must not show "daily_pass" |
| Mobile passes work (subject mastery) | ⏳ | Must not show "monthly_pass" |
| Users receive correct quantities | ⏳ | Bundle 1 = 100 questions, not 200 |
| Pass prices match | ⏳ | ₦700 and ₦800 across all platforms |
| Balance deduction order documented | ⏳ | Earned → Paid → Free shown to users |
| Webhook doesn't double-credit | ⏳ | Run webhook twice, user gets questions once |
| Error messages are helpful | ⏳ | "Invalid pass ID: xxx" when fails |
| Transaction history is accurate | ⏳ | All fields correct |

---

## DEPLOYMENT VERIFICATION

After deploying, run this checklist:

- [ ] Pull latest code
- [ ] Rebuild mobile app
- [ ] Restart server
- [ ] Clear browser cache for webapp
- [ ] Run TEST 1: Bundle Purchase (Mobile)
- [ ] Run TEST 2: Pass Purchase (Mobile)
- [ ] Run TEST 3: Balance Deduction Order
- [ ] Run TEST 7: Price Consistency
- [ ] Check server logs for errors
- [ ] Verify no payment failures reported
- [ ] Test transaction history works

---

## BUG REPORT TEMPLATE

If any test fails, use this format:

```
BUG REPORT
==========
Test: [TEST NUMBER AND NAME]
Step: [WHICH STEP FAILED]
Expected: [WHAT SHOULD HAPPEN]
Actual: [WHAT ACTUALLY HAPPENED]
Environment: [Mobile/Webapp/Both] [Device/Browser]
Server Logs: [ANY ERROR MESSAGES]
Database State: [USER BALANCE IF RELEVANT]

Steps to Reproduce:
1. [STEP 1]
2. [STEP 2]
3. [STEP 3]

Screenshots/Video: [ATTACH IF POSSIBLE]
```

---

**Test Plan Created**: 2026-05-02  
**Tests Ready**: 8 major tests + 6 regression tests  
**Deployment Gate**: All tests must pass before production  

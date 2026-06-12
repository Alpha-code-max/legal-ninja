export const MONETIZATION = {
  model: "subscription" as const,
  free_tier_questions_monthly: 100,
  pricing: {
    subscriptions: [
      {
        id: "free",
        name: "Free",
        price_ngn: 0,
        billing_period_days: 30,
        questions_per_month: 100,
        features: ["100 questions/month", "Basic support"],
        popular: false,
      },
      {
        id: "pro",
        name: "Pro",
        price_ngn: 2999,
        billing_period_days: 30,
        questions_per_month: -1, // unlimited
        features: ["Unlimited questions", "All subjects", "Priority support", "Ad-free experience"],
        popular: true,
      },
      {
        id: "elite",
        name: "Elite",
        price_ngn: 4999,
        billing_period_days: 30,
        questions_per_month: -1, // unlimited
        features: ["Unlimited questions", "All subjects", "VIP support", "Ad-free experience", "Monthly insights report"],
        popular: false,
      },
    ],
  },
  earnable_rewards: {
    daily_goal: 10,
    weekly_quest: 50,
    referral: 20,
    streak_milestone: 30,
    spaced_repetition_review: 5,
  },
  rules: {
    first_free_days: 30,
    low_balance_warning_threshold: 20,
  },
  payment_gateways: {
    primary: ["Paystack", "Flutterwave"] as const,
    supported_methods: ["card", "bank_transfer", "USSD", "mobile_money", "virtual_account"] as const,
    currency: "NGN" as const,
  },
} as const;

export type Subscription = (typeof MONETIZATION.pricing.subscriptions)[number];

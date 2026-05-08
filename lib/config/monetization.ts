export const MONETIZATION = {
  model: "pay_per_question" as const,
  free_questions: 100,
  pricing: {
    per_question_ngn: 1.67,
    bundles: [
      { questions: 6,   price_ngn: 10,   savings: "0%",  popular: true  },
      { questions: 50,  price_ngn: 80,   savings: "0%",  popular: false },
      { questions: 100, price_ngn: 165,  savings: "0%",  popular: false },
      { questions: 200, price_ngn: 330,  savings: "0%",  popular: false },
      { questions: 500, price_ngn: 800,  savings: "2%",  popular: false },
    ],
    passes: [
      {
        id: "7_day_unlimited",
        name: "7-Day Unlimited",
        price_ngn: 700,
        duration_days: 7,
        subject_specific: false,
        description: "Perfect for exam week",
      },
      {
        id: "subject_mastery",
        name: "Subject Mastery Pack",
        price_ngn: 800,
        duration_days: 30,
        subject_specific: true,
        description: "Unlimited questions in one subject",
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
    first_free: 100,
    low_balance_warning_threshold: 20,
    deduction_order: ["earned", "paid", "free"] as const,
  },
  payment_gateways: {
    primary: ["Paystack", "Flutterwave"] as const,
    supported_methods: ["card", "bank_transfer", "USSD", "mobile_money", "virtual_account"] as const,
    currency: "NGN" as const,
  },
} as const;

export type Bundle = (typeof MONETIZATION.pricing.bundles)[number];
export type Pass = (typeof MONETIZATION.pricing.passes)[number];

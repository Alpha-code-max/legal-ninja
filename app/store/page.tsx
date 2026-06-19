"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore, getTotalBalance } from "@/lib/store/user-store";
import { MONETIZATION, type Subscription } from "@/lib/config/monetization";
import { analytics } from "@/lib/analytics";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatNGN } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "subscriptions" | "earn";

const SUBSCRIPTION_EMOJIS = ["🎯", "⭐", "👑"];

const EARN_SOURCES: Array<{ key: string; emoji: string; title: string; desc: string; color: string }> = [
  { key: "daily_goal",      emoji: "🎯", title: "Daily Goal",       desc: "Complete 3 battles today",               color: "var(--cyber-green)" },
  { key: "weekly_quest",    emoji: "⚔️", title: "Weekly Quest",     desc: "Win 20 questions in a week",             color: "var(--cyber-cyan)" },
  { key: "referral",        emoji: "🎁", title: "Invite a Friend",  desc: "Share your referral link",               color: "var(--cyber-purple)" },
  { key: "streak_reward",   emoji: "🔥", title: "Streak Bonus",     desc: "Maintain a 7-day win streak",            color: "var(--cyber-gold)" },
];

export default function StorePage() {
  const router = useRouter();
  const user = useUserStore();
  const total = getTotalBalance(user);
  const [tab, setTab]           = useState<Tab>("subscriptions");
  const [purchased, setPurchased] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  const [lastPurchasePrice, setLastPurchasePrice] = useState<number | null>(null);
  const [lastReference, setLastReference] = useState<string | null>(null);

  // Check for ?payment=success query param after Paystack redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (params.get("payment") === "success" && reference) {
      setLastReference(reference);
      setPurchased("✅ Payment received! Refreshing your balance...");

      // Verify transaction and refresh user balance
      const verifyWithRetry = (attemptsLeft = 3): Promise<void> => {
        return api.verifyTransaction(reference)
          .then((result) => {
            if (result.status === "pending" && attemptsLeft > 1) {
              // Webhook not processed yet, retry after 1 second
              return new Promise(resolve => setTimeout(resolve, 1000)).then(() => verifyWithRetry(attemptsLeft - 1));
            }
            // Refresh user data to get updated balance
            return api.getMe().then((me) => {
              user.setUser({
                paid_questions_balance: me.paid_questions_balance,
                earned_questions_balance: me.earned_questions_balance,
                free_questions_remaining: me.free_questions_remaining,
                active_passes: (me.active_passes ?? []).map((p) => ({
                  id: p.pass_type,
                  name: p.pass_name,
                  expires_at: new Date(p.expires_at).getTime(),
                  subject_specific: !!p.subject_id,
                  subject_id: p.subject_id,
                })),
              });
              // Track purchase completed
              analytics.track("purchase_completed", {
                reference,
                price_ngn: lastPurchasePrice ?? 0,
              });
              setPurchased("✅ Payment successful! Questions added.");
              setTimeout(() => setPurchased(null), 5000);
            });
          })
          .catch(() => {
            setPurchased("⚠️ Couldn't verify payment. Tap to retry, or refresh to check your balance.");
          });
      };

      verifyWithRetry();

      window.history.replaceState({}, "", "/store");
    }
  }, [user]);

  const retryVerification = () => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference") || lastReference;
    if (!reference) return;
    setPurchased("✅ Retrying verification...");
    api.verifyTransaction(reference)
      .then(() => api.getMe())
      .then((me) => {
        user.setUser({
          paid_questions_balance: me.paid_questions_balance,
          earned_questions_balance: me.earned_questions_balance,
          free_questions_remaining: me.free_questions_remaining,
        });
        setPurchased("✅ Payment successful! Questions added.");
        setTimeout(() => setPurchased(null), 5000);
      })
      .catch(() => setPurchased("⚠️ Still couldn't verify. Tap to retry, or refresh to check your balance."));
  };

  const handleSubscriptionPurchase = async (subscription: Subscription) => {
    if (!user.uid) { router.push("/auth/sign-in"); return; }
    if (subscription.id === "free") {
      setPurchased("✅ Free tier activated!");
      setTimeout(() => setPurchased(null), 3000);
      return;
    }
    setProcessing(`subscription-${subscription.id}`);
    try {
      setLastPurchasePrice(subscription.price_ngn);
      analytics.track("subscription_initiated", {
        plan: subscription.id,
        price_ngn: subscription.price_ngn,
      });
      const result = await api.subscribeToplan(subscription.id);
      window.location.href = result.authorization_url;
    } catch {
      setPurchased("❌ Subscription failed — please try again.");
      setTimeout(() => setPurchased(null), 3500);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <div className="min-h-screen pb-36">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b h-16 flex items-center px-4"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()}
                  className="text-sm font-bold transition-colors"
                  style={{ color: "var(--text-muted)" }}>
            ← Back
          </button>
          <h1 className="text-xl font-black gradient-text">Armory</h1>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 px-2 py-1 rounded-full border text-sm font-black font-mono"
                 style={{ borderColor: "var(--cyber-border)", color: "var(--cyber-green)" }}>
              📚 {total}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-5">

        {/* Purchase notification */}
        <AnimatePresence>
          {purchased && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={purchased.startsWith("⚠️") ? retryVerification : undefined}
              className={cn("cyber-card p-4 text-center relative overflow-hidden", purchased.startsWith("⚠️") && "cursor-pointer")}
              style={{ borderColor: "var(--cyber-green)", boxShadow: "0 0 20px color-mix(in srgb, var(--cyber-green) 30%, transparent)" }}
            >
              <div className="absolute inset-0 opacity-5 bg-cyber-green" />
              <p className="font-black relative z-10 neon-text-green">{purchased}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Subscription Status */}
        <div className="cyber-card p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-gradient-primary" />
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest mb-3"
               style={{ color: "var(--text-muted)" }}>Your Subscription</p>
            <div className="flex items-center justify-center gap-2 mb-3">
              <span className="text-3xl">✨</span>
              <p className="text-2xl font-black neon-text-cyan">{user.subscription_plan || "Free"}</p>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {user.subscription_expires ? `Renews on ${new Date(user.subscription_expires).toLocaleDateString()}` : "Upgrade to unlock unlimited access"}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2">
          {(["subscriptions", "earn"] as Tab[]).map((t) => {
            const labels: Record<Tab, { label: string; emoji: string }> = {
              subscriptions: { label: "Buy", emoji: "⭐" },
              earn:    { label: "Earn Free", emoji: "🎯" },
            };
            return (
              <button key={t} onClick={() => setTab(t)}
                className={cn(
                  "py-2.5 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1",
                  tab === t
                    ? "border-cyber-cyan shadow-neon-cyan bg-cyber-cyan/10"
                    : "border-cyber-border hover:border-cyber-cyan/30"
                )}
                style={{ color: tab === t ? "var(--cyber-cyan)" : "var(--text-muted)" }}
              >
                <span className="text-base">{labels[t].emoji}</span>
                <span>{labels[t].label}</span>
              </button>
            );
          })}
        </div>

        {/* Subscriptions */}
        {tab === "subscriptions" && (
          <div className="space-y-3">
            {MONETIZATION.pricing.subscriptions.map((subscription, i) => (
              <motion.div
                key={subscription.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "cyber-card p-5 relative overflow-hidden",
                  subscription.popular
                    ? "border-cyber-cyan shadow-neon-cyan"
                    : "border-cyber-border"
                )}
              >
                {/* BG accent */}
                <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10"
                     style={{ background: subscription.popular ? "linear-gradient(90deg, transparent, var(--cyber-cyan))" : "transparent" }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{SUBSCRIPTION_EMOJIS[i % SUBSCRIPTION_EMOJIS.length]}</div>
                      <div>
                        {subscription.popular && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mb-1 inline-block"
                                style={{ background: "var(--cyber-cyan)", color: "#000" }}>
                            POPULAR
                          </span>
                        )}
                        <h3 className="font-black text-lg" style={{ color: "var(--text-base)" }}>{subscription.name}</h3>
                        <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                          {subscription.questions_per_month === -1 ? "Unlimited questions/month" : `${subscription.questions_per_month} questions/month`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-black font-mono neon-text-cyan">
                        {subscription.price_ngn === 0 ? "Free" : formatNGN(subscription.price_ngn)}
                      </p>
                      {subscription.price_ngn > 0 && (
                        <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>/month</p>
                      )}
                    </div>
                  </div>

                  {/* Features list */}
                  <div className="space-y-1.5 mb-4">
                    {subscription.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs">
                        <span style={{ color: "var(--cyber-green)" }}>✓</span>
                        <span style={{ color: "var(--text-muted)" }}>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <NeonButton
                    variant={subscription.popular ? "cyan" : "purple"}
                    fullWidth
                    size="sm"
                    onClick={() => handleSubscriptionPurchase(subscription)}
                    disabled={processing === `subscription-${subscription.id}`}
                  >
                    {processing === `subscription-${subscription.id}`
                      ? "…"
                      : subscription.id === "free"
                        ? "Select Free Plan"
                        : "Subscribe Now"}
                  </NeonButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Earn */}
        {tab === "earn" && (
          <div className="space-y-3">
            {/* Referral Code Section */}
            {user.referral_code && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="cyber-card p-5 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-black" style={{ color: "var(--text-base)" }}>🎁 Your Referral Code</p>
                    <p className="text-[10px] mt-1" style={{ color: "var(--text-muted)" }}>Share with friends & earn +20 questions</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black font-mono neon-text-purple">{user.referral_count ?? 0}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>referrals</p>
                  </div>
                </div>
                <div className="flex gap-2 items-center">
                  <div className="flex-1 px-3 py-2 rounded-lg border font-mono text-sm font-black"
                       style={{ borderColor: "var(--cyber-border)", background: "var(--cyber-bg)", color: "var(--cyber-cyan)" }}>
                    {user.referral_code}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(user.referral_code || "");
                      setPurchased("✅ Code copied!");
                      setTimeout(() => setPurchased(null), 2000);
                    }}
                    className="px-3 py-2 rounded-lg border font-black text-xs transition-all"
                    style={{
                      borderColor: "var(--cyber-border)",
                      color: "var(--cyber-cyan)",
                      background: "color-mix(in srgb, var(--cyber-cyan) 10%, transparent)"
                    }}
                  >
                    Copy
                  </button>
                </div>
              </motion.div>
            )}

            {EARN_SOURCES.map((source, i) => {
              const amount = (MONETIZATION.earnable_rewards as Record<string, number>)[source.key] ?? 0;
              return (
                <motion.div
                  key={source.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="cyber-card p-5 flex items-center gap-4 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-20 h-full opacity-10"
                       style={{ background: `linear-gradient(90deg, transparent, ${source.color})` }} />
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
                       style={{ background: `color-mix(in srgb, ${source.color} 15%, transparent)`,
                                border: `1px solid color-mix(in srgb, ${source.color} 30%, transparent)` }}>
                    {source.emoji}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black" style={{ color: "var(--text-base)" }}>{source.title}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: "var(--text-muted)" }}>{source.desc}</p>
                  </div>
                  <div className="text-right relative z-10">
                    <p className="text-lg font-black font-mono" style={{ color: source.color }}>+{amount}</p>
                    <p className="text-[9px]" style={{ color: "var(--text-muted)" }}>questions</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Payment badge */}
        <div className="glass-card rounded-xl p-4 text-center space-y-1">
          <p className="text-xs font-bold" style={{ color: "var(--text-muted)" }}>
            🔒 Secured by {MONETIZATION.payment_gateways.primary.join(" & ")}
          </p>
          <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
            Card · Bank Transfer · USSD · Mobile Money
          </p>
        </div>

      </div>
    </div>
  );
}

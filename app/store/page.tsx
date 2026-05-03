"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api/client";
import { motion, AnimatePresence } from "framer-motion";
import { useUserStore, getTotalBalance } from "@/lib/store/user-store";
import { MONETIZATION, type Bundle, type Pass } from "@/lib/config/monetization";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { formatNGN } from "@/lib/utils";
import { cn } from "@/lib/utils";

type Tab = "bundles" | "passes" | "earn";

const BUNDLE_EMOJIS = ["📦", "💎", "🎯", "🚀"];
const PASS_EMOJIS   = ["⚡", "🎓"];

const EARN_SOURCES: Array<{ key: string; emoji: string; title: string; desc: string; color: string }> = [
  { key: "daily_goal",      emoji: "🎯", title: "Daily Goal",       desc: "Complete 3 battles today",               color: "var(--cyber-green)" },
  { key: "weekly_quest",    emoji: "⚔️", title: "Weekly Quest",     desc: "Win 20 questions in a week",             color: "var(--cyber-cyan)" },
  { key: "referral",        emoji: "🎁", title: "Invite a Friend",  desc: "Share your referral link",               color: "var(--cyber-purple)" },
  { key: "streak_reward",   emoji: "🔥", title: "Streak Bonus",     desc: "Maintain a 7-day win streak",            color: "var(--cyber-gold)" },
];

function CoinStack({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-2xl">📚</span>
      <span className="text-xl font-black font-mono neon-text-green">×{count}</span>
    </div>
  );
}

export default function StorePage() {
  const router = useRouter();
  const user = useUserStore();
  const total = getTotalBalance(user);
  const [tab, setTab]           = useState<Tab>("bundles");
  const [purchased, setPurchased] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  // Check for ?payment=success query param after Paystack redirect
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const reference = params.get("reference");

    if (params.get("payment") === "success" && reference) {
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
              setPurchased("✅ Payment successful! Questions added.");
              setTimeout(() => setPurchased(null), 5000);
            });
          })
          .catch((err) => {
            setPurchased("⚠️ Payment processed but couldn't verify. Refresh to check your balance.");
            setTimeout(() => setPurchased(null), 6000);
          });
      };

      verifyWithRetry();

      window.history.replaceState({}, "", "/store");
    }
  }, [user]);

  const handleBundlePurchase = async (bundle: Bundle, index: number) => {
    if (!user.uid) { router.push("/auth/sign-in"); return; }
    setProcessing(`bundle-${index}`);
    try {
      const result = await api.buyBundle(index);
      window.location.href = result.authorization_url;
    } catch {
      setPurchased("❌ Payment failed — please try again.");
      setTimeout(() => setPurchased(null), 3500);
    } finally {
      setProcessing(null);
    }
  };

  const handlePassPurchase = async (pass: Pass) => {
    if (!user.uid) { router.push("/auth/sign-in"); return; }
    setProcessing(`pass-${pass.id}`);
    try {
      const result = await api.buyPass(pass.id);
      window.location.href = result.authorization_url;
    } catch {
      setPurchased("❌ Payment failed — please try again.");
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
              className="cyber-card p-4 text-center relative overflow-hidden"
              style={{ borderColor: "var(--cyber-green)", boxShadow: "0 0 20px color-mix(in srgb, var(--cyber-green) 30%, transparent)" }}
            >
              <div className="absolute inset-0 opacity-5 bg-cyber-green" />
              <p className="font-black relative z-10 neon-text-green">{purchased}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Balance hero */}
        <div className="cyber-card p-5 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 bg-gradient-primary" />
          <div className="relative z-10">
            <p className="text-[10px] uppercase font-black tracking-widest mb-1"
               style={{ color: "var(--text-muted)" }}>Your Arsenal</p>
            <div className="flex items-center justify-center gap-6 mb-2">
              <div>
                <p className="text-3xl font-black font-mono neon-text-green">{user.earned_questions_balance}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Earned</p>
              </div>
              <div className="w-px h-10" style={{ background: "var(--cyber-border)" }} />
              <div>
                <p className="text-3xl font-black font-mono neon-text-cyan">{user.paid_questions_balance}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Paid</p>
              </div>
              <div className="w-px h-10" style={{ background: "var(--cyber-border)" }} />
              <div>
                <p className="text-3xl font-black font-mono neon-text-purple">{user.free_questions_remaining}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Free</p>
              </div>
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              Each question costs <span className="font-black neon-text-cyan">{formatNGN(10)}</span>
            </p>
            <p className="text-[10px] mt-2" style={{ color: "var(--text-muted)" }}>
              Questions used in order: <span style={{ color: "var(--cyber-green)" }}>Earned</span> → <span style={{ color: "var(--cyber-cyan)" }}>Paid</span> → <span style={{ color: "var(--cyber-purple)" }}>Free</span>
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-2">
          {(["bundles", "passes", "earn"] as Tab[]).map((t) => {
            const labels: Record<Tab, { label: string; emoji: string }> = {
              bundles: { label: "Bundles", emoji: "📦" },
              passes:  { label: "Passes",  emoji: "⚡" },
              earn:    { label: "Earn Free",emoji: "🎯" },
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

        {/* Bundles */}
        {tab === "bundles" && (
          <div className="space-y-3">
            {MONETIZATION.pricing.bundles.map((bundle, i) => (
              <motion.div
                key={bundle.questions}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className={cn(
                  "cyber-card p-5 flex items-center justify-between relative overflow-hidden",
                  bundle.popular && "border-cyber-cyan shadow-neon-cyan"
                )}
              >
                {/* BG accent */}
                <div className="absolute right-0 top-0 bottom-0 w-24 opacity-10"
                     style={{ background: bundle.popular ? "linear-gradient(90deg, transparent, var(--cyber-cyan))" : "transparent" }} />

                <div className="flex items-center gap-4">
                  <div className="text-3xl">{BUNDLE_EMOJIS[i % BUNDLE_EMOJIS.length]}</div>
                  <div>
                    {bundle.popular && (
                      <span className="text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider mb-1 inline-block"
                            style={{ background: "var(--cyber-cyan)", color: "#000" }}>
                        POPULAR
                      </span>
                    )}
                    <CoinStack count={bundle.questions} />
                    {bundle.savings !== "0%" && (
                      <p className="text-[10px] font-bold neon-text-green">Save {bundle.savings}</p>
                    )}
                  </div>
                </div>
                <div className="text-right relative z-10">
                  <p className="text-xl font-black font-mono neon-text-cyan">{formatNGN(bundle.price_ngn)}</p>
                  <NeonButton variant="cyan" size="sm" onClick={() => handleBundlePurchase(bundle, i)} className="mt-2"
                    disabled={processing === `bundle-${i}`}>
                    {processing === `bundle-${i}` ? "…" : "Buy Now"}
                  </NeonButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Passes */}
        {tab === "passes" && (
          <div className="space-y-3">
            {MONETIZATION.pricing.passes.map((pass, i) => (
              <motion.div
                key={pass.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="cyber-card p-5 relative overflow-hidden border-cyber-purple"
                style={{ borderColor: "var(--cyber-purple)" }}
              >
                <div className="absolute inset-0 opacity-5"
                     style={{ background: "linear-gradient(135deg, var(--cyber-purple), transparent)" }} />
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{PASS_EMOJIS[i % PASS_EMOJIS.length]}</div>
                      <div>
                        <h3 className="font-black" style={{ color: "var(--text-base)" }}>{pass.name}</h3>
                        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>{pass.description}</p>
                        <p className="text-[10px] font-bold mt-1 neon-text-purple">
                          {pass.duration_days} days · {pass.subject_specific ? "One subject" : "All subjects"}
                        </p>
                      </div>
                    </div>
                    <p className="text-2xl font-black font-mono neon-text-purple">{formatNGN(pass.price_ngn)}</p>
                  </div>
                  <NeonButton variant="purple" fullWidth size="sm"
                    onClick={() => handlePassPurchase(pass)}
                    disabled={processing === `pass-${pass.id}`}>
                    {processing === `pass-${pass.id}` ? "…" : "⚡ Activate Pass"}
                  </NeonButton>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Earn */}
        {tab === "earn" && (
          <div className="space-y-3">
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

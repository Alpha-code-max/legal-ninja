"use client";
import { motion } from "framer-motion";
import { useUserStore, getTotalBalance } from "@/lib/store/user-store";
import { MONETIZATION } from "@/lib/config/monetization";
import { cn } from "@/lib/utils";

interface Props {
  className?: string;
  compact?: boolean;
}

export function BalanceDisplay({ className, compact = false }: Props) {
  const store = useUserStore();
  const total = getTotalBalance(store);
  const isLow = total < MONETIZATION.rules.low_balance_warning_threshold;

  if (compact) {
    return (
      <motion.div
        animate={isLow ? { scale: [1, 1.05, 1] } : {}}
        transition={{ repeat: Infinity, duration: 2 }}
        className={cn(
          "flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono font-bold text-sm",
          isLow
            ? "border-cyber-red text-cyber-red shadow-neon-red"
            : "border-cyber-green text-cyber-green shadow-neon-green",
          className
        )}
      >
        <span>📚</span>
        <span>{total}</span>
        {isLow && <span className="text-xs">Low!</span>}
      </motion.div>
    );
  }

  return (
    <div className={cn("cyber-card p-4 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm text-gray-300">Question Balance</h3>
        <span className="text-xs text-gray-500">₦10 per 6 questions</span>
      </div>

      <div
        className={cn(
          "text-center py-3 rounded-lg border",
          isLow
            ? "border-cyber-red shadow-neon-red"
            : "border-cyber-green shadow-neon-green"
        )}
      >
        <motion.p
          key={total}
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          className={cn(
            "text-3xl font-bold font-mono",
            isLow ? "text-cyber-red" : "text-cyber-green"
          )}
        >
          {total}
        </motion.p>
        <p className="text-xs text-gray-400 mt-1">questions remaining</p>
        {isLow && (
          <p className="text-xs text-cyber-red mt-1 animate-pulse-neon">
            ⚠️ Low balance — top up to keep the streak alive!
          </p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="bg-cyber-bg rounded p-2">
          <p className="text-gray-400">Free</p>
          <p className="font-bold text-gray-200">{store.free_questions_remaining}</p>
        </div>
        <div className="bg-cyber-bg rounded p-2">
          <p className="text-gray-400">Paid</p>
          <p className="font-bold text-cyber-cyan">{store.paid_questions_balance}</p>
        </div>
        <div className="bg-cyber-bg rounded p-2">
          <p className="text-gray-400">Earned</p>
          <p className="font-bold text-cyber-green">{store.earned_questions_balance}</p>
        </div>
      </div>
    </div>
  );
}

"use client";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { NeonButton } from "@/components/ui/NeonButton";

const sections = [
  {
    title: "🎮 Game Rules",
    color: "var(--cyber-cyan)",
    items: [
      { label: "Correct Answer", value: "+10 XP", desc: "Answer a question correctly" },
      { label: "Speed Bonus", value: "+8 XP", desc: "Answer within 30 seconds" },
      { label: "Streak Bonus", value: "+2 XP per streak", desc: "Each consecutive correct answer" },
      { label: "Wrong Answer", value: "-3 Score", desc: "Penalty for incorrect MCQ answers" },
      { label: "Daily Challenge", value: "100 XP", desc: "One attempt per day, fixed set of questions" },
      { label: "Perfect Round", value: "+50 XP", desc: "100% correct in a session" },
    ],
  },
  {
    title: "📊 Points & Scoring",
    color: "var(--cyber-green)",
    items: [
      { label: "Grade A+", value: "≥95%", desc: "Perfect mastery — Supreme Court material" },
      { label: "Grade A", value: "85-94%", desc: "Excellent — Top advocate level" },
      { label: "Grade B", value: "75-84%", desc: "Good — Solid counsel" },
      { label: "Grade C", value: "65-74%", desc: "Fair — Needs practice" },
      { label: "Grade D", value: "50-64%", desc: "Pass — Review weak areas" },
      { label: "Grade F", value: "<50%", desc: "Fail — Focus on fundamentals" },
    ],
  },
  {
    title: "📚 Ranks & Progression",
    color: "var(--cyber-gold)",
    items: [
      { label: "1L Rookie", value: "0 XP", desc: "Fresh start — Foundation concepts" },
      { label: "Case Hunter", value: "250 XP + 50 Qs", desc: "Early momentum" },
      { label: "Brief Writer", value: "600 XP + 150 Qs", desc: "Growing expertise" },
      { label: "Legal Warrior", value: "1,200 XP + 300 Qs", desc: "Solid foundation" },
      { label: "Senior Advocate", value: "2,500 XP + 600 Qs", desc: "Master level" },
      { label: "Legal Ninja", value: "5,000 XP + 1,200 Qs", desc: "Elite status" },
      { label: "Supreme Sensei", value: "10,000 XP + 2,500 Qs", desc: "Legend" },
    ],
  },
  {
    title: "🤖 AI Question Generation",
    color: "var(--cyber-purple)",
    items: [
      { label: "Multiple Choice", value: "MCQs", desc: "AI generates realistic bar exam questions grounded in PDF content" },
      { label: "Essay Questions", value: "Exam Mode", desc: "Complex problem questions with rubrics for authentic exam prep" },
      { label: "Subject Validation", value: "Strict Check", desc: "Questions must contain subject-specific keywords and avoid cross-subject mixing" },
      { label: "Duplicate Prevention", value: "Hash Check", desc: "System prevents identical questions from being stored twice" },
      { label: "Difficulty Balancing", value: "Distribution", desc: "Questions are generated across Easy, Medium, Hard, and Expert levels" },
      { label: "Real-World Context", value: "Grounding", desc: "Questions extracted from or inspired by actual case law and statutes" },
    ],
  },
  {
    title: "🏆 Badges & Achievements",
    color: "var(--cyber-red)",
    items: [
      { label: "Perfect Score", value: "Badge", desc: "Earn an A+ in a session" },
      { label: "Unbeaten Streak", value: "Badge", desc: "Achieve 10+ consecutive correct answers" },
      { label: "Speed Demon", value: "Future", desc: "Answer 5+ questions in <10 seconds each" },
      { label: "Daily Grinder", value: "Future", desc: "Complete daily challenge 7 days in a row" },
      { label: "Leaderboard Assassin", value: "Future", desc: "Reach top 10 on global leaderboard" },
      { label: "Review Ninja", value: "Future", desc: "Review 50+ incorrect answers" },
    ],
  },
  {
    title: "⚡ Daily Goals & Quests",
    color: "var(--cyber-cyan)",
    items: [
      { label: "Daily Questions", value: "5-20 Qs", desc: "Complete a minimum number to earn bonus XP" },
      { label: "Accuracy Target", value: "≥60%", desc: "Maintain accuracy threshold to unlock streak bonuses" },
      { label: "Weekly Quests", value: "Rotating", desc: "Earn extra questions and XP by completing special objectives" },
      { label: "Referral Rewards", value: "+Q/mo", desc: "Earn questions for every friend who joins" },
      { label: "Streak Maintenance", value: "Every Day", desc: "Answer at least 1 question daily to maintain your streak" },
      { label: "Free Questions", value: "100/month", desc: "All users earn questions through daily goals and quests" },
    ],
  },
];

export default function InfoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-3"
        >
          <h1 className="text-4xl font-black" style={{ color: "var(--cyber-cyan)" }}>
            How Legal Ninja Works
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Master the rules, scoring system, and AI-powered question generation
          </p>
        </motion.div>

        {/* Sections */}
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.05 }}
            className="space-y-4"
          >
            {/* Section header */}
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-2xl font-black" style={{ color: section.color }}>
                {section.title}
              </h2>
            </div>

            {/* Items grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {section.items.map((item, itemIdx) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: sectionIdx * 0.05 + itemIdx * 0.02 }}
                  className="cyber-card p-4 space-y-2"
                  style={{
                    borderColor: `${section.color}33`,
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-black" style={{ color: "var(--text-base)" }}>
                      {item.label}
                    </p>
                    <p
                      className="text-xs font-black px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{
                        background: `${section.color}20`,
                        color: section.color,
                      }}
                    >
                      {item.value}
                    </p>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-muted)" }}>
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-2 pt-4"
        >
          <NeonButton
            variant="cyan"
            fullWidth
            size="lg"
            onClick={() => router.push("/quiz")}
          >
            ⚔️ Start Training
          </NeonButton>
          <NeonButton variant="ghost" fullWidth onClick={() => router.back()}>
            Back
          </NeonButton>
        </motion.div>
      </div>
    </div>
  );
}

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";
import { motion } from "framer-motion";
import { useUserStore } from "@/lib/store/user-store";
import { XPBar } from "@/components/ui/XPBar";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { StreakCounter } from "@/components/ui/StreakCounter";
import { NeonButton } from "@/components/ui/NeonButton";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { LEVELS, getNextLevel } from "@/lib/config/progression";
import { calcAccuracy } from "@/lib/utils";

const BADGE_ICONS: Record<string, string> = {
  first_win: "🏆", streak_5: "🔥", streak_10: "⚡", perfect_round: "💫",
  week_warrior: "⚔️", knowledge_seeker: "📚", speed_demon: "💨",
};

function AvatarIllustration({ level }: { level: number }) {
  const levelColors = [
    "var(--cyber-cyan)",    // 1
    "var(--cyber-green)",   // 2
    "var(--cyber-cyan)",    // 3
    "#60a5fa",              // 4 blue-400
    "var(--cyber-purple)",  // 5
    "var(--cyber-gold)",    // 6
    "var(--cyber-red)",     // 7
  ];
  const color = levelColors[Math.min(level - 1, 6)];

  return (
    <svg viewBox="0 0 120 120" className="w-24 h-24" aria-hidden>
      <defs>
        <radialGradient id="avatar-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
        <filter id="avatar-glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Halo */}
      <circle cx="60" cy="60" r="52" fill="url(#avatar-bg)" />
      <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="3 5" />
      {/* Head */}
      <circle cx="60" cy="55" r="24" fill="#0f0f1e" />
      {/* Mask */}
      <path d="M36 52 Q60 40 84 52 L84 62 Q60 74 36 62 Z" fill={color} opacity="0.9" />
      {/* Headband */}
      <rect x="36" y="42" width="48" height="10" rx="5" fill="var(--cyber-purple)" />
      <rect x="51" y="39" width="18" height="5" rx="2.5" fill="var(--cyber-gold)" />
      {/* Eyes */}
      <rect x="43" y="49" width="13" height="5" rx="2.5" fill={color} filter="url(#avatar-glow)" />
      <rect x="64" y="49" width="13" height="5" rx="2.5" fill={color} filter="url(#avatar-glow)" />
      {/* Body */}
      <ellipse cx="60" cy="94" rx="22" ry="16" fill="#0f0f1e" />
      {/* Belt */}
      <rect x="38" y="90" width="44" height="8" rx="4" fill={color} opacity="0.7" />
      {/* Level rank on chest */}
      <text x="60" y="97" textAnchor="middle" fontSize="6" fill="#000" fontFamily="'Exo 2'" fontWeight="800">
        LV.{level}
      </text>
    </svg>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const user = useUserStore();
  const [editOpen,   setEditOpen]   = useState(false);
  const [editName,   setEditName]   = useState(user.username ?? "");
  const [editTrack,  setEditTrack]  = useState(user.track ?? "law_school_track");
  const [editRole,   setEditRole]   = useState(user.role ?? "law_student");
  const [editSchool, setEditSchool] = useState(user.law_school ?? "");
  const [editUniversity, setEditUniversity] = useState(user.university ?? "");
  const [saving,     setSaving]     = useState(false);
  const [saveError,  setSaveError]  = useState("");

  // Sync profile from server on mount
  useEffect(() => {
    if (!user.uid) return;
    api.getMe().then((me) => {
      user.setUser({
        username:                me.username,
        xp:                      me.xp,
        level:                   me.level,
        current_streak:          me.current_streak,
        longest_streak:          me.longest_streak,
        total_questions_answered: me.total_questions_answered,
        total_correct_answers:   me.total_correct_answers,
        free_questions_remaining: me.free_questions_remaining,
        paid_questions_balance:  me.paid_questions_balance,
        earned_questions_balance: me.earned_questions_balance,
        badges:                  me.badges,
        weak_areas:              me.weak_areas,
        referral_count:          me.referral_count,
        referral_code:           me.referral_code,
        track:                   me.track,
        role:                    me.role ?? "law_student",
        law_school:              me.law_school,
        university:              me.university,
      });
    }).catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.uid]);

  const saveProfile = async () => {
    setSaving(true); setSaveError("");
    try {
      await api.updateMe({
        username: editName.trim() || undefined,
        track: editTrack as "law_school_track" | "undergraduate_track",
        role: editRole,
        law_school: editSchool.trim() || undefined,
        university: editUniversity.trim() || undefined,
      });
      user.setUser({ username: editName.trim(), track: editTrack, role: editRole, law_school: editSchool.trim(), university: editUniversity.trim() });
      setEditOpen(false);
    } catch (err) {
      setSaveError(err instanceof Error && err.message.includes("taken") ? "Username already taken." : "Failed to save changes.");
    } finally { setSaving(false); }
  };

  const currentLevel = LEVELS.find((l) => l.level === user.level) ?? LEVELS[0];
  const nextLevel    = getNextLevel(user.level);
  const accuracy     = calcAccuracy(user.total_correct_answers, user.total_questions_answered);

  const stats = [
    { label: "Questions",  value: user.total_questions_answered.toLocaleString(), color: "var(--cyber-cyan)",   emoji: "📖" },
    { label: "Accuracy",   value: `${accuracy}%`,                                 color: accuracy >= 75 ? "var(--cyber-green)" : accuracy >= 60 ? "var(--cyber-gold)" : "var(--cyber-red)", emoji: accuracy >= 75 ? "✅" : "⚠️" },
    { label: "Best Streak",value: `${user.longest_streak}`,                       color: "var(--cyber-gold)",   emoji: "🔥" },
    { label: "Badges",     value: user.badges.length.toString(),                  color: "var(--cyber-purple)", emoji: "🏅" },
  ];

  return (
    <div className="min-h-screen pb-36">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b h-16 flex items-center px-4"
           style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)" }}>
        <div className="max-w-2xl mx-auto w-full flex items-center justify-between">
          <button onClick={() => router.back()} className="transition-colors text-sm font-bold" style={{ color: "var(--text-muted)" }}>← Back</button>
          <h1 className="text-xl font-black gradient-text">Profile</h1>
          <div className="flex items-center gap-2">
            <button onClick={() => {
            setEditName(user.username ?? "");
            setEditTrack(user.track ?? "law_school_track");
            setEditRole(user.role ?? "law_student");
            setEditSchool(user.law_school ?? "");
            setEditUniversity(user.university ?? "");
            setEditOpen(true);
          }}
              className="text-xs px-3 py-1.5 rounded-lg border font-bold transition-all"
              style={{ borderColor: "var(--cyber-cyan)", color: "var(--cyber-cyan)", background: "color-mix(in srgb, var(--cyber-cyan) 8%, transparent)" }}>
              Edit
            </button>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 pt-20 space-y-5">

        {/* Avatar + Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="cyber-card p-6 flex flex-col items-center gap-4 relative overflow-hidden"
        >
          {/* BG gradient */}
          <div className="absolute inset-0 opacity-5 bg-gradient-primary" />

          <motion.div
            animate={{ y: [0, -6, 0] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="relative z-10"
          >
            <AvatarIllustration level={user.level} />
          </motion.div>

          <div className="text-center relative z-10">
            <h2 className="text-2xl font-black" style={{ color: "var(--text-base)" }}>{user.username || "Recruit"}</h2>
            <p className="neon-text-cyan text-sm font-bold">{currentLevel.title}</p>
          </div>

          <div className="flex items-center gap-3 relative z-10">
            <LevelBadge level={user.level} size="md" showName />
            <StreakCounter streak={user.current_streak} size="md" />
          </div>

          <div className="w-full relative z-10">
            <XPBar xp={user.xp} level={user.level} />
            {nextLevel && (
              <p className="text-xs text-center mt-1" style={{ color: "var(--text-muted)" }}>
                {(nextLevel.xp_required - user.xp).toLocaleString()} XP to <span className="font-bold neon-text-cyan">{nextLevel.name}</span>
              </p>
            )}
          </div>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="cyber-card p-4 text-center relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-12 h-12 blur-2xl rounded-full opacity-20"
                   style={{ background: s.color }} />
              <div className="text-2xl mb-1">{s.emoji}</div>
              <p className="text-2xl font-black font-mono" style={{ color: s.color }}>{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="cyber-card p-5"
        >
          <h3 className="text-xs font-black uppercase tracking-widest mb-4"
              style={{ color: "var(--text-muted)" }}>
            Achievement Badges
          </h3>
          {user.badges.length === 0 ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">🔒</div>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>Complete quests to earn badges</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.badges.map((badge) => (
                <motion.span
                  key={badge}
                  whileHover={{ scale: 1.1 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{
                    background: "color-mix(in srgb, var(--cyber-purple) 10%, transparent)",
                    borderColor: "color-mix(in srgb, var(--cyber-purple) 40%, transparent)",
                    color: "var(--cyber-purple)",
                  }}
                >
                  <span>{BADGE_ICONS[badge] ?? "🏅"}</span>
                  <span>{badge.replace(/_/g, " ")}</span>
                </motion.span>
              ))}
            </div>
          )}
        </motion.div>

        {/* Weak areas */}
        {user.weak_areas.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-lg">⚠️</span>
              <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--cyber-red)" }}>
                Weak Areas
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {user.weak_areas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1.5 rounded-full text-xs font-bold border"
                  style={{
                    background: "color-mix(in srgb, var(--cyber-red) 10%, transparent)",
                    borderColor: "color-mix(in srgb, var(--cyber-red) 40%, transparent)",
                    color: "var(--cyber-red)",
                  }}
                >
                  {area}
                </span>
              ))}
            </div>
          </motion.div>
        )}

        {/* Educational Info */}
        {(user.law_school || user.university) && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="cyber-card p-5 space-y-3"
          >
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              🎓 Educational Background
            </h3>
            <div className="space-y-2">
              {user.law_school && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>Law School</p>
                  <p className="text-sm" style={{ color: "var(--text-base)" }}>{user.law_school}</p>
                </div>
              )}
              {user.university && (
                <div>
                  <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>University</p>
                  <p className="text-sm" style={{ color: "var(--text-base)" }}>{user.university}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Referral stats */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="cyber-card p-5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="text-2xl">🎁</div>
            <div>
              <p className="text-xs font-black uppercase tracking-wider neon-text-green">Referrals</p>
              <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>+20 questions per invite</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black font-mono neon-text-green">{user.referral_count}</p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>referred</p>
          </div>
        </motion.div>

        <NeonButton variant="red" fullWidth onClick={() => router.push("/quiz?mode=weak_area_focus")}>
          🔥 Grind Weak Areas
        </NeonButton>

        <NeonButton variant="cyan" fullWidth onClick={() => router.push("/quiz")}>
          ⚔️ Start New Battle
        </NeonButton>

      </div>

      {/* Edit Profile Modal */}
      {editOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center px-4"
             style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
             onClick={(e) => { if (e.target === e.currentTarget) setEditOpen(false); }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="cyber-card p-6 w-full max-w-sm space-y-4">
            <h2 className="text-lg font-black neon-text-cyan">Edit Profile</h2>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Username</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} maxLength={30}
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border focus:outline-none"
                style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }} />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Track</label>
              <select value={editTrack} onChange={(e) => setEditTrack(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }}>
                <option value="law_school_track">Law School</option>
                <option value="undergraduate_track">Undergraduate</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Student Type</label>
              <select value={editRole} onChange={(e) => setEditRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none"
                style={{ background: "var(--cyber-card-bg)", borderColor: "var(--cyber-border)", color: "var(--text-base)" }}>
                <option value="law_student">📖 Law Student — All subjects</option>
                <option value="bar_student">🎓 Bar Student — Bar exam subjects only</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>Law School</label>
              <input value={editSchool} onChange={(e) => setEditSchool(e.target.value)} maxLength={100}
                placeholder="e.g., Nigerian Law School, Lagos"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border focus:outline-none"
                style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }} />
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-widest font-black block mb-1.5" style={{ color: "var(--text-muted)" }}>University</label>
              <input value={editUniversity} onChange={(e) => setEditUniversity(e.target.value)} maxLength={100}
                placeholder="e.g., University of Lagos"
                className="w-full px-4 py-2.5 rounded-xl text-sm bg-transparent border focus:outline-none"
                style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }} />
            </div>

            {saveError && <p className="text-xs" style={{ color: "var(--cyber-red)" }}>{saveError}</p>}

            <div className="flex gap-3 pt-1">
              <NeonButton variant="ghost" fullWidth onClick={() => setEditOpen(false)}>Cancel</NeonButton>
              <NeonButton variant="cyan" fullWidth onClick={saveProfile} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </NeonButton>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

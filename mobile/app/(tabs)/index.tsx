import { FadeIn } from '@components/ui/FadeIn';
import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { CyberCard } from "@components/ui/CyberCard";
import { XPBar } from "@components/ui/XPBar";
import { LevelBadge } from "@components/ui/LevelBadge";
import { StreakCounter } from "@components/ui/StreakCounter";
import { NeonButton } from "@components/ui/NeonButton";
import { api, UserProfile } from "@lib/api";
import { storage } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

const SUBJECTS = [
  { id: "corporate_law",        label: "Corporate Law",      emoji: "🏢" },
  { id: "criminal_law",         label: "Criminal Law",       emoji: "⚖️" },
  { id: "constitutional_law",   label: "Constitutional Law", emoji: "📜" },
  { id: "civil_procedure",      label: "Civil Procedure",    emoji: "📋" },
  { id: "evidence",             label: "Evidence",           emoji: "🔍" },
  { id: "land_law",             label: "Land Law",           emoji: "🏗️" },
  { id: "family_law",           label: "Family Law",         emoji: "👨‍👩‍👧" },
  { id: "legal_drafting",       label: "Legal Drafting",     emoji: "✍️" },
  { id: "commercial_law",       label: "Commercial Law",     emoji: "💼" },
  { id: "public_international", label: "Public Intl Law",    emoji: "🌍" },
  { id: "ethics",               label: "Ethics",             emoji: "🤝" },
  { id: "taxation",             label: "Taxation",           emoji: "💰" },
  { id: "property_law",         label: "Property Law",       emoji: "🏘️" },
];

interface Quest { id: string; title: string; target: number; progress: number; status: string; reward_xp: number; reward_questions: number; }

export default function Dashboard() {
  const { colors }  = useTheme();
  const [user,       setUser]       = useState<UserProfile | null>(null);
  const [quests,     setQuests]     = useState<Quest[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [guest,      setGuest]      = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const g = await storage.isGuest();
    setGuest(!!g);
    if (!g) {
      try {
        const [u, q] = await Promise.all([api.getMe(), api.getQuests()]);
        setUser(u);
        setQuests(q);
      } catch (e: any) {
        setError(e.message ?? "Could not load your profile.");
      }
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#00F5FF" size="large" />
    </View>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor="#00F5FF" />}
      showsVerticalScrollIndicator={false}>

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, marginTop: 8 }}>
        <View>
          <Text style={{ fontSize: 11, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular", textTransform: "uppercase", letterSpacing: 1 }}>Welcome back</Text>
          <Text style={{ fontSize: 20, color: colors.text, fontFamily: "SpaceGrotesk_700Bold" }}>
            {guest ? "Guest Ninja" : (user?.username ?? "...")}
          </Text>
        </View>
        {!guest && user && <LevelBadge level={user.level} size="md" showName />}
      </View>

      {error && (
        <CyberCard accent="red" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ color: "#FF2D55", fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", flex: 1 }}>{error}</Text>
            <NeonButton label="Retry" onPress={load} variant="red" size="sm" />
          </View>
        </CyberCard>
      )}

      {!guest && user && (
        <FadeIn duration={350}>
          <CyberCard style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 16 }}>
              <StreakCounter streak={user.current_streak} size="md" />
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontFamily: "SpaceMono_700Bold", color: "#00F5FF" }}>{user.total_correct_answers}</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>Correct</Text>
              </View>
              <View style={{ width: 1, backgroundColor: colors.border }} />
              <View style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontFamily: "SpaceMono_700Bold", color: "#22FF88" }}>
                  {user.total_questions_answered > 0 ? Math.round((user.total_correct_answers / user.total_questions_answered) * 100) : 0}%
                </Text>
                <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>Accuracy</Text>
              </View>
            </View>
            <XPBar xp={user.xp} level={user.level} showLabel />
          </CyberCard>
        </FadeIn>
      )}

      {!guest && user && (
        <CyberCard accent="purple" style={{ marginBottom: 14 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ color: "#C026D3", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 }}>Daily Mission</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceMono_400Regular" }}>{user.daily_goal.progress}/{user.daily_goal.target}</Text>
          </View>
          <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: "hidden" }}>
            <View style={{ height: "100%", width: `${Math.min(100, (user.daily_goal.progress / user.daily_goal.target) * 100)}%`, backgroundColor: "#C026D3", borderRadius: 3 }} />
          </View>
          {user.daily_goal.completed && <Text style={{ color: "#22FF88", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", marginTop: 8 }}>✅ Completed! +50 XP bonus</Text>}
        </CyberCard>
      )}

      {quests.length > 0 && (
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Daily Quests</Text>
          <View style={{ gap: 8 }}>
            {quests.slice(0, 3).map((q) => (
              <CyberCard key={q.id} style={{ paddingVertical: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <Text style={{ color: colors.text, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold", flex: 1 }}>{q.title}</Text>
                  <Text style={{ color: "#FFD700", fontSize: 10, fontFamily: "SpaceMono_400Regular" }}>+{q.reward_xp} XP</Text>
                </View>
                <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, overflow: "hidden" }}>
                  <View style={{ height: "100%", width: `${Math.min(100, (q.progress / q.target) * 100)}%`, backgroundColor: q.status === "completed" ? "#22FF88" : "#00F5FF", borderRadius: 2 }} />
                </View>
              </CyberCard>
            ))}
          </View>
        </View>
      )}

      <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Quick Play</Text>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 10 }}>
        <NeonButton label="Practice" onPress={() => router.push("/quiz/setup")} style={{ flex: 1 }} size="sm" />
        <NeonButton label="Mock Exam" onPress={() => router.push({ pathname: "/quiz/setup", params: { mode: "mock_exam" } })} variant="purple" style={{ flex: 1 }} size="sm" />
      </View>
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 16 }}>
        <NeonButton label="Daily Challenge" onPress={() => router.push({ pathname: "/quiz/setup", params: { mode: "daily_challenge" } })} variant="gold" style={{ flex: 1 }} size="sm" />
        {!guest && <NeonButton label="⚔️ Duel" onPress={() => router.push({ pathname: "/lobby", params: { mode: "duel" } })} variant="red" style={{ flex: 1 }} size="sm" />}
      </View>

      <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Subjects</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {SUBJECTS.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => router.push({ pathname: "/quiz/setup", params: { subject: s.id } })}
            style={{ width: "47%", backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 14, padding: 14, gap: 6 }}>
            <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
            <Text style={{ color: colors.text, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", lineHeight: 15 }}>{s.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {guest && (
        <FadeIn duration={500} style={{ marginTop: 24 }}>
          <CyberCard accent="purple">
            <Text style={{ color: "#C026D3", fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", textAlign: "center", marginBottom: 6 }}>🥷 Unlock Full Ninja Mode</Text>
            <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", marginBottom: 14 }}>
              Sign in to track progress, earn XP, compete on leaderboards, and get AI explanations.
            </Text>
            <NeonButton label="Sign Up Free" onPress={() => router.push("/(auth)/sign-up")} variant="purple" fullWidth />
          </CyberCard>
        </FadeIn>
      )}
    </ScrollView>
  );
}

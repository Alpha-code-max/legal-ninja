import { FadeIn } from '@components/ui/FadeIn';
import { useEffect, useState, useCallback } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Share } from "react-native";
import { router } from "expo-router";
import { CyberCard } from "@components/ui/CyberCard";
import { LevelBadge } from "@components/ui/LevelBadge";
import { XPBar } from "@components/ui/XPBar";
import { StreakCounter } from "@components/ui/StreakCounter";
import { NeonButton } from "@components/ui/NeonButton";
import { api, UserProfile } from "@lib/api";
import { storage, deleteToken, clearGuest } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

const BADGE_LABELS: Record<string, string> = {
  first_correct: "🎯 First Blood",  streak_5: "🔥 Hot Streak",   streak_10: "💥 On Fire",
  perfect_score: "⭐ Perfect Score", speed_demon: "⚡ Speed Demon", top_10: "🏆 Top 10",
  corporate_expert: "🏢 Corp Expert", criminal_mind: "🚔 Criminal Mind",
};

const TRACK_LABELS: Record<string, string> = {
  law_school_track:    "BAR PART I",
  undergraduate_track: "BAR PART II",
};

export default function Profile() {
  const { colors }  = useTheme();
  const [user,      setUser]      = useState<UserProfile | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [guest,     setGuest]     = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [editOpen,  setEditOpen]  = useState(false);
  const [editName,  setEditName]  = useState("");
  const [editTrack, setEditTrack] = useState("law_school_track");
  const [saving,    setSaving]    = useState(false);

  const inputStyle = { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" } as const;

  const load = useCallback(async () => {
    setError(null);
    const g = await storage.isGuest();
    setGuest(!!g);
    if (!g) {
      try {
        const u = await api.getMe();
        setUser(u); setEditName(u.username); setEditTrack(u.track);
      } catch (e: any) { setError(e.message ?? "Could not load profile."); }
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSignOut = async () => { await deleteToken(); await clearGuest(); router.replace("/(auth)/sign-in"); };

  const handleSaveEdit = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      await api.updateMe({ username: editName.trim(), track: editTrack });
      const refreshed = await api.getMe();
      setUser(refreshed);
      setEditOpen(false);
    } catch (e: any) {
      // error is shown in modal
    } finally { setSaving(false); }
  };

  const handleShareReferral = async () => {
    if (!user?.referral_code) return;
    await Share.share({ message: `Join me on Legal Ninja! Use my referral code ${user.referral_code} to get bonus questions. 🥷⚖️`, title: "Join Legal Ninja" });
  };

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center" }}><ActivityIndicator color="#00F5FF" size="large" /></View>;

  if (guest) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24 }}>
      <Text style={{ fontSize: 48, marginBottom: 16 }}>🥷</Text>
      <Text style={{ color: colors.text, fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", textAlign: "center", marginBottom: 8 }}>Shadow Ninja</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center", marginBottom: 28 }}>Create an account to track progress, earn XP, and unlock your full potential.</Text>
      <NeonButton label="Sign Up Free" onPress={() => router.push("/(auth)/sign-up")} variant="purple" fullWidth style={{ marginBottom: 12 }} />
      <NeonButton label="Sign In" onPress={() => router.push("/(auth)/sign-in")} variant="ghost" fullWidth />
    </View>
  );

  if (error) return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
      <Text style={{ fontSize: 36 }}>⚠️</Text>
      <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center" }}>{error}</Text>
      <NeonButton label="Retry" onPress={load} variant="ghost" />
    </View>
  );

  if (!user) return null;
  const accuracy = user.total_questions_answered > 0 ? Math.round((user.total_correct_answers / user.total_questions_answered) * 100) : 0;

  return (
    <>
      <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <FadeIn duration={350}>
          <CyberCard style={{ alignItems: "center", paddingVertical: 24, marginBottom: 14 }}>
            <LevelBadge level={user.level} size="lg" showName />
            <Text style={{ color: colors.text, fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", marginTop: 12 }}>{user.username}</Text>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 16 }}>{TRACK_LABELS[user.track] ?? user.track.toUpperCase()}</Text>
            <View style={{ width: "100%" }}><XPBar xp={user.xp} level={user.level} showLabel /></View>
          </CyberCard>
        </FadeIn>

        <CyberCard style={{ marginBottom: 14 }}>
          <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Statistics</Text>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {[{ label: "Questions", value: user.total_questions_answered.toLocaleString(), color: colors.text },
              { label: "Correct",   value: user.total_correct_answers.toLocaleString(),    color: "#22FF88" },
              { label: "Accuracy",  value: `${accuracy}%`,                                 color: "#00F5FF" }].map(({ label, value, color }) => (
              <View key={label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 20, fontFamily: "SpaceMono_700Bold", color }}>{value}</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-around", marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderColor: colors.border }}>
            <StreakCounter streak={user.current_streak} size="sm" />
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontFamily: "SpaceMono_700Bold", color: "#FFD700" }}>{user.longest_streak}</Text>
              <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>Best Streak</Text>
            </View>
            <View style={{ width: 1, backgroundColor: colors.border }} />
            <View style={{ alignItems: "center" }}>
              <Text style={{ fontSize: 14, fontFamily: "SpaceMono_700Bold", color: "#C026D3" }}>{user.referral_count}</Text>
              <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>Referrals</Text>
            </View>
          </View>
        </CyberCard>

        {user.badges.length > 0 && (
          <CyberCard style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Badges</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {user.badges.map((b) => (
                <View key={b} style={{ backgroundColor: "rgba(0,245,255,0.08)", borderWidth: 1, borderColor: "rgba(0,245,255,0.25)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 5 }}>
                  <Text style={{ color: "#00F5FF", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold" }}>{BADGE_LABELS[b] ?? b}</Text>
                </View>
              ))}
            </View>
          </CyberCard>
        )}

        {user.weak_areas.length > 0 && (
          <CyberCard accent="red" style={{ marginBottom: 14 }}>
            <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Weak Areas</Text>
            <View style={{ gap: 8 }}>
              {user.weak_areas.map((w) => (
                <View key={w} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                  <Text style={{ color: "#FF2D55", fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>{w.replace(/_/g, " ")}</Text>
                  <NeonButton label="Practice →" size="sm" variant="red" onPress={() => router.push({ pathname: "/quiz/setup", params: { subject: w } })} />
                </View>
              ))}
            </View>
          </CyberCard>
        )}

        {user.referral_code && (
          <CyberCard accent="purple" style={{ marginBottom: 14 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <View>
                <Text style={{ color: "#C026D3", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Referral Code</Text>
                <Text style={{ color: colors.text, fontSize: 18, fontFamily: "SpaceMono_700Bold", letterSpacing: 2 }}>{user.referral_code}</Text>
                <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>{user.referral_count} friends joined</Text>
              </View>
              <NeonButton label="Share" onPress={handleShareReferral} variant="purple" size="sm" />
            </View>
          </CyberCard>
        )}

        <View style={{ gap: 10 }}>
          <NeonButton label="Edit Profile" onPress={() => setEditOpen(true)} variant="ghost" fullWidth />
          <NeonButton label="Sign Out" onPress={handleSignOut} variant="red" fullWidth />
        </View>
      </ScrollView>

      <Modal visible={editOpen} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: colors.bgAlt, borderTopWidth: 1, borderColor: colors.border, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
            <Text style={{ color: colors.text, fontSize: 16, fontFamily: "SpaceGrotesk_700Bold", marginBottom: 20 }}>Edit Profile</Text>
            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>Username</Text>
            <TextInput value={editName} onChangeText={setEditName} placeholder="Your username" placeholderTextColor={colors.textFaint} style={[inputStyle, { marginBottom: 16 }]} />
            <Text style={{ fontSize: 10, color: colors.textMuted, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Track</Text>
            <View style={{ flexDirection: "row", gap: 10, marginBottom: 24 }}>
              {[{ id: "law_school_track", label: "Bar Part I" }, { id: "undergraduate_track", label: "Bar Part II" }].map((t) => (
                <TouchableOpacity key={t.id} onPress={() => setEditTrack(t.id)}
                  style={{ flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5, borderColor: editTrack === t.id ? "#00F5FF" : colors.border, backgroundColor: editTrack === t.id ? "rgba(0,245,255,0.08)" : "transparent", alignItems: "center" }}>
                  <Text style={{ color: editTrack === t.id ? "#00F5FF" : colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>{t.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <NeonButton label="Save Changes" onPress={handleSaveEdit} loading={saving} fullWidth style={{ marginBottom: 12 }} />
            <NeonButton label="Cancel" onPress={() => setEditOpen(false)} variant="ghost" fullWidth />
          </View>
        </View>
      </Modal>
    </>
  );
}

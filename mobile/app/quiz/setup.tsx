import { FadeIn } from '@components/ui/FadeIn';
import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { NeonButton } from "@components/ui/NeonButton";
import { useTheme } from "@context/ThemeContext";

const SUBJECTS = [
  { id: "all",                   label: "All Subjects",       emoji: "🎲" },
  { id: "corporate_law",         label: "Corporate Law",      emoji: "🏢" },
  { id: "criminal_law",          label: "Criminal Law",       emoji: "⚖️" },
  { id: "constitutional_law",    label: "Constitutional Law", emoji: "📜" },
  { id: "civil_procedure",       label: "Civil Procedure",    emoji: "📋" },
  { id: "evidence",              label: "Evidence",           emoji: "🔍" },
  { id: "land_law",              label: "Land Law",           emoji: "🏗️" },
  { id: "family_law",            label: "Family Law",         emoji: "👨‍👩‍👧" },
  { id: "legal_drafting",        label: "Legal Drafting",     emoji: "✍️" },
  { id: "commercial_law",        label: "Commercial Law",     emoji: "💼" },
  { id: "public_international",  label: "Public Intl Law",    emoji: "🌍" },
  { id: "ethics",                label: "Ethics",             emoji: "🤝" },
  { id: "taxation",              label: "Taxation",           emoji: "💰" },
  { id: "property_law",          label: "Property Law",       emoji: "🏘️" },
];

const DIFFICULTIES = ["easy", "medium", "hard", "mixed"] as const;
const COUNTS        = [5, 10, 20, 40] as const;
const TIMES         = [0, 30, 60, 90] as const;

export default function QuizSetup() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ subject?: string; mode?: string }>();
  const [subject,    setSubject]    = useState(params.subject ?? "all");
  const [difficulty, setDifficulty] = useState<string>("mixed");
  const [count,      setCount]      = useState(10);
  const [timeLimit,  setTimeLimit]  = useState(60);
  const [mode]                      = useState(params.mode ?? "practice");

  const sectionLabel = { color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase" as const, letterSpacing: 1, marginBottom: 12 };

  const chipBase = (active: boolean, activeColor: string) => ({
    paddingVertical: 16 as const,
    borderRadius: 14 as const,
    borderWidth: 1.5 as const,
    borderColor: active ? activeColor : colors.border,
    backgroundColor: active ? `${activeColor}14` : "transparent" as const,
    alignItems: "center" as const,
  });

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 48 }} showsVerticalScrollIndicator={false}>
      <FadeIn duration={350}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 28, marginTop: 4 }}>
          <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}
            style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center", marginRight: 8 }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={{ color: "#00F5FF", fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 22, fontFamily: "SpaceGrotesk_700Bold", color: colors.text }}>Quiz Setup</Text>
        </View>

        <Text style={sectionLabel}>Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {SUBJECTS.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => setSubject(s.id)}
                style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: subject === s.id ? "#00F5FF" : colors.border, backgroundColor: subject === s.id ? "rgba(0,245,255,0.08)" : colors.card, alignItems: "center", gap: 6, minWidth: 80 }}>
                <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                <Text style={{ color: subject === s.id ? "#00F5FF" : colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textAlign: "center" }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <Text style={sectionLabel}>Difficulty</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          {DIFFICULTIES.map((d) => (
            <TouchableOpacity key={d} onPress={() => setDifficulty(d)} style={{ flex: 1, ...chipBase(difficulty === d, "#00F5FF") }}>
              <Text style={{ color: difficulty === d ? "#00F5FF" : colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_700Bold", textTransform: "capitalize" }}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={sectionLabel}>Questions</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          {COUNTS.map((c) => (
            <TouchableOpacity key={c} onPress={() => setCount(c)} style={{ flex: 1, ...chipBase(count === c, "#22FF88") }}>
              <Text style={{ color: count === c ? "#22FF88" : colors.textMuted, fontSize: 16, fontFamily: "SpaceMono_700Bold" }}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={sectionLabel}>Time per question</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 36 }}>
          {TIMES.map((t) => (
            <TouchableOpacity key={t} onPress={() => setTimeLimit(t)} style={{ flex: 1, ...chipBase(timeLimit === t, "#C026D3") }}>
              <Text style={{ color: timeLimit === t ? "#C026D3" : colors.textMuted, fontSize: 15, fontFamily: "SpaceMono_700Bold" }}>{t === 0 ? "∞" : `${t}s`}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <NeonButton label="⚔️ Start Quiz" onPress={() => router.push({ pathname: "/quiz/active", params: { subject, difficulty, count: String(count), timeLimit: String(timeLimit), mode } })} fullWidth size="lg" />
      </FadeIn>
    </ScrollView>
  );
}

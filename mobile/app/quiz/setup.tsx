import { FadeIn } from '@components/ui/FadeIn';
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { NeonButton } from "@components/ui/NeonButton";
import { useTheme } from "@context/ThemeContext";
import { api } from "@lib/api";
import { storage } from "@lib/storage";

// ── Subject definitions ──────────────────────────────────────────────────────

const BAR_SUBJECT_IDS = [
  "property_law", "civil_procedure", "criminal_procedure", "corporate_law", "legal_ethics",
] as const;

const ALL_SUBJECTS = [
  { id: "all",                   label: "All Subjects",       emoji: "🎲" },
  { id: "corporate_law",         label: "Corporate Law",      emoji: "🏢" },
  { id: "criminal_procedure",    label: "Criminal Procedure", emoji: "⚖️" },
  { id: "constitutional_law",    label: "Constitutional Law", emoji: "📜" },
  { id: "civil_procedure",       label: "Civil Procedure",    emoji: "📋" },
  { id: "evidence_law",          label: "Evidence",           emoji: "🔍" },
  { id: "land_law",              label: "Land Law",           emoji: "🏗️" },
  { id: "family_law",            label: "Family Law",         emoji: "👨‍👩‍👧" },
  { id: "legal_drafting",        label: "Legal Drafting",     emoji: "✍️" },
  { id: "commercial_law",        label: "Commercial Law",     emoji: "💼" },
  { id: "public_international",  label: "Public Intl Law",    emoji: "🌍" },
  { id: "legal_ethics",          label: "Ethics",             emoji: "🤝" },
  { id: "taxation",              label: "Taxation",           emoji: "💰" },
  { id: "property_law",          label: "Property Law",       emoji: "🏘️" },
  { id: "criminal_law",          label: "Criminal Law",       emoji: "🔒" },
  { id: "law_of_contract",       label: "Contract Law",       emoji: "📝" },
  { id: "law_of_torts",          label: "Torts",              emoji: "⚠️" },
  { id: "equity_and_trusts",     label: "Equity & Trusts",    emoji: "⚖️" },
];

// ── Source options ───────────────────────────────────────────────────────────

const SOURCES = [
  { id: "mixed", label: "Mixed",      emoji: "🎲", desc: "Both pools" },
  { id: "past",  label: "Past Exams", emoji: "📚", desc: "Real exam questions" },
  { id: "ai",    label: "AI Gen",     emoji: "🤖", desc: "From materials" },
] as const;

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
  const [source,     setSource]     = useState<string>("mixed");
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [userRole,   setUserRole]   = useState<string>("law_student");
  const [isGuest,    setIsGuest]    = useState(false);

  // Fetch user role on mount for subject filtering
  useEffect(() => {
    (async () => {
      const g = await storage.isGuest();
      setIsGuest(!!g);
      if (!g) {
        try {
          const me = await api.getMe();
          setUserRole(me.role ?? "law_student");
        } catch {
          // keep default
        }
      }
    })();
  }, []);

  // Filter subjects based on role
  const visibleSubjects = ALL_SUBJECTS.filter((s) => {
    if (s.id === "all") return true;
    if (isGuest) return true; // guests see all
    if (userRole === "bar_student") {
      return (BAR_SUBJECT_IDS as readonly string[]).includes(s.id);
    }
    return true; // law_student and admin see all
  });

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

        {/* Question Source */}
        <Text style={sectionLabel}>Question Source</Text>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 28 }}>
          {SOURCES.map((s) => (
            <TouchableOpacity key={s.id} onPress={() => setSource(s.id)}
              style={{
                flex: 1,
                paddingVertical: 16,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: source === s.id
                  ? (s.id === "past" ? "#FFD700" : s.id === "ai" ? "#00F5FF" : "#C026D3")
                  : colors.border,
                backgroundColor: source === s.id
                  ? (s.id === "past" ? "rgba(255,215,0,0.08)" : s.id === "ai" ? "rgba(0,245,255,0.08)" : "rgba(192,38,211,0.08)")
                  : "transparent",
                alignItems: "center",
                gap: 4,
              }}>
              <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
              <Text style={{
                color: source === s.id
                  ? (s.id === "past" ? "#FFD700" : s.id === "ai" ? "#00F5FF" : "#C026D3")
                  : colors.textMuted,
                fontSize: 11, fontFamily: "SpaceGrotesk_700Bold"
              }}>{s.label}</Text>
              <Text style={{ color: colors.textFaint, fontSize: 9, fontFamily: "SpaceGrotesk_400Regular" }}>{s.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Subject */}
        <Text style={sectionLabel}>Subject</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
          <View style={{ flexDirection: "row", gap: 10 }}>
            {visibleSubjects.map((s) => (
              <TouchableOpacity key={s.id} onPress={() => setSubject(s.id)}
                style={{ paddingHorizontal: 16, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: subject === s.id ? "#00F5FF" : colors.border, backgroundColor: subject === s.id ? "rgba(0,245,255,0.08)" : colors.card, alignItems: "center", gap: 6, minWidth: 80 }}>
                <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                <Text style={{ color: subject === s.id ? "#00F5FF" : colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textAlign: "center" }}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Bar student info badge */}
        {userRole === "bar_student" && (
          <View style={{ backgroundColor: "rgba(255,215,0,0.06)", borderWidth: 1, borderColor: "rgba(255,215,0,0.25)", borderRadius: 12, padding: 12, marginBottom: 20, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Text style={{ fontSize: 16 }}>🎓</Text>
            <Text style={{ color: "#FFD700", fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", flex: 1, lineHeight: 16 }}>
              Bar Student — showing bar exam subjects only. Change in Settings.
            </Text>
          </View>
        )}

        {/* Year filter — only when Past Exams selected */}
        {source === "past" && availableYears.length > 0 && (
          <>
            <Text style={sectionLabel}>Exam Year</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 28 }}>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity onPress={() => setSelectedYear(undefined)}
                  style={{ paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: !selectedYear ? "#FFD700" : colors.border, backgroundColor: !selectedYear ? "rgba(255,215,0,0.08)" : "transparent", alignItems: "center" }}>
                  <Text style={{ color: !selectedYear ? "#FFD700" : colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>All Years</Text>
                </TouchableOpacity>
                {availableYears.map((y) => (
                  <TouchableOpacity key={y} onPress={() => setSelectedYear(y)}
                    style={{ paddingHorizontal: 18, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: selectedYear === y ? "#FFD700" : colors.border, backgroundColor: selectedYear === y ? "rgba(255,215,0,0.08)" : "transparent", alignItems: "center" }}>
                    <Text style={{ color: selectedYear === y ? "#FFD700" : colors.textMuted, fontSize: 13, fontFamily: "SpaceMono_700Bold" }}>{y}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </>
        )}

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

        <NeonButton label="⚔️ Start Quiz" onPress={() => router.push({ pathname: "/quiz/active", params: { subject, difficulty, count: String(count), timeLimit: String(timeLimit), mode, source, ...(selectedYear ? { year: String(selectedYear) } : {}) } })} fullWidth size="lg" />
      </FadeIn>
    </ScrollView>
  );
}

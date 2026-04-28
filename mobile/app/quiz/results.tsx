import { FadeIn } from '@components/ui/FadeIn';
import { View, Text, ScrollView, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CyberCard } from "@components/ui/CyberCard";
import { NeonButton } from "@components/ui/NeonButton";
import { useTheme } from "@context/ThemeContext";

const GRADE_CONFIG: Record<string, { color: string; label: string; emoji: string }> = {
  A: { color: "#FFD700", label: "Excellent!",    emoji: "🏆" },
  B: { color: "#22FF88", label: "Great Work!",   emoji: "⭐" },
  C: { color: "#00F5FF", label: "Good Effort",   emoji: "👍" },
  D: { color: "#C026D3", label: "Keep Studying", emoji: "📚" },
  F: { color: "#FF2D55", label: "Keep Trying",   emoji: "⚔️" },
};

const BADGE_LABELS: Record<string, string> = {
  first_correct: "🎯 First Blood",  streak_5: "🔥 Hot Streak",   streak_10: "💥 On Fire",
  perfect_score: "⭐ Perfect Score", speed_demon: "⚡ Speed Demon", top_10: "🏆 Top 10",
};

export default function Results() {
  const { colors } = useTheme();
  const params     = useLocalSearchParams<{ grade: string; percentage: string; xpEarned: string; levelDirection: string; newBadges: string; answersJson: string }>();
  const grade      = params.grade ?? "F";
  const pct        = Number(params.percentage ?? 0);
  const xp         = Number(params.xpEarned ?? 0);
  const direction  = params.levelDirection === "up" ? "up" : params.levelDirection === "down" ? "down" : null;
  const newBadges  = JSON.parse(params.newBadges ?? "[]") as string[];
  const answers    = JSON.parse(params.answersJson ?? "[]") as { question_id: string; selected: string; correct_option: string }[];
  const wrong      = answers.filter((a) => a.selected !== a.correct_option);
  const cfg        = GRADE_CONFIG[grade] ?? GRADE_CONFIG["F"];

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <FadeIn style={{ alignItems: "center", paddingVertical: 32 }}>
        <Text style={{ fontSize: 56 }}>{cfg.emoji}</Text>
        <Text style={{ fontSize: 72, fontFamily: "SpaceMono_700Bold", color: cfg.color, lineHeight: 80 }}>{grade}</Text>
        <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: cfg.color }}>{cfg.label}</Text>
        <Text style={{ fontSize: 14, fontFamily: "SpaceMono_400Regular", color: colors.textMuted, marginTop: 4 }}>{pct}% correct</Text>
      </FadeIn>

      {direction && (
        <FadeIn duration={400}>
          <CyberCard accent={direction === "up" ? "green" : "red"} style={{ marginBottom: 14, alignItems: "center", paddingVertical: 18 }}>
            <Text style={{ fontSize: 32 }}>{direction === "up" ? "🎉" : "📉"}</Text>
            <Text style={{ color: direction === "up" ? "#22FF88" : "#FF2D55", fontSize: 16, fontFamily: "SpaceGrotesk_700Bold", marginTop: 6 }}>
              {direction === "up" ? "Level Up!" : "Level Down"}
            </Text>
          </CyberCard>
        </FadeIn>
      )}

      {xp > 0 && (
        <FadeIn duration={350}>
          <CyberCard style={{ marginBottom: 14, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular" }}>XP Earned</Text>
            <Text style={{ color: "#FFD700", fontSize: 20, fontFamily: "SpaceMono_700Bold" }}>+{xp.toLocaleString()}</Text>
          </CyberCard>
        </FadeIn>
      )}

      {newBadges.length > 0 && (
        <FadeIn duration={400}>
          <CyberCard accent="purple" style={{ marginBottom: 14 }}>
            <Text style={{ color: "#C026D3", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>New Badges!</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {newBadges.map((b) => (
                <View key={b} style={{ backgroundColor: "rgba(192,38,211,0.1)", borderWidth: 1, borderColor: "rgba(192,38,211,0.4)", borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: "#C026D3", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold" }}>{BADGE_LABELS[b] ?? b}</Text>
                </View>
              ))}
            </View>
          </CyberCard>
        </FadeIn>
      )}

      <FadeIn duration={350}>
        <CyberCard style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-around" }}>
            {[{ label: "Answered", value: String(answers.length),              color: colors.text },
              { label: "Correct",  value: String(answers.length - wrong.length), color: "#22FF88" },
              { label: "Wrong",    value: String(wrong.length),                color: "#FF2D55" }].map(({ label, value, color }) => (
              <View key={label} style={{ alignItems: "center" }}>
                <Text style={{ fontSize: 24, fontFamily: "SpaceMono_700Bold", color }}>{value}</Text>
                <Text style={{ fontSize: 9, color: colors.textMuted, fontFamily: "SpaceGrotesk_400Regular" }}>{label}</Text>
              </View>
            ))}
          </View>
        </CyberCard>
      </FadeIn>

      <View style={{ gap: 10 }}>
        {wrong.length > 0 && <NeonButton label="📖 Review Wrong Answers" onPress={() => router.push({ pathname: "/quiz/review", params: { answersJson: params.answersJson } })} variant="purple" fullWidth />}
        <NeonButton label="🔄 Play Again"  onPress={() => router.replace("/quiz/setup")} fullWidth />
        <NeonButton label="📤 Share Score" onPress={() => Share.share({ message: `I scored ${pct}% (${grade}) on Legal Ninja! 🥷⚖️ Can you beat me? #LegalNinja` })} variant="ghost" fullWidth />
        <NeonButton label="🏠 Home"        onPress={() => router.replace("/(tabs)")} variant="ghost" fullWidth />
      </View>
    </ScrollView>
  );
}

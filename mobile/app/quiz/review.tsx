import { FadeIn } from '@components/ui/FadeIn';
import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { CyberCard } from "@components/ui/CyberCard";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { useTheme } from "@context/ThemeContext";

interface Answer      { question_id: string; selected: string; correct_option: string; }
interface RevealResult { correct_option: string; explanation?: string; }

export default function Review() {
  const { colors } = useTheme();
  const params     = useLocalSearchParams<{ answersJson: string }>();
  const answers    = JSON.parse(params.answersJson ?? "[]") as Answer[];
  const wrong      = answers.filter((a) => a.selected !== a.correct_option && a.selected !== "__timeout__");

  const [reveals,  setReveals]  = useState<Record<string, RevealResult>>({});
  const [loading,  setLoading]  = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [fetchErr, setFetchErr] = useState<string | null>(null);

  useEffect(() => {
    if (wrong.length === 0) { setLoading(false); return; }
    (async () => {
      const map: Record<string, RevealResult> = {};
      let anyFailed = false;
      await Promise.allSettled(wrong.map(async (a) => {
        try {
          const r = await api.revealAnswer(a.question_id);
          map[a.question_id] = { correct_option: r.correct_option, explanation: r.explanation ?? undefined };
        } catch { anyFailed = true; }
      }));
      setReveals(map);
      if (anyFailed) setFetchErr("Some explanations could not be loaded. Check your connection.");
      setLoading(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")}>
          <Text style={{ color: "#00F5FF", fontSize: 14, fontFamily: "SpaceGrotesk_400Regular" }}>←</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: colors.text }}>Review ({wrong.length})</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#00F5FF" size="large" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {fetchErr && (
            <CyberCard accent="red" style={{ marginBottom: 16 }}>
              <Text style={{ color: "#FF2D55", fontSize: 12, fontFamily: "SpaceGrotesk_400Regular" }}>{fetchErr}</Text>
            </CyberCard>
          )}

          {wrong.length === 0 ? (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>🎉</Text>
              <Text style={{ color: "#22FF88", fontSize: 16, fontFamily: "SpaceGrotesk_700Bold" }}>Nothing to review!</Text>
            </View>
          ) : (
            <View style={{ gap: 12 }}>
              {wrong.map((a, i) => {
                const reveal = reveals[a.question_id];
                const isOpen = !!expanded[a.question_id];
                return (
                  <FadeIn key={a.question_id}>
                    <CyberCard accent="red">
                      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <View style={{ backgroundColor: "rgba(255,45,85,0.12)", borderWidth: 1, borderColor: "rgba(255,45,85,0.3)", borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 }}>
                          <Text style={{ color: "#FF2D55", fontSize: 9, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase" }}>Q{i + 1}</Text>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ backgroundColor: "rgba(34,255,136,0.08)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: "#22FF88", fontSize: 10, fontFamily: "SpaceMono_700Bold" }}>✓ {a.correct_option}</Text>
                          </View>
                          <View style={{ backgroundColor: "rgba(255,45,85,0.08)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}>
                            <Text style={{ color: "#FF2D55", fontSize: 10, fontFamily: "SpaceMono_700Bold" }}>✗ {a.selected === "__timeout__" ? "TIMEOUT" : a.selected}</Text>
                          </View>
                        </View>
                      </View>

                      {reveal?.explanation ? (
                        <>
                          <TouchableOpacity onPress={() => setExpanded((e) => ({ ...e, [a.question_id]: !e[a.question_id] }))}
                            style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8, borderTopWidth: 1, borderColor: colors.border }}>
                            <Text style={{ color: "#00F5FF", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 }}>⚖️ Legal Explanation</Text>
                            <Text style={{ color: "#00F5FF", fontSize: 12 }}>{isOpen ? "▲" : "▼"}</Text>
                          </TouchableOpacity>
                          {isOpen && (
                            <View style={{ backgroundColor: "rgba(0,245,255,0.04)", borderLeftWidth: 3, borderLeftColor: "#00F5FF", padding: 12, marginTop: 4 }}>
                              <Text style={{ color: colors.text, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 18 }}>{reveal.explanation}</Text>
                            </View>
                          )}
                        </>
                      ) : (
                        <View style={{ paddingTop: 8, borderTopWidth: 1, borderColor: colors.border }}>
                          <Text style={{ color: colors.textFaint, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>Explanation unavailable</Text>
                        </View>
                      )}
                    </CyberCard>
                  </FadeIn>
                );
              })}
            </View>
          )}
          <NeonButton label="Done" onPress={() => router.replace("/(tabs)")} fullWidth style={{ marginTop: 24 }} variant="ghost" />
        </ScrollView>
      )}
    </View>
  );
}

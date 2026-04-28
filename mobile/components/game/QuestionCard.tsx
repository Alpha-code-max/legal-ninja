import { FadeIn } from '@components/ui/FadeIn';
import { View, Text, TouchableOpacity, ScrollView } from "react-native";
import { useState, useEffect, useRef } from "react";
import { CyberCard } from "@components/ui/CyberCard";
import { useHaptics } from "@hooks/useHaptics";
import { useTheme } from "@context/ThemeContext";

const KEYS = ["A", "B", "C", "D"] as const;

interface Question {
  id: string; question: string; subject: string; difficulty: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option?: "A" | "B" | "C" | "D";
  explanation?: string;
}

interface Props {
  question:       Question;
  questionNumber: number;
  total:          number;
  onAnswer:       (selected: string, timeTakenMs: number) => void;
  isGuest?:       boolean;
}

export function QuestionCard({ question, questionNumber, total, onAnswer, isGuest }: Props) {
  const haptics       = useHaptics();
  const { colors }    = useTheme();
  const startTime     = useRef(Date.now());
  const [selected,    setSelected]    = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(question.explanation ?? null);
  const [showExplain, setShowExplain] = useState(false);

  useEffect(() => {
    startTime.current = Date.now();
    setSelected(null);
    setExplanation(question.explanation ?? null);
    setShowExplain(false);
  }, [question.id]);

  useEffect(() => {
    if (question.explanation) setExplanation(question.explanation);
    if (question.correct_option && selected && selected !== question.correct_option) setShowExplain(true);
  }, [question.explanation, question.correct_option]);

  const correctOption = question.correct_option;
  const isChecking    = selected !== null && !correctOption;
  const isWrong       = !isChecking && selected !== null && selected !== correctOption;

  const handleSelect = (key: string) => {
    if (selected) return;
    setSelected(key);
    haptics.tap();
    setTimeout(() => onAnswer(key, Date.now() - startTime.current), 300);
  };

  const optionBg = (key: string) => {
    if (!selected) return colors.card;
    if (isChecking && key === selected) return "rgba(0,245,255,0.08)";
    if (!isChecking && key === correctOption) return "rgba(34,255,136,0.12)";
    if (!isChecking && key === selected && key !== correctOption) return "rgba(255,45,85,0.12)";
    return colors.isDark ? "rgba(13,27,42,0.4)" : "rgba(240,245,250,0.6)";
  };

  const optionBorder = (key: string) => {
    if (!selected) return colors.border;
    if (isChecking && key === selected) return "#00F5FF";
    if (!isChecking && key === correctOption) return "#22FF88";
    if (!isChecking && key === selected) return "#FF2D55";
    return colors.borderFaint;
  };

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
      <FadeIn duration={300}>
        <CyberCard>
          {/* Header */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <View style={{ backgroundColor: "rgba(0,245,255,0.1)", borderWidth: 1, borderColor: "rgba(0,245,255,0.25)", borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 }}>
              <Text style={{ color: "#00F5FF", fontSize: 9, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 }}>
                {question.subject.replace(/_/g, " ")}
              </Text>
            </View>
            <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceMono_400Regular" }}>
              {questionNumber} / {total}
            </Text>
          </View>

          {/* Question */}
          <Text style={{ color: colors.text, fontSize: 17, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 26, marginBottom: 24 }}>
            {question.question}
          </Text>

          {/* Options */}
          <View style={{ gap: 12 }}>
            {KEYS.map((key) => (
              <TouchableOpacity key={key} onPress={() => handleSelect(key)} disabled={!!selected}
                activeOpacity={0.75}
                style={{ backgroundColor: optionBg(key), borderWidth: 1, borderColor: optionBorder(key), borderRadius: 16, paddingHorizontal: 16, paddingVertical: 18, flexDirection: "row", alignItems: "center", gap: 14, minHeight: 64 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, borderColor: optionBorder(key), alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Text style={{ color: optionBorder(key), fontSize: 14, fontFamily: "SpaceMono_700Bold" }}>{key}</Text>
                </View>
                <Text style={{ flex: 1, color: colors.text, fontSize: 15, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 22, opacity: selected && key !== selected && key !== correctOption ? 0.4 : 1 }}>
                  {question.options[key]}
                </Text>
                {isChecking && key === selected && <Text style={{ fontSize: 14 }}>⚖️</Text>}
                {!isChecking && key === correctOption && <Text style={{ fontSize: 14 }}>✅</Text>}
                {!isChecking && key === selected && key !== correctOption && <Text style={{ fontSize: 14 }}>❌</Text>}
              </TouchableOpacity>
            ))}
          </View>

          {/* Explanation */}
          {!isChecking && isWrong && (
            <FadeIn duration={250} style={{ marginTop: 16 }}>
              {isGuest ? (
                <View style={{ backgroundColor: "rgba(192,38,211,0.08)", borderWidth: 1, borderColor: "rgba(192,38,211,0.3)", borderRadius: 12, padding: 16, alignItems: "center", gap: 8 }}>
                  <Text style={{ color: "#C026D3", fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" }}>⚖️ Why did you get this wrong?</Text>
                  <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center" }}>Sign in to unlock AI-powered explanations</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={() => setShowExplain((o) => !o)}
                  style={{ backgroundColor: "rgba(0,245,255,0.06)", borderWidth: 1, borderColor: "rgba(0,245,255,0.25)", borderRadius: 12, padding: 14, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Text style={{ color: "#00F5FF", fontSize: 11, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 }}>⚖️ Legal Explanation</Text>
                  <Text style={{ color: "#00F5FF", fontSize: 12 }}>{showExplain ? "▲" : "▼"}</Text>
                </TouchableOpacity>
              )}
              {showExplain && explanation && !isGuest && (
                <View style={{ backgroundColor: "rgba(0,245,255,0.04)", borderLeftWidth: 3, borderLeftColor: "#00F5FF", padding: 14, marginTop: 0 }}>
                  <Text style={{ color: colors.text, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 18 }}>{explanation}</Text>
                </View>
              )}
            </FadeIn>
          )}
        </CyberCard>
      </FadeIn>
    </ScrollView>
  );
}

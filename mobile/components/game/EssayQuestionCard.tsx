import React, { useState, useRef, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { FadeIn } from "@components/ui/FadeIn";
import { CyberCard } from "@components/ui/CyberCard";
import { useTheme } from "@context/ThemeContext";

interface Question {
  id: string;
  question: string;
  subject: string;
  type?: string;
}

interface Props {
  question: Question;
  questionNumber: number;
  total: number;
  onAnswer: (text: string, timeTakenMs: number) => void;
  disabled?: boolean;
}

export function EssayQuestionCard({ question, questionNumber, total, onAnswer, disabled }: Props) {
  const { colors } = useTheme();
  const [text, setText] = useState("");
  const startTime = useRef(Date.now());

  useEffect(() => {
    startTime.current = Date.now();
  }, [question.id]);

  const handleSubmit = () => {
    if (!text.trim() || disabled) return;
    onAnswer(text.trim(), Date.now() - startTime.current);
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <View style={{ flex: 1, flexDirection: "column" }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 16 }}>
        <FadeIn duration={300}>
          <CyberCard>
            {/* Header */}
            <View style={styles.header}>
              <View style={[styles.badge, { backgroundColor: "rgba(192,38,211,0.1)", borderColor: "rgba(192,38,211,0.25)" }]}>
                <Text style={[styles.badgeText, { color: "#C026D3" }]}>
                  {question.subject.replace(/_/g, " ")} — ESSAY
                </Text>
              </View>
              <Text style={[styles.qNumber, { color: colors.textMuted }]}>
                {questionNumber} / {total}
              </Text>
            </View>

            {/* Question */}
            <Text style={[styles.questionText, { color: colors.text }]}>
              {question.question}
            </Text>

            {/* Input Area */}
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.textMuted }]}>YOUR ANALYSIS</Text>
              <TextInput
                multiline
                value={text}
                onChangeText={setText}
                disabled={disabled}
                placeholder="Type your legal response here..."
                placeholderTextColor={colors.textMuted}
                style={[
                  styles.input,
                  {
                    color: colors.text,
                    borderColor: colors.border,
                    backgroundColor: colors.isDark ? "rgba(13,27,42,0.3)" : "rgba(240,245,250,0.5)"
                  }
                ]}
              />
              <View style={styles.footer}>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>Words: {wordCount}</Text>
                <Text style={[styles.footerText, { color: colors.textMuted }]}>{text.length} chars</Text>
              </View>
            </View>
          </CyberCard>
        </FadeIn>
      </ScrollView>

      {/* Submit Button - Fixed at bottom, above keyboard */}
      <TouchableOpacity
        onPress={handleSubmit}
        disabled={!text.trim() || disabled}
        activeOpacity={0.8}
        style={[
          styles.submitBtn,
          {
            backgroundColor: !text.trim() || disabled ? "rgba(192,38,211,0.3)" : "#C026D3",
            shadowColor: "#C026D3",
            marginHorizontal: 16,
            marginBottom: 16,
          }
        ]}
      >
        <Text style={styles.submitBtnText}>Submit Response</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  badge: { borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  badgeText: { fontSize: 9, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  qNumber: { fontSize: 11, fontFamily: "SpaceMono_400Regular" },
  questionText: { fontSize: 17, fontFamily: "SpaceGrotesk_400Regular", lineHeight: 26, marginBottom: 24 },
  inputContainer: { gap: 8, marginBottom: 24 },
  label: { fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    height: 250,
    fontSize: 15,
    fontFamily: "SpaceGrotesk_400Regular",
    textAlignVertical: "top",
  },
  footer: { flexDirection: "row", justifyContent: "space-between" },
  footerText: { fontSize: 10, fontFamily: "SpaceMono_400Regular" },
  submitBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: { color: "#FFF", fontSize: 16, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1 },
});

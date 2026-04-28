import { FadeIn } from '@components/ui/FadeIn';
import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { QuestionCard } from "@components/game/QuestionCard";
import { TimerRing } from "@components/ui/TimerRing";
import { StreakCounter } from "@components/ui/StreakCounter";
import { api } from "@lib/api";
import { storage } from "@lib/storage";
import { useHaptics } from "@hooks/useHaptics";

interface Question {
  id: string; question: string; subject: string; difficulty: string;
  options: { A: string; B: string; C: string; D: string };
  correct_option?: "A" | "B" | "C" | "D";
  explanation?: string;
}

type ServerTrack      = "law_school_track" | "undergraduate_track";
type ServerDifficulty = "easy" | "medium" | "hard" | "expert";
type ServerMode       = "solo_practice" | "duel" | "battle_royale" | "daily_challenge" | "weak_area_focus" | "exam_simulation" | "flashcard_review";

const MIXED_DIFFICULTIES: ServerDifficulty[] = ["easy", "medium", "hard"];

function toServerTrack(track: string): ServerTrack {
  if (track === "undergraduate_track") return "undergraduate_track";
  return "law_school_track";
}

function toServerDifficulty(diff: string): ServerDifficulty {
  if (diff === "mixed") return MIXED_DIFFICULTIES[Math.floor(Math.random() * MIXED_DIFFICULTIES.length)];
  if (diff === "expert") return "expert";
  if (diff === "hard") return "hard";
  if (diff === "easy") return "easy";
  return "medium";
}

function toServerMode(mode: string): ServerMode {
  const map: Record<string, ServerMode> = {
    practice:       "solo_practice",
    solo_practice:  "solo_practice",
    daily_challenge:"daily_challenge",
    duel:           "duel",
    battle_royale:  "battle_royale",
  };
  return map[mode] ?? "solo_practice";
}

export default function ActiveQuiz() {
  const params  = useLocalSearchParams<{ subject: string; difficulty: string; count: string; timeLimit: string; mode: string; source: string; year: string }>();
  const haptics = useHaptics();

  const total   = Number(params.count)     || 10;
  const timeSec = Number(params.timeLimit) || 0;
  const subject = params.subject           || "all";
  const diff    = params.difficulty        || "mixed";
  const mode    = params.mode              || "practice";
  const source  = (params.source as "past" | "ai" | "mixed") || "mixed";
  const year    = params.year ? Number(params.year) : undefined;

  const [question,  setQuestion]  = useState<Question | null>(null);
  const [qNumber,   setQNumber]   = useState(1);
  const [streak,    setStreak]    = useState(0);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading,   setLoading]   = useState(true);
  const [waiting,   setWaiting]   = useState(false);
  const [finishing, setFinishing] = useState(false);
  const [timerKey,  setTimerKey]  = useState(0);

  const guestRef = useRef(false);
  const trackRef = useRef<ServerTrack>("law_school_track");

  const answers = useRef<{ question_id: string; selected: string; correct_option: string; time_taken_ms: number }[]>([]);

  const fetchNext = useCallback(async () => {
    setLoading(true);
    try {
      const body = {
        subject:    subject === "all" ? "mixed" : subject,
        track:      trackRef.current,
        difficulty: toServerDifficulty(diff),
        source,
        ...(year ? { year } : {}),
      };
      const res = guestRef.current
        ? await api.guestNextQuestion(body)
        : await api.nextQuestion(body);
      if (!res.question) throw new Error("No questions available for this subject yet.");
      setQuestion(res.question as Question);
      setTimerKey((k) => k + 1);
    } catch (e: any) {
      Alert.alert("No questions", e.message || "No questions available for this subject yet.", [
        { text: "Back", onPress: () => router.canGoBack() ? router.back() : router.replace("/(tabs)") },
      ]);
    } finally {
      setLoading(false);
    }
  }, [subject, diff]);

  useEffect(() => {
    (async () => {
      const g = await storage.isGuest();
      guestRef.current = !!g;

      if (!g) {
        try {
          const me = await api.getMe();
          trackRef.current = toServerTrack(me.track);
        } catch {
          // keep default track
        }

        try {
          const sess = await api.startSession({
            mode:            toServerMode(mode),
            track:           trackRef.current,
            subject:         subject === "all" ? undefined : subject,
            difficulty:      diff === "mixed" ? "medium" : toServerDifficulty(diff),
            time_limit_mins: timeSec ? Math.max(5, Math.ceil((timeSec * total) / 60)) : 30,
            question_count:  Math.min(total, 20),
          });
          setSessionId(sess.session_id);
        } catch (e: any) {
          Alert.alert(
            "Session Warning",
            "Could not start a tracked session. Your answers won't be saved to your profile, but you can still practice.",
            [{ text: "Continue" }, { text: "Cancel", style: "cancel", onPress: () => router.canGoBack() ? router.back() : router.replace("/(tabs)") }]
          );
        }
      }

      await fetchNext();
    })();
  }, []);

  const handleAnswer = async (selected: string, timeTakenMs: number) => {
    if (!question) return;

    let correct_option: string;
    let explanation: string | undefined;

    try {
      const reveal = guestRef.current
        ? await api.guestRevealAnswer(question.id)
        : await api.revealAnswer(question.id);
      correct_option = reveal.correct_option;
      explanation    = reveal.explanation ?? undefined;
    } catch (e: any) {
      Alert.alert("Connection error", "Could not load the answer. Check your connection.", [
        { text: "Quit", onPress: () => router.canGoBack() ? router.back() : router.replace("/(tabs)") },
      ]);
      return;
    }

    const updated: Question = { ...question, correct_option: correct_option as any, explanation };
    setQuestion(updated);

    const isCorrect = selected === correct_option;
    if (isCorrect) { haptics.success(); setStreak((s) => s + 1); }
    else           { haptics.error();  setStreak(0); }

    answers.current.push({ question_id: question.id, selected, correct_option, time_taken_ms: timeTakenMs });

    // Only submit non-timeout answers — server rejects "__timeout__"
    const isTimeout = selected === "__timeout__";
    if (!guestRef.current && sessionId && !isTimeout) {
      api.submitAnswer({
        session_id:     sessionId,
        question_id:    question.id,
        selected:       selected as "A" | "B" | "C" | "D",
        correct_option: correct_option as "A" | "B" | "C" | "D",
        time_taken_ms:  timeTakenMs,
        streak,
      }).catch(() => {});
    }

    // Show the correct/wrong result on the QuestionCard for 1.5s
    // before transitioning to the next question.
    // NOTE: Do NOT call setWaiting(true) here — React 18 would batch it
    // with setQuestion(updated) above and hide the card before the user
    // sees the ✅/❌ feedback.
    setTimeout(async () => {
      setWaiting(true);
      if (qNumber >= total) {
        await finishSession();
      } else {
        setQNumber((n) => n + 1);
        await fetchNext();
        setWaiting(false);
      }
    }, 1500);
  };

  const finishSession = async () => {
    setFinishing(true);
    let result: { grade: string; percentage: number; xpEarned: number; newBadges: string[]; levelDirection: "up" | "down" | null } = {
      grade: "F", percentage: 0, xpEarned: 0, newBadges: [], levelDirection: null,
    };

    const calcLocal = () => {
      const correct = answers.current.filter((a) => a.selected === a.correct_option).length;
      result.percentage = Math.round((correct / total) * 100);
      result.grade = result.percentage >= 90 ? "A" : result.percentage >= 75 ? "B" : result.percentage >= 60 ? "C" : result.percentage >= 45 ? "D" : "F";
    };

    if (!guestRef.current && sessionId) {
      try { result = await api.endSession(sessionId); }
      catch { calcLocal(); }
    } else {
      calcLocal();
    }

    haptics.levelUp();
    router.replace({
      pathname: "/quiz/results",
      params: {
        grade:          result.grade,
        percentage:     String(result.percentage),
        xpEarned:       String(result.xpEarned),
        levelDirection: result.levelDirection ?? "null",
        newBadges:      JSON.stringify(result.newBadges),
        answersJson:    JSON.stringify(answers.current),
      },
    });
  };

  const handleExpire = () => {
    if (question && !question.correct_option) {
      handleAnswer("__timeout__", timeSec * 1000);
    }
  };

  if (finishing || (loading && qNumber === 1)) return (
    <View style={{ flex: 1, backgroundColor: "#050A0F", alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator color="#00F5FF" size="large" />
      <Text style={{ color: "rgba(226,234,240,0.45)", fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", marginTop: 12 }}>
        {finishing ? "Calculating results..." : "Loading question..."}
      </Text>
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#050A0F" }}>
      {/* HUD */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <TouchableOpacity
          onPress={() => Alert.alert("Quit?", "Your progress will be lost.", [{ text: "Cancel" }, { text: "Quit", style: "destructive", onPress: () => router.canGoBack() ? router.back() : router.replace("/(tabs)") }])}
          style={{ width: 44, height: 44, alignItems: "center", justifyContent: "center" }}
        >
          <Text style={{ color: "rgba(226,234,240,0.45)", fontSize: 18, fontFamily: "SpaceGrotesk_400Regular" }}>✕</Text>
        </TouchableOpacity>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {Array.from({ length: Math.min(total, 10) }).map((_, i) => (
              <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: i < qNumber - 1 ? "#22FF88" : i === qNumber - 1 ? "#00F5FF" : "rgba(26,45,66,0.7)" }} />
            ))}
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <StreakCounter streak={streak} size="sm" />
          {timeSec > 0 && question && !question.correct_option && !waiting && (
            <TimerRing key={timerKey} durationSeconds={timeSec} onExpire={handleExpire} size={44} />
          )}
        </View>
      </View>

      {/* Question area */}
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        {loading || waiting ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
            <ActivityIndicator color="#00F5FF" />
            {waiting && (
              <Text style={{ color: "rgba(226,234,240,0.45)", fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>
                Next question...
              </Text>
            )}
          </View>
        ) : question ? (
          <FadeIn>
            <QuestionCard
              question={question}
              questionNumber={qNumber}
              total={total}
              onAnswer={handleAnswer}
              isGuest={guestRef.current}
            />
          </FadeIn>
        ) : null}
      </View>
    </View>
  );
}

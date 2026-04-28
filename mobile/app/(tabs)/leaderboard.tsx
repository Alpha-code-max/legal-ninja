import { FadeIn } from '@components/ui/FadeIn';
import { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { CyberCard } from "@components/ui/CyberCard";
import { LevelBadge } from "@components/ui/LevelBadge";
import { NeonButton } from "@components/ui/NeonButton";
import { api } from "@lib/api";
import { useTheme } from "@context/ThemeContext";

const TYPES = [
  { id: "global",        label: "Global" },
  { id: "weekly",        label: "Weekly" },
  { id: "country_based", label: "Nigeria" },
];

interface Entry { rank: number; username: string; avatar_url: string; level: number; total_xp: number; current_streak: number; }
const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard() {
  const { colors }  = useTheme();
  const [type,    setType]    = useState("global");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [myRank,  setMyRank]  = useState<{ rank: number; total_xp: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

  const fetchLeaderboard = (t: string) => {
    setLoading(true);
    setError(null);
    api.getLeaderboard(t)
      .then((res: any) => { setEntries(res.entries ?? []); setMyRank(res.my_rank ?? null); })
      .catch((e: any) => setError(e.message ?? "Could not load leaderboard."))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaderboard(type); }, [type]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", color: colors.text, marginBottom: 14 }}>🏆 Leaderboard</Text>
        <View style={{ flexDirection: "row", gap: 8 }}>
          {TYPES.map((t) => (
            <TouchableOpacity key={t.id} onPress={() => setType(t.id)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: type === t.id ? "#00F5FF" : colors.border, backgroundColor: type === t.id ? "rgba(0,245,255,0.08)" : "transparent", alignItems: "center" }}>
              <Text style={{ color: type === t.id ? "#00F5FF" : colors.textMuted, fontSize: 11, fontFamily: "SpaceGrotesk_700Bold" }}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color="#00F5FF" size="large" />
        </View>
      ) : error ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 }}>
          <Text style={{ fontSize: 36 }}>⚠️</Text>
          <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular", textAlign: "center" }}>{error}</Text>
          <NeonButton label="Retry" onPress={() => fetchLeaderboard(type)} variant="ghost" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
          {myRank && (
            <CyberCard accent="green" style={{ marginBottom: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#22FF88", fontSize: 12, fontFamily: "SpaceGrotesk_700Bold" }}>Your Rank</Text>
              <Text style={{ color: "#22FF88", fontSize: 22, fontFamily: "SpaceMono_700Bold" }}>#{myRank.rank}</Text>
              <Text style={{ color: colors.textMuted, fontSize: 11, fontFamily: "SpaceMono_400Regular" }}>{myRank.total_xp.toLocaleString()} XP</Text>
            </CyberCard>
          )}

          {entries.length >= 3 && (
            <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 16 }}>
              {[entries[1], entries[0], entries[2]].map((e, i) => {
                const heights   = [100, 120, 90];
                const podiumClr = ["#C0C0C0", "#FFD700", "#CD7F32"];
                const idx       = i === 0 ? 1 : i === 1 ? 0 : 2;
                return (
                  <FadeIn key={e.username} style={{ flex: 1, alignItems: "center" }}>
                    <Text style={{ fontSize: 24 }}>{MEDALS[idx]}</Text>
                    <LevelBadge level={e.level} size="sm" />
                    <Text style={{ color: colors.text, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", marginTop: 4, textAlign: "center" }} numberOfLines={1}>{e.username}</Text>
                    <View style={{ height: heights[i], width: "100%", backgroundColor: `${podiumClr[idx]}22`, borderTopWidth: 2, borderColor: podiumClr[idx], borderTopLeftRadius: 8, borderTopRightRadius: 8, marginTop: 8, alignItems: "center", paddingTop: 6 }}>
                      <Text style={{ color: podiumClr[idx], fontSize: 11, fontFamily: "SpaceMono_700Bold" }}>{(e.total_xp ?? 0).toLocaleString()}</Text>
                    </View>
                  </FadeIn>
                );
              })}
            </View>
          )}

          <View style={{ gap: 8 }}>
            {entries.slice(3).map((e) => (
              <FadeIn key={e.rank}>
                <CyberCard style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
                  <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceMono_700Bold", width: 28, textAlign: "center" }}>#{e.rank}</Text>
                  <LevelBadge level={e.level} size="sm" />
                  <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" }} numberOfLines={1}>{e.username}</Text>
                  <View style={{ alignItems: "flex-end" }}>
                    <Text style={{ color: "#00F5FF", fontSize: 12, fontFamily: "SpaceMono_700Bold" }}>{(e.total_xp ?? 0).toLocaleString()}</Text>
                    <Text style={{ color: colors.textFaint, fontSize: 9, fontFamily: "SpaceGrotesk_400Regular" }}>XP</Text>
                  </View>
                </CyberCard>
              </FadeIn>
            ))}
          </View>

          {entries.length === 0 && (
            <View style={{ alignItems: "center", paddingTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>📊</Text>
              <Text style={{ color: colors.textMuted, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular" }}>No entries yet. Be the first!</Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}

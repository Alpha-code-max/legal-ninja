import { FadeIn } from '@components/ui/FadeIn';
import { useEffect, useState, useRef } from "react";
import { View, Text, TextInput, ScrollView, Alert, ActivityIndicator, Share } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { io, Socket } from "socket.io-client";
import { CyberCard } from "@components/ui/CyberCard";
import { NeonButton } from "@components/ui/NeonButton";
import { LevelBadge } from "@components/ui/LevelBadge";
import { api, UserProfile, SOCKET_BASE } from "@lib/api";
import { storage } from "@lib/storage";
import { useTheme } from "@context/ThemeContext";

interface Player { user_id: string; username: string; level: number; ready: boolean; }

export default function Lobby() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ mode?: string }>();
  const mode   = params.mode ?? "duel";

  const [user,     setUser]     = useState<UserProfile | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [players,  setPlayers]  = useState<Player[]>([]);
  const [inRoom,   setInRoom]   = useState(false);
  const [isHost,   setIsHost]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [starting, setStarting] = useState(false);
  const socket    = useRef<Socket | null>(null);
  const inRoomRef = useRef(false);

  useEffect(() => {
    api.getMe().then(setUser).catch(() => {});
    return () => { socket.current?.disconnect(); };
  }, []);

  const connectSocket = async (code: string) => {
    const token = await storage.getToken();
    const s = io(SOCKET_BASE, { auth: { token }, reconnection: true, reconnectionAttempts: 3 });
    socket.current = s;
    s.on("connect", () => s.emit("room:join", { room_code: code, mode }));
    s.on("room:players", (data: { players: Player[] }) => setPlayers(data.players));
    s.on("room:started", (data: { session_id: string }) => {
      router.replace({ pathname: "/quiz/active", params: { subject: "all", difficulty: "mixed", count: "20", timeLimit: "60", mode, sessionId: data.session_id } });
    });
    s.on("connect_error", () => Alert.alert("Connection failed", "Could not connect to the game server."));
    s.on("disconnect", () => { if (inRoomRef.current) Alert.alert("Disconnected", "Lost connection to room."); });
  };

  const handleCreate = async () => {
    setLoading(true);
    try {
      const token = await storage.getToken();
      const res = await fetch(`${SOCKET_BASE}/api/rooms/create`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ mode }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).error ?? `Error ${res.status}`); }
      const data = await res.json();
      setRoomCode(data.room_code); setIsHost(true); inRoomRef.current = true; setInRoom(true);
      connectSocket(data.room_code);
    } catch (e: any) { Alert.alert("Error", e.message ?? "Could not create room."); }
    finally { setLoading(false); }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setLoading(true);
    try {
      const token = await storage.getToken();
      const res = await fetch(`${SOCKET_BASE}/api/rooms/join`, {
        method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ room_code: code }),
      });
      if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error((e as any).error ?? "Room not found"); }
      setRoomCode(code); inRoomRef.current = true; setInRoom(true);
      connectSocket(code);
    } catch (e: any) { Alert.alert("Error", e.message ?? "Room not found."); }
    finally { setLoading(false); }
  };

  const handleLeave = () => { inRoomRef.current = false; socket.current?.disconnect(); router.canGoBack() ? router.back() : router.replace("/(tabs)"); };
  const maxPlayers  = mode === "duel" ? 2 : 8;
  const emptySlots  = Math.max(0, maxPlayers - players.length);

  const inputStyle = { backgroundColor: colors.inputBg, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: colors.text, fontSize: 18, fontFamily: "SpaceMono_700Bold", textAlign: "center" as const, letterSpacing: 4, marginBottom: 12 };

  if (!inRoom) return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
      <FadeIn duration={350}>
        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 28, marginTop: 8, gap: 12 }}>
          <NeonButton label="←" onPress={() => router.canGoBack() ? router.back() : router.replace("/(tabs)")} variant="ghost" size="sm" />
          <Text style={{ fontSize: 20, fontFamily: "SpaceGrotesk_700Bold", color: colors.text }}>{mode === "duel" ? "⚔️ Duel" : "👑 Battle Royale"}</Text>
        </View>
        <CyberCard style={{ marginBottom: 20 }}>
          <Text style={{ color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", marginBottom: 6 }}>Create Room</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 16 }}>Start a room and invite friends to compete live.</Text>
          <NeonButton label="Create Room" onPress={handleCreate} loading={loading} fullWidth />
        </CyberCard>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
          <Text style={{ color: colors.textFaint, fontSize: 11, fontFamily: "SpaceGrotesk_400Regular" }}>OR</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.border }} />
        </View>
        <CyberCard>
          <Text style={{ color: colors.text, fontSize: 14, fontFamily: "SpaceGrotesk_700Bold", marginBottom: 6 }}>Join Room</Text>
          <Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular", marginBottom: 14 }}>Enter a room code to join an existing battle.</Text>
          <TextInput value={joinCode} onChangeText={setJoinCode} autoCapitalize="characters" maxLength={6} placeholder="ROOM CODE" placeholderTextColor={colors.textFaint} style={inputStyle} />
          <NeonButton label="Join Room" onPress={handleJoin} loading={loading} variant="green" fullWidth />
        </CyberCard>
      </FadeIn>
    </ScrollView>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}>
      <FadeIn duration={350}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24, marginTop: 8 }}>
          <Text style={{ fontSize: 18, fontFamily: "SpaceGrotesk_700Bold", color: colors.text }}>Room Lobby</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ backgroundColor: "rgba(0,245,255,0.08)", borderWidth: 1, borderColor: "rgba(0,245,255,0.3)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6 }}>
              <Text style={{ color: "#00F5FF", fontSize: 16, fontFamily: "SpaceMono_700Bold", letterSpacing: 3 }}>{roomCode}</Text>
            </View>
            <NeonButton label="Share" onPress={() => Share.share({ message: `Join my Legal Ninja ${mode === "duel" ? "Duel" : "Battle Royale"}! Room code: ${roomCode} ⚔️` })} variant="ghost" size="sm" />
          </View>
        </View>

        <Text style={{ color: colors.textMuted, fontSize: 10, fontFamily: "SpaceGrotesk_700Bold", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>Players ({players.length}/{maxPlayers})</Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {players.map((p) => (
            <FadeIn key={p.user_id}>
              <CyberCard style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 }}>
                <LevelBadge level={p.level} size="sm" />
                <Text style={{ flex: 1, color: colors.text, fontSize: 13, fontFamily: "SpaceGrotesk_700Bold" }}>{p.username}</Text>
                {p.ready && <View style={{ backgroundColor: "rgba(34,255,136,0.1)", borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 }}><Text style={{ color: "#22FF88", fontSize: 10, fontFamily: "SpaceGrotesk_700Bold" }}>Ready</Text></View>}
              </CyberCard>
            </FadeIn>
          ))}
          {Array.from({ length: emptySlots }).map((_, i) => (
            <CyberCard key={`empty-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, opacity: 0.4 }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.border, borderStyle: "dashed" }} />
              <Text style={{ color: colors.textFaint, fontSize: 13, fontFamily: "SpaceGrotesk_400Regular" }}>Waiting for player...</Text>
            </CyberCard>
          ))}
        </View>

        <View style={{ gap: 10 }}>
          {isHost && <NeonButton label={starting ? "Starting..." : "⚔️ Start Battle"} onPress={() => { setStarting(true); socket.current?.emit("room:start", { room_code: roomCode }); }} loading={starting} disabled={players.length < 2} fullWidth size="lg" />}
          {!isHost && <CyberCard style={{ alignItems: "center", paddingVertical: 16 }}><ActivityIndicator color="#00F5FF" style={{ marginBottom: 8 }} /><Text style={{ color: colors.textMuted, fontSize: 12, fontFamily: "SpaceGrotesk_400Regular" }}>Waiting for host to start...</Text></CyberCard>}
          <NeonButton label="Leave Room" onPress={handleLeave} variant="ghost" fullWidth />
        </View>
      </FadeIn>
    </View>
  );
}

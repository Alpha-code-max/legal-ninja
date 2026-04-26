"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api/client";
import { connectSocket, disconnectSocket } from "@/lib/api/socket";
import { useUserStore } from "@/lib/store/user-store";
import { NeonButton } from "@/components/ui/NeonButton";
import { cn } from "@/lib/utils";

interface Player { user_id: string; username: string; score: number; level?: number }

function LobbyContent() {
  const router   = useRouter();
  const params   = useSearchParams();
  const mode     = params.get("mode") ?? "duel";
  const track    = params.get("track") ?? "law_school_track";
  const subject  = params.get("subject") ?? undefined;
  const difficulty = params.get("difficulty") ?? "medium";
  const user     = useUserStore();

  const maxPlayers = mode === "battle_royale" ? 4 : 2;
  const modeLabel  = mode === "battle_royale" ? "Battle Royale" : "1v1 Duel";
  const modeEmoji  = mode === "battle_royale" ? "🏆" : "🥊";

  const [view,    setView]    = useState<"choice" | "creating" | "joining" | "waiting">("choice");
  const [roomId,  setRoomId]  = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [players, setPlayers] = useState<Player[]>([]);
  const [error,   setError]   = useState("");
  const [starting, setStarting] = useState(false);
  const [token,   setToken]   = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("ln_token") ?? "");
    }
  }, []);

  // Connect socket when we have a room
  useEffect(() => {
    if (!roomId || !token) return;
    const socket = connectSocket(token);

    socket.emit("room:join", roomId);
    socket.on("room:players", (ps: Player[]) => setPlayers(ps));
    socket.on("room:ready",   () => setStarting(true));
    socket.on("room:started", ({ questions }: { questions: unknown[] }) => {
      disconnectSocket();
      router.push(`/quiz?mode=${mode}&track=${track}&subject=${subject ?? ""}&difficulty=${difficulty}&_room=${roomId}`);
    });

    return () => {
      socket.off("room:players");
      socket.off("room:ready");
      socket.off("room:started");
    };
  }, [roomId, token, router, mode, track, subject, difficulty]);

  const createRoom = useCallback(async () => {
    if (!user.uid) { router.push("/auth/sign-in"); return; }
    setView("creating");
    setError("");
    try {
      const res = await api.createRoom({ mode: mode as "duel" | "battle_royale", track: track as "law_school_track" | "undergraduate_track", subject, difficulty: difficulty as "easy" | "medium" | "hard" | "expert", question_count: 10 });
      setRoomId(res.id);
      setRoomCode(res.code);
      setView("waiting");
    } catch {
      setError("Failed to create room. Try again.");
      setView("choice");
    }
  }, [user.uid, mode, track, subject, difficulty, router]);

  const joinRoom = useCallback(async () => {
    if (!user.uid) { router.push("/auth/sign-in"); return; }
    if (!joinCode.trim()) { setError("Enter a room code."); return; }
    setView("joining");
    setError("");
    try {
      const res = await api.joinRoom(joinCode.trim().toUpperCase());
      setRoomId(res.room_id);
      setView("waiting");
    } catch {
      setError("Room not found or already started.");
      setView("choice");
    }
  }, [user.uid, joinCode, router]);

  const startGame = async () => {
    if (!roomId || !token) return;
    const socket = connectSocket(token);
    socket.emit("room:start", roomId);
  };

  const isHost = players[0]?.user_id === user.uid;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="cyber-card p-6 w-full max-w-sm space-y-5">

        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b" style={{ borderColor: "var(--cyber-border)" }}>
          <div className="text-3xl">{modeEmoji}</div>
          <div>
            <h1 className="text-lg font-black" style={{ color: "var(--cyber-cyan)" }}>{modeLabel}</h1>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>{maxPlayers} players · {difficulty} difficulty</p>
          </div>
          <NeonButton variant="ghost" size="sm" className="ml-auto" onClick={() => { disconnectSocket(); router.back(); }}>✕</NeonButton>
        </div>

        {/* Choice */}
        {view === "choice" && (
          <div className="space-y-3">
            {error && <p className="text-xs text-center" style={{ color: "var(--cyber-red)" }}>{error}</p>}
            <NeonButton variant="cyan" fullWidth size="lg" onClick={createRoom}>
              ⚔️ Create Room
            </NeonButton>
            <div className="space-y-2">
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === "Enter" && joinRoom()}
                placeholder="ENTER ROOM CODE"
                maxLength={8}
                className="w-full px-4 py-3 rounded-xl text-center text-sm font-black font-mono tracking-widest bg-transparent border focus:outline-none uppercase"
                style={{ borderColor: "var(--cyber-border)", color: "var(--text-base)" }}
              />
              <NeonButton variant="purple" fullWidth onClick={joinRoom}>🚪 Join Room</NeonButton>
            </div>
          </div>
        )}

        {/* Creating / Joining */}
        {(view === "creating" || view === "joining") && (
          <div className="text-center py-6 space-y-2">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="text-4xl">⚔️</motion.div>
            <p className="text-sm font-black neon-text-cyan">{view === "creating" ? "Creating room…" : "Joining room…"}</p>
          </div>
        )}

        {/* Waiting room */}
        {view === "waiting" && (
          <div className="space-y-4">
            {roomCode && (
              <div className="cyber-card p-4 text-center space-y-1" style={{ borderColor: "color-mix(in srgb, var(--cyber-cyan) 40%, transparent)" }}>
                <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>Room Code</p>
                <p className="text-3xl font-black font-mono neon-text-cyan tracking-widest">{roomCode}</p>
                <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>Share this code with your opponent</p>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-black" style={{ color: "var(--text-muted)" }}>
                Players ({players.length}/{maxPlayers})
              </p>
              {Array.from({ length: maxPlayers }).map((_, i) => {
                const p = players[i];
                return (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                       style={{ borderColor: p ? "color-mix(in srgb, var(--cyber-green) 40%, transparent)" : "var(--cyber-border)", background: p ? "color-mix(in srgb, var(--cyber-green) 6%, transparent)" : "transparent" }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                         style={{ background: p ? "color-mix(in srgb, var(--cyber-green) 15%, transparent)" : "var(--cyber-border)" }}>
                      {p ? "🥷" : "?"}
                    </div>
                    <p className="text-sm font-bold" style={{ color: p ? "var(--cyber-green)" : "var(--text-muted)" }}>
                      {p ? p.username : "Waiting…"}
                    </p>
                    {p?.user_id === user.uid && <span className="ml-auto text-[10px] font-black neon-text-cyan">YOU</span>}
                  </div>
                );
              })}
            </div>

            {starting && <p className="text-center text-sm font-black neon-text-gold animate-pulse">Game starting…</p>}

            {isHost && players.length >= maxPlayers && !starting && (
              <NeonButton variant="cyan" fullWidth size="lg" onClick={startGame}>⚔️ Start Game</NeonButton>
            )}
            {!isHost && <p className="text-center text-xs" style={{ color: "var(--text-muted)" }}>Waiting for host to start…</p>}
          </div>
        )}
      </motion.div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center neon-text-cyan font-black animate-pulse">Loading lobby…</div>}>
      <LobbyContent />
    </Suspense>
  );
}

import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types";
import { query, queryOne } from "../db/client";

interface RoomState {
  players: Map<string, { userId: string; username: string; score: number; streak: number; answered: number }>;
  questions: unknown[];
  started: boolean;
}

const rooms = new Map<string, RoomState>();

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
      credentials: true,
    },
  });

  // JWT auth middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined;
    if (!token) return next(new Error("Authentication required"));
    try {
      const user = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;
      socket.data.user = user;
      next();
    } catch {
      next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AuthUser;
    console.log(`[ws] ${user.username} connected`);

    // --- Leaderboard ---
    socket.on("subscribe:leaderboard", async (type: string) => {
      socket.join(`lb:${type}`);
      const entries = await query(
        `SELECT u.username, u.avatar_url, u.level, le.rank, le.total_xp, le.current_streak, le.win_rate
         FROM leaderboard_entries le
         JOIN users u ON u.uid = le.user_id
         WHERE le.leaderboard_type = $1
           AND le.period_start = CASE
             WHEN $1 = 'daily' THEN CURRENT_DATE
             WHEN $1 = 'global_weekly' THEN date_trunc('week', NOW())::date
             ELSE '2024-01-01'::date END
         ORDER BY le.rank ASC LIMIT 50`,
        [type]
      );
      socket.emit("leaderboard:data", entries);
    });

    // --- Multiplayer Room ---
    socket.on("room:join", async (roomId: string) => {
      socket.join(`room:${roomId}`);
      const room = await queryOne<{ code: string; status: string; host_id: string }>(
        `SELECT code, status, host_id FROM multiplayer_rooms WHERE id = $1`,
        [roomId]
      );
      if (!room || room.status !== "waiting") {
        socket.emit("room:error", "Room not available");
        return;
      }

      if (!rooms.has(roomId)) rooms.set(roomId, { players: new Map(), questions: [], started: false });
      const state = rooms.get(roomId)!;
      state.players.set(socket.id, {
        userId: user.uid, username: user.username, score: 0, streak: 0, answered: 0,
      });

      io.to(`room:${roomId}`).emit("room:players", Array.from(state.players.values()));
    });

    socket.on("room:start", async (roomId: string) => {
      const state = rooms.get(roomId);
      if (!state || state.started) return;
      state.started = true;
      io.to(`room:${roomId}`).emit("room:started", { questions: state.questions });
    });

    socket.on("room:answer", (data: { roomId: string; correct: boolean; timeTakenMs: number }) => {
      const state = rooms.get(data.roomId);
      const player = state?.players.get(socket.id);
      if (!player) return;

      player.answered += 1;
      if (data.correct) {
        player.score += 10;
        player.streak += 1;
      } else {
        player.score = Math.max(0, player.score - 3);
        player.streak = 0;
      }
      io.to(`room:${data.roomId}`).emit("room:scoreboard", Array.from(state!.players.values()));
    });

    socket.on("disconnect", () => {
      console.log(`[ws] ${user.username} disconnected`);
      rooms.forEach((state, roomId) => {
        if (state.players.delete(socket.id)) {
          io.to(`room:${roomId}`).emit("room:players", Array.from(state.players.values()));
        }
      });
    });
  });

  return io;
}

export function broadcastLeaderboardUpdate(io: SocketServer, type: string, entries: unknown[]): void {
  io.to(`lb:${type}`).emit("leaderboard:data", entries);
}

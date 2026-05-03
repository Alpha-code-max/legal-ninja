/// <reference types="node" />
import { Server as SocketServer } from "socket.io";
import type { Server as HttpServer } from "http";
import jwt from "jsonwebtoken";
import type { AuthUser } from "../types";
import { LeaderboardEntry } from "../models/LeaderboardEntry";
import { MultiplayerRoom } from "../models/MultiplayerRoom";
import mongoose from "mongoose";

export function initSocketServer(httpServer: HttpServer): SocketServer {
  const io = new SocketServer(httpServer, {
    cors: { origin: process.env.FRONTEND_URL ?? "http://localhost:3000", credentials: true },
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

    // ── Leaderboard subscription ───────────────────────────────────────────
    socket.on("subscribe:leaderboard", async (type: string) => {
      socket.join(`lb:${type}`);
      try {
        const periodStart = type === "daily"
          ? new Date().toISOString().slice(0, 10)
          : type === "global_weekly"
            ? (() => { const d = new Date(); d.setDate(d.getDate() - d.getDay() + 1); return d.toISOString().slice(0, 10); })()
            : "2024-01-01";

        const entries = await LeaderboardEntry.find({ leaderboard_type: type, period_start: periodStart })
          .sort({ rank: 1 })
          .limit(50)
          .populate("user_id", "username avatar_url level")
          .lean();

        socket.emit("leaderboard:data", entries.map((e) => {
          const u = e.user_id as unknown as { username: string; avatar_url: string; level: number } | null;
          return {
            rank: e.rank,
            total_xp: e.total_xp,
            win_rate: e.win_rate,
            current_streak: e.current_streak,
            total_questions_answered: e.total_questions_answered,
            username: u && "username" in u ? u.username : "Unknown",
            avatar_url: u && "avatar_url" in u ? u.avatar_url : "",
            level: u && "level" in u ? u.level : 1,
          };
        }));
      } catch (err) {
        console.error("[ws] leaderboard error:", err);
      }
    });

    // ── Multiplayer Room ───────────────────────────────────────────────────
    socket.on("room:join", async (roomId: string) => {
      socket.join(`room:${roomId}`);
      try {
        const room = await MultiplayerRoom.findById(roomId).lean();
        if (!room || room.status !== "waiting") {
          socket.emit("room:error", "Room not available");
          return;
        }
        io.to(`room:${roomId}`).emit("room:players", room.players);
        // If room is now full, auto-start
        if (room.players.length >= room.max_players) {
          io.to(`room:${roomId}`).emit("room:ready", { message: "Room is full — game starting!" });
        }
      } catch (err) {
        console.error("[ws] room:join error:", err);
      }
    });

    socket.on("room:start", async (roomId: string) => {
      try {
        const room = await MultiplayerRoom.findByIdAndUpdate(
          roomId,
          { $set: { status: "active", started_at: new Date() } },
          { new: true }
        ).lean();
        if (!room) return;
        io.to(`room:${roomId}`).emit("room:started", { questions: room.questions });
      } catch (err) {
        console.error("[ws] room:start error:", err);
      }
    });

    socket.on("room:answer", async (data: { roomId: string; userId: string; correct: boolean; timeTakenMs: number }) => {
      try {
        const uid = new mongoose.Types.ObjectId(data.userId);
        const room = await MultiplayerRoom.findOneAndUpdate(
          { _id: data.roomId, "players.user_id": uid },
          {
            $inc: {
              "players.$.score":   data.correct ? 10 : -3,
              "players.$.correct": data.correct ? 1 : 0,
            },
            $set: { "players.$.streak": data.correct ? undefined : 0 },
          },
          { new: true }
        ).lean();
        if (room) io.to(`room:${data.roomId}`).emit("room:scoreboard", room.players);
      } catch (err) {
        console.error("[ws] room:answer error:", err);
      }
    });

    socket.on("room:finish", async (roomId: string) => {
      try {
        await MultiplayerRoom.findByIdAndUpdate(roomId, { $set: { status: "finished", ended_at: new Date() } });
        const room = await MultiplayerRoom.findById(roomId).lean();
        if (room) io.to(`room:${roomId}`).emit("room:ended", { players: room.players });
      } catch (err) {
        console.error("[ws] room:finish error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[ws] ${user.username} disconnected`);
    });
  });

  return io;
}

export function broadcastLeaderboardUpdate(io: SocketServer, type: string, entries: unknown[]): void {
  io.to(`lb:${type}`).emit("leaderboard:data", entries);
}

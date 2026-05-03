/// <reference types="node" />
import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { MultiplayerRoom } from "../models/MultiplayerRoom";
import { getOrGenerateQuestions } from "../services/question";
import mongoose from "mongoose";

const router = Router();

const CreateRoomSchema = z.object({
  mode:           z.enum(["duel", "battle_royale"]),
  track:          z.enum(["law_school_track", "undergraduate_track"]),
  subject:        z.string().max(60).optional(),
  difficulty:     z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  question_count: z.number().int().min(5).max(20).default(10),
});

function randomCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

// POST /api/rooms/create
router.post("/create", requireAuth, validate(CreateRoomSchema), async (req: Request, res) => {
  try {
    const { mode, track, subject, difficulty, question_count } = req.body as z.infer<typeof CreateRoomSchema>;
    const max = mode === "battle_royale" ? 4 : 2;

    const questions = await getOrGenerateQuestions({
      subject: subject ?? track,
      track,
      difficulty,
      count: question_count,
      userId: req.user!.uid,
    });

    // Strip answers before storing
    const safeQuestions = questions.map(({ correct_option: _co, explanation: _ex, ...q }) => q);

    // Generate a unique 6-character code
    let code = randomCode();
    for (let i = 0; i < 5; i++) {
      const exists = await MultiplayerRoom.exists({ code });
      if (!exists) break;
      code = randomCode();
    }

    const room = await MultiplayerRoom.create({
      code,
      host_id:     new mongoose.Types.ObjectId(req.user!.uid),
      mode,
      track,
      subject:     subject ?? null,
      difficulty,
      max_players: max,
      status:      "waiting",
      questions:   safeQuestions,
      players: [{
        user_id:  new mongoose.Types.ObjectId(req.user!.uid),
        username: req.user!.username,
        score: 0, correct: 0, streak: 0,
      }],
    });

    res.status(201).json({ id: String(room._id), code: room.code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

// POST /api/rooms/join
router.post("/join", requireAuth, async (req: Request, res) => {
  try {
    const { code } = req.body as { code: string };
    const room = await MultiplayerRoom.findOne({ code: code?.toUpperCase().trim() });
    if (!room || room.status !== "waiting") {
      res.status(404).json({ error: "Room not found or already started" });
      return;
    }
    if (room.players.length >= room.max_players) {
      res.status(409).json({ error: "Room is full" });
      return;
    }

    const uid = new mongoose.Types.ObjectId(req.user!.uid);
    const already = room.players.some((p) => p.user_id.toString() === req.user!.uid);
    if (!already) {
      room.players.push({ user_id: uid, username: req.user!.username, score: 0, correct: 0, streak: 0, joined_at: new Date() });
      await room.save();
    }

    res.json({ room_id: String(room._id), code: room.code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join room" });
  }
});

// GET /api/rooms/:id
router.get("/:id", requireAuth, async (req: Request, res) => {
  try {
    const room = await MultiplayerRoom.findById(req.params.id).lean();
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    res.json({ ...room, id: String(room._id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;

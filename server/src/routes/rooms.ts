import { Router, type Request } from "express";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { query, queryOne } from "../db/client";

import { getOrGenerateQuestions } from "../services/question";

const router = Router();

const CreateRoomSchema = z.object({
  mode: z.enum(["duel", "battle_royale"]),
  track: z.enum(["law_school_track", "undergraduate_track"]),
  subject: z.string().max(60).optional(),
  difficulty: z.enum(["easy", "medium", "hard", "expert"]).default("medium"),
  question_count: z.number().int().min(5).max(20).default(10),
});

function randomCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

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
    const safeQuestions = questions.map(({ correct_option: _co, ...q }) => q);

    let code = randomCode();
    let attempts = 0;
    while (attempts < 5) {
      const existing = await queryOne(`SELECT id FROM multiplayer_rooms WHERE code = $1`, [code]);
      if (!existing) break;
      code = randomCode();
      attempts++;
    }

    const [room] = await query<{ id: string; code: string }>(
      `INSERT INTO multiplayer_rooms (code, host_id, mode, track, subject, difficulty, max_players, questions)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, code`,
      [code, req.user!.uid, mode, track, subject ?? null, difficulty, max, JSON.stringify(safeQuestions)]
    );

    await query(
      `INSERT INTO room_players (room_id, user_id) VALUES ($1, $2)`,
      [room.id, req.user!.uid]
    );

    res.status(201).json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create room" });
  }
});

router.post("/join", requireAuth, async (req: Request, res) => {
  try {
    const { code } = req.body as { code: string };
    const room = await queryOne<{ id: string; status: string; max_players: number }>(
      `SELECT id, status, max_players FROM multiplayer_rooms WHERE code = $1`,
      [code?.toUpperCase()]
    );
    if (!room || room.status !== "waiting") {
      res.status(404).json({ error: "Room not found or already started" });
      return;
    }

    const [count] = await query<{ count: string }>(
      `SELECT COUNT(*) FROM room_players WHERE room_id = $1`,
      [room.id]
    );
    if (parseInt(count.count) >= room.max_players) {
      res.status(409).json({ error: "Room is full" });
      return;
    }

    await query(
      `INSERT INTO room_players (room_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [room.id, req.user!.uid]
    );
    res.json({ room_id: room.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to join room" });
  }
});

router.get("/:id", requireAuth, async (req: Request, res) => {
  try {
    const room = await queryOne(
      `SELECT r.id, r.code, r.mode, r.track, r.subject, r.difficulty, r.status, r.max_players,
              array_agg(json_build_object('uid', u.uid, 'username', u.username, 'level', u.level, 'avatar_url', u.avatar_url)) as players
       FROM multiplayer_rooms r
       JOIN room_players rp ON rp.room_id = r.id
       JOIN users u ON u.uid = rp.user_id
       WHERE r.id = $1
       GROUP BY r.id`,
      [req.params.id]
    );
    if (!room) { res.status(404).json({ error: "Room not found" }); return; }
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch room" });
  }
});

export default router;

import "dotenv/config";
import http from "http";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

import authRouter from "./routes/auth";
import questionsRouter from "./routes/questions";
import sessionsRouter from "./routes/sessions";
import leaderboardRouter from "./routes/leaderboard";
import usersRouter from "./routes/users";
import storeRouter from "./routes/store";
import roomsRouter from "./routes/rooms";
import adminRouter from "./routes/admin";

import { initSocketServer } from "./services/realtime";
import { startCronJobs } from "./services/cron";
import { connectDB } from "./db/connection";

const app = express();
const httpServer = http.createServer(app);

// --- Security ---
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:3000",
    credentials: true,
  })
);

// Raw body capture for Paystack webhook signature verification
app.use((req, res, next) => {
  if (req.originalUrl === "/api/store/webhook/paystack") {
    let raw = "";
    req.on("data", (chunk) => (raw += chunk));
    req.on("end", () => {
      (req as express.Request & { rawBody: string }).rawBody = raw;
      next();
    });
  } else {
    next();
  }
});

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// --- Rate limiting ---
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: "Too many auth attempts." },
});

const questionLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { error: "Slow down — too many questions requested." },
});

app.use(globalLimiter);

// --- Health check ---
app.get("/health", (_, res) => res.json({ status: "ok", ts: new Date().toISOString() }));

// --- Routes ---
app.use("/api/auth",        authLimiter,     authRouter);
app.use("/api/questions",   questionLimiter, questionsRouter);
app.use("/api/sessions",                     sessionsRouter);
app.use("/api/leaderboard",                  leaderboardRouter);
app.use("/api/users",                        usersRouter);
app.use("/api/store",                        storeRouter);
app.use("/api/rooms",                        roomsRouter);
app.use("/api/admin",                        adminRouter);

// --- 404 ---
app.use((_req, res) => res.status(404).json({ error: "Route not found" }));

// --- Global error handler ---
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// --- Socket.io ---
initSocketServer(httpServer);

// --- Cron ---
startCronJobs();

// --- Start ---
const PORT = parseInt(process.env.PORT ?? "4000");
connectDB()
  .then(() => {
    httpServer.listen(PORT, "0.0.0.0", () => {
      console.log(`🥷 Legal Ninja API running on port ${PORT}`);
    });

    httpServer.on("error", (err: NodeJS.ErrnoException) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ Port ${PORT} is already in use. Kill the old process first:\n   Run: npx kill-port ${PORT}`);
      } else {
        console.error("❌ Server error:", err.message);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });

export default app;

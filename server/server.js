import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import usersRouter from "./routes/users.js";
import quizzesRouter from "./routes/quizzies.js";
import cardsRouter from "./routes/cards.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ----- CORS -----
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,          // e.g. https://your-frontend.onrender.com (set in Render)
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ----- Middleware -----
app.use(express.json());

// ----- Routes -----
app.use("/api/users", usersRouter);
app.use("/api/quizzies", quizzesRouter);
app.use("/api/cards", cardsRouter);

app.get("/", (req, res) => {
  res.send("API is up. Try GET /api/health");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.get("/api/db/health", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// ----- Start server -----
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

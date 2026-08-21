const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const connectDB = require("./db");
const authRoutes       = require("./routes/auth");
const collectionRoutes = require("./routes/collections");
const reviewRoutes     = require("./routes/reviews");
const searchRoutes     = require("./routes/search");

const app = express();
connectDB();

app.use(cors({
  origin: [
    "https://synapse-aidebugger.netlify.app",
    "http://localhost:5173", // local dev
  ],
  credentials: true,
}));
app.use(express.json());

// ── Rate Limiters ──────────────────────────────────────────────
// 1. Strict limit on AI review calls (protects Gemini API quota)
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,                   // 10 AI reviews per IP per hour
  message: { error: "Too many AI review requests. Please wait before trying again." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 2. Auth route limiter (prevents brute-force login/register)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,                   // 20 attempts per IP per 15 min
  message: { error: "Too many auth attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// 3. General API limiter for all other routes
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // 100 requests per IP per 15 min
  message: { error: "Too many requests. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});
// ──────────────────────────────────────────────────────────────

// Health check endpoint for UptimeRobot (keep-alive) — no limiter needed
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth",        authLimiter,    authRoutes);
app.use("/api/collections", generalLimiter, collectionRoutes);
app.use("/api/reviews",     generalLimiter, reviewRoutes);
app.use("/api/search",      generalLimiter, searchRoutes);

// Gemini AI review — protected by JWT + strict rate limit
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const protect = require("./middleware/auth");

app.post("/review", protect, aiLimiter, async (req, res) => {
  try {
    const { code } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(`Review this code:\n${code}`);
    res.json({ review: result.response.text() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

app.listen(5000, () => console.log("Server running on port 5000"));
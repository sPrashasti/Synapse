const express = require("express");
const cors = require("cors");
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

// Health check endpoint for UptimeRobot (keep-alive)
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth",        authRoutes);
app.use("/api/collections", collectionRoutes);
app.use("/api/reviews",     reviewRoutes);
app.use("/api/search",      searchRoutes);

// Gemini AI review
const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
const protect = require("./middleware/auth");

app.post("/review", protect, async (req, res) => {
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
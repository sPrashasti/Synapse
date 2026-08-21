const express = require("express");
const router  = express.Router();
const protect = require("../middleware/auth");

// GET /api/search?q=query
// Uses StackOverflow API (free, no key) + DuckDuckGo Instant Answers
router.get("/", protect, async (req, res) => {
  const q = (req.query.q || "").trim();
  if (!q) return res.json({ stackoverflow: [], ddg: null });

  try {
    // ── 1. StackOverflow search ──────────────────────────────
    const soUrl = `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=relevance&q=${encodeURIComponent(q)}&site=stackoverflow&pagesize=8&filter=!nNPvSNdWme`;
    const soRes  = await fetch(soUrl, { headers: { "Accept-Encoding": "gzip" } });
    const soData = await soRes.json();

    const stackoverflow = (soData.items || []).map((item) => ({
      title:      item.title,
      url:        item.link,
      tags:       item.tags?.slice(0, 4) || [],
      score:      item.score,
      answers:    item.answer_count,
      answered:   item.is_answered,
      views:      item.view_count,
    }));

    // ── 2. DuckDuckGo Instant Answer ─────────────────────────
    const ddgUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_redirect=1&no_html=1&skip_disambig=1`;
    const ddgRes  = await fetch(ddgUrl);
    const ddgData = await ddgRes.json();

    const ddg = ddgData.AbstractText
      ? {
          text:   ddgData.AbstractText,
          source: ddgData.AbstractSource,
          url:    ddgData.AbstractURL,
        }
      : null;

    // ── 3. Related topics from DDG ────────────────────────────
    const related = (ddgData.RelatedTopics || [])
      .filter((r) => r.FirstURL && r.Text)
      .slice(0, 5)
      .map((r) => ({ title: r.Text.slice(0, 80), url: r.FirstURL }));

    res.json({ stackoverflow, ddg, related });
  } catch (err) {
    console.error("Search error:", err.message);
    res.status(500).json({ error: "Search failed", stackoverflow: [], ddg: null });
  }
});

module.exports = router;

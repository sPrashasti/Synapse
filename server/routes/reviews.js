const express = require("express");
const Review = require("../models/Review");
const protect = require("../middleware/auth");

const router = express.Router();

// POST /api/reviews/save — save a review
router.post("/save", protect, async (req, res) => {
  try {
    const { code, review, collectionId } = req.body;
    if (!code || !review)
      return res.status(400).json({ error: "Code and review are required" });

    const saved = await Review.create({
      code,
      review,
      owner: req.user._id,
      collectionId: collectionId || null,   // ← matches the schema field
    });
    res.status(201).json(saved);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/:collectionId — get reviews in a collection
router.get("/:collectionId", protect, async (req, res) => {
  try {
    const reviews = await Review.find({
      owner: req.user._id,
      collectionId: req.params.collectionId,   // ← matches the schema field
    }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

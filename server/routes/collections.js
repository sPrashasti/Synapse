const express = require("express");
const Collection = require("../models/Collection");
const protect = require("../middleware/auth");

const router = express.Router();

// GET /api/collections — get all for logged-in user
router.get("/", protect, async (req, res) => {
  try {
    const collections = await Collection.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/collections — create new
router.post("/", protect, async (req, res) => {
  try {
    const { name, desc } = req.body;
    if (!name) return res.status(400).json({ error: "Name is required" });
    const col = await Collection.create({ name, desc, owner: req.user._id });
    res.status(201).json(col);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/collections/:id
router.delete("/:id", protect, async (req, res) => {
  try {
    const col = await Collection.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!col) return res.status(404).json({ error: "Collection not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

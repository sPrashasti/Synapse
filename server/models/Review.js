const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    code:         { type: String, required: true },
    review:       { type: String, required: true },
    owner:        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);

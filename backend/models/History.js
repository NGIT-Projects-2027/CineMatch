const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  search: {
    type: String,
    required: true,
  },
  results: [
    {
      movieId: Number,
      title: String,
      genres: [String],
      similarity_score: Number,
    },
  ],
  searchedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for efficient user history queries
historySchema.index({ userId: 1, searchedAt: -1 });

module.exports = mongoose.model("History", historySchema);

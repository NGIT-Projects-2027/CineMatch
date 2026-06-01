require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const recommendRoutes = require("./routes/recommend");

const app = express();
const PORT = process.env.PORT || 3001;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api", recommendRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "movie-recommender-backend",
    timestamp: new Date().toISOString(),
  });
});

// --- MongoDB Connection ---
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("[OK] Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`[OK] Express server running on port ${PORT}`);
      console.log(`     Flask ML URL: ${process.env.FLASK_ML_URL}`);
    });
  })
  .catch((err) => {
    console.error("[ERROR] MongoDB connection failed:", err.message);
    process.exit(1);
  });

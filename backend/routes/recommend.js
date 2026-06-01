const express = require("express");
const axios = require("axios");
const History = require("../models/History");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

const FLASK_ML_URL = process.env.FLASK_ML_URL || "http://localhost:5000";

// TVDB Poster Service
let tvdbToken = null;
let tvdbTokenExp = 0;

async function getTvdbToken() {
  if (tvdbToken && Date.now() < tvdbTokenExp) return tvdbToken;
  try {
    const res = await axios.post("https://api4.thetvdb.com/v4/login", {
      apikey: process.env.TVDB_API_KEY
    });
    tvdbToken = res.data.data.token;
    tvdbTokenExp = Date.now() + 1000 * 60 * 60 * 24 * 28; // ~28 days
    return tvdbToken;
  } catch (e) {
    console.error("TVDB auth error", e.message);
    return null;
  }
}

async function attachPosters(movies) {
  if (!movies || movies.length === 0) return movies;
  const token = await getTvdbToken();
  if (!token) return movies;
  
  return Promise.all(movies.map(async (movie) => {
    try {
      // Clean title from year e.g., "Toy Story (1995)" -> "Toy Story"
      const cleanTitle = movie.title.replace(/\s*\(\d{4}\)$/, "");
      const res = await axios.get(`https://api4.thetvdb.com/v4/search?query=${encodeURIComponent(cleanTitle)}&type=movie`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.data && res.data.data.length > 0) {
        movie.image_url = res.data.data[0].image_url || res.data.data[0].thumbnail;
        console.log(`[TVDB] Found poster for ${cleanTitle}: ${movie.image_url}`);
      } else {
        console.log(`[TVDB] No results for ${cleanTitle}`);
      }
    } catch (e) {
      console.error(`[TVDB] search failed for ${cleanTitle}:`, e.response?.status, e.response?.data?.message || e.message);
    }
    return movie;
  }));
}

/**
 * POST /api/recommend
 * Get movie recommendations (proxies to Flask ML service)
 * Saves search to history if user is authenticated
 */
router.post("/recommend", async (req, res) => {
  try {
    const { movie, top_n } = req.body;

    if (!movie) {
      return res.status(400).json({ error: "Movie title is required." });
    }

    // Call Flask ML service
    const mlResponse = await axios.post(`${FLASK_ML_URL}/recommend`, {
      movie,
      top_n: top_n || 10,
    });

    const result = mlResponse.data;
    
    // Attach posters
    result.recommendations = await attachPosters(result.recommendations);
    if (result.searched) {
      const searchedWithPoster = await attachPosters([result.searched]);
      result.searched = searchedWithPoster[0];
    }

    // Save to history if user is authenticated
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      try {
        const jwt = require("jsonwebtoken");
        const decoded = jwt.verify(
          authHeader.split(" ")[1],
          process.env.JWT_SECRET
        );

        await History.create({
          userId: decoded.id,
          search: movie,
          results: result.recommendations.slice(0, 5).map((r) => ({
            movieId: r.movieId,
            title: r.title,
            genres: r.genres,
            similarity_score: r.similarity_score,
          })),
        });
      } catch (e) {
        // Silently fail on history save - don't block the response
        console.error("Failed to save history:", e.message);
      }
    }

    res.json(result);
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json(err.response.data);
    }
    console.error("Recommend error:", err.message);
    res.status(500).json({ error: "ML service unavailable. Please try again." });
  }
});

/**
 * GET /api/movies
 * Search movies for autocomplete (proxies to Flask)
 */
router.get("/movies", async (req, res) => {
  try {
    const query = req.query.q || "";
    const mlResponse = await axios.get(`${FLASK_ML_URL}/movies`, {
      params: { q: query },
    });
    res.json(mlResponse.data);
  } catch (err) {
    console.error("Movies search error:", err.message);
    res.status(500).json({ error: "ML service unavailable." });
  }
});

/**
 * GET /api/trending
 * Get trending movies (proxies to Flask)
 */
router.get("/trending", async (req, res) => {
  try {
    const mlResponse = await axios.get(`${FLASK_ML_URL}/trending`);
    let trendingMovies = mlResponse.data;
    trendingMovies = await attachPosters(trendingMovies);
    res.json(trendingMovies);
  } catch (err) {
    console.error("Trending error:", err.message);
    res.status(500).json({ error: "ML service unavailable." });
  }
});

/**
 * GET /api/history
 * Get user's search history
 */
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const history = await History.find({ userId: req.user.id })
      .sort({ searchedAt: -1 })
      .limit(50);

    res.json(history);
  } catch (err) {
    console.error("History error:", err);
    res.status(500).json({ error: "Failed to fetch history." });
  }
});

/**
 * DELETE /api/history
 * Clear user's search history
 */
router.delete("/history", authMiddleware, async (req, res) => {
  try {
    await History.deleteMany({ userId: req.user.id });
    res.json({ message: "History cleared." });
  } catch (err) {
    console.error("Clear history error:", err);
    res.status(500).json({ error: "Failed to clear history." });
  }
});

/**
 * POST /api/favorites
 * Add a movie to favorites
 */
router.post("/favorites", authMiddleware, async (req, res) => {
  try {
    const { movieId, title, genres } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ error: "movieId and title are required." });
    }

    const user = await User.findById(req.user.id);

    // Check if already favorited
    const exists = user.favorites.some((f) => f.movieId === movieId);
    if (exists) {
      return res.status(400).json({ error: "Movie already in favorites." });
    }

    user.favorites.push({ movieId, title, genres: genres || [] });
    await user.save();

    res.json({ message: "Added to favorites.", favorites: user.favorites });
  } catch (err) {
    console.error("Add favorite error:", err);
    res.status(500).json({ error: "Failed to add favorite." });
  }
});

/**
 * DELETE /api/favorites/:movieId
 * Remove a movie from favorites
 */
router.delete("/favorites/:movieId", authMiddleware, async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);

    const user = await User.findById(req.user.id);
    user.favorites = user.favorites.filter((f) => f.movieId !== movieId);
    await user.save();

    res.json({ message: "Removed from favorites.", favorites: user.favorites });
  } catch (err) {
    console.error("Remove favorite error:", err);
    res.status(500).json({ error: "Failed to remove favorite." });
  }
});

/**
 * GET /api/favorites
 * Get user's favorite movies
 */
router.get("/favorites", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    let favorites = user.favorites.map(f => f.toObject());
    favorites = await attachPosters(favorites);
    res.json(favorites);
  } catch (err) {
    console.error("Get favorites error:", err);
    res.status(500).json({ error: "Failed to fetch favorites." });
  }
});

module.exports = router;

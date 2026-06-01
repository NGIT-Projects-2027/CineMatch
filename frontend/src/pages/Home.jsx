import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { movieAPI, favoritesAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import SearchBox from "@/components/SearchBox";
import MovieCard from "@/components/MovieCard";
import { Sparkles, TrendingUp, Film } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [recommendations, setRecommendations] = useState(null);
  const [searchedMovie, setSearchedMovie] = useState(null);
  const [trending, setTrending] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadTrending();
    if (isAuthenticated) loadFavorites();
  }, [isAuthenticated]);

  const loadTrending = async () => {
    try {
      const res = await movieAPI.trending();
      setTrending(res.data);
    } catch (err) { console.error("Trending error:", err); }
  };

  const loadFavorites = async () => {
    try {
      const res = await favoritesAPI.getFavorites();
      setFavorites(res.data);
    } catch (err) { console.error("Favorites error:", err); }
  };

  const handleSearch = async (movieTitle) => {
    setLoading(true);
    setError("");
    setRecommendations(null);
    setSearchedMovie(null);
    try {
      const res = await movieAPI.recommend(movieTitle);
      setSearchedMovie(res.data.searched);
      setRecommendations(res.data.recommendations);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to get recommendations.");
    } finally { setLoading(false); }
  };

  const handleFavorite = async (movie) => {
    if (!isAuthenticated) return;
    const isFav = favorites.some(f => f.movieId === movie.movieId);
    try {
      if (isFav) {
        await favoritesAPI.removeFavorite(movie.movieId);
        setFavorites(prev => prev.filter(f => f.movieId !== movie.movieId));
      } else {
        await favoritesAPI.addFavorite({ movieId: movie.movieId, title: movie.title, genres: movie.genres });
        setFavorites(prev => [...prev, { movieId: movie.movieId, title: movie.title, genres: movie.genres }]);
      }
    } catch (err) { console.error("Favorite error:", err); }
  };

  const isFavorite = (movieId) => favorites.some(f => f.movieId === movieId);

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="bg-particles" />

      {/* Hero Section */}
      <section style={{ textAlign: "center", padding: "4rem 1.5rem 2rem", maxWidth: 800, margin: "0 auto" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Sparkles size={20} style={{ color: "var(--color-accent-amber)" }} />
            <span style={{ fontSize: "0.85rem", color: "var(--color-accent-amber)", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>AI-Powered Recommendations</span>
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: "1rem", letterSpacing: "-0.03em" }}>
            Discover Your Next <span className="gradient-text">Favorite Movie</span>
          </h1>
          <p style={{ fontSize: "1.1rem", color: "var(--color-text-secondary)", maxWidth: 520, margin: "0 auto 2rem", lineHeight: 1.6 }}>
            Search any movie and our ML engine finds the best matches using content-based similarity analysis.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }} style={{ display: "flex", justifyContent: "center" }}>
          <SearchBox onSearch={handleSearch} loading={loading} />
        </motion.div>
      </section>

      {/* Error */}
      {error && (
        <div style={{ maxWidth: 640, margin: "0 auto 2rem", padding: "0 1.5rem" }}>
          <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: "var(--radius-md)", padding: "0.8rem 1rem", fontSize: "0.9rem", color: "var(--color-error)", textAlign: "center" }}>{error}</div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.2rem" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="skeleton" style={{ height: 320, borderRadius: "var(--radius-lg)" }} />
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      <AnimatePresence>
        {recommendations && recommendations.length > 0 && (
          <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 3rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
              <Film size={20} style={{ color: "var(--color-accent-purple)" }} />
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>
                Movies similar to <span className="gradient-text">{searchedMovie?.title}</span>
              </h2>
            </div>

            {/* Searched movie */}
            {searchedMovie && (
              <div style={{ marginBottom: "2.5rem" }}>
                <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text-secondary)" }}>Searched Movie</h3>
                <div style={{ maxWidth: "240px" }}>
                  <MovieCard 
                    movie={searchedMovie} 
                    onFavorite={isAuthenticated ? handleFavorite : undefined} 
                    isFavorite={isFavorite(searchedMovie.movieId)} 
                  />
                </div>
              </div>
            )}

            <h3 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: "1rem", color: "var(--color-text-secondary)" }}>Recommended Movies</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.2rem" }}>
              {recommendations.slice(0, 5).map((movie, idx) => (
                <MovieCard key={movie.movieId} movie={movie} index={idx} onFavorite={isAuthenticated ? handleFavorite : undefined} isFavorite={isFavorite(movie.movieId)} onClick={handleSearch} />
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Trending Section */}
      {!recommendations && trending.length > 0 && (
        <section style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem 3rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <TrendingUp size={20} style={{ color: "var(--color-accent-pink)" }} />
            <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Trending Movies</h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.2rem" }}>
            {trending.map((movie, idx) => (
              <MovieCard key={movie.movieId} movie={movie} index={idx} onFavorite={isAuthenticated ? handleFavorite : undefined} isFavorite={isFavorite(movie.movieId)} onClick={handleSearch} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

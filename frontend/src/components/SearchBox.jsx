import { useState, useEffect, useRef } from "react";
import { movieAPI } from "@/lib/api";
import { Search, X, Film, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SearchBox({ onSearch, loading: externalLoading }) {
  const [query, setQuery] = useState("");
  const [allMovies, setAllMovies] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    // Fetch all movies for fast local filtering
    const loadAllMovies = async () => {
      try {
        const res = await movieAPI.search("all");
        setAllMovies(res.data);
      } catch (err) {
        console.error("Failed to load all movies:", err);
      }
    };
    loadAllMovies();

    // Close suggestions on outside click
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterMovies = (q) => {
    if (!q) {
      // Show first 100 movies when focused and empty
      setSuggestions(allMovies.slice(0, 100));
      return;
    }
    const lowerQ = q.toLowerCase();
    const filtered = allMovies.filter((m) => m.title.toLowerCase().includes(lowerQ));
    setSuggestions(filtered.slice(0, 100));
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setShowSuggestions(true);
    filterMovies(value);
  };

  const handleFocus = () => {
    setShowSuggestions(true);
    filterMovies(query);
  };

  const handleSelect = (movie) => {
    setQuery(movie.title);
    setShowSuggestions(false);
    onSearch(movie.title);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      onSearch(query.trim());
    }
  };

  const handleClear = () => {
    setQuery("");
    setSuggestions([]);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "640px" }}>
      <form onSubmit={handleSubmit}>
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "1rem",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
            }}
          >
            {externalLoading ? (
              <Loader2 size={20} className="animate-spin" style={{ animation: "spin 1s linear infinite" }} />
            ) : (
              <Search size={20} />
            )}
          </div>
          <input
            ref={inputRef}
            id="search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={handleFocus}
            placeholder="Search for a movie... (e.g., Toy Story, Avatar, Inception)"
            className="input-field"
            style={{
              paddingLeft: "2.8rem",
              paddingRight: query ? "5rem" : "1rem",
              height: "52px",
              fontSize: "1rem",
              borderRadius: "var(--radius-xl)",
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
            }}
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              style={{
                position: "absolute",
                right: "70px",
                background: "none",
                border: "none",
                color: "var(--color-text-muted)",
                cursor: "pointer",
                display: "flex",
                padding: "4px",
              }}
            >
              <X size={18} />
            </button>
          )}
          <button
            type="submit"
            disabled={!query.trim() || externalLoading}
            className="btn-gradient"
            style={{
              position: "absolute",
              right: "4px",
              height: "44px",
              borderRadius: "var(--radius-lg)",
              padding: "0 1.2rem",
              fontSize: "0.9rem",
            }}
          >
            Search
          </button>
        </div>
      </form>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showSuggestions && (suggestions.length > 0 || searchLoading) && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "var(--color-bg-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-card)",
              overflow: "hidden",
              zIndex: 50,
              maxHeight: "360px",
              overflowY: "auto",
            }}
          >
            {searchLoading ? (
              <div
                style={{
                  padding: "1rem",
                  textAlign: "center",
                  color: "var(--color-text-muted)",
                  fontSize: "0.85rem",
                }}
              >
                Searching...
              </div>
            ) : (
              suggestions.map((movie, idx) => (
                <button
                  key={movie.movieId}
                  onClick={() => handleSelect(movie)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "100%",
                    padding: "0.7rem 1rem",
                    border: "none",
                    background: "transparent",
                    color: "var(--color-text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    borderBottom:
                      idx < suggestions.length - 1
                        ? "1px solid var(--color-border)"
                        : "none",
                    transition: "background 0.15s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(139, 92, 246, 0.08)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <Film
                    size={16}
                    style={{ color: "var(--color-accent-purple)", flexShrink: 0 }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: "500",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {movie.title}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.3rem",
                        marginTop: "0.2rem",
                        flexWrap: "wrap",
                      }}
                    >
                      {movie.genres?.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          style={{
                            fontSize: "0.7rem",
                            color: "var(--color-text-muted)",
                          }}
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                  {movie.avg_rating > 0 && (
                    <span
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--color-accent-amber)",
                        fontWeight: "600",
                        flexShrink: 0,
                      }}
                    >
                      ★ {movie.avg_rating.toFixed(1)}
                    </span>
                  )}
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

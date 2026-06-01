import { useState } from "react";
import { motion } from "framer-motion";
import { Star, Heart, Info, TrendingUp } from "lucide-react";

// Generate a consistent gradient based on movie title
function getGradient(title) {
  const gradients = [
    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
    "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    "linear-gradient(135deg, #f5576c 0%, #ff6f91 100%)",
    "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash);
  }
  return gradients[Math.abs(hash) % gradients.length];
}

export default function MovieCard({
  movie,
  index = 0,
  showSimilarity = false,
  onFavorite,
  isFavorite = false,
  onClick,
}) {
  const [hovered, setHovered] = useState(false);

  const {
    title,
    genres = [],
    similarity_score,
    genre_match,
    avg_rating = 0,
    num_ratings = 0,
    image_url,
  } = movie;

  const [imageError, setImageError] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.06 }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick && onClick(title)}
      className="glass-card"
      style={{
        cursor: onClick ? "pointer" : "default",
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
      }}
    >
      {/* Poster Placeholder or Image */}
      <div
        style={{
          width: "100%",
          height: "240px",
          background: getGradient(title),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {image_url && !imageError ? (
          <img
            src={image_url}
            alt={title}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span
            style={{
              fontSize: "3rem",
              fontWeight: "800",
              color: "rgba(255, 255, 255, 0.2)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {title.charAt(0)}
          </span>
        )}

        {/* Favorite button */}
        {onFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFavorite(movie);
            }}
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              background: "rgba(0,0,0,0.5)",
              border: "none",
              borderRadius: "50%",
              width: "32px",
              height: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            <Heart
              size={16}
              fill={isFavorite ? "#ec4899" : "none"}
              color={isFavorite ? "#ec4899" : "white"}
            />
          </button>
        )}

        {/* Similarity badge */}
        {showSimilarity && similarity_score !== undefined && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              left: "8px",
              background: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
              borderRadius: "var(--radius-full)",
              padding: "0.2rem 0.6rem",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
              fontSize: "0.75rem",
              fontWeight: "600",
              color: "#10b981",
            }}
          >
            <TrendingUp size={12} />
            {similarity_score}%
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: "0.9rem" }}>
        {/* Title */}
        <h3
          style={{
            fontSize: "0.95rem",
            fontWeight: "600",
            color: "var(--color-text-primary)",
            marginBottom: "0.4rem",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {title}
        </h3>

        {/* Genres */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.25rem",
            marginBottom: "0.5rem",
          }}
        >
          {genres.slice(0, 3).map((genre) => (
            <span key={genre} className="badge" style={{ fontSize: "0.68rem" }}>
              {genre}
            </span>
          ))}
          {genres.length > 3 && (
            <span
              className="badge"
              style={{
                fontSize: "0.68rem",
                background: "rgba(100, 100, 120, 0.15)",
                color: "var(--color-text-muted)",
                borderColor: "rgba(100, 100, 120, 0.2)",
              }}
            >
              +{genres.length - 3}
            </span>
          )}
        </div>

        {/* Rating */}
        {avg_rating > 0 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "0.4rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Star
                size={14}
                fill="var(--color-accent-amber)"
                color="var(--color-accent-amber)"
              />
              <span
                style={{
                  fontSize: "0.85rem",
                  fontWeight: "600",
                  color: "var(--color-accent-amber)",
                }}
              >
                {avg_rating.toFixed(1)}
              </span>
            </div>
            <span
              style={{
                fontSize: "0.75rem",
                color: "var(--color-text-muted)",
              }}
            >
              {num_ratings.toLocaleString()} ratings
            </span>
          </div>
        )}

        {/* Similarity bar */}
        {showSimilarity && similarity_score !== undefined && (
          <div style={{ marginTop: "0.3rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.3rem",
                fontSize: "0.75rem",
              }}
            >
              <span style={{ color: "var(--color-text-muted)" }}>
                Similarity
              </span>
              <span
                style={{
                  color: "var(--color-accent-green)",
                  fontWeight: "600",
                }}
              >
                {similarity_score}%
              </span>
            </div>
            <div className="similarity-bar">
              <motion.div
                className="similarity-bar-fill"
                initial={{ width: 0 }}
                animate={{ width: `${similarity_score}%` }}
                transition={{ duration: 1, delay: index * 0.1 }}
              />
            </div>

            {/* Explanation */}
            {genre_match !== undefined && (
              <div
                style={{
                  marginTop: "0.5rem",
                  padding: "0.4rem 0.5rem",
                  background: "rgba(139, 92, 246, 0.06)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "0.72rem",
                  color: "var(--color-text-muted)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <Info size={12} style={{ color: "var(--color-accent-purple)", flexShrink: 0 }} />
                Genre Match: {genre_match}%
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

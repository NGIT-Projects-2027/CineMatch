"""
Flask ML Recommendation Service
Serves movie recommendations from pre-trained pickle model.
"""

import os
import sys
import pickle
import numpy as np
import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

app = Flask(__name__)
CORS(app)

# --- Load Model ---
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

print("[*] Loading ML models...")
movies = pickle.load(open(os.path.join(MODELS_DIR, "movies.pkl"), "rb"))
similarity = pickle.load(open(os.path.join(MODELS_DIR, "similarity.pkl"), "rb"))
print(f"[OK] Loaded {len(movies)} movies, similarity matrix {similarity.shape}")

# Build title-to-index lookup (case-insensitive)
title_to_idx = {}
for idx, row in movies.iterrows():
    title_to_idx[row["title"].lower().strip()] = idx


def find_movie_index(movie_name):
    """Find movie index by exact or partial match."""
    movie_lower = movie_name.lower().strip()

    # Exact match
    if movie_lower in title_to_idx:
        return title_to_idx[movie_lower]

    # Partial match (title contains search term)
    matches = []
    for title, idx in title_to_idx.items():
        if movie_lower in title:
            matches.append((idx, title))

    if matches:
        # Return the shortest match (most relevant)
        matches.sort(key=lambda x: len(x[1]))
        return matches[0][0]

    return None


def get_recommendations(movie_name, top_n=10):
    """Get top N similar movies with similarity scores."""
    idx = find_movie_index(movie_name)
    if idx is None:
        return None

    scores = list(enumerate(similarity[idx]))
    scores = sorted(scores, key=lambda x: x[1], reverse=True)

    # Get searched movie genres for explanation
    searched_movie = movies.iloc[idx]
    searched_genres = set(searched_movie["genres"].split("|")) if pd.notna(searched_movie["genres"]) and searched_movie["genres"] != "" else set()

    recommendations = []
    for i in scores[1:top_n + 1]:
        movie = movies.iloc[i[0]]
        genres = movie["genres"].split("|") if pd.notna(movie["genres"]) and movie["genres"] != "" else []
        genres_set = set(genres)

        # Calculate genre match percentage
        if searched_genres and genres_set:
            genre_match = len(searched_genres & genres_set) / len(searched_genres | genres_set) * 100
        else:
            genre_match = 0

        recommendations.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": genres,
            "similarity_score": round(float(i[1]) * 100, 1),
            "genre_match": round(genre_match, 1),
            "avg_rating": float(movie.get("avg_rating", 0)),
            "num_ratings": int(movie.get("num_ratings", 0))
        })

    # Also return the searched movie info
    searched_genres_list = list(searched_genres) if searched_genres else []

    return {
        "searched": {
            "movieId": int(searched_movie["movieId"]),
            "title": searched_movie["title"],
            "genres": searched_genres_list,
            "avg_rating": float(searched_movie.get("avg_rating", 0)),
            "num_ratings": int(searched_movie.get("num_ratings", 0))
        },
        "recommendations": recommendations
    }


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "movies_count": len(movies)})


@app.route("/recommend", methods=["POST"])
def recommend():
    """Get movie recommendations."""
    data = request.get_json()
    if not data or "movie" not in data:
        return jsonify({"error": "Missing 'movie' field"}), 400

    movie_name = data["movie"]
    top_n = data.get("top_n", 10)

    result = get_recommendations(movie_name, top_n)
    if result is None:
        return jsonify({"error": f"Movie '{movie_name}' not found"}), 404

    return jsonify(result)


@app.route("/movies", methods=["GET"])
def get_movies():
    """Return all movie titles for autocomplete search."""
    query = request.args.get("q", "").lower().strip()

    if query == "all":
        result = []
        for _, movie in movies.iterrows():
            result.append({
                "movieId": int(movie["movieId"]),
                "title": movie["title"]
            })
        return jsonify(result)

    if query:
        filtered = movies[movies["title"].str.lower().str.contains(query, na=False)]
        filtered = filtered.head(20)
    else:
        filtered = movies.head(50)

    result = []
    for _, movie in filtered.iterrows():
        genres = movie["genres"].split("|") if pd.notna(movie["genres"]) and movie["genres"] != "" else []
        result.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": genres,
            "avg_rating": float(movie.get("avg_rating", 0)),
            "num_ratings": int(movie.get("num_ratings", 0))
        })

    return jsonify(result)


@app.route("/trending", methods=["GET"])
def trending():
    """Return top-rated movies with significant number of ratings."""
    popular = movies[movies["num_ratings"] >= 50].copy()
    popular = popular.sort_values("avg_rating", ascending=False).head(20)

    result = []
    for _, movie in popular.iterrows():
        genres = movie["genres"].split("|") if pd.notna(movie["genres"]) and movie["genres"] != "" else []
        result.append({
            "movieId": int(movie["movieId"]),
            "title": movie["title"],
            "genres": genres,
            "avg_rating": float(movie["avg_rating"]),
            "num_ratings": int(movie["num_ratings"])
        })

    return jsonify(result)


if __name__ == "__main__":
    print("[*] Starting Flask ML Service on port 5000...")
    app.run(host="0.0.0.0", port=5000, debug=False)

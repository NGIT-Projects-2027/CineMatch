"""
Movie Recommendation Model Trainer (TMDB 5000 Version)
Trains a content-based recommendation model using TMDB 5000 dataset.
Saves pickle files for the Flask ML service.
"""

import os
import sys
import ast
import pandas as pd
import pickle
from sklearn.feature_extraction.text import CountVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Fix Windows console encoding
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")
MODELS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "models")

# --- JSON Parsing Helpers ---
def convert(text):
    """Extract name from generic JSON array."""
    L = []
    try:
        for i in ast.literal_eval(text):
            L.append(i['name'])
    except Exception:
        pass
    return L

def convert3(text):
    """Extract top 3 names from cast JSON array."""
    L = []
    counter = 0
    try:
        for i in ast.literal_eval(text):
            if counter < 3:
                L.append(i['name'])
                counter += 1
            else:
                break
    except Exception:
        pass
    return L

def fetch_director(text):
    """Extract director name from crew JSON array."""
    L = []
    try:
        for i in ast.literal_eval(text):
            if i['job'] == 'Director':
                L.append(i['name'])
                break
    except Exception:
        pass
    return L

def train_model():
    """Train the content-based recommendation model using TMDB 5000."""
    movies_path = os.path.join(DATA_DIR, "tmdb_5000_movies.csv")
    credits_path = os.path.join(DATA_DIR, "tmdb_5000_credits.csv")
    
    if not os.path.exists(movies_path) or not os.path.exists(credits_path):
        print(f"\n[ERROR] TMDB 5000 dataset files not found in {DATA_DIR}!")
        print("Please download 'tmdb_5000_movies.csv' and 'tmdb_5000_credits.csv'")
        print("from Kaggle (https://www.kaggle.com/datasets/tmdb/tmdb-movie-metadata)")
        print(f"and place them directly inside the {DATA_DIR} folder.")
        sys.exit(1)
        
    print("\n[*] Loading datasets...")
    movies = pd.read_csv(movies_path)
    credits = pd.read_csv(credits_path)
    
    print(f"  Movies loaded: {movies.shape}")
    print(f"  Credits loaded: {credits.shape}")
    
    # Merge datasets
    print("[*] Merging datasets and preprocessing...")
    movies = movies.merge(credits, on='title')
    
    # We keep vote_average and vote_count for the frontend display
    movies['avg_rating'] = movies['vote_average'].fillna(0).round(1)
    movies['num_ratings'] = movies['vote_count'].fillna(0).astype(int)
    
    # Keep essential columns
    movies = movies[['movie_id', 'title', 'overview', 'genres', 'keywords', 'cast', 'crew', 'avg_rating', 'num_ratings']]
    movies.dropna(inplace=True)
    
    # Parse JSON
    print("[*] Parsing JSON metadata...")
    movies['genres_raw'] = movies['genres'].apply(convert) # Keep original genres for frontend
    movies['genres'] = movies['genres'].apply(convert)
    movies['keywords'] = movies['keywords'].apply(convert)
    movies['cast'] = movies['cast'].apply(convert3)
    movies['crew'] = movies['crew'].apply(fetch_director)
    
    # Overview to list
    movies['overview'] = movies['overview'].apply(lambda x: x.split())
    
    # Remove spaces from names to create unique entities
    movies['genres'] = movies['genres'].apply(lambda x: [i.replace(" ", "") for i in x])
    movies['keywords'] = movies['keywords'].apply(lambda x: [i.replace(" ", "") for i in x])
    movies['cast'] = movies['cast'].apply(lambda x: [i.replace(" ", "") for i in x])
    movies['crew'] = movies['crew'].apply(lambda x: [i.replace(" ", "") for i in x])
    
    # Create tags column
    print("[*] Creating tags...")
    movies['tags'] = movies['overview'] + movies['genres'] + movies['keywords'] + movies['cast'] + movies['crew']
    movies['tags'] = movies['tags'].apply(lambda x: " ".join(x))
    movies['tags'] = movies['tags'].apply(lambda x: x.lower())
    
    # Format genres for frontend display
    movies['genres'] = movies['genres_raw'].apply(lambda x: "|".join(x))
    
    # Final dataframe for pickling
    new_df = movies[['movie_id', 'title', 'tags', 'genres', 'avg_rating', 'num_ratings']]
    
    print(f"    Final dataframe shape: {new_df.shape}")
    
    # Vectorization
    print("\n[*] Computing CountVectorizer vectors...")
    cv = CountVectorizer(max_features=5000, stop_words='english')
    vectors = cv.fit_transform(new_df['tags']).toarray()
    
    # Cosine Similarity
    print("[*] Computing cosine similarity matrix...")
    similarity = cosine_similarity(vectors)
    
    print(f"    Similarity matrix shape: {similarity.shape}")
    
    # Ensure frontend compatibility by renaming movie_id to movieId
    new_df = new_df.rename(columns={'movie_id': 'movieId'})
    
    # Save pickle files
    os.makedirs(MODELS_DIR, exist_ok=True)
    movies_pkl_path = os.path.join(MODELS_DIR, "movies.pkl")
    similarity_pkl_path = os.path.join(MODELS_DIR, "similarity.pkl")
    
    pickle.dump(new_df, open(movies_pkl_path, "wb"))
    pickle.dump(similarity, open(similarity_pkl_path, "wb"))
    
    print(f"\n[SAVED] {movies_pkl_path}")
    print(f"[SAVED] {similarity_pkl_path}")
    print(f"\n[OK] Model training complete!")
    
    # Quick test
    test_movie = "Batman Begins"
    try:
        idx = new_df[new_df['title'] == test_movie].index[0]
        scores = list(enumerate(similarity[idx]))
        scores = sorted(scores, key=lambda x: x[1], reverse=True)
        
        print(f"\n[TEST] Top 5 similar to '{test_movie}':")
        for i in scores[1:6]:
            title = new_df.iloc[i[0]]["title"]
            score = round(i[1] * 100, 1)
            print(f"       {title} -- {score}% similar")
    except IndexError:
        print(f"\n[TEST] '{test_movie}' not found in dataset.")

if __name__ == "__main__":
    train_model()

import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes("/login") && !window.location.pathname.includes("/signup")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// --- Auth APIs ---
export const authAPI = {
  signup: (data) => api.post("/auth/signup", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
};

// --- Recommendation APIs ---
export const movieAPI = {
  recommend: (movie, top_n = 10) => api.post("/recommend", { movie, top_n }),
  search: (query) => api.get(`/movies?q=${encodeURIComponent(query)}`),
  trending: () => api.get("/trending"),
};

// --- History APIs ---
export const historyAPI = {
  getHistory: () => api.get("/history"),
  clearHistory: () => api.delete("/history"),
};

// --- Favorites APIs ---
export const favoritesAPI = {
  getFavorites: () => api.get("/favorites"),
  addFavorite: (movie) => api.post("/favorites", movie),
  removeFavorite: (movieId) => api.delete(`/favorites/${movieId}`),
};

export default api;

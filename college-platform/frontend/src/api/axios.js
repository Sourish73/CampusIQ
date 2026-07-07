/**
 * src/api/axios.js
 * Configured Axios instance with JWT interceptors.
 * All API calls across the app should use this instance.
 */

import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attaches the Bearer token from localStorage to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("campus_iq_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// Handles 401 globally — clears stale session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname;
      if (currentPath !== "/login" && currentPath !== "/register") {
        localStorage.removeItem("campus_iq_token");
        localStorage.removeItem("campus_iq_user");
        window.dispatchEvent(new CustomEvent("auth:expired"));
      }
    }
    return Promise.reject(error);
  }
);

// ─── API Service Functions ────────────────────────────────────────────────────

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  getMe: () => api.get("/auth/me"),
  updateMe: (data) => api.put("/auth/me", data),
};

export const collegesAPI = {
  getAll: (params) => api.get("/colleges", { params }),
  getById: (id) => api.get(`/colleges/${id}`),
  compare: (ids) => api.get("/colleges/compare-batch", { params: { ids: ids.join(",") } }),
  compareAI: (college1, college2) => api.post("/college/compare", { college1, college2 }),
  summary: (name) => api.get("/college/summary", { params: { name } }),
  reviewsAI: (name) => api.get("/college/reviews", { params: { name } }),
  searchAI: (name) => api.get("/colleges/search-ai", { params: { name } }),  // college lookup
};

export const savedItemsAPI = {
  getAll: () => api.get("/saved-items"),
  add: (college_id, notes) => api.post("/saved-items", { college_id, notes }),
  remove: (collegeId) => api.delete(`/saved-items/${collegeId}`),
};

export const predictorAPI = {
  predict: (data) => api.post("/predict", data),
  getExams: () => api.get("/predict/exams"),
};

export default api;

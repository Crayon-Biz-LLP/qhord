import axios from "axios";

// Server-side (SSR): call backend directly via internal/env URL.
// Client-side: use relative /api path — Next.js rewrites proxy it to the backend.
const baseURL =
  typeof window === "undefined"
    ? (process.env.API_INTERNAL_BASE_URL || "http://localhost:4000/api")
    : "/api";

export const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});


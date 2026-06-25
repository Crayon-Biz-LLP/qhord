import axios from "axios";

// Server-side (SSR): call backend directly.
//   Docker: NEXT_PUBLIC_API_URL=http://backend:4000/api
//   seenode.app: NEXT_PUBLIC_API_BASE_URL=https://api-qhord.onrender.com/api
// Client-side: always use /api — Next.js rewrites proxy it to the backend (no CORS needed).
const baseURL = process.env.NEXT_PUBLIC_API_URL || "/api";

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


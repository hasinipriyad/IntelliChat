import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // still send cookies where supported
});

// ── In-memory token store ─────────────────────────────────────────────────────
// Access token lives only in memory (never localStorage) — safe from XSS.
// Refresh token goes in localStorage so it survives page reloads on mobile.

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken() {
  return accessToken;
}

export function setRefreshToken(token: string | null) {
  if (token) {
    localStorage.setItem("refreshToken", token);
  } else {
    localStorage.removeItem("refreshToken");
  }
}

export function getRefreshToken() {
  return localStorage.getItem("refreshToken");
}

// ── Request interceptor — attach Bearer token ─────────────────────────────────
api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// ── Response interceptor — refresh on 401 ────────────────────────────────────
let isRefreshing = false;
type QueueEntry = { resolve: (value: unknown) => void; reject: (reason: unknown) => void };
let queue: QueueEntry[] = [];

function flushQueue(error: unknown) {
  queue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(undefined);
  });
  queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (
        originalRequest.url?.includes("/refresh-token") ||
        originalRequest.url?.includes("/login")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        const storedRefreshToken = getRefreshToken();
        const { data } = await api.post("/auth/refresh-token", {
          refreshToken: storedRefreshToken,
        });

        setAccessToken(data.accessToken);
        isRefreshing = false;
        flushQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        setAccessToken(null);
        setRefreshToken(null);
        isRefreshing = false;
        flushQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Track whether a refresh is already in flight, so concurrent 401s
// don't fire multiple refresh calls.
let isRefreshing = false;
type QueueEntry = { resolve: (value: unknown) => void; reject: (reason: unknown) => void };
let queue: QueueEntry[] = [];

function flushQueue(error: unknown) {
  queue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(undefined);
    }
  });
  queue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only try to refresh on a 401, and only once per request.
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Don't try to refresh the refresh endpoint itself, or login.
      if (
        originalRequest.url?.includes("/refresh-token") ||
        originalRequest.url?.includes("/login")
      ) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        // Wait for the in-flight refresh to finish, then retry.
        return new Promise((resolve, reject) => {
          queue.push({
            resolve: () => resolve(api(originalRequest)),
            reject,
          });
        });
      }

      isRefreshing = true;

      try {
        await api.post("/auth/refresh-token");
        isRefreshing = false;
        flushQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        flushQueue(refreshError);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;

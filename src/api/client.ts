import axios from "axios";
import { authService } from "./services";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:5000/api"),
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for 401 handling (Refresh Token)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRoute = originalRequest?.url?.includes('/auth/login') || 
                       originalRequest?.url?.includes('/auth/register') ||
                       originalRequest?.url?.includes('/auth/refresh');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRoute) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // No refresh token, logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return Promise.reject(error);
      }

      try {
        const { token, refreshToken: newRefreshToken } = await authService.refreshToken(refreshToken);
        
        localStorage.setItem("token", token);
        localStorage.setItem("refreshToken", newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${token}`;
        processQueue(null, token);
        
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        // Refresh token failed, logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

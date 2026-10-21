// src/api/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import type { CurrentUser } from "@/types";
import { requireMedicalUser } from "@/features/auth/utils/medical-session";
import { useAuthStore } from "@/stores/auth.store";
import { statusMessages } from "@/components/helper/Filter/FIlterStatus";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

type ApiErrorListener = (
  message: string,
  severity?: "error" | "warning" | "info",
) => void;
const listeners = new Set<ApiErrorListener>();

export const registerApiErrorListener = (fn: ApiErrorListener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const notifyApiFeedback = (
  message: string,
  severity: "error" | "warning" | "info" = "error",
) => {
  listeners.forEach((listener) => listener(message, severity));
};

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let queue: Array<{
  resolve: (token: string) => void;
  reject: (e: unknown) => void;
}> = [];

api.interceptors.response.use(
  (res) => res,
  async (
    error: AxiosError<{
      message?: string | string[];
      error?: string;
      statusCode?: number;
    }>,
  ) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes("/auth/login") ||
      original.url?.includes("/auth/staff/medical/login") ||
      original.url?.includes("/auth/staff/login") ||
      original.url?.includes("/auth/staff/refresh")
    ) {
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;
        const formattedMsg = Array.isArray(msg) ? msg.join(", ") : msg;

        notifyApiFeedback(
          statusMessages({ status, formattedMsg })[0],
          statusMessages({ status, formattedMsg })[1],
        );
      } else if (!error.response && error.message) {
        console.warn("Network or server unreachable:", error.message);
      }
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        queue.push({ resolve, reject });
      }).then((token) => {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      });
    }

    original._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post<{ accessToken: string }>(
        `${API_BASE_URL}/auth/staff/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = data.accessToken;
      const { data: user } = await axios.get<CurrentUser>(
        `${API_BASE_URL}/auth/staff/me`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${newToken}` },
        },
      );
      useAuthStore.getState().setAuth(newToken, requireMedicalUser(user));
      queue.forEach((p) => p.resolve(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      queue.forEach((p) => p.reject(refreshError));
      queue = [];
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

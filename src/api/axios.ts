// src/api/axios.ts
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/auth.store';
import { statusMessages } from '@/components/helper/Filter/FIlterStatus';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type ApiErrorListener = (message: string, severity?: 'error' | 'warning' | 'info') => void;
const listeners = new Set<ApiErrorListener>();

export const registerApiErrorListener = (fn: ApiErrorListener) => {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
};

export const notifyApiFeedback = (message: string, severity: 'error' | 'warning' | 'info' = 'error') => {
  listeners.forEach((listener) => listener(message, severity));
};

// Request interceptor — attach token
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = useAuthStore.getState().accessToken;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — auto-refresh on 401
let isRefreshing = false;
let queue: Array<{ resolve: (token: string) => void; reject: (e: unknown) => void }> = [];

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<{ message?: string | string[]; error?: string; statusCode?: number }>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If request has no config or is already a retry or is auth login/refresh endpoint
    if (
      !original ||
      error.response?.status !== 401 ||
      original._retry ||
      original.url?.includes('/auth/login') ||
      original.url?.includes('/auth/refresh-token')
    ) {
      if (error.response) {
        const status = error.response.status;
        const msg = error.response.data?.message;
        const formattedMsg = Array.isArray(msg) ? msg.join(', ') : msg;

     
          notifyApiFeedback(statusMessages({status,formattedMsg})[0],statusMessages({status,formattedMsg})[1]);
        
      } else if (!error.response && error.message) {
        console.warn('Network or server unreachable:', error.message);
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
        `${API_BASE_URL}/auth/refresh-token`,
        {},
        { withCredentials: true },
      );
      const newToken = data.accessToken;
      useAuthStore.getState().setToken(newToken);
      queue.forEach((p) => p.resolve(newToken));
      queue = [];
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (refreshError) {
      queue.forEach((p) => p.reject(refreshError));
      queue = [];
      useAuthStore.getState().clearAuth();
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);

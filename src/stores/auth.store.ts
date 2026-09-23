// src/stores/auth.store.ts
import { create } from 'zustand';
import { CurrentUser, UserRole } from '@/types';

interface AuthState {
  accessToken: string | null;
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: CurrentUser) => void;
  setToken: (token: string | null) => void;
  setUser: (user: CurrentUser | null) => void;
  setLoading: (isLoading: boolean) => void;
  clearAuth: () => void;
}

// Persist token in sessionStorage for page refreshes while keeping security best practice
const INITIAL_TOKEN = sessionStorage.getItem('access_token');
const INITIAL_USER = (() => {
  try {
    const raw = sessionStorage.getItem('current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: INITIAL_TOKEN,
  user: INITIAL_USER,
  isAuthenticated: !!INITIAL_TOKEN && !!INITIAL_USER,
  isLoading: false,

  setAuth: (token: string, user: CurrentUser) => {
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('current_user', JSON.stringify(user));
    set({
      accessToken: token,
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  setToken: (token: string | null) => {
    if (token) {
      sessionStorage.setItem('access_token', token);
    } else {
      sessionStorage.removeItem('access_token');
    }
    set({
      accessToken: token,
      isAuthenticated: !!token,
    });
  },

  setUser: (user: CurrentUser | null) => {
    if (user) {
      sessionStorage.setItem('current_user', JSON.stringify(user));
    } else {
      sessionStorage.removeItem('current_user');
    }
    set({ user });
  },

  setLoading: (isLoading: boolean) => set({ isLoading }),

  clearAuth: () => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('current_user');
    set({
      accessToken: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },
}));

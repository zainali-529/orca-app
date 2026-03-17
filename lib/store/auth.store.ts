import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { loginApi, logoutApi, getMeApi, registerApi } from '@/lib/api/auth.api';
import { TOKEN_KEYS } from '@/lib/api-instance';
import type { LoginPayload, RegisterPayload, User } from '@/lib/types/auth.types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  // Actions
  initialize: () => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  // ── Called once on app start ──────────────────────────────
  initialize: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEYS.ACCESS);

      if (!accessToken) {
        set({ isInitialized: true, isAuthenticated: false });
        return;
      }

      // Token exists — validate by fetching user
      const response = await getMeApi();
      set({
        user: response.data.data.user,
        isAuthenticated: true,
        isInitialized: true,
      });
    } catch {
      // Token invalid or expired — clear everything
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
      set({ isInitialized: true, isAuthenticated: false, user: null });
    }
  },

  // ── Register ──────────────────────────────────────────────
  register: async (payload) => {
    set({ isLoading: true });
    try {
      await registerApi(payload);
      // After register, auto-login
      await get().login({ email: payload.email, password: payload.password });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Login ─────────────────────────────────────────────────
  login: async (payload) => {
    set({ isLoading: true });
    try {
      const response = await loginApi(payload);
      const { user, accessToken, refreshToken } = response.data.data;

      // Persist tokens securely
      await SecureStore.setItemAsync(TOKEN_KEYS.ACCESS, accessToken);
      await SecureStore.setItemAsync(TOKEN_KEYS.REFRESH, refreshToken);

      set({ user, isAuthenticated: true });
    } finally {
      set({ isLoading: false });
    }
  },

  // ── Logout ────────────────────────────────────────────────
  logout: async () => {
    set({ isLoading: true });
    try {
      const refreshToken = await SecureStore.getItemAsync(TOKEN_KEYS.REFRESH);
      if (refreshToken) {
        await logoutApi(refreshToken).catch(() => {
          // Ignore API errors — still clear local state
        });
      }
    } finally {
      await SecureStore.deleteItemAsync(TOKEN_KEYS.ACCESS);
      await SecureStore.deleteItemAsync(TOKEN_KEYS.REFRESH);
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  clearAuth: () => set({ user: null, isAuthenticated: false }),
}));
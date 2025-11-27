import { create } from 'zustand';
import { User } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  lastCheckTime: number | null;
  setUser: (user: User | null) => void;
  setError: (error: string | null) => void;
  login: (email: string, pin: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const CHECK_AUTH_CACHE_MS = 60000;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  lastCheckTime: null,

  setUser: (user) => {
    set({ user, isAuthenticated: !!user, error: null });
  },

  setError: (error) => {
    set({ error });
  },

  login: async (email, pin) => {
    try {
      set({ isLoading: true, error: null });

      const response = await authService.login(email, pin);
      const { user } = response;

      set({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        lastCheckTime: Date.now(),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao fazer login';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.logout();
      set({ user: null, isAuthenticated: false, error: null, lastCheckTime: null });
    } catch (error) {
      set({ user: null, isAuthenticated: false, lastCheckTime: null });
    }
  },

  checkAuth: async () => {
    const state = get();
    const now = Date.now();

    if (state.lastCheckTime && (now - state.lastCheckTime) < CHECK_AUTH_CACHE_MS) {
      set({ isLoading: false });
      return;
    }

    try {
      const isAuth = await authService.isAuthenticated();
      if (isAuth) {
        const user = await authService.getMe();
        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          lastCheckTime: now,
        });
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          lastCheckTime: now,
        });
      }
    } catch (error) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        lastCheckTime: now,
      });
    }
  },
}));

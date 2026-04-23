'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@/lib/types';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      login: (token, user) => {
        localStorage.setItem('auth_token', token);
        // Also set a cookie so the server-side middleware can verify auth
        document.cookie = `auth_token=${token}; path=/; SameSite=Strict; max-age=${60 * 60 * 24 * 7}`;
        set({ token, user, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('auth_token');
        // Clear the middleware cookie too
        document.cookie = 'auth_token=; path=/; max-age=0';
        set({ token: null, user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setAuth: (token, user) =>
        set({ token, user, isAuthenticated: true, isLoading: false }),
      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),
      logout: () =>
        set({ token: null, user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'linkpage-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isAuthenticated = !!state.token;
          state.isLoading = false;
        }
      },
    },
  ),
);

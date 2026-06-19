'use client';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type User = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: 'citizen' | 'responder' | 'admin';
  is_active: boolean;
  created_at: string;
};

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
};

// Helper function to set a cookie
function setCookie(name: string, value: string, days = 7) {
  if (typeof window === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/;SameSite=Lax`;
}

// Helper function to delete a cookie
function deleteCookie(name: string) {
  if (typeof window === 'undefined') return;
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => {
      return {
        user: null,
        accessToken: null,
        refreshToken: null,
        setAuth: (user, accessToken, refreshToken) => {
          setCookie('auth_token', accessToken);
          setCookie('refresh_token', refreshToken);
          setCookie('user_role', user.role);
          set({ user, accessToken, refreshToken });
        },
        logout: () => {
          deleteCookie('auth_token');
          deleteCookie('refresh_token');
          deleteCookie('user_role');
          set({ user: null, accessToken: null, refreshToken: null });
        },
        updateUser: (userData) =>
          set((state) => ({ user: state.user ? { ...state.user, ...userData } : null })),
      };
    },
    { 
      name: 'auth-storage',
      onRehydrateStorage: () => {
        return (state) => {
          if (typeof window !== 'undefined' && state && state.user && state.accessToken) {
            setCookie('auth_token', state.accessToken);
            setCookie('refresh_token', state.refreshToken || '');
            setCookie('user_role', state.user.role);
          }
        };
      }
    }
  )
);

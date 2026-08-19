import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http } from '@tms/shared/services/apiClient';
import type { AuthState, User, Role } from '@tms/shared/types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      login: (user: User, token: string) => {
        try {
          localStorage.setItem('tms_token', token);
        } catch {}
        set({ user, isAuthenticated: true, token });
      },
      logout: () => {
        // Send logout request to backend API
        try {
          http.post('/auth/logout', {}).catch(() => {
            // Silently handle if server is already offline
          });
        } catch {}

        try {
          localStorage.removeItem('tms_token');
        } catch {}

        set({ user: null, isAuthenticated: false, token: null });
      },
      switchRole: (role: Role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),
    }),
    {
      name: 'michuu-tms-auth', // localStorage key
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
);

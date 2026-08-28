import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { http, setInMemoryToken } from '@tms/shared/services/apiClient';
import type { AuthState, User, Role } from '@tms/shared/types/auth';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,

      login: (user: User, token: string) => {
        // Store access token in memory ONLY — never in localStorage
        setInMemoryToken(token);
        set({ user, isAuthenticated: true, token });
      },

      logout: () => {
        // Call backend to clear HttpOnly refresh cookie and invalidate server-side token
        try {
          http.post('/auth/logout', {}).catch(() => {});
        } catch {}

        // Clear in-memory access token
        setInMemoryToken(null);

        set({ user: null, isAuthenticated: false, token: null });
      },

      switchRole: (role: Role) =>
        set((state) => ({
          user: state.user ? { ...state.user, role } : null,
        })),

      updateUser: (fields: Partial<User>) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...fields } : null,
        })),

      completePasswordChange: () =>
        set((state) => ({
          user: state.user ? { ...state.user, mustChangePassword: false } : null,
        })),
    }),
    {
      name: 'michuu-tms-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (state.token) {
            setInMemoryToken(state.token);
          }
          if (state.isAuthenticated && !state.token) {
            http.post('/auth/refresh', {})
              .then((res) => {
                const newToken = res.data.accessToken || res.data.access_token;
                setInMemoryToken(newToken);
                state.token = newToken;
              })
              .catch(() => {
                state.user = null;
                state.isAuthenticated = false;
              });
          }
        }
      },
    }
  )
);

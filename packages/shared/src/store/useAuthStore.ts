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
      // IMPORTANT: only persist user identity — NOT the access token
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        // token is intentionally omitted — it lives in memory only
      }),
      // On hydration from storage, don't restore token (it expired)
      // The refresh interceptor will automatically get a new one via HttpOnly cookie
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.token = null;
          // If user was previously authenticated, attempt a silent refresh
          if (state.isAuthenticated) {
            http.post('/auth/refresh', {})
              .then((res) => {
                setInMemoryToken(res.data.accessToken);
                state.token = res.data.accessToken;
              })
              .catch(() => {
                // Refresh failed (cookie expired) — clear auth state
                state.user = null;
                state.isAuthenticated = false;
              });
          }
        }
      },
    }
  )
);

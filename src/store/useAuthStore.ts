import { create } from 'zustand';
import type { AuthState, User, Role } from '@/types/auth';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  token: null,
  login: (user: User, token: string) => set({ user, isAuthenticated: true, token }),
  logout: () => set({ user: null, isAuthenticated: false, token: null }),
  switchRole: (role: Role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));

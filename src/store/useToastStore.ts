import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastState {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newToast: ToastMessage = {
      ...toast,
      id,
      duration: toast.duration ?? 4000,
    };

    set((state) => ({
      toasts: [...state.toasts.slice(-4), newToast],
    }));

    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, newToast.duration);
    }

    return id;
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));

export const toast = {
  success: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'success', message, title: title || 'Success', duration }),

  error: (message: string, title?: string, duration = 5000) =>
    useToastStore.getState().addToast({ type: 'error', message, title: title || 'Error', duration }),

  info: (message: string, title?: string, duration = 4000) =>
    useToastStore.getState().addToast({ type: 'info', message, title: title || 'Information', duration }),

  warning: (message: string, title?: string, duration = 4500) =>
    useToastStore.getState().addToast({ type: 'warning', message, title: title || 'Notice', duration }),
};

import { create } from 'zustand';
import { notificationService } from '@/services/notificationService';

export type NotificationType =
  | 'booking_confirmation'
  | 'payment_confirmation'
  | 'tour_reminder'
  | 'booking_cancellation'
  | 'schedule_change'
  | 'admin_new_booking'
  | 'admin_payment_received'
  | 'admin_cancellation_request'
  | 'issue_resolved'
  | 'issue_rejected'
  | 'issue_update'
  | 'system';

export interface AppNotification {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
  link?: string;
  bookingRef?: string;
  targetRole?: 'customer' | 'admin' | 'all';
}

interface NotificationState {
  notifications: AppNotification[];
  isLoading: boolean;
  fetchNotifications: (userEmail?: string) => Promise<void>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => Promise<void>;
  notifyCustomer: (email: string, type: NotificationType, title: string, message: string, bookingRef?: string, link?: string) => void;
  notifyAdmin: (type: NotificationType, title: string, message: string, bookingRef?: string, link?: string) => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: (userEmail?: string, targetRole?: 'customer' | 'admin') => Promise<void>;
  clearNotifications: () => void;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  isLoading: false,

  fetchNotifications: async (userEmail?: string) => {
    set({ isLoading: true });
    try {
      const email = userEmail || 'admin@michuutours.et';
      const notifs = await notificationService.getForUser(email);
      set({ notifications: notifs, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  addNotification: async (notifData) => {
    try {
      const created = await notificationService.create(notifData);
      set((state) => ({ notifications: [created, ...state.notifications] }));
    } catch {
      const localNotif: AppNotification = {
        ...notifData,
        id: `notif-${Date.now()}`,
        timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
        isRead: false,
      };
      set((state) => ({ notifications: [localNotif, ...state.notifications] }));
    }
  },

  notifyCustomer: (email, type, title, message, bookingRef, link = '/my-bookings') => {
    get().addNotification({
      userEmail: email,
      targetRole: 'customer',
      type,
      title,
      message,
      bookingRef,
      link,
    });
  },

  notifyAdmin: (type, title, message, bookingRef, link = '/admin/bookings') => {
    get().addNotification({
      userEmail: 'admin@michuutours.et',
      targetRole: 'admin',
      type,
      title,
      message,
      bookingRef,
      link,
    });
  },

  markAsRead: async (id) => {
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    }));
    try {
      await notificationService.markRead(id);
    } catch {}
  },

  markAllAsRead: async (userEmail, targetRole) => {
    set((state) => ({
      notifications: state.notifications.map((n) => {
        const matchesRole = !targetRole || n.targetRole === targetRole || n.targetRole === 'all';
        const matchesEmail = !userEmail || n.userEmail.toLowerCase() === userEmail.toLowerCase() || n.targetRole === 'admin';
        if (matchesRole && matchesEmail) {
          return { ...n, isRead: true };
        }
        return n;
      }),
    }));
    if (userEmail) {
      try {
        await notificationService.markAllRead(userEmail);
      } catch {}
    }
  },

  clearNotifications: () => set({ notifications: [] }),
}));

// Auto-fetch for initial state
useNotificationStore.getState().fetchNotifications();

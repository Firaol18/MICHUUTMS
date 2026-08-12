import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AppNotification {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: 'issue_resolved' | 'issue_rejected' | 'issue_update' | 'system';
  link?: string;
}

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userEmail?: string) => void;
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    userEmail: 'eleanor.vance@example.com',
    title: 'Support Ticket #ISS-801 Status',
    message: 'Your ticket regarding deposit clarification is currently open and assigned to tourism operations.',
    timestamp: '2026-08-09 14:30',
    isRead: false,
    type: 'issue_update',
    link: '/user/issues',
  },
  {
    id: 'notif-2',
    userEmail: 'eleanor.vance@example.com',
    title: 'Support Ticket #ISS-803 Resolved',
    message: 'Meal plan updated with tour operator and chef notified.',
    timestamp: '2026-08-06 10:15',
    isRead: true,
    type: 'issue_resolved',
    link: '/user/issues',
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: INITIAL_NOTIFICATIONS,
      addNotification: (notifData) =>
        set((state) => ({
          notifications: [
            {
              ...notifData,
              id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              isRead: false,
            },
            ...state.notifications,
          ],
        })),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),
      markAllAsRead: (userEmail) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            !userEmail || n.userEmail.toLowerCase() === userEmail.toLowerCase()
              ? { ...n, isRead: true }
              : n
          ),
        })),
      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'michuu-tms-notifications',
    }
  )
);

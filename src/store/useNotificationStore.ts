import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type NotificationType =
  // Customer types
  | 'booking_confirmation'
  | 'payment_confirmation'
  | 'tour_reminder'
  | 'booking_cancellation'
  | 'schedule_change'
  // Admin types
  | 'admin_new_booking'
  | 'admin_payment_received'
  | 'admin_cancellation_request'
  // General / Support types
  | 'issue_resolved'
  | 'issue_rejected'
  | 'issue_update'
  | 'system';

export interface AppNotification {
  id: string;
  userEmail: string;           // Target user email OR 'admin@michuutours.et' / 'all'
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
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>) => void;
  notifyCustomer: (email: string, type: NotificationType, title: string, message: string, bookingRef?: string, link?: string) => void;
  notifyAdmin: (type: NotificationType, title: string, message: string, bookingRef?: string, link?: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: (userEmail?: string, targetRole?: 'customer' | 'admin') => void;
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  // ── CUSTOMER SEED NOTIFICATIONS ─────────────────────────────────────────────
  {
    id: 'notif-c1',
    userEmail: 'eleanor.vance@example.com',
    targetRole: 'customer',
    title: 'Reservation Confirmed! 🎟️',
    message: 'Your booking for Wenchi Crater Lake Eco-Resort (Ref #MCH-BKG-8819) is confirmed for 2 guests on Aug 15, 2026.',
    timestamp: '2026-08-12 09:30',
    isRead: false,
    type: 'booking_confirmation',
    bookingRef: 'MCH-BKG-8819',
    link: '/my-bookings',
  },
  {
    id: 'notif-c2',
    userEmail: 'eleanor.vance@example.com',
    targetRole: 'customer',
    title: 'Payment Received ($900.00) 💳',
    message: 'Full payment of $900.00 was successfully processed via Telebirr for Ref #MCH-BKG-8819.',
    timestamp: '2026-08-12 09:35',
    isRead: false,
    type: 'payment_confirmation',
    bookingRef: 'MCH-BKG-8819',
    link: '/my-bookings',
  },
  {
    id: 'notif-c3',
    userEmail: 'eleanor.vance@example.com',
    targetRole: 'customer',
    title: 'Upcoming Expedition Reminder ⏰',
    message: 'Get ready! Your Wenchi Crater Lake tour departs in 3 days. Please bring your QR E-Ticket and comfortable trekking footwear.',
    timestamp: '2026-08-12 14:00',
    isRead: false,
    type: 'tour_reminder',
    bookingRef: 'MCH-BKG-8819',
    link: '/my-bookings',
  },
  {
    id: 'notif-c4',
    userEmail: 'eleanor.vance@example.com',
    targetRole: 'customer',
    title: 'Guide & Schedule Update 📅',
    message: 'Senior Ranger Guide Abebe Bekele has been assigned to lead your expedition group.',
    timestamp: '2026-08-11 16:45',
    isRead: true,
    type: 'schedule_change',
    bookingRef: 'MCH-BKG-8819',
    link: '/my-bookings',
  },
  {
    id: 'notif-c5',
    userEmail: 'eleanor.vance@example.com',
    targetRole: 'customer',
    title: 'Booking Cancellation Update ❌',
    message: 'Your request to cancel Ref #MCH-BKG-5533 has been registered. Refund status: Pending review.',
    timestamp: '2026-08-10 11:20',
    isRead: true,
    type: 'booking_cancellation',
    bookingRef: 'MCH-BKG-5533',
    link: '/my-bookings',
  },

  // ── ADMIN SEED NOTIFICATIONS ────────────────────────────────────────────────
  {
    id: 'notif-a1',
    userEmail: 'admin@michuutours.et',
    targetRole: 'admin',
    title: 'NEW BOOKING: Ref #MCH-BKG-8819 🔔',
    message: 'Eleanor Vance booked 2 seats for Wenchi Crater Lake Eco-Resort ($900 total).',
    timestamp: '2026-08-12 09:30',
    isRead: false,
    type: 'admin_new_booking',
    bookingRef: 'MCH-BKG-8819',
    link: '/admin/bookings',
  },
  {
    id: 'notif-a2',
    userEmail: 'admin@michuutours.et',
    targetRole: 'admin',
    title: 'PAYMENT RECEIVED: $2,500.00 💵',
    message: 'Sophia Rossi paid full invoice ($2,500) for Danakil Volcano Tour (Ref #MCH-BKG-4412).',
    timestamp: '2026-08-11 15:10',
    isRead: false,
    type: 'admin_payment_received',
    bookingRef: 'MCH-BKG-4412',
    link: '/admin/bookings',
  },
  {
    id: 'notif-a3',
    userEmail: 'admin@michuutours.et',
    targetRole: 'admin',
    title: 'CANCELLATION REQUESTED 🚨',
    message: 'James Okonkwo requested cancellation with refund for Simien Mountains Trek (Ref #MCH-BKG-5533).',
    timestamp: '2026-08-10 11:15',
    isRead: false,
    type: 'admin_cancellation_request',
    bookingRef: 'MCH-BKG-5533',
    link: '/admin/bookings',
  },
];

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: INITIAL_NOTIFICATIONS,

      addNotification: (notifData) =>
        set((state) => ({
          notifications: [
            {
              ...notifData,
              id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
              timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
              isRead: false,
            },
            ...state.notifications,
          ],
        })),

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

      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, isRead: true } : n
          ),
        })),

      markAllAsRead: (userEmail, targetRole) =>
        set((state) => ({
          notifications: state.notifications.map((n) => {
            const matchesRole = !targetRole || n.targetRole === targetRole || n.targetRole === 'all';
            const matchesEmail = !userEmail || n.userEmail.toLowerCase() === userEmail.toLowerCase() || n.targetRole === 'admin';
            if (matchesRole && matchesEmail) {
              return { ...n, isRead: true };
            }
            return n;
          }),
        })),

      clearNotifications: () => set({ notifications: [] }),
    }),
    {
      name: 'michuu-tms-notifications-v2',
    }
  )
);

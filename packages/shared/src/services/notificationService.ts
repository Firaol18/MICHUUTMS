import { http } from './apiClient';
import type { AppNotification, NotificationType } from '@tms/shared/store/useNotificationStore';

function mapNotif(n: any): AppNotification {
  return {
    id: String(n.id),
    userEmail: n.userEmail,
    title: n.title,
    message: n.message,
    timestamp: typeof n.timestamp === 'string'
      ? n.timestamp
      : new Date(n.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    isRead: Boolean(n.isRead),
    type: n.type as NotificationType,
    link: n.link ?? undefined,
    bookingRef: n.bookingRef ?? undefined,
    targetRole: n.targetRole,
  };
}

export const notificationService = {
  async getForUser(userEmail: string): Promise<AppNotification[]> {
    const res = await http.get('/notifications', { params: { userEmail } });
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(mapNotif);
  },

  async create(data: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>): Promise<AppNotification> {
    const res = await http.post('/notifications', data);
    return mapNotif(res.data);
  },

  async markRead(id: string): Promise<void> {
    await http.patch(`/notifications/${id}/read`, {});
  },

  async markAllRead(userEmail: string): Promise<void> {
    await http.patch(`/notifications/read-all?userEmail=${encodeURIComponent(userEmail)}`, {});
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/notifications/${id}`);
  },
};

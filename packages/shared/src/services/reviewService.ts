import { http } from './apiClient';
import type { UserReview } from '@tms/shared/store/useReviewStore';

function mapReview(r: any): UserReview {
  let dateStr = new Date().toISOString().split('T')[0];
  try {
    const rawDate = r.createdAt || r.date;
    if (rawDate) {
      dateStr = typeof rawDate === 'string'
        ? (rawDate.includes('T') ? rawDate.split('T')[0] : rawDate)
        : new Date(rawDate).toISOString().split('T')[0];
    }
  } catch {}

  return {
    id: String(r.id || `rev-${Date.now()}`),
    tourId: r.tourId ?? '',
    tourTitle: r.tourTitle || 'Ethiopian Expedition',
    bookingRef: r.bookingRef ?? undefined,
    authorName: r.authorName || 'Traveler',
    authorEmail: r.authorEmail || '',
    avatarUrl: r.avatarUrl ?? undefined,
    overallRating: Number(r.overallRating) || 5,
    guideRating: Number(r.guideRating) || 5,
    guideName: r.guideName ?? undefined,
    transportRating: Number(r.transportRating) || 5,
    accommodationRating: Number(r.accommodationRating) || 5,
    comment: r.comment || '',
    date: dateStr,
    isVerifiedBooking: Boolean(r.isVerifiedBooking),
  };
}

export const reviewService = {
  async getAll(tourId?: string): Promise<UserReview[]> {
    const params: Record<string, string> = {};
    if (tourId) params.tourId = tourId;
    const res = await http.get('/reviews', { params });
    const raw = Array.isArray(res.data) ? res.data : (res.data?.data ?? []);
    return raw.map(mapReview);
  },

  async create(data: Omit<UserReview, 'id' | 'date'>): Promise<UserReview> {
    const payload = {
      tourId: data.tourId || undefined,
      tourTitle: data.tourTitle,
      bookingRef: data.bookingRef || undefined,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      avatarUrl: data.avatarUrl || undefined,
      overallRating: Number(data.overallRating),
      guideRating: Number(data.guideRating),
      guideName: data.guideName || undefined,
      transportRating: Number(data.transportRating),
      accommodationRating: Number(data.accommodationRating),
      comment: data.comment,
      isVerifiedBooking: Boolean(data.isVerifiedBooking),
    };
    const res = await http.post('/reviews', payload);
    return mapReview(res.data);
  },

  async remove(id: string): Promise<void> {
    await http.delete(`/reviews/${id}`);
  },

  async getAverageRatings(tourId: string) {
    const res = await http.get(`/reviews/${tourId}/ratings`);
    return res.data as { overall: number; guide: number; transport: number; accommodation: number; totalCount: number };
  },
};

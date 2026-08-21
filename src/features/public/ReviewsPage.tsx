import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useReviewStore } from '@/store/useReviewStore';
import { tourismService } from '@/services/tourismService';
import type { TourPackage } from '@/types/tour';
import { Star, Send, Loader2 } from 'lucide-react';

const StarPickerRow: React.FC<{
  label: string;
  value: number;
  onChange: (v: number) => void;
}> = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
    <div style={{ display: 'flex', gap: '0.2rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.2rem',
            color: star <= value ? '#fbbf24' : '#cbd5e1',
            padding: 0,
          }}
        >
          ★
        </button>
      ))}
    </div>
  </div>
);

export const ReviewsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { reviews, addReview, fetchReviews, isLoading } = useReviewStore();

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedTourId, setSelectedTourId] = useState<string>('');
  const [overallRating, setOverallRating] = useState(5);
  const [guideRating, setGuideRating] = useState(5);
  const [guideName, setGuideName] = useState('Abebe Bekele');
  const [transportRating, setTransportRating] = useState(4);
  const [accommodationRating, setAccommodationRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    fetchReviews();
    tourismService.getTours().then((t) => {
      setTours(t);
      if (t.length > 0) {
        setSelectedTourId(t[0].id);
        if (t[0].assignedGuideName) setGuideName(t[0].assignedGuideName);
      }
    }).catch(() => {});
  }, [fetchReviews]);

  const handleTourChange = (id: string) => {
    setSelectedTourId(id);
    const selected = tours.find((t) => t.id === id);
    if (selected?.assignedGuideName) {
      setGuideName(selected.assignedGuideName);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmitting(true);
    setErrorMsg(null);

    const selectedTour = tours.find((t) => t.id === selectedTourId);
    const tourTitle = selectedTour?.title || 'Ethiopian Expedition';

    try {
      await addReview({
        tourId: selectedTourId || '',
        tourTitle,
        authorName: user?.name || 'Verified Traveler',
        authorEmail: user?.email || 'traveler@example.com',
        avatarUrl: user?.avatarUrl,
        overallRating,
        guideRating,
        guideName,
        transportRating,
        accommodationRating,
        comment: reviewComment,
        isVerifiedBooking: true,
      });

      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit review to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        ⭐ Expedition Reviews & Ratings
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Write a Review Form */}
        <Card glass style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            ✍️ Post-Trip Multi-Aspect Review
          </h3>

          {reviewSuccess && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(22,163,74,0.1)',
                color: '#16a34a',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              ✓ Thank you! Your review was successfully saved to the backend database and published publicly.
            </div>
          )}

          {errorMsg && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(239,68,68,0.1)',
                color: '#ef4444',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                marginBottom: '1rem',
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Select Expedition
              </label>
              <select
                value={selectedTourId}
                onChange={(e) => handleTourChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                {tours.length > 0 ? (
                  tours.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="tour-101">Wenchi Crater Lake & Thermal Springs Expedition</option>
                    <option value="tour-102">Lalibela Monolithic Rock Churches Pilgrimage</option>
                    <option value="tour-104">Danakil Depression & Erta Ale Volcano Expedition</option>
                  </>
                )}
              </select>
            </div>

            {/* Ratings Breakdown Grid */}
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 2 }}>
                RATINGS BREAKDOWN (1 TO 5 STARS)
              </div>
              <StarPickerRow label="⭐ Overall Tour Experience" value={overallRating} onChange={setOverallRating} />
              <StarPickerRow label={`👤 Ranger Guide (${guideName})`} value={guideRating} onChange={setGuideRating} />
              <StarPickerRow label="🚐 Transportation Comfort" value={transportRating} onChange={setTransportRating} />
              <StarPickerRow label="🏨 Accommodation & Meals" value={accommodationRating} onChange={setAccommodationRating} />
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Your Experience Comment *
              </label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Excellent experience! The tour was outstanding, transportation was comfortable, and accommodations were great..."
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-xs)',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} disabled={isSubmitting}>
              {isSubmitting ? 'Submitting Review...' : 'Publish Review to Catalog'}
            </Button>
          </form>
        </Card>

        {/* Published Reviews List */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>
            Published Reviews Feed ({reviews.length})
          </h3>
          {isLoading ? (
            <Card glass style={{ textAlign: 'center', padding: '2rem' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>Loading live reviews from backend...</p>
            </Card>
          ) : reviews.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '2rem' }}>
              <Star size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No reviews yet in database. Submit your first review using the form.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <Card key={rev.id} glass style={{ padding: '1.25rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{rev.authorName}</div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>

                  <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.5rem' }}>
                    {rev.tourTitle}
                  </h4>

                  <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginBottom: '0.625rem' }}>
                    <Badge variant="warning">★ {rev.overallRating}/5 Overall</Badge>
                    <Badge variant="info">Guide: {rev.guideName || 'Abebe'} ★{rev.guideRating || 5}/5</Badge>
                    <Badge variant="success">Transport: ★{rev.transportRating || 4}/5</Badge>
                    <Badge variant="info">Accom: ★{rev.accommodationRating || 5}/5</Badge>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, fontStyle: 'italic', margin: 0 }}>
                    "{rev.comment}"
                  </p>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

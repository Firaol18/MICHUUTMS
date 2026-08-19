import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { useReviewStore } from '@tms/shared/store/useReviewStore';
import { Star, Send } from 'lucide-react';

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
  const { reviews, addReview } = useReviewStore();

  const [reviewTourId, setReviewTourId] = useState('tour-101');
  const [overallRating, setOverallRating] = useState(5);
  const [guideRating, setGuideRating] = useState(5);
  const [guideName] = useState('Abebe Bekele');
  const [transportRating, setTransportRating] = useState(4);
  const [accommodationRating, setAccommodationRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    const tourTitleMap: Record<string, string> = {
      'tour-101': 'Wenchi Crater Lake Expedition',
      'tour-102': 'Lalibela Monolithic Rock Churches',
      'tour-104': 'Danakil Depression & Erta Ale Volcano',
    };

    addReview({
      tourId: reviewTourId,
      tourTitle: tourTitleMap[reviewTourId] || 'Ethiopian Expedition',
      authorName: user?.name || 'Traveler',
      authorEmail: user?.email || '',
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
    setTimeout(() => setReviewSuccess(false), 3500);
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
              ✓ Thank you! Your multi-aspect review has been published publicly.
            </div>
          )}

          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Select Completed Expedition
              </label>
              <select
                value={reviewTourId}
                onChange={(e) => setReviewTourId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="tour-101">Wenchi Crater Lake & Thermal Springs Expedition</option>
                <option value="tour-102">Lalibela Monolithic Rock Churches Pilgrimage</option>
                <option value="tour-104">Danakil Depression & Erta Ale Volcano Expedition</option>
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
                placeholder="Excellent experience! Guide Abebe was outstanding, transportation 4/5, accommodation 5/5..."
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

            <Button type="submit" variant="primary" icon={<Send size={16} />}>
              Publish Review to Catalog
            </Button>
          </form>
        </Card>

        {/* Published Reviews List */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>
            Published Reviews Feed ({reviews.length})
          </h3>
          {reviews.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '2rem' }}>
              <Star size={32} style={{ color: 'var(--text-muted)', margin: '0 auto 0.75rem auto' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                No reviews yet. Submit your first review using the form.
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

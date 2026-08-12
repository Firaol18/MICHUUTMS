import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { useAuthStore } from '@/store/useAuthStore';
import { useReviewStore } from '@/store/useReviewStore';
import { Star, Send, ShieldCheck } from 'lucide-react';

export const ReviewsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { reviews, addReview } = useReviewStore();

  const [reviewTourId, setReviewTourId] = useState('tour-101');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    addReview({
      tourId: reviewTourId,
      tourTitle: reviewTourId === 'tour-101' ? 'Wenchi Crater Lake Expedition' : 'Danakil Depression Expedition',
      authorName: user?.name || 'Traveler',
      authorEmail: user?.email || '',
      rating: reviewRating,
      comment: reviewComment,
      category: 'tour',
      isVerifiedBooking: true,
    });

    setReviewComment('');
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3500);
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
        ⭐ My Reviews
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Write a Review Form */}
        <Card glass style={{ padding: '1.75rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            ✍️ Post-Trip Review & Feedback
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
              ✓ Thank you! Your verified review has been published.
            </div>
          )}

          <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Select Completed Tour
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
                <option value="tour-104">Danakil Depression & Erta Ale Volcano Expedition</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Star Rating (1 to 5 Stars)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1.5rem',
                      color: star <= reviewRating ? '#fbbf24' : '#cbd5e1',
                      transition: 'color 0.1s ease',
                    }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Your Review Comment
              </label>
              <textarea
                rows={4}
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                placeholder="Share details about your ranger guide, accommodation, sights, and tips for future travelers..."
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            <Button type="submit" variant="primary" icon={<Send size={16} />}>
              Submit Review
            </Button>
          </form>
        </Card>

        {/* Published Reviews List */}
        <div>
          <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>
            My Published Reviews ({reviews.length})
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                      {'★'.repeat(rev.rating)}
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{rev.date}</span>
                  </div>
                  <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                    {rev.tourTitle}
                  </h4>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                    "{rev.comment}"
                  </p>
                  {rev.isVerifiedBooking && (
                    <div
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        fontSize: '10px',
                        fontWeight: 700,
                        color: '#16a34a',
                        marginTop: '0.5rem',
                      }}
                    >
                      <ShieldCheck size={12} /> Verified MICHUU Traveler
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

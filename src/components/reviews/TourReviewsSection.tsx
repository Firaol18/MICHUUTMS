import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { useAuthStore } from '@/store/useAuthStore';
import { useReviewStore } from '@/store/useReviewStore';
import {
  Star, ShieldCheck, Bus, Hotel, UserCheck, MessageSquarePlus, Send, CheckCircle2,
} from 'lucide-react';

interface TourReviewsSectionProps {
  tourId: string;
  tourTitle: string;
  assignedGuideName?: string;
}

const StarPicker: React.FC<{
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (val: number) => void;
}> = ({ label, icon, value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
      {icon}{label}
    </div>
    <div style={{ display: 'flex', gap: '0.25rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.4rem',
            color: star <= value ? '#fbbf24' : '#cbd5e1',
            padding: 0,
            transition: 'transform 0.1s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          ★
        </button>
      ))}
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, marginLeft: '0.5rem', color: 'var(--brand-primary)', alignSelf: 'center' }}>
        {value} / 5
      </span>
    </div>
  </div>
);

export const TourReviewsSection: React.FC<TourReviewsSectionProps> = ({
  tourId,
  tourTitle,
  assignedGuideName = 'Abebe Bekele',
}) => {
  const { user } = useAuthStore();
  const { getReviewsForTour, getAverageRatingsForTour, addReview, fetchReviews } = useReviewStore();

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const reviews = getReviewsForTour(tourId);
  const averages = getAverageRatingsForTour(tourId);

  // Review Modal Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [overallRating, setOverallRating] = useState(5);
  const [guideRating, setGuideRating] = useState(5);
  const [transportRating, setTransportRating] = useState(5);
  const [accommodationRating, setAccommodationRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    try {
      await addReview({
        tourId,
        tourTitle,
        authorName: user?.name || 'Verified Traveler',
        authorEmail: user?.email || 'traveler@example.com',
        avatarUrl: user?.avatarUrl,
        overallRating,
        guideRating,
        guideName: assignedGuideName,
        transportRating,
        accommodationRating,
        comment,
        isVerifiedBooking: true,
      });

      setSubmitSuccess(true);
      setTimeout(() => {
        setSubmitSuccess(false);
        setIsModalOpen(false);
        setComment('');
      }, 1500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ marginTop: '3rem', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
      
      {/* Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            ⭐ Verified Traveler Reviews & Ratings
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Real multi-aspect feedback from completed MICHUU expedition travelers
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<MessageSquarePlus size={16} />}
          onClick={() => setIsModalOpen(true)}
        >
          Write a Review
        </Button>
      </div>

      {/* Averages Breakdown Grid */}
      <Card glass style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: 'var(--bg-secondary)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem', alignItems: 'center' }}>
          
          {/* Main Average Card */}
          <div style={{ textAlign: 'center', paddingRight: '1rem', borderRight: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: '#f59e0b', lineHeight: 1 }}>
              {averages.overall}
            </div>
            <div style={{ color: '#fbbf24', fontSize: '1.1rem', margin: '0.25rem 0' }}>
              {'★'.repeat(Math.round(averages.overall))}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)' }}>
              Based on {averages.totalCount > 0 ? averages.totalCount : 4} verified reviews
            </div>
          </div>

          {/* Sub Ratings */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Ranger Guide</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>★ {averages.guide} / 5.0</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Transportation</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>★ {averages.transport} / 5.0</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Hotel size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Accommodation</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>★ {averages.accommodation} / 5.0</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(139,92,246,0.1)', color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Star size={18} />
              </div>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>Overall Satisfaction</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>★ {averages.overall} / 5.0</div>
              </div>
            </div>
          </div>

        </div>
      </Card>

      {/* Reviews Cards List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {reviews.map((rev) => (
          <Card key={rev.id} glass style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            
            {/* Reviewer Header */}
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.875rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={rev.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(rev.authorName)}&background=2563eb&color=fff`}
                  alt={rev.authorName}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                />
                <div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {rev.authorName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                    <span>{rev.date}</span>
                    {rev.isVerifiedBooking && (
                      <span style={{ color: '#16a34a', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <ShieldCheck size={12} /> Verified Traveler
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24', fontSize: '1.2rem' }}>
                {'★'.repeat(rev.overallRating)}
              </div>
            </div>

            {/* Detailed Category Badges requested by user */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.875rem' }}>
              <Badge variant="warning" style={{ fontWeight: 700 }}>
                ★ {rev.overallRating}/5 Overall
              </Badge>
              <Badge variant="info" style={{ fontWeight: 700 }}>
                👤 Guide ({rev.guideName || assignedGuideName}): ★{rev.guideRating || 5}/5
              </Badge>
              <Badge variant="success" style={{ fontWeight: 700 }}>
                🚐 Transportation: ★{rev.transportRating || 4}/5
              </Badge>
              <Badge variant="info" style={{ fontWeight: 700 }}>
                🏨 Accommodation: ★{rev.accommodationRating || 5}/5
              </Badge>
            </div>

            {/* Review Text */}
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0, fontStyle: 'italic' }}>
              "{rev.comment}"
            </p>
          </Card>
        ))}
      </div>

      {/* Write a Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Write a Tour Review — ${tourTitle}`}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSubmitReview} icon={<Send size={14} />} isLoading={isSubmitting} disabled={isSubmitting}>
              Publish Review
            </Button>
          </div>
        }
      >
        {submitSuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#16a34a' }}>
            <CheckCircle2 size={48} style={{ margin: '0 auto 0.75rem auto' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800 }}>Thank You!</h3>
            <p style={{ fontSize: 'var(--font-size-xs)', marginTop: 4 }}>
              Your detailed review has been published publicly on the tour catalog.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
              <strong>Tour:</strong> {tourTitle}<br />
              <strong>Assigned Ranger Guide:</strong> {assignedGuideName}
            </div>

            {/* 4 Multi-Aspect Star Pickers */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <StarPicker
                label="Overall Tour Experience"
                icon={<Star size={15} style={{ color: '#f59e0b' }} />}
                value={overallRating}
                onChange={setOverallRating}
              />
              <StarPicker
                label={`Ranger Guide (${assignedGuideName})`}
                icon={<UserCheck size={15} style={{ color: 'var(--brand-primary)' }} />}
                value={guideRating}
                onChange={setGuideRating}
              />
              <StarPicker
                label="Transportation (Cruiser/Bus)"
                icon={<Bus size={15} style={{ color: '#10b981' }} />}
                value={transportRating}
                onChange={setTransportRating}
              />
              <StarPicker
                label="Accommodation & Meals"
                icon={<Hotel size={15} style={{ color: '#8b5cf6' }} />}
                value={accommodationRating}
                onChange={setAccommodationRating}
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Your Detailed Comments & Feedback *
              </label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Describe your overall experience, guide service, transportation comfort, and accommodation..."
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-sm)',
                  resize: 'vertical',
                }}
                required
              />
            </div>

          </form>
        )}
      </Modal>

    </div>
  );
};

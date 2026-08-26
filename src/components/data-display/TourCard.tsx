import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import type { TourPackage } from '@/types/tour';
import { useWishlistStore } from '@/store/useWishlistStore';
import { Star, Clock, MapPin, Users, ArrowRight, Tag, Heart } from 'lucide-react';

interface TourCardProps {
  tour: TourPackage;
}

export const TourCard: React.FC<TourCardProps> = ({ tour }) => {
  const navigate = useNavigate();
  const { isWishlisted, toggleWishlist } = useWishlistStore();

  const wishlisted = isWishlisted(tour.id);

  const originalPrice = tour.originalPrice
    ? tour.originalPrice
    : tour.discountPercent
    ? Math.round(tour.pricePerPerson / (1 - tour.discountPercent / 100))
    : null;

  return (
    <Card
      glass
      style={{
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease',
        cursor: 'pointer',
        border: tour.hasOffer ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
      }}
      onClick={() => navigate(`/tours/${tour.id}`)}
    >
      {/* Cover Image Container */}
      <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden' }}>
        <img
          src={tour.imageUrl}
          alt={tour.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.4s ease',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
        {/* Category Pill Badge */}
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
          <Badge variant="info">{tour.category.toUpperCase()}</Badge>
          {tour.hasOffer && (
            <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={10} /> {tour.offerTag || `${tour.discountPercent || 15}% OFF OFFER`}
            </Badge>
          )}
        </div>

        {/* Wishlist Heart Toggle Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(tour);
          }}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            width: 34,
            height: 34,
            borderRadius: '50%',
            backgroundColor: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: wishlisted ? '#ef4444' : '#ffffff',
            transition: 'transform 0.2s ease, color 0.2s ease',
          }}
          title={wishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
        >
          <Heart size={18} fill={wishlisted ? '#ef4444' : 'none'} />
        </button>

        {/* Rating Overlay */}
        <div
          className="flex-center"
          style={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            backgroundColor: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(4px)',
            padding: '0.25rem 0.625rem',
            borderRadius: 'var(--radius-full)',
            color: '#fbbf24',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            gap: '0.25rem',
          }}
        >
          <Star size={13} fill="#fbbf24" />
          <span>{tour.rating}</span>
          <span style={{ color: '#94a3b8', fontWeight: 500 }}>({tour.reviewCount})</span>
        </div>
      </div>

      {/* Card Content Body */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
        {/* Destination Location Tag */}
        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
          <MapPin size={14} />
          <span>{tour.destination.name}, {tour.destination.country}</span>
        </div>

        {/* Tour Title */}
        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
          {tour.title}
        </h3>

        <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {tour.summary}
        </p>

        {/* Tour Specs (Duration & Max Group) */}
        <div
          className="flex-between"
          style={{
            marginTop: 'auto',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
          }}
        >
          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Clock size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{tour.durationDays} Days</span>
          </div>

          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <span>
              {tour.availableSlots !== undefined && tour.availableSlots <= 0 ? (
                <span style={{ color: 'var(--status-danger)', fontWeight: 700 }}>Sold Out</span>
              ) : tour.availableSlots !== undefined && tour.availableSlots <= 3 ? (
                <span style={{ color: '#ea580c', fontWeight: 700 }}>🔥 {tour.availableSlots} left</span>
              ) : (
                <span>{tour.availableSlots !== undefined ? `${tour.availableSlots} / ` : 'Max '}{tour.maxGroupSize} Seats</span>
              )}
            </span>
          </div>
        </div>

        {/* Price & CTA with Offer strike-through */}
        <div className="flex-between" style={{ paddingTop: '0.5rem' }}>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              {tour.hasOffer ? 'Special Offer Price' : 'From'}
            </span>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: tour.hasOffer ? '#16a34a' : 'var(--text-primary)' }}>
              {originalPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginRight: '0.375rem', fontWeight: 500 }}>
                  ${originalPrice.toLocaleString()}
                </span>
              )}
              ${tour.pricePerPerson.toLocaleString()} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
            </div>
          </div>

          <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
            Details
          </Button>
        </div>
      </div>
    </Card>
  );
};

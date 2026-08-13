import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { tourismService } from '@/services/tourismService';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Virtual360Modal } from '@/components/common/Virtual360Modal';
import { TourReviewsSection } from '@/components/reviews/TourReviewsSection';
import type { TourPackage } from '@/types/tour';
import type { Booking } from '@/types/booking';
import {
  MapPin,
  Clock,
  Users,
  Star,
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Ticket,
  ChevronDown,
  ChevronUp,
  Tag,
  RotateCw,
} from 'lucide-react';

export const TourDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();

  const [tour, setTour] = useState<TourPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

  // Booking Modal Form State
  const [is360Open, setIs360Open] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [adultsCount, setAdultsCount] = useState(2);
  const [childrenCount, setChildrenCount] = useState(0);
  const [travelDate, setTravelDate] = useState('2026-09-20');
  const [travelerName, setTravelerName] = useState(user?.name || '');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || '');
  const [travelerPhone, setTravelerPhone] = useState('+1 (555) 321-7890');
  const [travelerNationality, setTravelerNationality] = useState('United States');

  useEffect(() => {
    if (user) {
      setTravelerName(user.name);
      setTravelerEmail(user.email);
    }
  }, [user]);

  const handleBookNow = () => {
    if (!isAuthenticated) {
      navigate('/login?mode=signin');
      return;
    }
    setIsBookingModalOpen(true);
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login?mode=signin');
      return;
    }
    if (!tour) return;
    useCartStore.getState().addItem({
      id: `${tour.id}-cart`,
      type: 'tour',
      title: tour.title,
      subtitle: `${tour.durationDays} Days • ${tour.destination.name}`,
      imageUrl: tour.imageUrl,
      unitPrice: tour.pricePerPerson,
      quantity: adultsCount + childrenCount,
      date: travelDate,
      details: {
        location: tour.destination.name,
        duration: `${tour.durationDays} Days`,
      },
    });
    useCartStore.getState().openCart();
  };
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchTourDetails = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const data = await tourismService.getTourById(id);
        setTour(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTourDetails();
  }, [id]);

  if (isLoading) {
    return <LoadingSpinner label="Loading itinerary details..." />;
  }

  if (!tour) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>Tour package not found.</h2>
        <Button variant="primary" onClick={() => navigate('/tours')}>
          Back to Tour Catalog
        </Button>
      </div>
    );
  }

  const totalTravelers = adultsCount + childrenCount;
  const isOverCapacity = totalTravelers > tour.maxGroupSize;
  const spotsRemaining = tour.maxGroupSize - totalTravelers;

  const originalPrice = tour.originalPrice
    ? tour.originalPrice
    : tour.discountPercent
    ? Math.round(tour.pricePerPerson / (1 - tour.discountPercent / 100))
    : null;

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCapacity) return;
    setBookingError('');
    setIsSubmitting(true);
    try {
      const bkg = await tourismService.createBooking(
        tour.id,
        {
          name: travelerName,
          email: travelerEmail,
          phone: travelerPhone,
          nationality: travelerNationality,
          specialRequests,
        },
        travelDate,
        totalTravelers,
        adultsCount,
        childrenCount
      );
      setConfirmedBooking(bkg);
    } catch (err: unknown) {
      setBookingError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Title & Location Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <Badge variant="info">{tour.category.toUpperCase()}</Badge>
          {tour.hasOffer && (
            <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              <Tag size={12} /> {tour.offerTag || `${tour.discountPercent || 15}% OFF PROMO`}
            </Badge>
          )}
          <span className="flex-center" style={{ gap: '0.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
            <MapPin size={14} /> {tour.destination.name}, {tour.destination.country}
          </span>
        </div>

        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          {tour.title}
        </h1>

        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1.5rem', marginTop: '0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
          <div className="flex-center" style={{ gap: '0.375rem', color: '#fbbf24', fontWeight: 700 }}>
            <Star size={16} fill="#fbbf24" /> <span>{tour.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({tour.reviewCount} customer reviews)</span>
          </div>

          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Clock size={16} /> <span>{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
          </div>

          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Users size={16} /> <span>Max Group {tour.maxGroupSize} Guests</span>
          </div>
        </div>
      </div>

      {/* Special Offer Alert Banner */}
      {tour.hasOffer && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.3)',
            color: '#16a34a',
            fontWeight: 700,
            marginBottom: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <Tag size={22} style={{ color: '#16a34a', flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800 }}>
              🔥 SPECIAL PROMOTIONAL OFFER: {tour.offerTag || `${tour.discountPercent || 15}% DISCOUNT ACTIVE`}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
              Book this package today to save {originalPrice ? `$${(originalPrice - tour.pricePerPerson).toLocaleString()}` : 'discounted rates'} per guest! Limited offer slots remaining.
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Hero Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2.5rem', height: '420px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          <img
            src={tour.imageUrl}
            alt={tour.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
          />
          {/* Virtual 360° Panorama Trigger Button */}
          <button
            type="button"
            onClick={() => setIs360Open(true)}
            style={{
              position: 'absolute',
              bottom: '1.25rem',
              left: '1.25rem',
              backgroundColor: 'rgba(15, 23, 42, 0.85)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 800,
              border: '1px solid rgba(255, 255, 255, 0.3)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <RotateCw size={16} /> 360° Virtual Panorama View
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          {tour.galleryImages.slice(0, 2).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Gallery ${idx}`}
              style={{ width: '100%', height: '50%', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          ))}
        </div>
      </div>

      {/* Page Body Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2.5rem' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Summary */}
          <Card glass>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginBottom: '0.75rem' }}>Expedition Overview</h3>
            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{tour.summary}</p>
          </Card>

          {/* Day by Day Itinerary Accordion */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '1.25rem' }}>
              Day-by-Day Detailed Itinerary
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {tour.itinerary.map((day) => {
                const isExpanded = expandedDay === day.dayNumber;
                return (
                  <Card key={day.dayNumber} glass style={{ padding: 0, overflow: 'hidden' }}>
                    <div
                      className="flex-between"
                      onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                      style={{
                        padding: '1rem 1.25rem',
                        cursor: 'pointer',
                        backgroundColor: isExpanded ? 'var(--brand-primary-light)' : 'transparent',
                        transition: 'background-color var(--transition-fast)',
                      }}
                    >
                      <div className="flex-center" style={{ gap: '0.875rem' }}>
                        <span
                          className="flex-center"
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: '50%',
                            backgroundColor: 'var(--brand-primary)',
                            color: '#ffffff',
                            fontWeight: 700,
                            fontSize: 'var(--font-size-xs)',
                          }}
                        >
                          D{day.dayNumber}
                        </span>
                        <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)' }}>{day.title}</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {isExpanded && (
                      <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
                        <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1rem' }}>
                          {day.description}
                        </p>
                        <div className="flex-between" style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', flexWrap: 'wrap', gap: '0.5rem' }}>
                          {day.mealsIncluded && <span><strong>Meals:</strong> {day.mealsIncluded.join(', ')}</span>}
                          {day.accommodation && <span><strong>Stay:</strong> {day.accommodation}</span>}
                        </div>
                      </div>
                    )}
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <Card glass>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '1rem', color: 'var(--status-success)' }}>
                ✓ What's Included
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)' }}>
                {tour.included.map((item, idx) => (
                  <li key={idx} className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} style={{ color: 'var(--status-success)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>

            <Card glass>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '1rem', color: 'var(--status-danger)' }}>
                ✕ What's Excluded
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)' }}>
                {tour.excluded.map((item, idx) => (
                  <li key={idx} className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                    <XCircle size={16} style={{ color: 'var(--status-danger)', flexShrink: 0 }} />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>

        {/* Sidebar Sticky Booking Card */}
        <div>
          <Card
            glass
            style={{
              position: 'sticky',
              top: 100,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-lg)',
              border: tour.hasOffer ? '1.5px solid rgba(22, 163, 74, 0.4)' : '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                {tour.hasOffer ? 'Special Discounted Price' : 'Package Price'}
              </span>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: tour.hasOffer ? '#16a34a' : 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                {originalPrice && (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginRight: '0.5rem', fontWeight: 500 }}>
                    ${originalPrice.toLocaleString()}
                  </span>
                )}
                ${tour.pricePerPerson.toLocaleString()} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-sm)' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Duration:</span>
                <span style={{ fontWeight: 600 }}>{tour.durationDays} Days</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Difficulty:</span>
                <Badge variant="warning">{tour.difficulty.toUpperCase()}</Badge>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Group Size:</span>
                <span style={{ fontWeight: 600 }}>Max {tour.maxGroupSize} Guests</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Button variant="primary" size="lg" icon={<Ticket size={18} />} onClick={handleBookNow}>
                Book This Expedition Now
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleAddToCart}
              >
                🛒 Add to Cart (Multi-Item Package)
              </Button>
            </div>

            <div className="flex-center" style={{ gap: '0.5rem', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              <ShieldCheck size={16} style={{ color: 'var(--status-success)' }} /> Instant confirmation & 100% money-back guarantee
            </div>
          </Card>
          {/* Reviews & Ratings Section */}
          <TourReviewsSection
            tourId={tour.id}
            tourTitle={tour.title}
            assignedGuideName={tour.assignedGuideName}
          />
        </div>
      </div>

      {/* Interactive Booking Modal */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setConfirmedBooking(null);
        }}
        title={confirmedBooking ? 'Reservation Confirmed!' : `Book Tour - ${tour.title}`}
        footer={
          confirmedBooking ? (
            <Button variant="primary" size="sm" onClick={() => navigate('/my-bookings')}>
              View My Reservations
            </Button>
          ) : (
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsBookingModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleBookingSubmit}
                isLoading={isSubmitting}
                icon={<Ticket size={16} />}
                disabled={isOverCapacity}
              >
                Confirm Booking (${(tour.pricePerPerson * totalTravelers).toLocaleString()})
              </Button>
            </div>
          )
        }
      >
        {confirmedBooking ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
            <div
              className="flex-center"
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}
            >
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Booking Reference #{confirmedBooking.bookingReference}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Thank you {confirmedBooking.traveler.name}! Your reservation for <strong>{confirmedBooking.tourTitle}</strong> is confirmed.
              </p>
            </div>

            <Card glass style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
              <div><strong>Travel Date:</strong> {confirmedBooking.travelDate}</div>
              <div><strong>Travelers:</strong> {confirmedBooking.numberOfTravelers} Guests</div>
              <div><strong>Total Paid:</strong> ${confirmedBooking.totalPrice.toLocaleString()}</div>
              <div><strong>Assigned Ranger Guide:</strong> {confirmedBooking.assignedGuideName}</div>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Capacity indicator */}
            <div
              style={{
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isOverCapacity ? 'rgba(239,68,68,0.08)' : 'rgba(22,163,74,0.08)',
                border: `1px solid ${isOverCapacity ? 'rgba(239,68,68,0.3)' : 'rgba(22,163,74,0.3)'}`,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: isOverCapacity ? '#dc2626' : '#16a34a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Max Group Size: {tour.maxGroupSize} guests</span>
              <span>{isOverCapacity ? `⚠ Over capacity by ${Math.abs(spotsRemaining)}` : `✓ ${spotsRemaining} spot${spotsRemaining !== 1 ? 's' : ''} remaining`}</span>
            </div>

            {/* Adults + Children */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input
                label="Adults"
                type="number"
                min={1}
                max={tour.maxGroupSize}
                value={adultsCount}
                onChange={(e) => setAdultsCount(Number(e.target.value))}
                required
              />
              <Input
                label="Children (under 12)"
                type="number"
                min={0}
                max={tour.maxGroupSize}
                value={childrenCount}
                onChange={(e) => setChildrenCount(Number(e.target.value))}
              />
              <Input
                label="Departure Date"
                type="date"
                value={travelDate}
                onChange={(e) => setTravelDate(e.target.value)}
                required
              />
            </div>

            <Input label="Lead Traveler Full Name" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email Address" type="email" value={travelerEmail} onChange={(e) => setTravelerEmail(e.target.value)} required />
              <Input label="Phone Number" type="tel" value={travelerPhone} onChange={(e) => setTravelerPhone(e.target.value)} required />
            </div>

            <Input label="Nationality / Passport Country" value={travelerNationality} onChange={(e) => setTravelerNationality(e.target.value)} required />
            <Input label="Special Dietary / Access Requests" placeholder="e.g. Vegetarian meal plan, Wheelchair access" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />

            {bookingError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                ⚠ {bookingError}
              </div>
            )}

            <div className="flex-between" style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
              <span>Total ({totalTravelers} guest{totalTravelers !== 1 ? 's' : ''} · {adultsCount}A/{childrenCount}C):</span>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                ${(tour.pricePerPerson * totalTravelers).toLocaleString()}
              </span>
            </div>
          </form>
        )}
      </Modal>

      {/* Interactive 360° Virtual Panorama Viewer Modal */}
      <Virtual360Modal
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
        destinationName={tour.destination.name}
        imageUrl={tour.imageUrl}
        tourId={tour.id}
      />
    </div>
  );
};

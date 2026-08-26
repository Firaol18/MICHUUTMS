import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { tourismService } from '@tms/shared/services/tourismService';
import { newsletterService } from '@tms/shared/services/newsletterService';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { toast } from '@tms/shared/store/useToastStore';
import { Virtual360Modal } from '@tms/shared/components/common/Virtual360Modal';
import { TourReviewsSection } from '@tms/shared/components/reviews/TourReviewsSection';
import { InteractiveLocationMap } from '@tms/shared/components/common/InteractiveLocationMap';
import { EthiopianPaymentQR } from '@tms/shared/components/common/EthiopianPaymentQR';
import type { TourPackage } from '@tms/shared/types/tour';
import type { Booking } from '@tms/shared/types/booking';
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
  UploadCloud,
  FileImage,
  Copy,
  Check,
  CreditCard,
  Building2,
  Smartphone,
  Banknote,
  Receipt,
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: '📱',
    badge: 'Instant / Birr',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '0930222784',
    instructions: 'Pay via Telebirr App or *127# to 0930222784, then upload the transaction confirmation screenshot below.',
  },
  {
    id: 'cbe_birr',
    name: 'Commercial Bank of Ethiopia (CBE / CBE Birr)',
    icon: '🏦',
    badge: 'CBE Mobile / *847#',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '1000299280164',
    instructions: 'Transfer to CBE account 1000299280164, enter the FT transaction reference code, and upload the transfer receipt screenshot.',
  },
  {
    id: 'bank_transfer',
    name: 'Awash / Dashen / BOA Bank Transfer',
    icon: '🏛️',
    badge: 'Direct Bank Wire',
    accountName: 'MICHUU TOURISM PLC',
    accountNumber: 'Awash Bank: 01320495839001 | Dashen: 504938291001',
    instructions: 'Transfer to our Awash/Dashen account, then attach a photo of your bank deposit slip or mobile screenshot.',
  },
  {
    id: 'credit_card',
    name: 'Credit / Debit Card (Visa / Mastercard)',
    icon: '💳',
    badge: 'Card Checkout',
    accountName: 'MICHUU Global Checkout',
    accountNumber: 'Encrypted 256-Bit SSL',
    instructions: 'Enter your card authorization reference or upload a screenshot of your successful transaction slip.',
  },
  {
    id: 'cash',
    name: 'Pay Cash on Arrival / Bole Office Hub',
    icon: '💵',
    badge: 'Pay in Person',
    accountName: 'MICHUU Hub — Bole Medhanialem',
    accountNumber: 'Bole Medhanialem Tower, 4th Floor',
    instructions: 'Your reservation is held. Please settle the remaining fee at our Bole hub or upon meeting your Ranger Guide.',
  },
];

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
  const [travelerPhone, setTravelerPhone] = useState('+251 91 123 4567');
  const [travelerNationality, setTravelerNationality] = useState('Ethiopia');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment State & Receipt Attachment
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer' | 'credit_card' | 'cash'>('telebirr');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    if (user) {
      setTravelerName(user.name);
      setTravelerEmail(user.email);
    }
  }, [user]);

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



  // Promotional Offer & Voucher State
  const cartPromoCode = useCartStore((s) => s.promoCode);
  const cartDiscountPercent = useCartStore((s) => s.discountPercent);
  const [promoCodeInput, setPromoCodeInput] = useState(cartPromoCode || '');
  const [promoDiscountPercent, setPromoDiscountPercent] = useState(cartDiscountPercent || 0);

  useEffect(() => {
    if (cartPromoCode) {
      setPromoCodeInput(cartPromoCode);
      setPromoDiscountPercent(cartDiscountPercent || 15);
    }
  }, [cartPromoCode, cartDiscountPercent]);

  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim()) {
      toast.warning('Please enter a valid promo code.', 'Promo Code');
      return;
    }
    try {
      const res = await newsletterService.validateOffer(promoCodeInput.trim(), travelerEmail);
      setPromoDiscountPercent(res.discountPercent);
      useCartStore.getState().applyPromoCode(res.promoCode);
      toast.success(`${res.discountPercent}% Welcome Promo applied to this tour!`, 'Offer Applied 🎉');
    } catch (err: any) {
      toast.warning(err.message || 'Invalid promo code.', 'Promo Code');
    }
  };

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

  const totalAvailable = tour.availableSlots !== undefined ? tour.availableSlots : tour.maxGroupSize;
  const isTourSoldOut = totalAvailable <= 0 || tour.status === 'sold_out';
  const totalTravelers = adultsCount + childrenCount;
  const spotsRemaining = totalAvailable - totalTravelers;
  const isOverCapacity = totalTravelers > totalAvailable || totalAvailable === 0;
  const basePrice = tour.pricePerPerson * totalTravelers;
  const discountAmount = promoDiscountPercent > 0 ? Math.round((tour.pricePerPerson * promoDiscountPercent) / 100) : 0;
  const totalPrice = Math.max(0, basePrice - discountAmount);

  const originalPrice = tour.originalPrice
    ? tour.originalPrice
    : tour.discountPercent
      ? Math.round(tour.pricePerPerson / (1 - tour.discountPercent / 100))
      : null;

  const activePaymentOption = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverCapacity) return;

    if (!travelerName || !travelerEmail) {
      setBookingError('Please provide your full name and email address.');
      return;
    }

    // Payment validation: electronic methods require either a screenshot attachment or transaction reference code
    if (paymentMethod !== 'cash' && !paymentReceiptUrl && !transactionReference.trim()) {
      setBookingError('Please upload a screenshot of your payment receipt or enter the transaction reference code.');
      return;
    }

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
        childrenCount,
        {
          title: tour.title,
          destination: tour.destination.name,
          totalPrice,
          status: 'confirmed',
          paymentStatus: paymentReceiptUrl || transactionReference ? 'paid' : (paymentMethod === 'cash' ? 'unpaid' : 'paid'),
          paymentMethod,
          paymentReceiptUrl,
          transactionReference,
        }
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

      {/* Top Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/tours" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Tours</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{tour.title}</span>
      </div>

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

        <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1.5rem', marginTop: '0.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Clock size={16} /> <span>{tour.durationDays} Days / {tour.durationDays - 1} Nights</span>
          </div>

          <div className="flex-center" style={{ gap: '0.375rem' }}>
            <Star size={16} style={{ color: 'var(--status-warning)', fill: 'var(--status-warning)' }} />
            <span style={{ fontWeight: 600 }}>{tour.rating}</span>
            <span style={{ color: 'var(--text-muted)' }}>({tour.reviewCount ?? 18} reviews)</span>
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
      <div
        className="tour-gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1rem',
          marginBottom: '2.5rem',
          minHeight: '340px',
          position: 'relative',
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '340px' }}>
          <img
            src={tour.imageUrl}
            alt={tour.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius-lg)' }}
          />
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '340px' }}>
          {tour.galleryImages.slice(0, 2).map((img, idx) => (
            <img
              key={idx}
              src={img}
              alt={`Gallery ${idx}`}
              style={{ width: '100%', height: 'calc(50% - 0.5rem)', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
          ))}
        </div>
      </div>

      {/* ── 2-Column Section (Left Details + Right Sticky Sidebar) ── */}
      <div className="tour-details-layout" style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>

        {/* Main Content Area */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            <Card glass>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '1rem', color: 'var(--status-success)' }}>
                ✓ What's Included
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)', padding: 0 }}>
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
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)', padding: 0 }}>
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

        {/* Sidebar Sticky Booking Card & Trust Assurances */}
        <div className="tour-details-sidebar" style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            glass
            style={{
              position: 'sticky',
              top: 90,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-lg)',
              border: tour.hasOffer ? '1.5px solid rgba(22, 163, 74, 0.4)' : '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {tour.hasOffer ? 'Special Discounted Price' : 'Package Price'}
              </span>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: tour.hasOffer ? '#16a34a' : 'var(--text-primary)', letterSpacing: '-0.02em', marginTop: 4 }}>
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
                <span style={{ fontWeight: 700 }}>{tour.durationDays} Days</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Difficulty:</span>
                <Badge variant="warning">{tour.difficulty.toUpperCase()}</Badge>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Group Size:</span>
                <span style={{ fontWeight: 700 }}>Max {tour.maxGroupSize} Guests</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Availability:</span>
                <span style={{
                  fontWeight: 800,
                  color: isTourSoldOut ? '#dc2626' : totalAvailable <= 3 ? '#ea580c' : '#16a34a',
                }}>
                  {isTourSoldOut ? 'Sold Out (0 Left)' : `${totalAvailable} / ${tour.maxGroupSize} Available`}
                </span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Lead Ranger:</span>
                <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{tour.assignedGuideName || 'Abebe Bekele'}</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<Ticket size={18} />}
                onClick={handleBookNow}
                disabled={isTourSoldOut}
                style={{
                  width: '100%',
                  fontWeight: 800,
                  opacity: isTourSoldOut ? 0.6 : 1,
                  cursor: isTourSoldOut ? 'not-allowed' : 'pointer',
                  backgroundColor: isTourSoldOut ? 'var(--status-danger)' : undefined,
                }}
              >
                {isTourSoldOut ? 'Sold Out' : 'Book Now'}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleAddToCart}
                style={{ width: '100%' }}
              >
                🛒 Add to Cart (Multi-Item Package)
              </Button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} style={{ color: '#16a34a' }} /> 100% Verified licensed Ethiopian operator
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ShieldCheck size={14} style={{ color: '#16a34a' }} /> Free reschedule up to 7 days prior
              </div>
            </div>
          </Card>

          {/* Expert Guide Card */}
          <Card glass style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120"
              alt="Lead Guide"
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
            />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Assigned Ranger Guide</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>{tour.assignedGuideName || 'Abebe Bekele'}</div>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>★ 5.0 (98 Expeditions Guided)</div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── Full Width Interactive Expedition Location Map ── */}
      <div style={{ marginTop: '3.5rem' }}>
        <InteractiveLocationMap
          title={`Interactive Location Map & Route — ${tour.title}`}
          tourTitle={tour.title}
          tourId={tour.id}
          isEditable={false}
        />
      </div>

      {/* ── Full Width Reviews & Ratings Section ── */}
      <div style={{ marginTop: '3.5rem' }}>
        <TourReviewsSection
          tourId={tour.id}
          tourTitle={tour.title}
          assignedGuideName={tour.assignedGuideName}
        />
      </div>

      {/* ── Enhanced Interactive Booking Modal with Payment & Screenshot Upload ── */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setConfirmedBooking(null);
        }}
        title={confirmedBooking ? 'Reservation Confirmed! 🎟️' : `Book Tour - ${tour.title}`}
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
                Confirm Booking & Payment (${totalPrice.toLocaleString()})
              </Button>
            </div>
          )
        }
      >
        {confirmedBooking ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
            <div
              className="flex-center"
              style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}
            >
              <CheckCircle2 size={40} />
            </div>
            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>Booking Confirmed! #{confirmedBooking.bookingReference}</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Thank you <strong>{confirmedBooking.traveler.name}</strong>! Your expedition reservation is officially recorded.
              </p>
            </div>

            <Card glass style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)', backgroundColor: 'var(--bg-secondary)' }}>
              <div><strong>Tour:</strong> {confirmedBooking.tourTitle}</div>
              <div><strong>Travel Date:</strong> {confirmedBooking.travelDate}</div>
              <div><strong>Travelers:</strong> {confirmedBooking.numberOfTravelers} Guests</div>
              <div><strong>Total Amount:</strong> ${confirmedBooking.totalPrice.toLocaleString()}</div>
              <div>
                <strong>Payment Method:</strong> <Badge variant="info">{(confirmedBooking.paymentMethod || paymentMethod).toUpperCase()}</Badge>
              </div>
              {confirmedBooking.transactionReference && (
                <div><strong>Transaction Reference:</strong> <code style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{confirmedBooking.transactionReference}</code></div>
              )}
              {confirmedBooking.paymentReceiptUrl && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: '0.35rem' }}>
                    ✓ Payment Receipt Attached:
                  </span>
                  <img
                    src={confirmedBooking.paymentReceiptUrl}
                    alt="Payment Slip"
                    style={{ maxHeight: 120, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              )}
              <div><strong>Status:</strong> <Badge variant="success">CONFIRMED & VERIFIED</Badge></div>
            </Card>
          </div>
        ) : (
          <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>

            {/* Capacity indicator */}
            <div
              style={{
                padding: '0.625rem 1rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isOverCapacity ? 'rgba(239,68,68,0.08)' : 'rgba(22,163,74,0.08)',
                border: `1px solid ${isOverCapacity ? 'rgba(239,68,68,0.3)' : 'rgba(22,163,74,0.3)'}`,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: isOverCapacity ? '#dc2626' : '#16a34a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Capacity: {totalAvailable} / {tour.maxGroupSize} seats available</span>
              <span>
                {isOverCapacity
                  ? totalAvailable === 0
                    ? '⚠ Tour is completely sold out'
                    : `⚠ Only ${totalAvailable} seat${totalAvailable !== 1 ? 's' : ''} left`
                  : `✓ ${spotsRemaining} seat${spotsRemaining !== 1 ? 's' : ''} remaining after your party`}
              </span>
            </div>

            {/* Traveler Details Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input
                label="Adults"
                type="number"
                min={1}
                max={Math.max(1, totalAvailable)}
                value={adultsCount}
                onChange={(e) => setAdultsCount(Number(e.target.value))}
                required
              />
              <Input
                label="Children (under 12)"
                type="number"
                min={0}
                max={Math.max(0, totalAvailable - adultsCount)}
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

            <Input label="Lead Traveler Full Name *" value={travelerName} onChange={(e) => setTravelerName(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email Address *" type="email" value={travelerEmail} onChange={(e) => setTravelerEmail(e.target.value)} required />
              <Input label="Phone Number *" type="tel" value={travelerPhone} onChange={(e) => setTravelerPhone(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Nationality *" value={travelerNationality} onChange={(e) => setTravelerNationality(e.target.value)} required />
              <Input label="Special Dietary / Access Requests" placeholder="e.g. Vegan, wheelchair, translator" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} />
            </div>

            {/* ── PAYMENT METHOD SELECTION ── */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                💳 Select Payment Method *
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => {
                        setPaymentMethod(pm.id as any);
                        setBookingError('');
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontSize: '1.25rem' }}>{pm.icon}</span>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: isSelected ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>
                          {pm.badge}
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {pm.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Ethiopian Payment QR & Verification Widget */}
              <div style={{ marginBottom: '1rem' }}>
                <EthiopianPaymentQR
                  method={paymentMethod}
                  amountUsd={totalPrice}
                  accountNumber={activePaymentOption.accountNumber}
                  accountName={activePaymentOption.accountName}
                  receiptUrl={paymentReceiptUrl}
                  receiptFileName={receiptFileName}
                  onReceiptUpload={(url, name) => {
                    setPaymentReceiptUrl(url);
                    setReceiptFileName(name);
                  }}
                  onRemoveReceipt={() => {
                    setPaymentReceiptUrl('');
                    setReceiptFileName('');
                  }}
                />
              </div>

              {paymentMethod !== 'cash' && (
                <div style={{ marginTop: '0.75rem' }}>
                  <Input
                    label="Transaction Reference / Bank Confirmation Code (e.g. FT2609...)"
                    placeholder="Enter TXN ID / Reference Code"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                  />
                </div>
              )}
            </div>

            {bookingError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                ⚠️ {bookingError}
              </div>
            )}

            {/* Promo Code / Newsletter Voucher Input */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.85rem' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.4rem' }}>
                🎟️ Have a Promo Code or Newsletter Voucher?
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="text"
                  placeholder="e.g. MICHUU15"
                  value={promoCodeInput}
                  onChange={(e) => setPromoCodeInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.55rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                  }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleApplyPromo} style={{ fontWeight: 700 }}>
                  Apply Offer
                </Button>
              </div>
              {promoDiscountPercent > 0 && (
                <div style={{ marginTop: '0.4rem', fontSize: '11px', color: '#16a34a', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle2 size={13} /> {promoDiscountPercent}% Travel Offer Active! -${discountAmount.toLocaleString()} deducted on 1 Tour.
                </div>
              )}
            </div>

            <div className="flex-between" style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
              <div>
                <div style={{ fontWeight: 700 }}>Total ({totalTravelers} guest{totalTravelers !== 1 ? 's' : ''} · {adultsCount}A/{childrenCount}C):</div>
                {promoDiscountPercent > 0 && (
                  <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
                    Includes 15% Single-Tour Discount (-${discountAmount})
                  </div>
                )}
              </div>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                ${totalPrice.toLocaleString()}
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

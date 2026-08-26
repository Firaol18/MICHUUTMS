import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { useContentStore } from '@tms/shared/store/useContentStore';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Virtual360Modal } from '@tms/shared/components/common/Virtual360Modal';
import { TourReviewsSection } from '@tms/shared/components/reviews/TourReviewsSection';
import { InteractiveLocationMap } from '@tms/shared/components/common/InteractiveLocationMap';
import { EthiopianPaymentQR } from '@tms/shared/components/common/EthiopianPaymentQR';
import { tourismService } from '@tms/shared/services/tourismService';
import type { EthiopianEvent } from '@tms/shared/services/mockEventsData';
import type { Booking } from '@tms/shared/types/booking';
import {
  CalendarDays,
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
  Share2,
  Calendar as CalendarIcon,
  Shirt,
  Camera,
  Info,
  Compass,
  ArrowLeft,
  Sparkles,
  Utensils,
  Check,
  UploadCloud,
  Copy,
} from 'lucide-react';

const CATEGORY_COLORS: Record<string, string> = {
  religious: '#f59e0b',
  cultural: '#10b981',
  nature: '#06b6d4',
  music: '#8b5cf6',
  food: '#ef4444',
  sport: '#3b82f6',
};

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

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { user, isAuthenticated } = useAuthStore();
  const { events, fetchEvents } = useContentStore();

  const [event, setEvent] = useState<EthiopianEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is360Open, setIs360Open] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Booking Form State
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [ticketQuantity, setTicketQuantity] = useState(2);
  const [bookingDate, setBookingDate] = useState('');
  const [travelerName, setTravelerName] = useState(user?.name || '');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || '');
  const [travelerPhone, setTravelerPhone] = useState('+251 91 123 4567');
  const [travelerNationality, setTravelerNationality] = useState('Ethiopia');
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment Method & Screenshot Upload State
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer' | 'credit_card' | 'cash'>('telebirr');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (events.length > 0 && id) {
      const found = events.find((e) => e.id === id || String(e.id) === String(id));
      if (found) {
        setEvent(found);
        setBookingDate(found.date);
        setIsLoading(false);
      } else {
        tourismService.getTours().then(() => {
          setIsLoading(false);
        }).catch(() => setIsLoading(false));
      }
    }
  }, [events, id]);

  useEffect(() => {
    if (user) {
      setTravelerName(user.name);
      setTravelerEmail(user.email);
    }
  }, [user]);

  if (isLoading) {
    return <LoadingSpinner label="Loading festival & event details..." />;
  }

  if (!event) {
    return (
      <div className="flex-center" style={{ minHeight: '50vh', flexDirection: 'column', gap: '1rem', padding: '3rem 1.5rem' }}>
        <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800 }}>Event Not Found</h2>
        <p style={{ color: 'var(--text-muted)' }}>The requested festival or celebration could not be located in our catalog.</p>
        <Button variant="primary" onClick={() => navigate('/events')} icon={<ArrowLeft size={16} />}>
          Back to Events & Festivals Calendar
        </Button>
      </div>
    );
  }

  const basePrice = event.isFree ? 0 : (event.price || 45);
  const originalPrice = event.originalPrice || (event.discountPercent ? Math.round(basePrice / (1 - event.discountPercent / 100)) : null);
  const totalPrice = basePrice * ticketQuantity;
  const activePaymentOption = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];

  const totalCapacity = event.capacity ?? 50;
  const availablePasses = event.availableSlots !== undefined ? event.availableSlots : totalCapacity;
  const isEventSoldOut = availablePasses <= 0 || event.status === 'completed';
  const spotsRemaining = availablePasses - ticketQuantity;
  const isOverCapacity = ticketQuantity > availablePasses || availablePasses === 0;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

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
    useCartStore.getState().addItem({
      id: `${event.id}-event-cart`,
      type: 'tour',
      title: event.title,
      subtitle: `Festival Pass • ${event.location}`,
      imageUrl: event.imageUrl,
      unitPrice: basePrice,
      quantity: ticketQuantity,
      date: bookingDate || event.date,
      details: {
        location: event.location,
        duration: 'Festival Pass',
      },
    });
    useCartStore.getState().openCart();
  };



  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!travelerName || !travelerEmail) {
      setBookingError('Please enter your full name and contact email.');
      return;
    }

    if (!event.isFree && paymentMethod !== 'cash' && !paymentReceiptUrl && !transactionReference.trim()) {
      setBookingError('Please upload a screenshot of your payment receipt or enter the transaction reference code.');
      return;
    }

    setIsSubmitting(true);
    setBookingError('');

    try {
      const created = await tourismService.createBooking(
        event.id,
        {
          name: travelerName,
          email: travelerEmail,
          phone: travelerPhone,
          nationality: travelerNationality,
          specialRequests,
        },
        bookingDate || event.date,
        ticketQuantity,
        ticketQuantity,
        0,
        {
          title: event.title,
          destination: event.location,
          totalPrice,
          status: 'confirmed',
          paymentStatus: event.isFree ? 'paid' : (paymentReceiptUrl || transactionReference ? 'paid' : 'paid'),
          paymentMethod: event.isFree ? 'free' : paymentMethod,
          paymentReceiptUrl,
          transactionReference,
        }
      );

      setConfirmedBooking(created);
      setEvent((prev) => {
        if (!prev) return null;
        const totalCap = prev.capacity ?? 50;
        const newBooked = (prev.bookedSeats ?? 0) + ticketQuantity;
        const newAvailable = Math.max(0, (prev.availableSlots ?? totalCap) - ticketQuantity);
        return {
          ...prev,
          bookedSeats: newBooked,
          availableSlots: newAvailable,
          status: newAvailable === 0 ? 'completed' : prev.status,
        };
      });
    } catch (err: any) {
      setBookingError(err.message || 'Failed to complete festival pass reservation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const generateGoogleCalendarUrl = () => {
    const startStr = event.date.replace(/-/g, '') + 'T060000Z';
    const endStr = (event.endDate ? event.endDate.replace(/-/g, '') : event.date.replace(/-/g, '')) + 'T180000Z';
    const text = encodeURIComponent(event.title);
    const details = encodeURIComponent(event.description + '\n\nBooked via MICHUU Tourism TMS');
    const location = encodeURIComponent(event.location + ', Ethiopia');
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startStr}/${endStr}&details=${details}&location=${location}`;
  };

  const relatedEvents = events.filter((e) => e.id !== event.id && (e.category === event.category || e.region === event.region)).slice(0, 3);

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      
      {/* Top Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
        <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
        <span>/</span>
        <Link to="/events" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Events & Festivals</Link>
        <span>/</span>
        <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{event.title}</span>
      </div>

      {/* Offer Banner */}
      {event.hasOffer && (
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(239,68,68,0.15) 100%)',
            border: '1px solid rgba(245,158,11,0.4)',
            borderRadius: 'var(--radius-md)',
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Sparkles size={20} style={{ color: '#f59e0b', flexShrink: 0 }} />
            <div>
              <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 'var(--font-size-sm)' }}>
                {event.offerTag || 'Special Festival Discount Offer!'}
              </span>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', margin: 0 }}>
                {event.discountPercent ? `Save ${event.discountPercent}% on Guided Festival Passes` : 'Discounted pricing available for early reservations.'}
              </p>
            </div>
          </div>
          <Badge variant="warning" style={{ fontWeight: 800 }}>Limited Availability</Badge>
        </div>
      )}

      {/* Title & Meta Header */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <span
              style={{
                backgroundColor: CATEGORY_COLORS[event.category] || 'var(--brand-primary)',
                color: '#ffffff',
                padding: '2px 10px',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
              }}
            >
              {event.category}
            </span>
            <Badge variant="info">📍 {event.region}</Badge>
            {event.isFeatured && <Badge variant="warning">⭐ Major National Celebration</Badge>}
            {event.isFree && <Badge variant="success">Free Public Entry</Badge>}
          </div>

          <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            {event.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
              <CalendarDays size={16} style={{ color: 'var(--brand-primary)' }} />
              {new Date(event.date).toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' })}
              {event.endDate && ` – ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
            </span>

            {event.ethiopianDate && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 700, color: '#f59e0b' }}>
                🇪🇹 Ge'ez Calendar: {event.ethiopianDate}
              </span>
            )}

            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <MapPin size={16} style={{ color: '#ef4444' }} />
              {event.location}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Button
            variant="outline"
            size="sm"
            icon={<Share2 size={15} />}
            onClick={handleShare}
          >
            {copiedLink ? 'Link Copied!' : 'Share'}
          </Button>

          <a
            href={generateGoogleCalendarUrl()}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'none' }}
          >
            <Button variant="secondary" size="sm" icon={<CalendarIcon size={15} />}>
              + Google Calendar
            </Button>
          </a>
        </div>
      </div>

      {/* Image Gallery Hero Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '2.5rem', height: '420px', position: 'relative' }}>
        <div style={{ position: 'relative', width: '100%', height: '100%', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <img
            src={event.imageUrl}
            alt={event.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
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
            <RotateCw size={16} /> 360° Virtual Festival Experience
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
          <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800"
              alt="Cultural Gathering"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, borderRadius: 'var(--radius-lg)', overflow: 'hidden', position: 'relative' }}>
            <img
              src="https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800"
              alt="Ethiopian Heritage"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>

      {/* Main Content 2-Column Section */}
      <div style={{ display: 'flex', gap: '2.5rem', alignItems: 'flex-start' }}>
        
        {/* Left Column: Details */}
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Quick Festival Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <Card glass style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.1)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shirt size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Dress Code</div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  {event.dressCode || 'Traditional White Cotton (Netela)'}
                </div>
              </div>
            </Card>

            <Card glass style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.1)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Camera size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Photography</div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  Allowed & Welcomed
                </div>
              </div>
            </Card>

            <Card glass style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700 }}>Security & Guide</div>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                  Certified Ranger Escort
                </div>
              </div>
            </Card>
          </div>

          {/* Overview */}
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              📖 Celebration Overview & Cultural Significance
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '1rem' }}>
              {event.description}
            </p>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              Ethiopian cultural and religious festivals represent thousands of years of continuous spiritual and communal heritage. When you attend with MICHUU, you receive privileged access to viewing enclosures, translation of ancient liturgical chants, and expert navigation of mass ceremonial gatherings.
            </p>
          </div>

          {/* Visitor Guide */}
          <Card glass style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <Info size={20} style={{ color: '#f59e0b' }} />
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, margin: 0 }}>
                Visitor Guide & Cultural Etiquette
              </h3>
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li><strong>Attire:</strong> {event.dressCode || 'Modest white attire is recommended for religious ceremonies. Shoulders and knees must be covered.'}</li>
              <li><strong>Etiquette:</strong> {event.tipForVisitors || 'Arrive early at dawn for morning blessings. Follow the cues of the local elders and guide.'}</li>
              <li><strong>Comfort:</strong> Sun protection, a refillable water bottle, and comfortable walking shoes are essential.</li>
              <li><strong>Holy Enclosures:</strong> Shoes must be removed when entering carpeted church grounds and consecrated zones.</li>
            </ul>
          </Card>

          {/* Timeline */}
          <div>
            <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
              🕒 Festival Program & Ceremonial Timeline
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { time: '05:30 AM – 08:30 AM', title: 'Dawn Procession & Consecration Prayers', desc: 'Priests in golden ceremonial vestments lead liturgical chants under colorful ceremonial velvet umbrellas.' },
                { time: '09:00 AM – 12:30 PM', title: 'Main Public Ceremony & Communal Blessing', desc: 'The holy Tabot or sacred cultural symbol is blessed amidst thousands of singing devotees and ceremonial drummers.' },
                { time: '01:00 PM – 03:30 PM', title: 'Traditional Festive Feast & Coffee Ceremony', desc: 'Enjoy authentic Ethiopian culinary delicacies, injera with doro wat, and traditional 3-round buna coffee.' },
                { time: '04:00 PM – 06:30 PM', title: 'Cultural Dancing, Chants & Evening Procession', desc: 'Spirited communal dancing, youth celebrations, and return procession to the sanctuary.' },
              ].map((step, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px', flexShrink: 0, marginTop: 2 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, paddingBottom: '1rem', borderBottom: idx < 3 ? '1px solid var(--border-color)' : 'none' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>{step.title}</h4>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#f59e0b', backgroundColor: 'rgba(245,158,11,0.1)', padding: '2px 8px', borderRadius: 'var(--radius-sm)' }}>
                        {step.time}
                      </span>
                    </div>
                    <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', margin: '0.35rem 0 0 0', lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Sidebar: Sticky Booking Card & Trust Assurances */}
        <div style={{ width: '380px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card
            glass
            style={{
              position: 'sticky',
              top: 90,
              display: 'flex',
              flexDirection: 'column',
              gap: '1.25rem',
              boxShadow: 'var(--shadow-lg)',
              border: event.hasOffer ? '1.5px solid rgba(245,158,11,0.5)' : '1px solid var(--border-color)',
            }}
          >
            <div>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
                {event.isFree ? 'Public Entry' : 'Guided Festival Pass'}
              </span>
              <div style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 900, color: event.isFree ? '#10b981' : '#f59e0b', letterSpacing: '-0.02em', marginTop: 4 }}>
                {event.isFree ? (
                  'FREE ENTRY'
                ) : (
                  <>
                    {originalPrice && (
                      <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginRight: '0.5rem', fontWeight: 500 }}>
                        ${originalPrice.toLocaleString()}
                      </span>
                    )}
                    ${basePrice.toLocaleString()} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
                  </>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-sm)' }}>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Date:</span>
                <span style={{ fontWeight: 700 }}>{event.date}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Location:</span>
                <span style={{ fontWeight: 700 }}>{event.location}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Category:</span>
                <span style={{ fontWeight: 700, textTransform: 'capitalize' }}>{event.category}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Ticket Capacity:</span>
                <span style={{ fontWeight: 700 }}>{totalCapacity} Passes</span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Availability:</span>
                <span style={{
                  fontWeight: 800,
                  color: isEventSoldOut ? '#dc2626' : availablePasses <= 5 ? '#ea580c' : '#16a34a',
                }}>
                  {isEventSoldOut ? 'Sold Out (0 Left)' : `${availablePasses} / ${totalCapacity} Left`}
                </span>
              </div>
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Guide Escort:</span>
                <span style={{ fontWeight: 700, color: '#10b981' }}>Included</span>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: 0 }} />

            {/* Ticket Guest Quantity Counter */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Number of Guests / Passes
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketQuantity(Math.max(1, ticketQuantity - 1))}
                  disabled={ticketQuantity <= 1 || isEventSoldOut}
                  style={{ width: 36, height: 36, padding: 0 }}
                >
                  -
                </Button>
                <span style={{ flex: 1, textAlign: 'center', fontWeight: 800, fontSize: 'var(--font-size-md)' }}>
                  {ticketQuantity} {ticketQuantity === 1 ? 'Guest' : 'Guests'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTicketQuantity(Math.min(availablePasses, ticketQuantity + 1))}
                  disabled={ticketQuantity >= availablePasses || isEventSoldOut}
                  style={{ width: 36, height: 36, padding: 0 }}
                >
                  +
                </Button>
              </div>
            </div>

            {/* Total Calculation */}
            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <div className="flex-between" style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800 }}>
                <span>Total Estimated:</span>
                <span style={{ color: '#f59e0b', fontSize: 'var(--font-size-lg)' }}>
                  {event.isFree ? '$0 (Free Entry)' : `$${totalPrice.toLocaleString()}`}
                </span>
              </div>
              <p style={{ fontSize: '10px', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                Includes festival escort, reserved viewing access, and local cultural ranger.
              </p>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<Ticket size={18} />}
                onClick={handleBookNow}
                disabled={isEventSoldOut}
                style={{
                  backgroundColor: isEventSoldOut ? 'var(--status-danger)' : '#f59e0b',
                  color: isEventSoldOut ? '#ffffff' : '#000000',
                  fontWeight: 800,
                  width: '100%',
                  opacity: isEventSoldOut ? 0.6 : 1,
                  cursor: isEventSoldOut ? 'not-allowed' : 'pointer',
                }}
              >
                {isEventSoldOut ? 'Sold Out' : event.isFree ? 'Reserve Free Entry Spot' : 'Book Festival Pass Now'}
              </Button>

              {!event.isFree && (
                <Button
                  variant="secondary"
                  size="md"
                  onClick={handleAddToCart}
                  style={{ width: '100%' }}
                >
                  Add to Travel Cart
                </Button>
              )}
            </div>

            {/* Trust Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={14} style={{ color: '#10b981' }} /> Instant confirmation & e-ticket QR
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={14} style={{ color: '#10b981' }} /> Free cancellation up to 48 hours prior
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Check size={14} style={{ color: '#10b981' }} /> Verified authentic cultural experience
              </div>
            </div>
          </Card>

          {/* Expert Guide Card */}
          <Card glass style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', backgroundColor: 'var(--bg-secondary)' }}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120"
              alt="Cultural Host"
              style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #f59e0b' }}
            />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Cultural Host & Escort</div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>Ranger Almaz Tsegaye</div>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 700 }}>★ 4.9 (Local Historian)</div>
            </div>
          </Card>
        </div>

      </div>

      {/* ── Full Width Interactive Celebration Location & Route Map ── */}
      <div style={{ marginTop: '3.5rem' }}>
        <InteractiveLocationMap
          title={`Celebration Location & Route Map — ${event.title}`}
          tourTitle={event.title}
          tourId={event.id}
          isEditable={false}
        />
      </div>

      {/* ── Full Width Verified Traveler Reviews & Ratings Section ── */}
      <div style={{ marginTop: '3.5rem' }}>
        <TourReviewsSection
          tourId={event.id}
          tourTitle={event.title}
          assignedGuideName="Ranger Almaz Tsegaye"
        />
      </div>

      {/* ── Related Events & Festivals Carousel ── */}
      {relatedEvents.length > 0 && (
        <div style={{ marginTop: '4rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem' }}>
            🎉 Explore Other Upcoming Festivals & Cultural Celebrations
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {relatedEvents.map((rel) => (
              <Card
                key={rel.id}
                glass
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => {
                  navigate(`/events/${rel.id}`);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              >
                <div style={{ height: 180, position: 'relative', overflow: 'hidden' }}>
                  <img
                    src={rel.imageUrl}
                    alt={rel.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: 10,
                      left: 10,
                      backgroundColor: CATEGORY_COLORS[rel.category] || '#f59e0b',
                      color: '#ffffff',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '10px',
                      fontWeight: 800,
                      textTransform: 'uppercase',
                    }}
                  >
                    {rel.category}
                  </span>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, marginBottom: '0.4rem' }}>{rel.title}</h3>
                  <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    <span>📅 {rel.date}</span>
                    <span>📍 {rel.location}</span>
                  </div>
                  <div className="flex-between">
                    <span style={{ fontWeight: 800, color: '#f59e0b', fontSize: 'var(--font-size-sm)' }}>
                      {rel.isFree ? 'Free Entry' : `$${rel.price || 45}/guest`}
                    </span>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ── Virtual 360° Modal ── */}
      <Virtual360Modal
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
        destinationName={event.location}
        imageUrl={event.imageUrl}
        tourId={event.id}
      />

      {/* ── Enhanced Booking Confirmation Modal with Payment & Screenshot Upload ── */}
      <Modal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setConfirmedBooking(null);
        }}
        title={confirmedBooking ? 'Festival Pass Confirmed! 🎟️' : `Book Festival Pass: ${event.title}`}
        footer={
          confirmedBooking ? (
            <Button
              variant="primary"
              onClick={() => {
                setIsBookingModalOpen(false);
                navigate('/my-bookings');
              }}
            >
              View My Bookings
            </Button>
          ) : (
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" onClick={() => setIsBookingModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleConfirmBooking} isLoading={isSubmitting} icon={<Ticket size={16} />}>
                Confirm Reservation (${totalPrice})
              </Button>
            </div>
          )
        }
      >
        {confirmedBooking ? (
          <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
            <CheckCircle2 size={48} style={{ color: '#10b981', margin: '0 auto 1rem auto' }} />
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Festival Pass Confirmed! 🎟️
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Your reservation reference is <strong style={{ color: 'var(--brand-primary)', fontFamily: 'monospace' }}>#{confirmedBooking.bookingReference}</strong>.
            </p>
            <div style={{ margin: '1.25rem 0', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', textAlign: 'left', fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div><strong>Festival:</strong> {event.title}</div>
              <div><strong>Location:</strong> {event.location}</div>
              <div><strong>Date:</strong> {bookingDate || event.date}</div>
              <div><strong>Passes:</strong> {ticketQuantity} Guest(s)</div>
              <div><strong>Total Paid:</strong> ${totalPrice}</div>
              <div><strong>Payment Method:</strong> <Badge variant="info">{(confirmedBooking.paymentMethod || paymentMethod).toUpperCase()}</Badge></div>
              {confirmedBooking.transactionReference && (
                <div><strong>Transaction Reference:</strong> <code style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{confirmedBooking.transactionReference}</code></div>
              )}
              {confirmedBooking.paymentReceiptUrl && (
                <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: '0.35rem' }}>
                    ✓ Attached Payment Receipt:
                  </span>
                  <img
                    src={confirmedBooking.paymentReceiptUrl}
                    alt="Receipt Screenshot"
                    style={{ maxHeight: 110, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {bookingError && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(239,68,68,0.1)', color: '#ef4444', fontSize: 'var(--font-size-xs)' }}>
                ⚠️ {bookingError}
              </div>
            )}

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
              <strong>Event:</strong> {event.title} ({event.location})<br />
              <strong>Date:</strong> {event.date} {event.ethiopianDate ? `• 🇪🇹 ${event.ethiopianDate}` : ''}
            </div>

            {/* Live Capacity Info Bar */}
            <div
              style={{
                padding: '0.625rem 0.875rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: isOverCapacity ? 'rgba(220, 38, 38, 0.08)' : 'rgba(22, 163, 74, 0.08)',
                border: `1px solid ${isOverCapacity ? 'rgba(220, 38, 38, 0.3)' : 'rgba(22, 163, 74, 0.3)'}`,
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: isOverCapacity ? '#dc2626' : '#16a34a',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>Capacity: {availablePasses} / {totalCapacity} passes available</span>
              <span>
                {isOverCapacity
                  ? availablePasses === 0
                    ? '⚠ Event is completely sold out'
                    : `⚠ Only ${availablePasses} pass${availablePasses !== 1 ? 'es' : ''} left`
                  : `✓ ${spotsRemaining} pass${spotsRemaining !== 1 ? 'es' : ''} remaining after your party`}
              </span>
            </div>

            <Input
              label="Lead Traveler Full Name *"
              value={travelerName}
              onChange={(e) => setTravelerName(e.target.value)}
              required
            />

            <Input
              label="Email Address (for e-ticket delivery) *"
              type="email"
              value={travelerEmail}
              onChange={(e) => setTravelerEmail(e.target.value)}
              required
            />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Phone Number"
                value={travelerPhone}
                onChange={(e) => setTravelerPhone(e.target.value)}
              />
              <Input
                label="Nationality"
                value={travelerNationality}
                onChange={(e) => setTravelerNationality(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Special Dietary or Accessibility Requests
              </label>
              <textarea
                rows={2}
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Vegan/fasting meal option, wheelchair access, translator..."
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontFamily: 'inherit',
                  fontSize: 'var(--font-size-xs)',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* ── PAYMENT METHOD SELECTION ── */}
            {!event.isFree && (
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
            )}

            <div className="flex-between" style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginTop: '0.5rem' }}>
              <span>Total ({ticketQuantity} Passes):</span>
              <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: '#f59e0b' }}>
                {event.isFree ? 'FREE ENTRY ($0)' : `$${totalPrice.toLocaleString()}`}
              </span>
            </div>
          </form>
        )}
      </Modal>

    </div>
  );
};

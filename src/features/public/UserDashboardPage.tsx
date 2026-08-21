import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ETicketModal } from '@/components/common/ETicketModal';
import { tourismService } from '@/services/tourismService';
import { useAuthStore } from '@/store/useAuthStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useReviewStore } from '@/store/useReviewStore';
import type { Booking } from '@/types/booking';
import {
  Calendar,
  MapPin,
  Users,
  CheckCircle2,
  QrCode,
  Compass,
  Heart,
  Star,
  FileText,
  Download,
  Settings,
  Ticket,
  LogOut,
  Send,
  ShieldCheck,
} from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, login, isAuthenticated } = useAuthStore();
  const { wishlist, toggleWishlist } = useWishlistStore();
  const { reviews, addReview, fetchReviews } = useReviewStore();

  const [activeTab, setActiveTab] = useState<'trips' | 'invoices' | 'wishlist' | 'reviews' | 'profile'>('trips');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedETicket, setSelectedETicket] = useState<Booking | null>(null);

  // Profile Edit Form State
  const [profileName, setProfileName] = useState(user?.name || 'Eleanor Vance');
  const [profileEmail, setProfileEmail] = useState(user?.email || 'eleanor.vance@example.com');
  const [profilePhone, setProfilePhone] = useState('+251 91 123 4567');
  const [profileNationality, setProfileNationality] = useState('Ethiopia');
  const [preferredCurrency, setPreferredCurrency] = useState('ETB (Br) / USD ($)');
  const [emergencyContact, setEmergencyContact] = useState('Abebe Vance (+251 911 223344)');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian / Fasting Options');
  const [profileSaveMessage, setProfileSaveMessage] = useState(false);

  // Review Form State
  const [reviewTourId, setReviewTourId] = useState('tour-101');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);

  // Guard: redirect unauthenticated visitors to login (after all hooks)
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    fetchReviews();
    const fetchCustomerBookings = async () => {
      setIsLoading(true);
      try {
        const data = await tourismService.getBookings('all');
        setBookings(data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCustomerBookings();
  }, [fetchReviews]);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      login(
        {
          ...user,
          name: profileName,
          email: profileEmail,
        },
        'updated-jwt-token'
      );
      setProfileSaveMessage(true);
      setTimeout(() => setProfileSaveMessage(false), 3000);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    try {
      await addReview({
        tourId: reviewTourId,
        tourTitle: reviewTourId === 'tour-101' ? 'Wenchi Crater Lake Expedition' : 'Danakil Depression Expedition',
        authorName: profileName,
        authorEmail: profileEmail,
        rating: reviewRating,
        overallRating: reviewRating,
        guideRating: 5,
        transportRating: 5,
        accommodationRating: 5,
        comment: reviewComment,
        category: 'tour',
        isVerifiedBooking: true,
      });

      setReviewComment('');
      setReviewSuccess(true);
      setTimeout(() => setReviewSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to submit review:', err);
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <Card
        glass
        style={{
          padding: '1.75rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.12) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <img
            src={user?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'}
            alt={user?.name || 'User'}
            style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user?.name || 'Eleanor Vance'}
              </h1>
              <Badge variant="success">VIP Traveler</Badge>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
              {user?.email || 'eleanor.vance@example.com'} • Member since 2026
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" size="sm" icon={<Compass size={16} />} onClick={() => navigate('/tours')}>
            Explore Tours
          </Button>
          <Button
            variant="ghost"
            size="sm"
            icon={<LogOut size={16} />}
            onClick={() => { logout(); navigate('/'); }}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('trips')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'trips' ? 700 : 500,
            backgroundColor: activeTab === 'trips' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'trips' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'trips' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Ticket size={16} /> My Trips ({bookings.length})
        </button>

        <button
          onClick={() => setActiveTab('invoices')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'invoices' ? 700 : 500,
            backgroundColor: activeTab === 'invoices' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'invoices' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'invoices' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <FileText size={16} /> Invoices & Receipts
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'wishlist' ? 700 : 500,
            backgroundColor: activeTab === 'wishlist' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'wishlist' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'wishlist' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Heart size={16} fill={activeTab === 'wishlist' ? '#fff' : 'none'} /> Wishlist ({wishlist.length})
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'reviews' ? 700 : 500,
            backgroundColor: activeTab === 'reviews' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'reviews' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'reviews' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Star size={16} fill={activeTab === 'reviews' ? '#fff' : 'none'} /> My Reviews ({reviews.length})
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: 'var(--radius-full)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: activeTab === 'profile' ? 700 : 500,
            backgroundColor: activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--bg-secondary)',
            color: activeTab === 'profile' ? '#fff' : 'var(--text-secondary)',
            border: `1px solid ${activeTab === 'profile' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            transition: 'all 0.15s ease',
          }}
        >
          <Settings size={16} /> Profile & Settings
        </button>
      </div>

      {/* ─── TAB 1: TRIPS & BOOKING HISTORY ─── */}
      {activeTab === 'trips' && (
        <div>
          {isLoading ? (
            <LoadingSpinner label="Fetching your travel reservations..." />
          ) : bookings.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Compass size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3>No active travel reservations found.</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Ready to explore? Browse our luxury tour packages and book your next expedition.
              </p>
              <Button variant="primary" onClick={() => navigate('/tours')}>
                Explore Tour Catalog
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {bookings.map((bkg) => (
                <Card key={bkg.id} glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                        Ref #{bkg.bookingReference}
                      </div>
                      <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, marginTop: '0.15rem' }}>{bkg.tourTitle}</h3>
                    </div>

                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                      <Badge variant="success" icon={<CheckCircle2 size={13} />}>
                        {bkg.status.toUpperCase()}
                      </Badge>
                      <Badge variant="info">PAID</Badge>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: 'var(--font-size-sm)' }}>
                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Destination</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <MapPin size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.destinationName}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Departure Date</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <Calendar size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.travelDate}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'block' }}>Travelers & Total</span>
                      <span className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontWeight: 600 }}>
                        <Users size={14} style={{ color: 'var(--brand-primary)' }} /> {bkg.numberOfTravelers} Guests (${bkg.totalPrice.toLocaleString()})
                      </span>
                    </div>
                  </div>

                  <div
                    className="flex-between"
                    style={{
                      padding: '0.875rem 1rem',
                      backgroundColor: 'var(--bg-tertiary)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--font-size-xs)',
                      flexWrap: 'wrap',
                      gap: '0.75rem',
                    }}
                  >
                    <div>
                      <span>Lead Traveler: <strong>{bkg.traveler.name}</strong> ({bkg.traveler.email})</span>
                      {bkg.assignedGuideName && <span style={{ marginLeft: '1rem' }}>Ranger Guide: <strong>{bkg.assignedGuideName}</strong></span>}
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<QrCode size={14} />}
                      onClick={() => setSelectedETicket(bkg)}
                    >
                      View QR E-Ticket & Pass
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: INVOICES & RECEIPTS ─── */}
      {activeTab === 'invoices' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {bookings.map((bkg) => (
            <Card key={bkg.id} glass style={{ padding: '1.25rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Official Tax Invoice #{bkg.bookingReference}-INV
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.2rem' }}>
                  {bkg.tourTitle}
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  Date Issued: {bkg.travelDate} • Status: <strong style={{ color: '#16a34a' }}>PAID FULL</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Amount</div>
                  <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    ${bkg.totalPrice.toLocaleString()} USD
                  </div>
                </div>

                <Button variant="outline" size="sm" icon={<Download size={14} />} onClick={() => setSelectedETicket(bkg)}>
                  Download Tax PDF
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ─── TAB 3: WISHLIST / FAVORITES ─── */}
      {activeTab === 'wishlist' && (
        <div>
          {wishlist.length === 0 ? (
            <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <Heart size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3>Your wishlist is empty</h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                Click the heart icon on any tour card to save it to your personal favorites!
              </p>
              <Button variant="primary" onClick={() => navigate('/tours')}>
                Browse Tour Packages
              </Button>
            </Card>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {wishlist.map((tour) => (
                <Card key={tour.id} glass style={{ padding: 0, overflow: 'hidden' }}>
                  <div style={{ height: 180, backgroundImage: `url(${tour.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                    <button
                      onClick={() => toggleWishlist(tour)}
                      style={{ position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.6)', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Heart size={16} fill="#ef4444" />
                    </button>
                  </div>
                  <div style={{ padding: '1.25rem' }}>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, marginBottom: '0.2rem' }}>
                      📍 {tour.destination.name}
                    </div>
                    <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.5rem' }}>{tour.title}</h3>
                    <div className="flex-between" style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                        ${tour.pricePerPerson} USD
                      </span>
                      <Button variant="primary" size="sm" onClick={() => navigate(`/tours/${tour.id}`)}>
                        Book Tour
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: REVIEWS & POST-TRIP FEEDBACK ─── */}
      {activeTab === 'reviews' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Write a Review Form */}
          <Card glass style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
              ✍️ Post-Trip Review & Feedback
            </h3>

            {reviewSuccess && (
              <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1rem' }}>
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
                  style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
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
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: star <= reviewRating ? '#fbbf24' : '#cbd5e1' }}
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
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: 'inherit' }}
                  required
                />
              </div>

              <Button type="submit" variant="primary" icon={<Send size={16} />}>
                Submit Review
              </Button>
            </form>
          </Card>

          {/* List of Posted Reviews */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, marginBottom: '1rem' }}>
              My Published Reviews ({reviews.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {reviews.map((rev) => (
                <Card key={rev.id} glass style={{ padding: '1.25rem' }}>
                  <div className="flex-between" style={{ marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#fbbf24' }}>
                      {'★'.repeat(rev.overallRating || rev.rating || 5)}
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
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '10px', fontWeight: 700, color: '#16a34a', marginTop: '0.5rem' }}>
                      <ShieldCheck size={12} /> Verified MICHUU Traveler
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 5: PROFILE & SETTINGS ─── */}
      {activeTab === 'profile' && (
        <Card glass style={{ maxWidth: '700px', margin: '0 auto', padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>
            👤 Profile & Traveler Preferences
          </h3>

          {profileSaveMessage && (
            <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22,163,74,0.1)', color: '#16a34a', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1.25rem' }}>
              ✓ Profile settings updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Full Name" value={profileName} onChange={(e) => setProfileName(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email Address" type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} required />
              <Input label="Mobile / Telebirr Phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Nationality / Passport Country" value={profileNationality} onChange={(e) => setProfileNationality(e.target.value)} required />
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Preferred Display Currency
                </label>
                <select
                  value={preferredCurrency}
                  onChange={(e) => setPreferredCurrency(e.target.value)}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                >
                  <option value="ETB (Br) / USD ($)">ETB (Br) / USD ($)</option>
                  <option value="USD ($)">USD ($) Only</option>
                  <option value="EUR (€)">EUR (€) Only</option>
                </select>
              </div>
            </div>

            <Input label="Emergency Contact (Name & Phone)" value={emergencyContact} onChange={(e) => setEmergencyContact(e.target.value)} />
            <Input label="Dietary / Medical Accessibility Notes" value={dietaryPref} onChange={(e) => setDietaryPref(e.target.value)} />

            <Button type="submit" variant="primary" size="lg" icon={<CheckCircle2 size={18} />}>
              Save Profile Changes
            </Button>
          </form>
        </Card>
      )}

      {/* Printable E-Ticket Modal Trigger */}
      <ETicketModal
        isOpen={Boolean(selectedETicket)}
        onClose={() => setSelectedETicket(null)}
        booking={selectedETicket}
      />
    </div>
  );
};

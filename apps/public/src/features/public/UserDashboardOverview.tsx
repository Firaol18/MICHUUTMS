import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { tourismService } from '@tms/shared/services/tourismService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { useWishlistStore } from '@tms/shared/store/useWishlistStore';
import { useReviewStore } from '@tms/shared/store/useReviewStore';
import type { Booking } from '@tms/shared/types/booking';
import {
  Ticket,
  Heart,
  Star,
  FileText,
  Compass,
  MapPin,
  Calendar,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';

export const UserDashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const { user: _user } = useAuthStore();
  const { wishlist } = useWishlistStore();
  const { reviews, fetchReviews } = useReviewStore();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
    tourismService.getBookings('all').then((data) => {
      if (_user?.email && _user.role !== 'admin' && _user.role !== 'tour_operator') {
        const email = _user.email.toLowerCase();
        setBookings(data.filter((b) => b.traveler?.email?.toLowerCase() === email));
      } else {
        setBookings(data);
      }
      setIsLoading(false);
    }).catch(() => {
      setBookings([]);
      setIsLoading(false);
    });
  }, [fetchReviews, _user]);

  const userReviews = _user?.email
    ? reviews.filter((r) => r.authorEmail && r.authorEmail.toLowerCase() === _user.email.toLowerCase())
    : [];

  const statCards = [
    {
      label: 'My Bookings',
      value: bookings.length,
      icon: <Ticket size={22} />,
      color: 'var(--brand-primary)',
      bg: 'var(--brand-primary-light)',
      route: '/my-bookings',
    },
    {
      label: 'Wishlist',
      value: wishlist.length,
      icon: <Heart size={22} />,
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.1)',
      route: '/user/wishlist',
    },
    {
      label: 'My Reviews',
      value: userReviews.length,
      icon: <Star size={22} />,
      color: '#f59e0b',
      bg: 'rgba(245,158,11,0.1)',
      route: '/user/reviews',
    },
    {
      label: 'Invoices',
      value: bookings.length,
      icon: <FileText size={22} />,
      color: '#10b981',
      bg: 'rgba(16,185,129,0.1)',
      route: '/user/invoices',
    },
    {
      label: 'Support Tickets',
      value: 'Track',
      icon: <HelpCircle size={22} />,
      color: '#8b5cf6',
      bg: 'rgba(139,92,246,0.1)',
      route: '/user/issues',
    },
  ];

  if (isLoading) return <LoadingSpinner label="Loading your dashboard..." />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
        {statCards.map((stat) => (
          <Card
            key={stat.label}
            glass
            style={{ padding: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s ease' }}
            onClick={() => navigate(stat.route)}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 'var(--radius-md)',
                backgroundColor: stat.bg,
                color: stat.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '0.75rem',
              }}
            >
              {stat.icon}
            </div>
            <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {stat.label}
            </div>
          </Card>
        ))}
      </div>

      {/* Recent Bookings */}
      <div>
        <div className="flex-between" style={{ marginBottom: '1rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)' }}>
            Recent Trips
          </h2>
          <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/my-bookings')}>
            View All
          </Button>
        </div>

        {bookings.length === 0 ? (
          <Card glass style={{ textAlign: 'center', padding: '3rem 2rem' }}>
            <Compass size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
            <h3 style={{ marginBottom: '0.5rem' }}>No trips yet</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Start exploring our curated Ethiopian expeditions.
            </p>
            <Button variant="primary" size="sm" onClick={() => navigate('/tours')}>
              Explore Tours
            </Button>
          </Card>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {bookings.slice(0, 3).map((bkg) => (
              <Card key={bkg.id} glass style={{ padding: '1rem 1.25rem' }}>
                <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 700 }}>
                      Ref #{bkg.bookingReference}
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginTop: '0.1rem' }}>
                      {bkg.tourTitle}
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        marginTop: '0.35rem',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--text-muted)',
                      }}
                    >
                      <span className="flex-center" style={{ gap: '0.25rem' }}>
                        <MapPin size={12} /> {bkg.destinationName}
                      </span>
                      <span className="flex-center" style={{ gap: '0.25rem' }}>
                        <Calendar size={12} /> {bkg.travelDate}
                      </span>
                    </div>
                  </div>
                  <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                    {bkg.status.toUpperCase()}
                  </Badge>
                </div>
              </Card>
            ))}
            {bookings.length > 3 && (
              <Button variant="outline" size="sm" onClick={() => navigate('/my-bookings')} style={{ alignSelf: 'flex-start' }}>
                See {bookings.length - 3} more booking{bookings.length - 3 !== 1 ? 's' : ''}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Quick Actions
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
          <Button variant="outline" icon={<Compass size={15} />} onClick={() => navigate('/tours')}>
            Browse Tours
          </Button>
          <Button variant="outline" icon={<Heart size={15} />} onClick={() => navigate('/user/wishlist')}>
            My Wishlist ({wishlist.length})
          </Button>
          <Button variant="outline" icon={<Star size={15} />} onClick={() => navigate('/user/reviews')}>
            Write a Review
          </Button>
        </div>
      </div>
    </div>
  );
};

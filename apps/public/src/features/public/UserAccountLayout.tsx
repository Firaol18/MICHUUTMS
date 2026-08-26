import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { getUserAvatarUrl } from '@tms/shared/utils/avatar';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import {
  LayoutDashboard,
  Ticket,
  FileText,
  Heart,
  Star,
  Settings,
  LogOut,
  Compass,
  HelpCircle,
  MailWarning,
} from 'lucide-react';
import { http } from '@tms/shared/services/apiClient';
import { toast } from '@tms/shared/store/useToastStore';

export const UserAccountLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [isResending, setIsResending] = React.useState(false);

  const handleResendVerification = async () => {
    if (!user?.email) return;
    setIsResending(true);
    try {
      await http.post('/auth/forgot-password', { email: user.email });
      toast.success(`Verification link re-sent to ${user.email}! Check your inbox.`, 'Email Sent');
    } catch {
      toast.error('Failed to resend verification email. Please try again later.');
    } finally {
      setIsResending(false);
    }
  };

  const isGuideOrAdmin =
    user?.role === 'ADMIN' ||
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'tour_guide' ||
    user?.role === 'GUIDE';

  const navItems = [
    { to: '/user/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/my-bookings', label: 'My Bookings', icon: <Ticket size={16} /> },
    ...(isGuideOrAdmin ? [{ to: '/user/guide-dashboard', label: 'Guide Portal', icon: <Compass size={16} /> }] : []),
    { to: '/user/issues', label: 'Support Tickets', icon: <HelpCircle size={16} /> },
    { to: '/user/invoices', label: 'Invoices & Receipts', icon: <FileText size={16} /> },
    { to: '/user/wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
    { to: '/user/reviews', label: 'My Reviews', icon: <Star size={16} /> },
    { to: '/user/profile', label: 'Profile & Settings', icon: <Settings size={16} /> },
  ];

  const handleSignOut = () => {
    logout();
    navigate('/');
  };

  const navLinkBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    padding: '0.65rem 1rem',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--font-size-sm)',
    fontWeight: 500,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
    color: 'var(--text-secondary)',
    border: '1px solid transparent',
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* ── Unverified Email Banner ── */}
      {user?.emailVerified === false && (
        <div
          style={{
            padding: '0.875rem 1.25rem',
            marginBottom: '1.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: 'var(--font-size-xs)', color: '#b45309' }}>
            <MailWarning size={18} style={{ flexShrink: 0 }} />
            <span>
              <strong>Verify your email address ({user.email}).</strong> Check your inbox for the verification link to unlock full account features.
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleResendVerification}
            isLoading={isResending}
            style={{ fontSize: 'var(--font-size-xs)', padding: '0.35rem 0.75rem' }}
          >
            Resend Email
          </Button>
        </div>
      )}

      {/* ── Top Profile Banner ── */}
      <Card
        glass
        style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(6,182,212,0.12) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={getUserAvatarUrl(user)}
            alt={user?.name}
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--brand-primary)',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
                {user?.name || 'Traveler'}
              </h1>
              <Badge variant="success">
                {user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
                  ? 'Administrator'
                  : user?.role === 'tour_guide' || user?.role === 'GUIDE'
                  ? 'Certified Guide'
                  : 'Traveler Member'}
              </Badge>
            </div>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              {user?.email} • Member since 2026
            </p>
          </div>
        </div>

        <div>
          <Button variant="outline" size="sm" icon={<Compass size={15} />} onClick={() => navigate('/tours')}>
            Explore Tours
          </Button>
        </div>
      </Card>

      {/* ── Body: Sidebar + Content ── */}
      <div className="user-account-layout" style={{ display: 'flex', gap: '1.5rem', alignItems: 'start' }}>

        {/* Sidebar Nav */}
        <Card
          className="user-account-sidebar"
          glass
          style={{ padding: '0.6rem', position: 'sticky', top: '80px', minWidth: '200px' }}
        >
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end
                className="sidebar-link"
                style={({ isActive }) => ({
                  ...navLinkBase,
                  backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 500,
                  borderColor: isActive ? 'rgba(37,99,235,0.15)' : 'transparent',
                })}
              >
                {item.icon}
                {item.label}
              </NavLink>
            ))}

            {/* Sign Out at bottom */}
            <div style={{ borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }}>
              <button
                type="button"
                onClick={handleSignOut}
                className="sidebar-link"
                style={{
                  ...navLinkBase,
                  width: '100%',
                  color: '#ef4444',
                  cursor: 'pointer',
                  background: 'none',
                  border: '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)';
                  e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </nav>
        </Card>

        {/* Page Content */}
        <div className="user-account-content" style={{ minWidth: 0, flex: 1, width: '100%' }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
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
} from 'lucide-react';

const NAV_ITEMS = [
  { to: '/user/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
  { to: '/my-bookings', label: 'My Bookings', icon: <Ticket size={16} /> },
  { to: '/user/guide-dashboard', label: 'Guide Portal', icon: <Compass size={16} /> },
  { to: '/user/issues', label: 'Support Tickets', icon: <HelpCircle size={16} /> },
  { to: '/user/invoices', label: 'Invoices & Receipts', icon: <FileText size={16} /> },
  { to: '/user/wishlist', label: 'Wishlist', icon: <Heart size={16} /> },
  { to: '/user/reviews', label: 'My Reviews', icon: <Star size={16} /> },
  { to: '/user/profile', label: 'Profile & Settings', icon: <Settings size={16} /> },
];

export const UserAccountLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

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
            src={
              user?.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=2563eb&color=fff&size=128`
            }
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
              <Badge variant="success">VIP Traveler</Badge>
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
            {NAV_ITEMS.map((item) => (
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
        <div style={{ minWidth: 0 }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

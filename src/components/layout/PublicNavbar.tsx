import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import type { LanguageCode } from '@/store/useLanguageStore';
import {
  Compass,
  Sun,
  Moon,
  LogIn,
  LayoutDashboard,
  Ticket,
  LogOut,
  HelpCircle,
  ShoppingBag,
  Languages,
  Calendar,
  BookOpen,
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/common/Button';
import { RaiseIssueModal } from '@/components/common/RaiseIssueModal';
import { CartDrawer } from '@/components/cart/CartDrawer';
import { useCartStore } from '@/store/useCartStore';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; shortCode: string }[] = [
  { code: 'am', label: 'Amharic', shortCode: 'AM' },
  { code: 'en', label: 'English', shortCode: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', shortCode: 'OM' },
];

export const PublicNavbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();

  const navigate = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'tour_operator' || user.role === 'finance_manager');

  const { items: cartItems, openCart } = useCartStore();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Close language dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[1];

  const getNavLinkStyle = (isActive: boolean): React.CSSProperties => ({
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--font-size-xs)',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.35rem 0.6rem',
    borderRadius: 'var(--radius-sm)',
    transition: 'all 0.15s ease',
  });

  return (
    <>
      <header
        className="glass-panel"
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '1px solid var(--border-color)',
          borderRadius: 0,
          backgroundColor: 'var(--bg-glass)',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div
          className="flex-between"
          style={{
            width: '100%',
            padding: '0 1.5rem',
            gap: '1rem',
          }}
        >
          {/* Brand Logo */}
          <Link to="/" className="flex-center" style={{ gap: '0.6rem', textDecoration: 'none', flexShrink: 0 }}>
            <div
              className="flex-center text-gradient"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary-light)',
              }}
            >
              <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </div>
              <div style={{ fontSize: '9px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em', lineHeight: 1 }}>
                Ethiopian Tourism & Travel
              </div>
            </div>
          </Link>

          {/* Navigation Links - Clean Single Row, No Wrapping */}
          <nav
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              overflowX: 'auto',
              scrollbarWidth: 'none',
              padding: '0.25rem 0',
            }}
          >
            <NavLink to="/" style={({ isActive }) => getNavLinkStyle(isActive)}>
              {t('home')}
            </NavLink>

            <NavLink to="/tours" style={({ isActive }) => getNavLinkStyle(isActive)}>
              {t('explore_tours')}
            </NavLink>

            <NavLink to="/my-bookings" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Ticket size={14} /> {t('tour_history')}
            </NavLink>

            <NavLink to="/events" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Calendar size={14} /> {t('events')}
            </NavLink>

            <NavLink to="/blog" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <BookOpen size={14} /> {t('blog')}
            </NavLink>

            <NavLink to="/plan-trip" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Sparkles size={14} style={{ color: 'var(--brand-primary)' }} /> Plan Custom Trip
            </NavLink>

            <NavLink to="/contact" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <PhoneCall size={14} /> Contact & FAQ
            </NavLink>

            {/* Issue Tickets Button */}
            <button
              type="button"
              onClick={() => setIsIssueModalOpen(true)}
              style={{
                fontWeight: 500,
                color: 'var(--text-secondary)',
                fontSize: 'var(--font-size-xs)',
                whiteSpace: 'nowrap',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.35rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                transition: 'color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--brand-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              <HelpCircle size={14} /> {t('issue_tickets')}
            </button>
          </nav>

          {/* Right Side Actions: Language Selector, Cart, Theme, User Profile */}
          <div className="flex-center" style={{ gap: '0.5rem', flexShrink: 0 }}>
            {/* Custom Language Popover (文A  EN) */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Languages size={15} style={{ color: 'var(--brand-primary)' }} />
                <span>{activeLangObj.shortCode}</span>
              </button>

              {/* Popup Dropdown Menu matching screenshot */}
              {isLangMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '140px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--text-primary)',
                    borderRadius: '8px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                    overflow: 'hidden',
                    zIndex: 200,
                    padding: '0.35rem 0',
                  }}
                >
                  {LANGUAGE_OPTIONS.map((l) => {
                    const isSelected = l.code === currentLanguage;
                    return (
                      <button
                        key={l.code}
                        type="button"
                        onClick={() => {
                          setLanguage(l.code);
                          setIsLangMenuOpen(false);
                        }}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.5rem 1rem',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: isSelected ? 700 : 400,
                          color: isSelected ? '#16a34a' : 'var(--text-primary)',
                          backgroundColor: isSelected ? 'rgba(22, 163, 74, 0.08)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          transition: 'color 0.15s ease',
                        }}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Multi-Item Shopping Cart Button */}
            <button
              onClick={openCart}
              className="flex-center"
              style={{
                position: 'relative',
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              title="View Cart & Multi-Item Checkout"
            >
              <ShoppingBag size={16} />
              {cartItemCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    fontSize: '10px',
                    fontWeight: 800,
                    width: 17,
                    height: 17,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-secondary)',
                  }}
                >
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="tms-btn-ghost flex-center"
              style={{ width: 34, height: 34, borderRadius: '50%', color: 'var(--text-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
            </button>

            {/* User Auth Profile */}
            {user ? (
              <div className="flex-center" style={{ gap: '0.4rem' }}>
                {isAdmin && (
                  <Button variant="primary" size="sm" icon={<LayoutDashboard size={14} />} onClick={() => navigate('/admin/dashboard')}>
                    Admin
                  </Button>
                )}

                <div
                  className="flex-center"
                  onClick={() => navigate('/user/dashboard')}
                  style={{ gap: '0.4rem', paddingLeft: '0.4rem', borderLeft: '1px solid var(--border-color)', cursor: 'pointer' }}
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                  />
                  <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); logout(); }} title="Sign Out">
                    <LogOut size={14} />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex-center" style={{ gap: '0.35rem' }}>
                <Button variant="ghost" size="sm" icon={<LogIn size={14} />} onClick={() => navigate('/login?mode=signin')}>
                  {t('sign_in')}
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/login?mode=signup')}>
                  {t('sign_up')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HOW CAN WE HELP YOU – Issue Ticket Modal */}
      <RaiseIssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} />

      {/* Multi-Item Shopping Cart Drawer */}
      <CartDrawer />
    </>
  );
};

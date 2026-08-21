import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { useUIStore } from '@tms/shared/store/useUIStore';
import { useLanguageStore } from '@tms/shared/store/useLanguageStore';
import type { LanguageCode } from '@tms/shared/store/useLanguageStore';
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
  ChevronDown,
  Lock,
  X,
  Menu,
  Home,
  UserCircle,
  Star,
  Settings,
  UserPlus,
} from 'lucide-react';
import { Button } from '@tms/shared/components/common/Button';
import { RaiseIssueModal } from '@tms/shared/components/common/RaiseIssueModal';
import { CartDrawer } from '@tms/shared/components/cart/CartDrawer';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { NotificationPopover } from '@tms/shared/components/common/NotificationPopover';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; shortCode: string }[] = [
  { code: 'am', label: 'Amharic', shortCode: 'AM' },
  { code: 'en', label: 'English', shortCode: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', shortCode: 'OM' },
];

export const PublicNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();

  const navigate = useNavigate();
  const location = useLocation();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'tour_operator' || user.role === 'finance_manager');

  const { items: cartItems, openCart } = useCartStore();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
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

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleIssueClick = () => {
    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
    } else {
      setIsIssueModalOpen(true);
    }
  };

  const handleCartClick = () => {
    if (!isAuthenticated) {
      setIsLoginPromptOpen(true);
    } else {
      openCart();
    }
  };

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
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div className="flex-between pub-nav-container">
          {/* Brand Logo */}
          <Link to="/" className="flex-center pub-nav-brand" style={{ gap: '0.5rem', textDecoration: 'none', flexShrink: 0 }}>
            <div
              className="flex-center text-gradient"
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary-light)',
                flexShrink: 0,
              }}
            >
              <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <div className="pub-nav-brand-title">
                MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </div>
              <div className="pub-nav-brand-subtitle">
                Ethiopian Tourism & Travel
              </div>
            </div>
          </Link>

          {/* Navigation Links — desktop only */}
          <nav
            className="pub-nav-desktop"
            style={{
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

            {/* Support / Issue Tickets Button — visible only when authenticated */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleIssueClick}
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
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="flex-center pub-nav-actions" style={{ gap: '0.4rem', flexShrink: 0 }}>
            {/* ── 1. Hamburger toggle (mobile only) ── */}
            <button
              type="button"
              className="pub-nav-mobile-toggle tms-btn-ghost"
              onClick={() => setIsMobileMenuOpen((v) => !v)}
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
              }}
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* ── 2. Language Popover ── */}
            <div ref={langMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  padding: '0.3rem 0.55rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Languages size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>{activeLangObj.shortCode}</span>
              </button>

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

            {/* ── 3. Theme Toggle ── */}
            <button
              onClick={toggleTheme}
              className="tms-btn-ghost flex-center"
              style={{ width: 34, height: 34, borderRadius: '50%', color: 'var(--text-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
            </button>

            {/* In-App Notifications Dropdown (when authenticated) */}
            {isAuthenticated && user && (
              <NotificationPopover role="customer" />
            )}

            {/* Shopping Cart — visible only when authenticated */}
            {isAuthenticated && (
              <button
                onClick={handleCartClick}
                className="flex-center"
                style={{
                  position: 'relative',
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-tertiary)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                title="View Cart & Multi-Item Checkout"
              >
                <ShoppingBag size={15} />
                {cartItemCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      backgroundColor: '#ef4444',
                      color: '#ffffff',
                      fontSize: '9px',
                      fontWeight: 800,
                      width: 16,
                      height: 16,
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
            )}

            {/* ── AUTH SECTION ── */}
            {isAuthenticated && user ? (
              <div className="flex-center" style={{ gap: '0.4rem' }}>
                {/* Admin Portal Button — visible only to admin roles */}
                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="pub-nav-admin-btn hide-md"
                    icon={<LayoutDashboard size={14} />}
                    onClick={() => navigate('/admin/dashboard')}
                  >
                    Admin
                  </Button>
                )}

                {/* User Avatar — clicking avatar/name → dashboard, chevron → dropdown */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
                    {/* Avatar + name → navigate to dashboard */}
                    <button
                      type="button"
                      onClick={() => navigate('/user/dashboard')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.25rem 0.5rem 0.25rem 0.25rem',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      <img
                        src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                        alt={user.name}
                        style={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--brand-primary)',
                        }}
                      />
                      <span className="hide-md" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    {/* Chevron → toggle dropdown */}
                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.35rem 0.4rem',
                        background: 'none',
                        border: 'none',
                        borderLeft: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <ChevronDown
                        size={13}
                        style={{
                          transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                          transition: 'transform 0.15s ease',
                        }}
                      />
                    </button>
                  </div>

                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 10px)',
                        right: 0,
                        width: '220px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                        overflow: 'hidden',
                        zIndex: 200,
                      }}
                    >
                      {/* User Info — clickable → dashboard */}
                      <div
                        onClick={() => { setIsUserMenuOpen(false); navigate('/user/dashboard'); }}
                        style={{
                          padding: '1rem',
                          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(6,182,212,0.08))',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                          transition: 'filter 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.filter = 'brightness(0.96)')}
                        onMouseLeave={(e) => (e.currentTarget.style.filter = 'none')}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                            alt={user.name}
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)', flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.email}
                            </div>
                            <div
                              style={{
                                marginTop: '0.3rem',
                                fontSize: '10px',
                                fontWeight: 700,
                                color: 'var(--brand-primary)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.06em',
                              }}
                            >
                              Role: {user.role.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Menu links */}
                      <div style={{ padding: '0.35rem 0' }}>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); navigate('/admin/dashboard'); }}
                            style={menuItemStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <LayoutDashboard size={15} style={{ color: 'var(--brand-primary)' }} />
                            <span>Admin Portal</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/dashboard'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <UserCircle size={15} />
                          <span>My Dashboard</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/my-bookings'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Ticket size={15} />
                          <span>My Bookings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/profile'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Settings size={15} style={{ color: 'var(--brand-primary)' }} />
                          <span>Profile & Settings</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/reviews'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Star size={15} />
                          <span>My Reviews</span>
                        </button>

                        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.35rem 0' }} />

                        <button
                          type="button"
                          onClick={handleSignOut}
                          style={{
                            ...menuItemStyle,
                            color: '#ef4444',
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest: Show enhanced Sign In button on Desktop only (hidden on mobile) */
              <div className="pub-nav-signin-desktop hide-md">
                <Button
                  variant="primary"
                  size="sm"
                  icon={<LogIn size={15} />}
                  onClick={() => navigate('/login?mode=signin')}
                  style={{
                    fontWeight: 700,
                    padding: '0.45rem 1.15rem',
                    borderRadius: 'var(--radius-full)',
                    boxShadow: '0 2px 10px rgba(37, 99, 235, 0.25)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                  }}
                >
                  {t('sign_in')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* HOW CAN WE HELP YOU – Issue Ticket Modal */}
      <RaiseIssueModal isOpen={isIssueModalOpen} onClose={() => setIsIssueModalOpen(false)} />

      {/* LOGIN REQUIRED PROMPT MODAL FOR GUESTS */}
      {isLoginPromptOpen && (
        <div
          onClick={() => setIsLoginPromptOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '440px',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              padding: '2rem',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <button
              type="button"
              onClick={() => setIsLoginPromptOpen(false)}
              style={{
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
              }}
            >
              <X size={20} />
            </button>

            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'rgba(37,99,235,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
                color: 'var(--brand-primary)',
              }}
            >
              <Lock size={30} />
            </div>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>
              Authentication Required
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              You need an active traveler account to submit support tickets, manage your travel cart, and track booking vouchers.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Button
                variant="primary"
                icon={<LogIn size={16} />}
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  navigate('/login?mode=signin');
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Sign In to Your Account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  navigate('/login?mode=signup');
                }}
                style={{ width: '100%', justifyContent: 'center' }}
              >
                Create New Traveler Account
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Drawer Modal */}
      <CartDrawer />

      {/* ── MOBILE FULL-SCREEN DRAWER (Sign In is placed prominently inside here) ── */}
      <div className={`pub-nav-mobile-menu${isMobileMenuOpen ? ' open' : ''}`}>

        {/* Nav Links */}
        <NavLink to="/" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <Home size={18} /> {t('home')}
        </NavLink>
        <NavLink to="/tours" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <Compass size={18} /> {t('explore_tours')}
        </NavLink>
        <NavLink to="/events" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <Calendar size={18} /> {t('events')}
        </NavLink>
        <NavLink to="/blog" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <BookOpen size={18} /> {t('blog')}
        </NavLink>
        <NavLink to="/plan-trip" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Plan Custom Trip
        </NavLink>
        <NavLink to="/contact" className={({ isActive }) => `pub-nav-mobile-link${isActive ? ' active' : ''}`}>
          <PhoneCall size={18} /> Contact & FAQ
        </NavLink>
        {isAuthenticated && (
          <button
            type="button"
            className="pub-nav-mobile-link"
            onClick={() => { setIsMobileMenuOpen(false); handleIssueClick(); }}
          >
            <HelpCircle size={18} /> {t('issue_tickets')}
          </button>
        )}

        <div className="pub-nav-mobile-divider" />

        {/* Language selector */}
        <div style={{ padding: '0.5rem 1rem' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.5rem' }}>Language</div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {LANGUAGE_OPTIONS.map((l) => (
              <button
                key={l.code}
                type="button"
                onClick={() => { setLanguage(l.code); setIsMobileMenuOpen(false); }}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  border: '1px solid var(--border-color)',
                  backgroundColor: l.code === currentLanguage ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                  color: l.code === currentLanguage ? '#fff' : 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          type="button"
          className="pub-nav-mobile-link"
          onClick={() => { toggleTheme(); }}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>

        {/* Cart (authenticated) */}
        {isAuthenticated && (
          <button
            type="button"
            className="pub-nav-mobile-link"
            onClick={() => { setIsMobileMenuOpen(false); openCart(); }}
          >
            <ShoppingBag size={18} />
            Cart{cartItemCount > 0 && (
              <span style={{ backgroundColor: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 800, padding: '0.1rem 0.4rem', borderRadius: 'var(--radius-full)', marginLeft: '0.25rem' }}>
                {cartItemCount}
              </span>
            )}
          </button>
        )}

        <div className="pub-nav-mobile-divider" />

        {/* Auth section */}
        {isAuthenticated && user ? (
          <>
            {/* User info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '0.25rem' }}>
              <img
                src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                alt={user.name}
                style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
              />
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{user.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                className="pub-nav-mobile-link"
                onClick={() => { setIsMobileMenuOpen(false); navigate('/admin/dashboard'); }}
              >
                <LayoutDashboard size={18} style={{ color: 'var(--brand-primary)' }} /> Admin Portal
              </button>
            )}
            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { setIsMobileMenuOpen(false); navigate('/user/dashboard'); }}
            >
              <UserCircle size={18} style={{ color: 'var(--brand-primary)' }} /> My Dashboard
            </button>
            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { setIsMobileMenuOpen(false); navigate('/my-bookings'); }}
            >
              <Ticket size={18} style={{ color: 'var(--brand-primary)' }} /> My Bookings
            </button>
            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { setIsMobileMenuOpen(false); navigate('/user/profile'); }}
            >
              <Settings size={18} style={{ color: 'var(--brand-primary)' }} /> Profile & Settings
            </button>
            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { setIsMobileMenuOpen(false); navigate('/user/reviews'); }}
            >
              <Star size={18} style={{ color: 'var(--brand-primary)' }} /> My Reviews
            </button>

            <div className="pub-nav-mobile-divider" />

            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { setIsMobileMenuOpen(false); logout(); navigate('/'); }}
              style={{ color: '#ef4444' }}
            >
              <LogOut size={18} /> Sign Out
            </button>
          </>
        ) : (
          /* Guest: Prominent Sign In and Sign Up buttons inside mobile drawer */
          <div className="pub-nav-mobile-auth">
            <Button
              variant="primary"
              size="lg"
              icon={<LogIn size={18} />}
              onClick={() => { setIsMobileMenuOpen(false); navigate('/login?mode=signin'); }}
              style={{ width: '100%', justifyContent: 'center', fontWeight: 700 }}
            >
              {t('sign_in')}
            </Button>
            <Button
              variant="outline"
              size="md"
              icon={<UserPlus size={16} />}
              onClick={() => { setIsMobileMenuOpen(false); navigate('/login?mode=signup'); }}
              style={{ width: '100%', justifyContent: 'center', fontWeight: 600 }}
            >
              Create New Account
            </Button>
          </div>
        )}
      </div>
    </>
  );
};

const menuItemStyle: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  padding: '0.6rem 1rem',
  fontSize: 'var(--font-size-xs)',
  fontWeight: 500,
  color: 'var(--text-primary)',
  backgroundColor: 'transparent',
  border: 'none',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '0.6rem',
  transition: 'background-color 0.12s ease',
};

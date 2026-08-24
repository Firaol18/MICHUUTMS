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
  X,
  Menu,
  Home,
  UserCircle,
  Star,
  Settings,
  UserPlus,
  Search,
  Heart,
  FileText,
  MessageSquare,
  CornerDownLeft,
} from 'lucide-react';
import { Button } from '@tms/shared/components/common/Button';
import { RaiseIssueModal } from '@tms/shared/components/common/RaiseIssueModal';
import { CartDrawer } from '@tms/shared/components/cart/CartDrawer';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useWishlistStore } from '@tms/shared/store/useWishlistStore';
import { NotificationPopover } from '@tms/shared/components/common/NotificationPopover';

const LANGUAGE_OPTIONS: { code: LanguageCode; label: string; shortCode: string }[] = [
  { code: 'am', label: 'Amharic (አማርኛ)', shortCode: 'AM' },
  { code: 'en', label: 'English', shortCode: 'EN' },
  { code: 'om', label: 'Afaan Oromoo', shortCode: 'OM' },
];

export const PublicNavbar: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const { wishlist } = useWishlistStore();

  const navigate = useNavigate();
  const location = useLocation();

  // Modals & Menus State
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navbar Quick Search State
  const [navSearchQuery, setNavSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  // Refs for click outside
  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'tour_operator' || user.role === 'finance_manager');

  const { items: cartItems, openCart } = useCartStore();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // Close mobile menu and dropdowns on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMoreMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsLangMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(target)) {
        setIsUserMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeLangObj = LANGUAGE_OPTIONS.find((l) => l.code === currentLanguage) || LANGUAGE_OPTIONS[1];

  const handleNavSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!navSearchQuery.trim()) return;
    navigate(`/tours?search=${encodeURIComponent(navSearchQuery.trim())}`);
    setNavSearchQuery('');
  };

  const handleSignOut = () => {
    setIsUserMenuOpen(false);
    logout();
    navigate('/');
  };

  const handleIssueClick = () => {
    setIsMoreMenuOpen(false);
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

  const getNavLinkStyle = (isActive: boolean): React.CSSProperties => ({
    fontWeight: isActive ? 700 : 500,
    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
    fontSize: 'var(--font-size-xs)',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.35rem',
    padding: '0.4rem 0.7rem',
    borderRadius: 'var(--radius-full)',
    backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
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
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          height: '68px',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          maxWidth: '100vw',
          boxSizing: 'border-box',
        }}
      >
        <div
          className="pub-nav-container"
          style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '0 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          {/* ── Left: Brand Identity ── */}
          <Link to="/" className="flex-center pub-nav-brand" style={{ gap: '0.625rem', textDecoration: 'none', flexShrink: 0 }}>
            <div
              className="flex-center text-gradient"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--brand-primary-light), rgba(6,182,212,0.15))',
                border: '1px solid var(--border-color)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                flexShrink: 0,
              }}
            >
              <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div>
              <div className="pub-nav-brand-title" style={{ fontSize: '1.05rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </div>
              <div className="pub-nav-brand-subtitle" style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Ethiopian Tourism Portal
              </div>
            </div>
          </Link>

          {/* ── Center-Left: Streamlined Primary Navigation (Desktop) ── */}
          <nav
            className="pub-nav-desktop"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              flexShrink: 0,
            }}
          >
            <NavLink to="/" style={({ isActive }) => getNavLinkStyle(isActive)}>
              {t('home')}
            </NavLink>

            <NavLink to="/tours" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Compass size={14} /> Tours
            </NavLink>

            <NavLink to="/events" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Calendar size={14} /> Events
            </NavLink>

            <NavLink to="/plan-trip" style={({ isActive }) => getNavLinkStyle(isActive)}>
              <Sparkles size={14} style={{ color: '#f59e0b' }} /> Custom Trip
            </NavLink>

            {/* "More Resources & Support" Dropdown */}
            <div ref={moreMenuRef} style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                style={{
                  ...getNavLinkStyle(
                    isMoreMenuOpen ||
                    location.pathname.startsWith('/blog') ||
                    location.pathname.startsWith('/contact') ||
                    location.pathname.startsWith('/faq')
                  ),
                  background: isMoreMenuOpen ? 'var(--bg-tertiary)' : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                <span>More</span>
                <ChevronDown
                  size={13}
                  style={{
                    transform: isMoreMenuOpen ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.15s ease',
                  }}
                />
              </button>

              {isMoreMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    width: '230px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.16)',
                    overflow: 'hidden',
                    zIndex: 200,
                    padding: '0.4rem',
                  }}
                >
                  <Link
                    to="/blog"
                    onClick={() => setIsMoreMenuOpen(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <BookOpen size={16} style={{ color: 'var(--brand-primary)' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Travel Blog</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Guides, culture & itineraries</div>
                    </div>
                  </Link>

                  <Link
                    to="/contact"
                    onClick={() => setIsMoreMenuOpen(false)}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <PhoneCall size={16} style={{ color: '#10b981' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Contact & FAQ</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Travel inquiries & help</div>
                    </div>
                  </Link>

                  {isAuthenticated && (
                    <Link
                      to="/user/wishlist"
                      onClick={() => setIsMoreMenuOpen(false)}
                      style={dropdownItemStyle}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <Heart size={16} style={{ color: '#ef4444' }} />
                      <div>
                        <div style={{ fontWeight: 700 }}>Saved Wishlist</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{wishlist.length} saved tours</div>
                      </div>
                    </Link>
                  )}

                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.3rem 0' }} />

                  <button
                    type="button"
                    onClick={handleIssueClick}
                    style={{
                      ...dropdownItemStyle,
                      border: 'none',
                      width: '100%',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <HelpCircle size={16} style={{ color: '#8b5cf6' }} />
                    <div>
                      <div style={{ fontWeight: 700 }}>Support & Helpdesk</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Submit or track tickets</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </nav>

          {/* ── Center-Right: Integrated Quick Destination Search Bar (Desktop) ── */}
          <form
            onSubmit={handleNavSearchSubmit}
            className="hide-md"
            style={{
              flex: 1,
              maxWidth: isSearchFocused ? '320px' : '260px',
              transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${isSearchFocused ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                padding: '0.35rem 0.75rem',
                boxShadow: isSearchFocused ? '0 0 0 3px rgba(37,99,235,0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <Search size={15} style={{ color: isSearchFocused ? 'var(--brand-primary)' : 'var(--text-muted)', marginRight: '0.4rem', flexShrink: 0 }} />
              <input
                type="text"
                value={navSearchQuery}
                onChange={(e) => setNavSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                placeholder="Search destinations, tours..."
                style={{
                  border: 'none',
                  background: 'none',
                  outline: 'none',
                  width: '100%',
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-primary)',
                }}
              />
              {navSearchQuery ? (
                <button
                  type="button"
                  onClick={() => setNavSearchQuery('')}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}
                >
                  <X size={13} />
                </button>
              ) : (
                <span
                  style={{
                    fontSize: '9px',
                    fontWeight: 700,
                    color: 'var(--text-muted)',
                    backgroundColor: 'var(--bg-primary)',
                    padding: '2px 5px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1px',
                  }}
                >
                  <CornerDownLeft size={8} />
                </span>
              )}
            </div>
          </form>

          {/* ── Right Side Actions ── */}
          <div className="flex-center pub-nav-actions" style={{ gap: '0.45rem', flexShrink: 0 }}>
            {/* 1. Hamburger toggle (mobile only) */}
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

            {/* 2. Language Selector */}
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
                  padding: '0.35rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.15s ease',
                }}
              >
                <Languages size={14} style={{ color: 'var(--brand-primary)' }} />
                <span>{activeLangObj.shortCode}</span>
                <ChevronDown size={11} style={{ opacity: 0.6 }} />
              </button>

              {isLangMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '160px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
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
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)',
                          backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'block',
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {l.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="tms-btn-ghost flex-center"
              style={{ width: 34, height: 34, borderRadius: '50%', color: 'var(--text-secondary)' }}
              title="Toggle light / dark mode"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
            </button>

            {/* 4. In-App Notifications (when authenticated) */}
            {isAuthenticated && user && (
              <NotificationPopover role="customer" />
            )}

            {/* 5. Shopping Cart (when authenticated) */}
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
                title="View Saved Trips & Cart"
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

            {/* ── 6. Auth Section ── */}
            {isAuthenticated && user ? (
              <div className="flex-center" style={{ gap: '0.4rem' }}>
                {/* Admin Portal shortcut button */}
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

                {/* User Avatar + Dropdown Pill */}
                <div ref={userMenuRef} style={{ position: 'relative' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      borderRadius: 'var(--radius-full)',
                      backgroundColor: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-color)',
                      overflow: 'hidden',
                      transition: 'border-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--brand-primary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-color)')}
                  >
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
                      <span className="hide-md" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        {user.name.split(' ')[0]}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '0.35rem 0.45rem',
                        background: 'none',
                        border: 'none',
                        borderLeft: '1px solid var(--border-color)',
                        cursor: 'pointer',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      <ChevronDown
                        size={12}
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
                        width: '230px',
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '12px',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                        overflow: 'hidden',
                        zIndex: 200,
                      }}
                    >
                      {/* User Info Header */}
                      <div
                        onClick={() => { setIsUserMenuOpen(false); navigate('/user/dashboard'); }}
                        style={{
                          padding: '0.875rem 1rem',
                          background: 'linear-gradient(135deg, rgba(37,99,235,0.06), rgba(6,182,212,0.08))',
                          borderBottom: '1px solid var(--border-color)',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <img
                            src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                            alt={user.name}
                            style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)', flexShrink: 0 }}
                          />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.name}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {user.email}
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
                          <Ticket size={15} style={{ color: '#10b981' }} />
                          <span>My Bookings & Tickets</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/invoices'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <FileText size={15} style={{ color: 'var(--brand-primary)' }} />
                          <span>Invoices & Receipts</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/issues'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <MessageSquare size={15} style={{ color: '#8b5cf6' }} />
                          <span>Support Tickets</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/profile'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Settings size={15} />
                          <span>Profile & Settings</span>
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
              /* Guest Actions */
              <div className="flex-center hide-md" style={{ gap: '0.4rem' }}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/login?mode=signin')}
                  style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)' }}
                >
                  {t('sign_in')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<UserPlus size={13} />}
                  onClick={() => navigate('/login?mode=signup')}
                  style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)' }}
                >
                  {t('sign_up')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Support / Raise Issue Modal */}
      <RaiseIssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
      />

      {/* Shopping Cart Drawer */}
      <CartDrawer />

      {/* ── Mobile Navigation Drawer ── */}
      {isMobileMenuOpen && (
        <>
          <div
            className="pub-nav-mobile-backdrop"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="pub-nav-mobile-menu open">
            <div className="flex-between pub-nav-mobile-header" style={{ marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
                <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)' }}>MICHUU TMS</span>
              </div>
              <button
                type="button"
                className="tms-btn-ghost flex-center"
                onClick={() => setIsMobileMenuOpen(false)}
                style={{ width: 32, height: 32, borderRadius: '50%' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Mobile Search Input */}
            <form
              onSubmit={(e) => {
                handleNavSearchSubmit(e);
                setIsMobileMenuOpen(false);
              }}
              style={{ padding: '0.25rem 0 0.5rem 0' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  padding: '0.5rem 0.75rem',
                }}
              >
                <Search size={16} style={{ color: 'var(--text-muted)', marginRight: '0.5rem' }} />
                <input
                  type="text"
                  value={navSearchQuery}
                  onChange={(e) => setNavSearchQuery(e.target.value)}
                  placeholder="Search tours & destinations..."
                  style={{
                    border: 'none',
                    background: 'none',
                    outline: 'none',
                    width: '100%',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                  }}
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <nav className="pub-nav-mobile-links">
              <NavLink
                to="/"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Home size={18} /> {t('home')}
              </NavLink>

              <NavLink
                to="/tours"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Compass size={18} /> {t('explore_tours')}
              </NavLink>

              <NavLink
                to="/events"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Calendar size={18} /> {t('events')}
              </NavLink>

              <NavLink
                to="/plan-trip"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Plan Custom Trip
              </NavLink>

              <NavLink
                to="/blog"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <BookOpen size={18} /> Travel Blog
              </NavLink>

              <NavLink
                to="/contact"
                className={({ isActive }) => `pub-nav-mobile-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <PhoneCall size={18} /> Contact & FAQ
              </NavLink>

              {/* Support Ticket button */}
              <button
                type="button"
                className="pub-nav-mobile-link"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  handleIssueClick();
                }}
              >
                <HelpCircle size={18} style={{ color: '#8b5cf6' }} /> Support & Helpdesk
              </button>
            </nav>

            <div className="pub-nav-mobile-divider" />

            {/* Theme Toggle in Mobile */}
            <button
              type="button"
              className="pub-nav-mobile-link"
              onClick={() => { toggleTheme(); }}
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
              {theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            </button>

            {/* Cart */}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', marginBottom: '0.25rem' }}>
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                    alt={user.name}
                    style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
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
                  <Ticket size={18} style={{ color: '#10b981' }} /> My Bookings & Tickets
                </button>
                <button
                  type="button"
                  className="pub-nav-mobile-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/user/invoices'); }}
                >
                  <FileText size={18} style={{ color: 'var(--brand-primary)' }} /> Invoices & Receipts
                </button>
                <button
                  type="button"
                  className="pub-nav-mobile-link"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/user/profile'); }}
                >
                  <Settings size={18} /> Profile & Settings
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
              <div className="pub-nav-mobile-auth" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '0.75rem 1rem' }}>
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
                  Create Account
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

const dropdownItemStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
  padding: '0.6rem 0.75rem',
  borderRadius: '8px',
  textDecoration: 'none',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-xs)',
  transition: 'background-color 0.15s ease',
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

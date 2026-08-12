import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { useUIStore } from '@/store/useUIStore';
import { useLanguageStore } from '@/store/useLanguageStore';
import { useNotificationStore } from '@/store/useNotificationStore';
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
  ChevronDown,
  Bell,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  Lock,
  X,
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
  const { user, logout, isAuthenticated } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const { currentLanguage, setLanguage, t } = useLanguageStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();

  const navigate = useNavigate();
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isLoginPromptOpen, setIsLoginPromptOpen] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifMenuOpen, setIsNotifMenuOpen] = useState(false);

  const langMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const notifMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = user && (user.role === 'admin' || user.role === 'tour_operator' || user.role === 'finance_manager');

  const { items: cartItems, openCart } = useCartStore();
  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  // User specific notifications
  const userNotifs = user
    ? notifications.filter((n) => n.userEmail.toLowerCase() === user.email.toLowerCase())
    : [];
  const unreadCount = userNotifs.filter((n) => !n.isRead).length;

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setIsLangMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
      if (notifMenuRef.current && !notifMenuRef.current.contains(event.target as Node)) {
        setIsNotifMenuOpen(false);
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

          {/* Navigation Links */}
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

            {/* Support / Issue Tickets Button */}
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
          </nav>

          {/* Right Side Actions */}
          <div className="flex-center" style={{ gap: '0.5rem', flexShrink: 0 }}>
            {/* Language Popover */}
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

            {/* In-App Notifications Dropdown (when authenticated) */}
            {isAuthenticated && user && (
              <div ref={notifMenuRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => setIsNotifMenuOpen(!isNotifMenuOpen)}
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
                  title="In-App Notifications"
                >
                  <Bell size={16} />
                  {unreadCount > 0 && (
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
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Popover */}
                {isNotifMenuOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      width: '320px',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '12px',
                      boxShadow: '0 12px 36px rgba(0,0,0,0.2)',
                      overflow: 'hidden',
                      zIndex: 200,
                    }}
                  >
                    {/* Header */}
                    <div
                      className="flex-between"
                      style={{
                        padding: '0.875rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-tertiary)',
                      }}
                    >
                      <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        Notifications ({userNotifs.length})
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllAsRead(user.email)}
                          style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '11px',
                            color: 'var(--brand-primary)',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.2rem',
                          }}
                        >
                          <Check size={12} /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Items List */}
                    <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {userNotifs.length === 0 ? (
                        <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        userNotifs.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              setIsNotifMenuOpen(false);
                              if (n.link) navigate(n.link);
                            }}
                            style={{
                              padding: '0.875rem 1rem',
                              borderBottom: '1px solid var(--border-color)',
                              backgroundColor: n.isRead ? 'transparent' : 'rgba(37,99,235,0.05)',
                              cursor: 'pointer',
                              transition: 'background-color 0.15s ease',
                              display: 'flex',
                              gap: '0.75rem',
                              alignItems: 'flex-start',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = n.isRead ? 'transparent' : 'rgba(37,99,235,0.05)')}
                          >
                            <div style={{ marginTop: '2px', flexShrink: 0 }}>
                              {n.type === 'issue_resolved' ? (
                                <CheckCircle2 size={16} style={{ color: '#10b981' }} />
                              ) : n.type === 'issue_rejected' ? (
                                <XCircle size={16} style={{ color: '#ef4444' }} />
                              ) : (
                                <Clock size={16} style={{ color: 'var(--brand-primary)' }} />
                              )}
                            </div>
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: n.isRead ? 600 : 700, color: 'var(--text-primary)' }}>
                                {n.title}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.15rem', lineHeight: 1.4 }}>
                                {n.message}
                              </div>
                              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                                {n.timestamp}
                              </div>
                            </div>
                            {!n.isRead && (
                              <div
                                style={{
                                  width: 7,
                                  height: 7,
                                  borderRadius: '50%',
                                  backgroundColor: 'var(--brand-primary)',
                                  flexShrink: 0,
                                  marginTop: '5px',
                                }}
                              />
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Shopping Cart */}
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

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="tms-btn-ghost flex-center"
              style={{ width: 34, height: 34, borderRadius: '50%', color: 'var(--text-secondary)' }}
              title="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} style={{ color: '#f59e0b' }} />}
            </button>

            {/* ── AUTH SECTION ── */}
            {isAuthenticated && user ? (
              <div className="flex-center" style={{ gap: '0.4rem' }}>
                {/* Admin Portal Button — visible only to admin roles */}
                {isAdmin && (
                  <Button
                    variant="primary"
                    size="sm"
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
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
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
                        padding: '0.25rem 0.5rem 0.25rem 0',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        borderLeft: '1px solid var(--border-color)',
                      }}
                    >
                      <ChevronDown
                        size={14}
                        style={{
                          color: 'var(--text-muted)',
                          transform: isUserMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: 'transform 0.2s ease',
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
                        width: '210px',
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
                                backgroundColor: 'var(--brand-primary-light)',
                                padding: '0.15rem 0.4rem',
                                borderRadius: 'var(--radius-full)',
                                display: 'inline-block',
                              }}
                            >
                              {user.role.replace('_', ' ')}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Admin Portal link — only for admin roles */}
                      {isAdmin && (
                        <div style={{ padding: '0.4rem 0', borderBottom: '1px solid var(--border-color)' }}>
                          <button
                            type="button"
                            onClick={() => { setIsUserMenuOpen(false); navigate('/admin/dashboard'); }}
                            style={menuItemStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                          >
                            <LayoutDashboard size={15} style={{ color: 'var(--brand-primary)' }} />
                            Admin Portal
                          </button>
                        </div>
                      )}

                      {/* Tour History + Sign Out */}
                      <div style={{ padding: '0.4rem 0' }}>
                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/my-bookings'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <Ticket size={15} style={{ color: 'var(--brand-primary)' }} />
                          Tour History
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsUserMenuOpen(false); navigate('/user/issues'); }}
                          style={menuItemStyle}
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          <HelpCircle size={15} style={{ color: 'var(--brand-primary)' }} />
                          Support Tickets
                        </button>
                      </div>

                      <div style={{ padding: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                        <button
                          type="button"
                          onClick={handleSignOut}
                          style={{ ...menuItemStyle, color: '#ef4444', width: '100%', borderRadius: '8px' }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Guest: Show Sign In + Sign Up buttons */
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
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>

            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'rgba(37,99,235,0.1)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto',
              }}
            >
              <Lock size={28} />
            </div>

            <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Sign In Required
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              Please sign in to raise a support ticket and track real-time resolution updates from our concierge team.
            </p>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  navigate('/login?mode=signup');
                }}
              >
                Create Account
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setIsLoginPromptOpen(false);
                  navigate('/login?mode=signin');
                }}
              >
                Sign In Now
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Item Shopping Cart Drawer */}
      <CartDrawer />
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

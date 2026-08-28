import React, { useState, useEffect, useMemo } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { useUIStore } from '@tms/shared/store/useUIStore';
import { isCorporateRole } from '@tms/shared/types/rbac';
import {
  corporateService,
  type ApiCompany,
} from '@tms/shared/services/corporateService';
import {
  LayoutDashboard,
  ListOrdered,
  CheckSquare,
  Users,
  ShieldCheck,
  Plane,
  Hotel,
  Building2,
  BarChart3,
  LogOut,
  CreditCard,
  Sun,
  Moon,
  Compass,
  ChevronDown,
  UserCircle,
} from 'lucide-react';
import { Button } from '@tms/shared/components/common/Button';
import { getTravelerAvatar } from '@tms/shared/utils/avatar';
import { MandatoryPasswordChangeModal } from '@tms/shared/components/auth/MandatoryPasswordChangeModal';

export const CorporateLayout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const navigate = useNavigate();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [company, setCompany] = useState<ApiCompany | null>(null);
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchLayoutData = async () => {
      if (!user) return;
      try {
        const rawCid = user.companyId;
        const compList = await corporateService.getCompanies({ limit: 50 });
        const matched = compList.items.find(
          (c) => c.id === rawCid || (user.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
        );

        if (matched && isMounted) {
          setCompany(matched);
          const reqs = await corporateService.getTravelRequests(matched.id, { limit: 100 });
          const pending = reqs.items.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(r.status));
          if (isMounted) setPendingApprovalsCount(pending.length);
        } else if (isMounted && user.companyName) {
          setCompany({
            id: user.companyId || 'comp-custom',
            name: user.companyName,
            code: 'CORP',
            isActive: true,
            annualTravelBudget: 250000,
            currency: 'USD',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as any);
        }
      } catch {}
    };

    fetchLayoutData();
    return () => { isMounted = false; };
  }, [user?.companyId, user?.companyName]);

  if (!user || !isCorporateRole(user.role)) {
    return null;
  }

  const companyName = company?.name || user.companyName || 'Corporate Workspace';
  const availableBudget = Number(company?.annualTravelBudget) || 250000;
  const userRole = user.role as string;
  const isManagerOrAdmin = userRole === 'CORPORATE_ADMIN' || userRole === 'TRAVEL_MANAGER';
  const isApprover = userRole === 'APPROVER';

  // Sidebar Links in the exact clean structure requested:
  // Company Dashboard, Bookings, Flights, Hotels, Approvals, Employees, Travel Policy, Reports
  const sidebarLinks = [
    {
      to: '/corporate/dashboard',
      label: 'Company Dashboard',
      icon: <LayoutDashboard size={17} />,
      show: true,
    },
    {
      to: '/corporate/bookings',
      label: 'Bookings',
      icon: <ListOrdered size={17} />,
      show: true,
    },
    {
      to: '/corporate/book-flight',
      label: 'Flights',
      icon: <Plane size={17} />,
      show: true,
    },
    {
      to: '/corporate/book-hotel',
      label: 'Hotels',
      icon: <Hotel size={17} />,
      show: true,
    },
    {
      to: '/corporate/approvals',
      label: 'Approvals',
      icon: <CheckSquare size={17} />,
      badge: (isManagerOrAdmin || isApprover) && pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
      show: isManagerOrAdmin || isApprover,
    },
    {
      to: '/corporate/employees',
      label: 'Employees',
      icon: <Users size={17} />,
      show: isManagerOrAdmin,
    },
    {
      to: '/corporate/policy',
      label: 'Travel Policy',
      icon: <ShieldCheck size={17} />,
      show: true,
    },
    {
      to: '/corporate/reports',
      label: 'Reports',
      icon: <BarChart3 size={17} />,
      show: true,
    },
  ].filter((item) => item.show);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.65rem 0.9rem',
    borderRadius: '10px',
    fontWeight: isActive ? 800 : 500,
    fontSize: 'var(--font-size-xs)',
    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
    backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
    border: `1px solid ${isActive ? 'rgba(37,99,235,0.2)' : 'transparent'}`,
    textDecoration: 'none',
    transition: 'all 0.15s ease',
  });

  const dropdownItemStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 0.6rem',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: 700,
    color: 'var(--text-primary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    width: '100%',
    textAlign: 'left',
    transition: 'background-color 0.15s ease',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* ── Left Corporate Workspace Sidebar ── */}
      <aside
        style={{
          width: '260px',
          flexShrink: 0,
          borderRight: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          zIndex: 50,
        }}
      >
        {/* Brand Header */}
        <div style={{ padding: '1.5rem 1.25rem 1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #2563eb, #06b6d4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
              }}
            >
              <Building2 size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.1 }}>
                MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </div>
              <div style={{ fontSize: '10px', color: 'var(--brand-primary)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', marginTop: '2px' }}>
                Corporate Travel
              </div>
            </div>
          </div>

          {/* Company Identity Chip */}
          <div
            style={{
              marginTop: '1rem',
              padding: '0.75rem 0.85rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderRadius: '10px',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {companyName}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.25rem', fontSize: '10px', color: 'var(--text-muted)' }}>
              <span>{userRole.replace('_', ' ')}</span>
              <span style={{ color: '#16a34a', fontWeight: 700 }}>Active Enterprise</span>
            </div>
          </div>
        </div>

        {/* Primary Corporate Menu */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', padding: '1rem 0.75rem', flex: 1 }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 0.5rem 0.4rem 0.5rem' }}>
            Workspace Menu
          </div>
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <span style={{ flexShrink: 0 }}>{link.icon}</span>
                <span>{link.label}</span>
              </div>
              {link.badge !== undefined && (
                <span
                  style={{
                    backgroundColor: '#f59e0b',
                    color: '#fff',
                    fontSize: '10px',
                    fontWeight: 900,
                    padding: '0.1rem 0.45rem',
                    borderRadius: '99px',
                  }}
                >
                  {link.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{ padding: '0.85rem 0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* Back to Travel Portal */}
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.55rem 0.75rem',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--bg-tertiary)',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            <Compass size={14} style={{ color: 'var(--brand-primary)' }} />
            <span>← Back to Travel Portal</span>
          </NavLink>

          {/* User Profile Pill & Sign Out */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.4rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
              <img
                src={getTravelerAvatar(user)}
                alt={user.name}
                style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--brand-primary)' }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 800, fontSize: '11px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.name}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Sign Out"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#ef4444',
                padding: '0.4rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main Corporate App Area ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Corporate Workspace Header */}
        <header
          style={{
            height: '64px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 2rem',
            position: 'sticky',
            top: 0,
            zIndex: 40,
          }}
        >
          {/* Left Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Corporate Workspace
            </span>
            <span style={{ color: 'var(--border-color)' }}>|</span>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              {companyName}
            </span>
          </div>

          {/* Right Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            {/* Credit Status Chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.75rem',
                backgroundColor: 'rgba(22,163,74,0.08)',
                border: '1px solid rgba(22,163,74,0.25)',
                borderRadius: '99px',
                fontSize: '11px',
                fontWeight: 800,
                color: '#16a34a',
              }}
            >
              <CreditCard size={13} />
              <span>Credit Available: ${availableBudget.toLocaleString()}</span>
            </div>

            {/* Theme Toggle */}
            <button

              type="button"
              onClick={toggleTheme}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>


            {/* Profile Avatar Pill & Dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.2rem 0.55rem 0.2rem 0.25rem',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                }}
              >
                <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                  <img
                    src={getTravelerAvatar(user)}
                    alt={user.name}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '1.5px solid var(--brand-primary)',
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      right: 0,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      border: '1px solid var(--bg-secondary)',
                    }}
                  />
                </div>
                <div style={{ textAlign: 'left', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '11px', fontWeight: 800, lineHeight: 1.1 }}>
                    {user.name.split(' ')[0]}
                  </span>
                  <span style={{ fontSize: '9px', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    {userRole.replace('_', ' ')}
                  </span>
                </div>
                <ChevronDown size={12} style={{ opacity: 0.6 }} />
              </button>

              {/* Dropdown Menu */}
              {isProfileMenuOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    width: '210px',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.18)',
                    zIndex: 100,
                    padding: '0.4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.15rem',
                  }}
                >
                  <div style={{ padding: '0.4rem 0.5rem 0.5rem 0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                      {user.name}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); navigate('/corporate/dashboard'); }}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LayoutDashboard size={14} /> Dashboard
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); navigate('/corporate/bookings'); }}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <ListOrdered size={14} /> My Bookings
                  </button>

                  <button
                    type="button"
                    onClick={() => { setIsProfileMenuOpen(false); navigate('/'); }}
                    style={dropdownItemStyle}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <Compass size={14} /> Back to Travel Portal
                  </button>

                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.2rem 0' }} />

                  <button
                    type="button"
                    onClick={handleLogout}
                    style={{ ...dropdownItemStyle, color: '#ef4444' }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <LogOut size={14} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Outlet */}
        <main style={{ flex: 1, padding: '2.5rem', overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>

      {/* Mandatory First-Login Password Change Modal */}
      <MandatoryPasswordChangeModal />
    </div>
  );
};

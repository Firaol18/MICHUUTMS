import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@tms/shared/store/useUIStore';
import {
  Gauge,
  Package,
  Users,
  ListOrdered,
  Building2,
  UserCheck,
  Bus,
  Car,
  CreditCard,
  Receipt,
  BarChart3,
  Settings,
  Shield,
  ShieldCheck,
  Key,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  ArrowLeft,
  PlusCircle,
  List,
  CalendarDays,
  BookOpen,
  Sparkles,
  FileText,
  LifeBuoy,
  MessageSquare,
  X,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const [tourPackagesExpanded, setTourPackagesExpanded] = useState(true);
  const location = useLocation();

  const isTourActive = location.pathname.startsWith('/tours');

  // Automatically close mobile sidebar when route changes
  useEffect(() => {
    setMobileSidebarOpen(false);
  }, [location.pathname, location.search, setMobileSidebarOpen]);

  // Lock body scrolling when mobile sidebar drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileSidebarOpen]);

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Gauge size={19} /> },
    { to: '/tours', label: 'Tours', icon: <Package size={19} /> },
    { to: '/bookings', label: 'Bookings', icon: <ListOrdered size={19} /> },
    { to: '/issues', label: 'Issue Management', icon: <LifeBuoy size={19} /> },
    { to: '/enquiries', label: 'Inquiries', icon: <MessageSquare size={19} /> },
    { to: '/custom-trips', label: 'Custom Trips', icon: <Sparkles size={19} /> },
    { to: '/events', label: 'Events & Festivals', icon: <CalendarDays size={19} /> },
    { to: '/blog', label: 'Travel Blog', icon: <BookOpen size={19} /> },
    { to: '/users', label: 'Customers', icon: <Users size={19} /> },
    { to: '/suppliers', label: 'Suppliers', icon: <Building2 size={19} /> },
    { to: '/guides', label: 'Guides', icon: <UserCheck size={19} /> },
    { to: '/drivers', label: 'Drivers', icon: <Bus size={19} /> },
    { to: '/vehicles', label: 'Vehicles', icon: <Car size={19} /> },
    { to: '/payments', label: 'Payments', icon: <CreditCard size={19} /> },
    { to: '/expenses', label: 'Expenses', icon: <Receipt size={19} /> },
    { to: '/reports', label: 'Reports', icon: <BarChart3 size={19} /> },
    { to: '/pages', label: 'CMS Pages', icon: <FileText size={19} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  const rbacItems = [
    { to: '/employees', label: 'Employee', icon: <Shield size={18} /> },
    { to: '/roles', label: 'Role', icon: <Shield size={18} /> },
    { to: '/permission-resources', label: 'Permission Resource', icon: <ShieldCheck size={18} /> },
    { to: '/permission-actions', label: 'Permission Action', icon: <Key size={18} /> },
  ];

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileSidebarOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        className={`admin-sidebar-aside${mobileSidebarOpen ? ' mobile-open' : ''}${sidebarCollapsed ? ' collapsed' : ''}`}
        style={{
          width: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          minWidth: sidebarCollapsed ? 'var(--sidebar-width-collapsed)' : 'var(--sidebar-width)',
          backgroundColor: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'sticky',
          top: 0,
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), width var(--transition-normal), min-width var(--transition-normal)',
          zIndex: 100,
        }}
      >
        {/* Brand Header */}
        <div
          className="flex-between"
          style={{
            height: 'var(--navbar-height)',
            padding: sidebarCollapsed ? '0 0.875rem' : '0 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
        >
          <div className="flex-center" style={{ gap: '0.75rem' }}>
            <div
              className="flex-center text-gradient"
              style={{
                width: 38,
                height: 38,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--brand-primary-light)',
                fontWeight: 800,
                flexShrink: 0,
              }}
            >
              <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
            </div>
            {(!sidebarCollapsed || mobileSidebarOpen) && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                  MICHUU <span style={{ color: 'var(--brand-primary)' }}>ADMIN</span>
                </span>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ethiopian Tourism Control
                </span>
              </div>
            )}
          </div>

          {/* Desktop collapse toggle */}
          <button
            onClick={toggleSidebar}
            className="admin-desktop-collapse-btn tms-btn-ghost flex-center"
            style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>

          {/* Mobile close button */}
          <button
            onClick={() => setMobileSidebarOpen(false)}
            className="admin-mobile-close-btn tms-btn-ghost flex-center"
            style={{ width: 32, height: 32, borderRadius: 'var(--radius-sm)', color: 'var(--text-primary)' }}
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

      {/* Navigation Links matching exact tree hierarchy */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>

        {!sidebarCollapsed && (
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.4rem 0.75rem 0.2rem 0.75rem' }}>
            ADMIN PORTAL
          </div>
        )}

        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
              transition: 'all var(--transition-fast)',
              textDecoration: 'none',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
            {!sidebarCollapsed && <span>{item.label}</span>}
          </NavLink>
        ))}

        {/* ── RBAC Authorization Governance Section (Display at Bottom) ── */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          {!sidebarCollapsed && (
            <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.25rem 0.75rem 0.25rem 0.75rem' }}>
              RBAC & PERMISSIONS
            </div>
          )}
          {rbacItems.map((r) => (
            <NavLink
              key={r.to}
              to={r.to}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.45rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: 'var(--font-size-sm)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
                textDecoration: 'none',
                transition: 'all var(--transition-fast)',
              })}
            >
              <span style={{ display: 'flex', alignItems: 'center' }}>{r.icon}</span>
              {!sidebarCollapsed && <span>{r.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Back to Public Portal Link */}
        <div style={{ paddingTop: '0.35rem' }}>
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.45rem 0.75rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-muted)',
              textDecoration: 'none',
            }}
          >
            <ArrowLeft size={16} />
            {!sidebarCollapsed && <span>Back to Public Portal</span>}
          </NavLink>
        </div>
      </nav>
    </aside>
    </>
  );
};


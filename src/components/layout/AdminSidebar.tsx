import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
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
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [tourPackagesExpanded, setTourPackagesExpanded] = useState(true);
  const location = useLocation();

  const isTourActive = location.pathname.startsWith('/admin/tours');

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Gauge size={19} /> },
    { to: '/admin/tours', label: 'Tours', icon: <Package size={19} /> },
    { to: '/admin/bookings', label: 'Bookings', icon: <ListOrdered size={19} /> },
    { to: '/admin/custom-trips', label: 'Custom Trips', icon: <Sparkles size={19} /> },
    { to: '/admin/events', label: 'Events & Festivals', icon: <CalendarDays size={19} /> },
    { to: '/admin/blog', label: 'Travel Blog', icon: <BookOpen size={19} /> },
    { to: '/admin/users', label: 'Customers', icon: <Users size={19} /> },
    { to: '/admin/suppliers', label: 'Suppliers', icon: <Building2 size={19} /> },
    { to: '/admin/guides', label: 'Guides', icon: <UserCheck size={19} /> },
    { to: '/admin/drivers', label: 'Drivers', icon: <Bus size={19} /> },
    { to: '/admin/vehicles', label: 'Vehicles', icon: <Car size={19} /> },
    { to: '/admin/payments', label: 'Payments', icon: <CreditCard size={19} /> },
    { to: '/admin/expenses', label: 'Expenses', icon: <Receipt size={19} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart3 size={19} /> },
    { to: '/admin/pages', label: 'CMS Pages', icon: <FileText size={19} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  const rbacItems = [
    { to: '/admin/employees', label: 'Employee', icon: <Shield size={18} /> },
    { to: '/admin/roles', label: 'Role', icon: <Shield size={18} /> },
    { to: '/admin/permission-resources', label: 'Permission Resource', icon: <ShieldCheck size={18} /> },
    { to: '/admin/permission-actions', label: 'Permission Action', icon: <Key size={18} /> },
  ];

  return (
    <aside
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
        transition: 'width var(--transition-normal), min-width var(--transition-normal)',
        zIndex: 10,
      }}
    >
        {/* Brand Header */}
        <div
          className="flex-between"
          style={{
            height: 'var(--navbar-height)',
            padding: sidebarCollapsed ? '0 0.5rem' : '0 1.25rem',
            borderBottom: '1px solid var(--border-color)',
            flexShrink: 0,
            gap: '0.5rem',
            justifyContent: sidebarCollapsed ? 'center' : 'space-between',
          }}
        >
          {sidebarCollapsed ? (
            /* Collapsed State: Centered clickable icon with Expand chevron badge */
            <button
              onClick={toggleSidebar}
              className="tms-btn-ghost"
              style={{
                width: 44,
                height: 44,
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: 0,
                position: 'relative',
              }}
              title="Click to Expand Sidebar"
              aria-label="Expand sidebar"
            >
              <div
                className="text-gradient"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary-light)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 2,
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                }}
              >
                <ChevronRight size={11} style={{ color: 'var(--brand-primary)' }} />
              </div>
            </button>
          ) : (
            /* Expanded State */
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0, flex: 1 }}>
                <div
                  className="text-gradient"
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--brand-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
                  <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', letterSpacing: '-0.02em', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2 }}>
                    MICHUU <span style={{ color: 'var(--brand-primary)' }}>ADMIN</span>
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.2, marginTop: 2 }}>
                    Ethiopian Tourism Control
                  </span>
                </div>
              </div>

              <button
                onClick={toggleSidebar}
                className="tms-btn-ghost"
                style={{ width: 30, height: 30, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                aria-label="Collapse sidebar"
                title="Collapse sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

      {/* Navigation Links matching exact tree hierarchy */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
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
  );
};

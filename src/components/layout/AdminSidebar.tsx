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
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [tourPackagesExpanded, setTourPackagesExpanded] = useState(true);
  const location = useLocation();

  const isTourActive = location.pathname.startsWith('/admin/tours');

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <Gauge size={19} /> },
    { to: '/admin/tours', label: 'Tours', icon: <Package size={19} />, isExpandable: true },
    { to: '/admin/bookings', label: 'Bookings', icon: <ListOrdered size={19} /> },
    { to: '/admin/users', label: 'Customers', icon: <Users size={19} /> },
    { to: '/admin/suppliers', label: 'Suppliers', icon: <Building2 size={19} /> },
    { to: '/admin/guides', label: 'Guides', icon: <UserCheck size={19} /> },
    { to: '/admin/drivers', label: 'Drivers', icon: <Bus size={19} /> },
    { to: '/admin/vehicles', label: 'Vehicles', icon: <Car size={19} /> },
    { to: '/admin/payments', label: 'Payments', icon: <CreditCard size={19} /> },
    { to: '/admin/expenses', label: 'Expenses', icon: <Receipt size={19} /> },
    { to: '/admin/reports', label: 'Reports', icon: <BarChart3 size={19} /> },
    { to: '/admin/settings', label: 'Settings', icon: <Settings size={19} /> },
  ];

  const rbacItems = [
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
          padding: sidebarCollapsed ? '0 0.875rem' : '0 1.25rem',
          borderBottom: '1px solid var(--border-color)',
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
            }}
          >
            <Compass size={22} style={{ color: 'var(--brand-primary)' }} />
          </div>
          {!sidebarCollapsed && (
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

        <button
          onClick={toggleSidebar}
          className="tms-btn-ghost flex-center"
          style={{ width: 28, height: 28, borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)' }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links matching exact tree hierarchy */}
      <nav style={{ flex: 1, padding: '0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>

        {!sidebarCollapsed && (
          <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0.4rem 0.75rem 0.2rem 0.75rem' }}>
            ADMIN PORTAL
          </div>
        )}

        {navItems.map((item) => {
          if (item.isExpandable) {
            return (
              <div key={item.to}>
                <div
                  onClick={() => setTourPackagesExpanded(!tourPackagesExpanded)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: sidebarCollapsed ? 'center' : 'space-between',
                    gap: '0.75rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isTourActive ? 700 : 500,
                    color: isTourActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    backgroundColor: isTourActive ? 'var(--brand-primary-light)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    {!sidebarCollapsed && <span>{item.label}</span>}
                  </div>
                  {!sidebarCollapsed && (
                    <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                      {tourPackagesExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </span>
                  )}
                </div>

                {/* Submenu for Tours */}
                {!sidebarCollapsed && tourPackagesExpanded && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', paddingLeft: '2.25rem', marginTop: '0.15rem' }}>
                    <NavLink
                      to="/admin/tours"
                      end
                      style={() => {
                        const isActive = location.pathname === '/admin/tours' && !location.search.includes('create=true');
                        return {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          textDecoration: 'none',
                        };
                      }}
                    >
                      <List size={13} />
                      <span>Manage Packages</span>
                    </NavLink>

                    <NavLink
                      to="/admin/tours?create=true"
                      style={() => {
                        const isActive = location.pathname === '/admin/tours' && location.search.includes('create=true');
                        return {
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.35rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-xs)',
                          fontWeight: isActive ? 700 : 400,
                          color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                          backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                          textDecoration: 'none',
                        };
                      }}
                    >
                      <PlusCircle size={13} />
                      <span>Create Package</span>
                    </NavLink>
                  </div>
                )}
              </div>
            );
          }

          return (
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
          );
        })}

        {/* ── RBAC Authorization Governance Section (Display at Bottom) ── */}
        <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
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

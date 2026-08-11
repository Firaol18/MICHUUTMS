import React from 'react';
import { NavLink } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import {
  LayoutDashboard,
  PackageCheck,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Boxes,
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/shipments', label: 'Shipments & Freight', icon: <PackageCheck size={20} /> },
  { path: '/fleet', label: 'Fleet & Drivers', icon: <Truck size={20} /> },
  { path: '/settings', label: 'System Settings', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();

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
            <Boxes size={22} style={{ color: 'var(--brand-primary)' }} />
          </div>
          {!sidebarCollapsed && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                LOGIX <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </span>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Enterprise Transport
              </span>
            </div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="tms-btn-ghost flex-center"
          style={{
            width: 28,
            height: 28,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)',
          }}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `tms-nav-link ${isActive ? 'tms-nav-link-active' : ''}`
            }
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 600 : 500,
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
      </nav>

      {/* Footer Info */}
      {!sidebarCollapsed && (
        <div
          style={{
            padding: '1rem 1.25rem',
            borderTop: '1px solid var(--border-color)',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>TMS Core v2.4.0</div>
          <div>All Systems Operational</div>
        </div>
      )}
    </aside>
  );
};

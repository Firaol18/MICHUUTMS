import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useUIStore } from '@/store/useUIStore';
import {
  Gauge,
  Package,
  Users,
  ListOrdered,
  AlertCircle,
  FileText,
  Copy,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Compass,
  ArrowLeft,
  PlusCircle,
  List,
  UserCheck,
  Shield,
  ShieldCheck,
  Key,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const [tourPackagesExpanded, setTourPackagesExpanded] = useState(true);
  const location = useLocation();

  const isTourActive = location.pathname.startsWith('/admin/tours');

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

      {/* Navigation Links matching exact requested items */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.375rem', overflowY: 'auto' }}>
        {/* 1. Dashboard */}
        <NavLink
          to="/admin/dashboard"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><Gauge size={20} /></span>
          {!sidebarCollapsed && <span>Dashboard</span>}
        </NavLink>

        {/* 2. Tour Packages (Expandable Menu with >) */}
        <div>
          <div
            onClick={() => setTourPackagesExpanded(!tourPackagesExpanded)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: sidebarCollapsed ? 'center' : 'space-between',
              gap: '0.875rem',
              padding: '0.625rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isTourActive ? 600 : 500,
              color: isTourActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isTourActive ? 'var(--brand-primary-light)' : 'transparent',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
              <span style={{ display: 'flex', alignItems: 'center' }}><Package size={20} /></span>
              {!sidebarCollapsed && <span>Tour Packages</span>}
            </div>
            {!sidebarCollapsed && (
              <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)' }}>
                {tourPackagesExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </span>
            )}
          </div>

          {/* Submenu for Tour Packages */}
          {!sidebarCollapsed && tourPackagesExpanded && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', paddingLeft: '2.5rem', marginTop: '0.25rem' }}>
              <NavLink
                to="/admin/tours"
                end
                style={() => {
                  const isActive = location.pathname === '/admin/tours' && !location.search.includes('create=true');
                  return {
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    textDecoration: 'none',
                  };
                }}
              >
                <List size={14} />
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
                    padding: '0.45rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: isActive ? 700 : 400,
                    color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    backgroundColor: isActive ? 'rgba(37, 99, 235, 0.08)' : 'transparent',
                    textDecoration: 'none',
                  };
                }}
              >
                <PlusCircle size={14} />
                <span>Create Package</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* 3. Manage Users */}
        <NavLink
          to="/admin/users"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><Users size={20} /></span>
          {!sidebarCollapsed && <span>Manage Users</span>}
        </NavLink>

        {/* 3b. Manage Guides */}
        <NavLink
          to="/admin/guides"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><UserCheck size={20} /></span>
          {!sidebarCollapsed && <span>Manage Guides</span>}
        </NavLink>

        {/* 4. Manage Booking */}
        <NavLink
          to="/admin/bookings"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><ListOrdered size={20} /></span>
          {!sidebarCollapsed && <span>Manage Booking</span>}
        </NavLink>

        {/* 5. Manage Issues */}
        <NavLink
          to="/admin/issues"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><AlertCircle size={20} /></span>
          {!sidebarCollapsed && <span>Manage Issues</span>}
        </NavLink>

        {/* 6. Manage Enquiries */}
        <NavLink
          to="/admin/enquiries"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><FileText size={20} /></span>
          {!sidebarCollapsed && <span>Manage Enquiries</span>}
        </NavLink>

        {/* 7. Manage Pages */}
        <NavLink
          to="/admin/pages"
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
          <span style={{ display: 'flex', alignItems: 'center' }}><Copy size={20} /></span>
          {!sidebarCollapsed && <span>Manage Pages</span>}
        </NavLink>

        {/* ── RBAC Authorization Governance Section (Display at Bottom) ── */}
        <div style={{ marginTop: 'auto', paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          {/* Role */}
          <NavLink
            to="/admin/roles"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.55rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><Shield size={18} /></span>
            {!sidebarCollapsed && <span>Role</span>}
          </NavLink>

          {/* Permission Resource */}
          <NavLink
            to="/admin/permission-resources"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.55rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><ShieldCheck size={18} /></span>
            {!sidebarCollapsed && <span>Permission Resource</span>}
          </NavLink>

          {/* Permission Action */}
          <NavLink
            to="/admin/permission-actions"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.55rem 0.875rem',
              borderRadius: 'var(--radius-sm)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
              backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
              textDecoration: 'none',
              transition: 'all var(--transition-fast)',
            })}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}><Key size={18} /></span>
            {!sidebarCollapsed && <span>Permission Action</span>}
          </NavLink>
        </div>

        {/* Back to Public Portal Link */}
        <div style={{ paddingTop: '0.5rem' }}>
          <NavLink
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.875rem',
              padding: '0.5rem 0.875rem',
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

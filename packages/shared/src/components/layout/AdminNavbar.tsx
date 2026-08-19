import React from 'react';
import { useUIStore } from '@tms/shared/store/useUIStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Sun, Moon, Search, LogOut, Menu } from 'lucide-react';
import { Button } from '@tms/shared/components/common/Button';
import { NotificationPopover } from '@tms/shared/components/common/NotificationPopover';

export const AdminNavbar: React.FC = () => {
  const { theme, toggleTheme, toggleMobileSidebar } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <header
      className="glass-panel flex-between admin-navbar-header"
      style={{
        height: 'var(--navbar-height)',
        padding: '0 1.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 9,
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 0,
        gap: '0.75rem',
      }}
    >
      {/* Left side: Mobile menu toggle + Search */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '420px' }}>
        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          onClick={toggleMobileSidebar}
          className="admin-mobile-toggle tms-btn-ghost flex-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            flexShrink: 0,
          }}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        {/* Search Input */}
        <div className="admin-search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '320px' }}>
          <Search
            size={15}
            style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '0.45rem 0.875rem 0.45rem 2.25rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              outline: 'none',
            }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex-center" style={{ gap: '1rem' }}>
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="tms-btn-ghost flex-center"
          style={{ width: 36, height: 36, borderRadius: '50%', color: 'var(--text-secondary)' }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
        </button>

        {/* Admin Notifications Popover */}
        <NotificationPopover role="admin" />

        {/* User Info */}
        {user && (
          <div className="flex-center" style={{ gap: '0.6rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{ width: 32, height: 32, borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--brand-primary)', flexShrink: 0 }}
            />
            <div className="admin-user-text" style={{ display: 'flex', flexDirection: 'column', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user.name.split(' ')[0]}</span>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize', fontSize: '10px' }}>{user.role}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={logout} title="Sign Out">
              <LogOut size={16} />
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};


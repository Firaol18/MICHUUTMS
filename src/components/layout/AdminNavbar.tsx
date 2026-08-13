import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Sun, Moon, Search, LogOut } from 'lucide-react';
import { Button } from '@/components/common/Button';
import { NotificationPopover } from '@/components/common/NotificationPopover';

export const AdminNavbar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  const { user, logout } = useAuthStore();

  return (
    <header
      className="glass-panel flex-between"
      style={{
        height: 'var(--navbar-height)',
        padding: '0 1.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 9,
        borderBottom: '1px solid var(--border-color)',
        borderRadius: 0,
      }}
    >
      {/* Search Input */}
      <div style={{ position: 'relative', width: '320px' }}>
        <Search
          size={16}
          style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
        />
        <input
          type="text"
          placeholder="Search bookings, tours, guides..."
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
          <div className="flex-center" style={{ gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{ width: 34, height: 34, borderRadius: 'var(--radius-full)', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', fontSize: 'var(--font-size-xs)' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
              <span style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>{user.role}</span>
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

import React from 'react';
import { useUIStore } from '@/store/useUIStore';
import { useAuthStore } from '@/store/useAuthStore';
import { ROLE_DEFINITIONS } from '@/utils/permissions';
import type { Role } from '@/types/rbac';
import { Sun, Moon, Bell, Search, LogOut, Shield } from 'lucide-react';
import { Button } from '@/components/common/Button';

export const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useUIStore();
  const { user, logout, switchRole } = useAuthStore();

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
          placeholder="Global tracking, shipment #, vehicle..."
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

      {/* Action Controls */}
      <div className="flex-center" style={{ gap: '1rem' }}>
        {/* Interactive RBAC Role Selector */}
        {user && (
          <div
            className="flex-center"
            style={{
              gap: '0.375rem',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.25rem 0.625rem',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--border-color)',
            }}
          >
            <Shield size={14} style={{ color: 'var(--brand-primary)' }} />
            <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              RBAC Role:
            </span>
            <select
              value={user.role}
              onChange={(e) => switchRole(e.target.value as Role)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-primary)',
                fontWeight: 700,
                fontSize: 'var(--font-size-xs)',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              {Object.values(ROLE_DEFINITIONS).map((def) => (
                <option key={def.role} value={def.role} style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                  {def.label} ({def.role})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="tms-btn-ghost flex-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
          }}
          title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} style={{ color: '#f59e0b' }} />}
        </button>

        {/* Notifications */}
        <button
          className="tms-btn-ghost flex-center"
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-full)',
            color: 'var(--text-secondary)',
            position: 'relative',
          }}
          title="Notifications"
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
              width: 8,
              height: 8,
              backgroundColor: 'var(--status-danger)',
              borderRadius: '50%',
            }}
          />
        </button>

        {/* User Profile Info */}
        {user && (
          <div className="flex-center" style={{ gap: '0.75rem', paddingLeft: '0.5rem', borderLeft: '1px solid var(--border-color)' }}>
            <img
              src={user.avatarUrl}
              alt={user.name}
              style={{
                width: 34,
                height: 34,
                borderRadius: 'var(--radius-full)',
                objectFit: 'cover',
                border: '2px solid var(--brand-primary)',
              }}
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

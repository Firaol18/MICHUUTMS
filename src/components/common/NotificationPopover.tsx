import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotificationStore } from '@/store/useNotificationStore';
import type { AppNotification, NotificationType } from '@/store/useNotificationStore';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Bell, Ticket, CreditCard, Clock, XCircle, Calendar, PlusCircle,
  DollarSign, AlertTriangle, Check,
} from 'lucide-react';

interface NotificationPopoverProps {
  role?: 'customer' | 'admin';
}

function getNotificationMeta(type: NotificationType): { icon: React.ReactNode; color: string; bg: string } {
  switch (type) {
    case 'booking_confirmation':
      return { icon: <Ticket size={16} />, color: '#16a34a', bg: 'rgba(22,163,74,0.12)' };
    case 'payment_confirmation':
      return { icon: <CreditCard size={16} />, color: '#059669', bg: 'rgba(5,150,105,0.12)' };
    case 'tour_reminder':
      return { icon: <Clock size={16} />, color: '#d97706', bg: 'rgba(217,119,6,0.12)' };
    case 'booking_cancellation':
      return { icon: <XCircle size={16} />, color: '#dc2626', bg: 'rgba(220,38,38,0.12)' };
    case 'schedule_change':
      return { icon: <Calendar size={16} />, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' };

    // Admin types
    case 'admin_new_booking':
      return { icon: <PlusCircle size={16} />, color: '#2563eb', bg: 'rgba(37,99,235,0.12)' };
    case 'admin_payment_received':
      return { icon: <DollarSign size={16} />, color: '#059669', bg: 'rgba(5,150,105,0.12)' };
    case 'admin_cancellation_request':
      return { icon: <AlertTriangle size={16} />, color: '#dc2626', bg: 'rgba(220,38,38,0.12)' };

    default:
      return { icon: <Bell size={16} />, color: 'var(--brand-primary)', bg: 'var(--brand-primary-light)' };
  }
}

export const NotificationPopover: React.FC<NotificationPopoverProps> = ({ role = 'customer' }) => {
  const { user } = useAuthStore();
  const { notifications, markAsRead, markAllAsRead } = useNotificationStore();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const popoverRef = useRef<HTMLDivElement>(null);

  // Filter notifications relevant to current view/role/user
  const relevantNotifs = notifications.filter((n) => {
    if (role === 'admin') {
      return n.targetRole === 'admin' || n.userEmail === 'admin@michuutours.et' || n.targetRole === 'all';
    }
    // Customer role
    if (!user) return n.targetRole === 'customer';
    return (
      n.userEmail.toLowerCase() === user.email.toLowerCase() ||
      n.targetRole === 'customer' ||
      n.targetRole === 'all'
    );
  });

  const unreadCount = relevantNotifs.filter((n) => !n.isRead).length;

  const displayNotifs = relevantNotifs.filter((n) => (filter === 'unread' ? !n.isRead : true));

  // Close popover on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (notif: AppNotification) => {
    markAsRead(notif.id);
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  return (
    <div ref={popoverRef} style={{ position: 'relative' }}>
      {/* Bell Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="tms-btn-ghost flex-center"
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          color: 'var(--text-secondary)',
          position: 'relative',
          border: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-secondary)',
          cursor: 'pointer',
        }}
        title="In-App Notifications"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: -3,
              right: -3,
              minWidth: 18,
              height: 18,
              padding: '0 4px',
              backgroundColor: '#ef4444',
              color: '#ffffff',
              borderRadius: 'var(--radius-full)',
              fontSize: 10,
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 0 2px var(--bg-primary)',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Container */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 10px)',
            right: 0,
            width: '380px',
            maxWidth: '90vw',
            maxHeight: '520px',
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-xl)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            backdropFilter: 'blur(16px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1rem',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-tertiary)',
            }}
          >
            <div>
              <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                Notifications {unreadCount > 0 && <span style={{ color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)' }}>({unreadCount} new)</span>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                {role === 'admin' ? 'Operator & System Notifications' : 'Reservation & Tour Alerts'}
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead(user?.email, role)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)' }}>
            <button
              onClick={() => setFilter('all')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 11,
                fontWeight: filter === 'all' ? 700 : 500,
                color: filter === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: filter === 'all' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              All ({relevantNotifs.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              style={{
                flex: 1,
                padding: '0.5rem',
                border: 'none',
                backgroundColor: 'transparent',
                fontSize: 11,
                fontWeight: filter === 'unread' ? 700 : 500,
                color: filter === 'unread' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                borderBottom: filter === 'unread' ? '2px solid var(--brand-primary)' : '2px solid transparent',
                cursor: 'pointer',
              }}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* Notification List */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
            {displayNotifs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                <Bell size={32} style={{ margin: '0 auto 0.5rem auto', opacity: 0.4 }} />
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>No notifications found</div>
                <div style={{ fontSize: 11, marginTop: 4 }}>You are all caught up!</div>
              </div>
            ) : (
              displayNotifs.map((item) => {
                const meta = getNotificationMeta(item.type);
                return (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '0.875rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      backgroundColor: item.isRead ? 'transparent' : 'var(--brand-primary-light)',
                      display: 'flex',
                      gap: '0.75rem',
                      alignItems: 'flex-start',
                      cursor: 'pointer',
                      transition: 'background-color 0.15s ease',
                      position: 'relative',
                    }}
                    onMouseEnter={(e) => {
                      if (item.isRead) e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      if (item.isRead) e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {!item.isRead && (
                      <span
                        style={{
                          position: 'absolute',
                          left: 4,
                          top: 18,
                          width: 6,
                          height: 6,
                          borderRadius: '50%',
                          backgroundColor: 'var(--brand-primary)',
                        }}
                      />
                    )}

                    {/* Icon Badge */}
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: meta.bg,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 2,
                      }}
                    >
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <span style={{ fontWeight: item.isRead ? 600 : 800, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                          {item.title}
                        </span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                          {item.timestamp}
                        </span>
                      </div>

                      <p style={{ fontSize: 11, color: 'var(--text-secondary)', margin: '0.2rem 0 0.4rem 0', lineHeight: 1.4 }}>
                        {item.message}
                      </p>

                      {item.bookingRef && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: meta.color,
                            backgroundColor: meta.bg,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-sm)',
                            display: 'inline-block',
                          }}
                        >
                          Ref #{item.bookingRef}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              padding: '0.625rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
              fontSize: 11,
              color: 'var(--text-muted)',
            }}
          >
            Click any notification to view full details
          </div>
        </div>
      )}
    </div>
  );
};

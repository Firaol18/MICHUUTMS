import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { tourismService } from '@/services/tourismService';
import { Input } from '@/components/common/Input';
import {
  X,
  CheckCircle2,
  Headphones,
  Ticket,
  RefreshCcw,
  CreditCard,
  HelpCircle,
  AlertTriangle,
  Send,
  Loader2,
  Copy,
  ChevronDown,
} from 'lucide-react';

interface RaiseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ISSUE_CATEGORIES = [
  { id: 'booking',      label: 'Booking Issue',    icon: <Ticket size={18} />,       color: '#2563eb', bg: 'rgba(37,99,235,0.08)' },
  { id: 'cancellation', label: 'Cancellation',     icon: <RefreshCcw size={18} />,   color: '#f59e0b', bg: 'rgba(245,158,11,0.08)' },
  { id: 'refund',       label: 'Refund / Payment', icon: <CreditCard size={18} />,   color: '#10b981', bg: 'rgba(16,185,129,0.08)' },
  { id: 'guide',        label: 'Guide / Trip',     icon: <Headphones size={18} />,   color: '#8b5cf6', bg: 'rgba(139,92,246,0.08)' },
  { id: 'urgent',       label: 'Urgent Help',      icon: <AlertTriangle size={18} />,color: '#ef4444', bg: 'rgba(239,68,68,0.08)' },
  { id: 'other',        label: 'Other',            icon: <HelpCircle size={18} />,   color: '#6b7280', bg: 'rgba(107,114,128,0.08)' },
];

const PRIORITY_LEVELS = [
  { id: 'low',    label: 'Low',    color: '#10b981' },
  { id: 'medium', label: 'Medium', color: '#f59e0b' },
  { id: 'high',   label: 'High',   color: '#ef4444' },
];

export const RaiseIssueModal: React.FC<RaiseIssueModalProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);

  const [selectedCategory, setSelectedCategory] = useState('');
  const [priority, setPriority] = useState('medium');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [copied, setCopied] = useState(false);

  // Sync user info when user changes
  useEffect(() => {
    if (user) {
      setReporterName(user.name);
      setReporterEmail(user.email);
    }
  }, [user]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Escape key close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleResetAndClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;
    setIsSubmitting(true);
    try {
      const ticket = await tourismService.createIssueTicket({
        reportedBy: reporterName || 'Public Traveler',
        email: reporterEmail || 'traveler@example.com',
        issueType: selectedCategory,
        description: description || `${selectedCategory} report from public portal`,
      });
      setTicketId(ticket.ticketId);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setSelectedCategory('');
    setPriority('medium');
    setDescription('');
    onClose();
  };

  const handleCopyTicket = () => {
    navigator.clipboard.writeText(ticketId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const activeCat = ISSUE_CATEGORIES.find((c) => c.id === selectedCategory);
  const activePriority = PRIORITY_LEVELS.find((p) => p.id === priority);
  const canSubmit = selectedCategory && description.trim().length > 0 && reporterName && reporterEmail;

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      onClick={handleResetAndClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        backgroundColor: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(6px)',
        animation: 'fadeIn 0.18s ease',
      }}
    >
      {/* Modal Panel */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '20px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
          animation: 'slideUp 0.22s ease',
          position: 'relative',
        }}
      >
        {/* ── CLOSE BUTTON ── */}
        <button
          type="button"
          onClick={handleResetAndClose}
          style={{
            position: 'absolute',
            top: '1rem',
            right: '1rem',
            width: 32,
            height: 32,
            borderRadius: '50%',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            zIndex: 1,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-primary)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
        >
          <X size={16} />
        </button>

        {isSubmitted ? (
          /* ── SUCCESS STATE ── */
          <div
            style={{
              padding: '3rem 2rem',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '1.25rem',
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(16,185,129,0.15), rgba(16,185,129,0.05))',
                border: '2px solid rgba(16,185,129,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#10b981',
              }}
            >
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
                Ticket Submitted!
              </h3>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                Our support concierge will respond to you within <strong>2–4 hours</strong>. Check your email for updates.
              </p>
            </div>

            {/* Ticket ID chip */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1.25rem',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
              }}
            >
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Ticket ID</span>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.05em' }}>
                #{ticketId}
              </span>
              <button
                type="button"
                onClick={handleCopyTicket}
                title="Copy ticket ID"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: copied ? '#10b981' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  transition: 'color 0.15s',
                }}
              >
                <Copy size={14} />
              </button>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              style={{
                marginTop: '0.5rem',
                padding: '0.7rem 2rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--brand-primary)',
                color: '#fff',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
                border: 'none',
                cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.88')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              Done
            </button>
          </div>
        ) : (
          /* ── FORM STATE ── */
          <div>
            {/* Header */}
            <div
              style={{
                padding: '1.75rem 2rem 1.25rem',
                borderBottom: '1px solid var(--border-color)',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.04), rgba(6,182,212,0.06))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--brand-primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                  }}
                >
                  <Headphones size={20} />
                </div>
                <div>
                  <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    How can we help you?
                  </h2>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    MICHUU Support · Usually replies in 2–4 hours
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Reporter info — hidden if logged in */}
              {!user && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Your Full Name"
                    placeholder="e.g. Eleanor Vance"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    required
                  />
                  <Input
                    label="Email Address"
                    type="email"
                    placeholder="e.g. eleanor@example.com"
                    value={reporterEmail}
                    onChange={(e) => setReporterEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {/* Logged-in user chip */}
              {user && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.6rem 1rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <img
                    src={user.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=2563eb&color=fff&size=64`}
                    alt={user.name}
                    style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>{user.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{user.email}</div>
                  </div>
                  <div
                    style={{
                      marginLeft: 'auto',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#10b981',
                      backgroundColor: 'rgba(16,185,129,0.1)',
                      padding: '0.15rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                    }}
                  >
                    Verified
                  </div>
                </div>
              )}

              {/* Issue Category Pills */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                  Issue Category <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                  {ISSUE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setSelectedCategory(cat.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          padding: '0.6rem 0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: `1.5px solid ${isSelected ? cat.color : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? cat.bg : 'var(--bg-tertiary)',
                          color: isSelected ? cat.color : 'var(--text-secondary)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: 'var(--font-size-xs)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ color: isSelected ? cat.color : 'var(--text-muted)', flexShrink: 0 }}>{cat.icon}</span>
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                  Priority Level
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {PRIORITY_LEVELS.map((p) => {
                    const isSelected = priority === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPriority(p.id)}
                        style={{
                          flex: 1,
                          padding: '0.45rem 0',
                          borderRadius: 'var(--radius-full)',
                          border: `1.5px solid ${isSelected ? p.color : 'var(--border-color)'}`,
                          backgroundColor: isSelected ? `${p.color}18` : 'var(--bg-tertiary)',
                          color: isSelected ? p.color : 'var(--text-muted)',
                          fontWeight: isSelected ? 700 : 500,
                          fontSize: 'var(--font-size-xs)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.35rem',
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            backgroundColor: isSelected ? p.color : 'var(--text-muted)',
                            flexShrink: 0,
                          }}
                        />
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                  Describe your issue <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <textarea
                  rows={4}
                  placeholder="Please describe what happened in detail — booking reference, dates, and any relevant information..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `1.5px solid ${description.length > 0 ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: 'var(--font-size-sm)',
                    resize: 'vertical',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'right', marginTop: '0.25rem' }}>
                  {description.length} chars
                </div>
              </div>

              {/* Submit Row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.25rem' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {activeCat ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <span style={{ color: activeCat.color }}>{activeCat.icon}</span>
                      {activeCat.label}
                      {activePriority && (
                        <span style={{ color: activePriority.color, fontWeight: 700, marginLeft: '0.25rem' }}>
                          · {activePriority.label} priority
                        </span>
                      )}
                    </span>
                  ) : (
                    'Select a category to continue'
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.7rem 1.5rem',
                    borderRadius: 'var(--radius-full)',
                    backgroundColor: canSubmit ? 'var(--brand-primary)' : 'var(--bg-tertiary)',
                    color: canSubmit ? '#fff' : 'var(--text-muted)',
                    fontWeight: 700,
                    fontSize: 'var(--font-size-sm)',
                    border: 'none',
                    cursor: canSubmit && !isSubmitting ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s ease',
                    boxShadow: canSubmit ? '0 4px 14px rgba(37,99,235,0.3)' : 'none',
                  }}
                >
                  {isSubmitting ? (
                    <><Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} /> Submitting...</>
                  ) : (
                    <><Send size={15} /> Submit Ticket</>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>
    </div>
  );
};

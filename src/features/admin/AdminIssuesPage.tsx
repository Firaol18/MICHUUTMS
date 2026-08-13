import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { tourismService, type IssueTicket } from '@/services/tourismService';
import { useAuthStore } from '@/store/useAuthStore';
import {
  Search,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  User as UserIcon,
  Calendar,
  Tag,
  X,
  FileText,
  ShieldCheck,
  Send,
} from 'lucide-react';

export const AdminIssuesPage: React.FC = () => {
  const currentUser = useAuthStore((state) => state.user);

  const [issues, setIssues] = useState<IssueTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [selectedTicket, setSelectedTicket] = useState<IssueTicket | null>(null);
  const [decisionMode, setDecisionMode] = useState<'resolved' | 'rejected'>('resolved');
  const [adminReasonInput, setAdminReasonInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getIssueTickets();
      setIssues(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const openDetailModal = (ticket: IssueTicket, initialMode: 'resolved' | 'rejected' = 'resolved') => {
    setSelectedTicket(ticket);
    setDecisionMode(ticket.status === 'rejected' ? 'rejected' : ticket.status === 'resolved' ? 'resolved' : initialMode);
    setAdminReasonInput(ticket.adminReason || '');
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setAdminReasonInput('');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !adminReasonInput.trim()) return;

    setIsSubmitting(true);
    try {
      const adminName = currentUser?.name || 'Alex Morgan';
      await tourismService.updateIssueStatus(
        selectedTicket.id,
        decisionMode,
        adminReasonInput.trim(),
        adminName
      );
      await fetchIssues();
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered issues
  const filtered = issues.filter((i) => {
    const matchesSearch =
      i.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count metrics
  const counts = {
    all: issues.length,
    open: issues.filter((i) => i.status === 'open').length,
    in_progress: issues.filter((i) => i.status === 'in_progress').length,
    resolved: issues.filter((i) => i.status === 'resolved').length,
    rejected: issues.filter((i) => i.status === 'rejected').length,
  };

  const columns: Column<IssueTicket>[] = [
    {
      header: 'Ticket ID',
      cell: (row) => (
        <button
          type="button"
          onClick={() => openDetailModal(row)}
          style={{
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: 'pointer',
            fontWeight: 800,
            color: 'var(--brand-primary)',
            fontSize: 'var(--font-size-xs)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.25rem',
            textDecoration: 'underline',
          }}
        >
          {row.ticketId}
        </button>
      ),
    },
    {
      header: 'Reported By',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--brand-primary)',
              flexShrink: 0,
            }}
          >
            {row.reportedBy.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
              {row.reportedBy}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => (
        <Badge variant="info">
          <Tag size={10} style={{ marginRight: '4px' }} />
          {row.issueType}
        </Badge>
      ),
    },
    {
      header: 'Description',
      cell: (row) => (
        <div
          style={{
            maxWidth: '260px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-secondary)',
          }}
          title={row.description}
        >
          {row.description}
        </div>
      ),
    },
    {
      header: 'Date Reported',
      cell: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          {row.dateReported}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => {
        switch (row.status) {
          case 'resolved':
            return (
              <Badge variant="success" icon={<CheckCircle2 size={12} />}>
                RESOLVED
              </Badge>
            );
          case 'rejected':
            return (
              <Badge variant="danger" icon={<XCircle size={12} />}>
                REJECTED
              </Badge>
            );
          case 'in_progress':
            return (
              <Badge variant="warning" icon={<Clock size={12} />}>
                IN PROGRESS
              </Badge>
            );
          default:
            return (
              <Badge variant="danger" icon={<AlertCircle size={12} />}>
                OPEN
              </Badge>
            );
        }
      },
    },
    {
      header: 'Action',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
          {/* Main View Details Button */}
          <Button
            variant="outline"
            size="sm"
            icon={<Eye size={14} />}
            onClick={() => openDetailModal(row, 'resolved')}
          >
            View
          </Button>

          {/* Quick Resolve / Reject Buttons if not finalized */}
          {row.status !== 'resolved' && row.status !== 'rejected' && (
            <>
              <Button
                variant="primary"
                size="sm"
                style={{ backgroundColor: '#10b981', borderColor: '#10b981', color: '#ffffff', padding: '0.25rem 0.5rem', fontSize: '11px' }}
                onClick={() => openDetailModal(row, 'resolved')}
                title="Resolve ticket with explanation"
              >
                <CheckCircle2 size={13} /> Resolve
              </Button>

              <Button
                variant="outline"
                size="sm"
                style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', padding: '0.25rem 0.5rem', fontSize: '11px' }}
                onClick={() => openDetailModal(row, 'rejected')}
                title="Reject ticket with reason"
              >
                <XCircle size={13} /> Reject
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Issues & Support Tickets"
        description="Review customer complaints, inspect ticket details, and resolve or reject support requests with formal reasoning."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchIssues}>
            Refresh Tickets
          </Button>
        }
      />

      {/* Filter Tabs & Search Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.25rem',
        }}
      >
        {/* Status Filter Tabs */}
        <div
          style={{
            display: 'flex',
            gap: '0.35rem',
            backgroundColor: 'var(--bg-tertiary)',
            padding: '0.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-color)',
          }}
        >
          {(['all', 'open', 'in_progress', 'resolved', 'rejected'] as const).map((st) => {
            const isActive = statusFilter === st;
            const labelMap = {
              all: `All (${counts.all})`,
              open: `Open (${counts.open})`,
              in_progress: `In Progress (${counts.in_progress})`,
              resolved: `Resolved (${counts.resolved})`,
              rejected: `Rejected (${counts.rejected})`,
            };

            return (
              <button
                key={st}
                type="button"
                onClick={() => setStatusFilter(st)}
                style={{
                  padding: '0.4rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isActive ? 700 : 500,
                  backgroundColor: isActive ? 'var(--bg-secondary)' : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  border: isActive ? '1px solid var(--border-color)' : 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {labelMap[st]}
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div style={{ maxWidth: '300px', width: '100%' }}>
          <Input
            placeholder="Search ticket #, traveler, keyword..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Issues Data Table */}
      <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} isLoading={isLoading} />

      {/* ── TICKET DETAIL & DECISION MODAL ── */}
      {selectedTicket && (
        <div
          onClick={closeModal}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '620px',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 24px 64px rgba(0,0,0,0.3)',
              position: 'relative',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(6,182,212,0.06))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span
                  style={{
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 800,
                    color: 'var(--brand-primary)',
                    letterSpacing: '0.04em',
                  }}
                >
                  #{selectedTicket.ticketId}
                </span>
                <Badge variant="info">{selectedTicket.issueType}</Badge>
                {selectedTicket.status === 'resolved' && <Badge variant="success">RESOLVED</Badge>}
                {selectedTicket.status === 'rejected' && <Badge variant="danger">REJECTED</Badge>}
                {selectedTicket.status === 'open' && <Badge variant="danger">OPEN</Badge>}
                {selectedTicket.status === 'in_progress' && <Badge variant="warning">IN PROGRESS</Badge>}
              </div>

              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  borderRadius: '50%',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body Content */}
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Traveler & Reporter Metadata Card */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1rem',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-color)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    <UserIcon size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Reported By
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {selectedTicket.reportedBy}
                  </strong>
                  <div style={{ color: 'var(--text-secondary)', marginTop: '0.1rem' }}>
                    <Mail size={11} style={{ display: 'inline', marginRight: '4px' }} />
                    {selectedTicket.email}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.2rem' }}>
                    <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                    Date Submitted
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {selectedTicket.dateReported}
                  </strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                    Portal Ref: <code>{selectedTicket.id}</code>
                  </div>
                </div>
              </div>

              {/* Issue Description Box */}
              <div>
                <label
                  style={{
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 700,
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    marginBottom: '0.4rem',
                  }}
                >
                  <FileText size={14} style={{ color: 'var(--brand-primary)' }} /> Customer Issue Description
                </label>
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border-color)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  "{selectedTicket.description}"
                </div>
              </div>

              {/* Existing Resolution / Rejection Details (If already handled) */}
              {selectedTicket.adminReason && (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor:
                      selectedTicket.status === 'resolved'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${
                      selectedTicket.status === 'resolved'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '0.4rem' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        color: selectedTicket.status === 'resolved' ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ShieldCheck size={14} />
                      Existing {selectedTicket.status.toUpperCase()} Audit Record
                    </span>
                    {selectedTicket.resolvedAt && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Date: {selectedTicket.resolvedAt} {selectedTicket.resolvedBy && `· By ${selectedTicket.resolvedBy}`}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    "{selectedTicket.adminReason}"
                  </p>
                </div>
              )}

              {/* Admin Action Form (Resolve or Reject) */}
              <form onSubmit={handleUpdateStatus} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Admin Action & Audit Log Reason <span style={{ color: '#ef4444' }}>*</span>
                  </label>

                  {/* Toggle between Resolve and Reject */}
                  <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.2rem', borderRadius: 'var(--radius-sm)' }}>
                    <button
                      type="button"
                      onClick={() => setDecisionMode('resolved')}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: decisionMode === 'resolved' ? '#10b981' : 'transparent',
                        color: decisionMode === 'resolved' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ✓ Resolve
                    </button>
                    <button
                      type="button"
                      onClick={() => setDecisionMode('rejected')}
                      style={{
                        padding: '0.3rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: decisionMode === 'rejected' ? '#ef4444' : 'transparent',
                        color: decisionMode === 'rejected' ? '#ffffff' : 'var(--text-secondary)',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>

                {/* Reason Textarea */}
                <div>
                  <textarea
                    rows={4}
                    value={adminReasonInput}
                    onChange={(e) => setAdminReasonInput(e.target.value)}
                    placeholder={
                      decisionMode === 'resolved'
                        ? 'Provide resolution details (e.g. Refund processed via Telebirr, booking itinerary dates adjusted, customer contacted)...'
                        : 'Provide reason for rejection (e.g. Request submitted past non-refundable 24-hour cutoff, invalid booking ref)...'
                    }
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: 'var(--radius-md)',
                      border: `1.5px solid ${
                        decisionMode === 'resolved' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)'
                      }`,
                      backgroundColor: 'var(--bg-primary)',
                      color: 'var(--text-primary)',
                      fontFamily: 'inherit',
                      fontSize: 'var(--font-size-xs)',
                      resize: 'vertical',
                      boxSizing: 'border-box',
                    }}
                    required
                  />
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                    Reason is logged in customer audit history and administrative records.
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
                  <Button variant="outline" size="sm" type="button" onClick={closeModal}>
                    Cancel
                  </Button>

                  <button
                    type="submit"
                    disabled={isSubmitting || !adminReasonInput.trim()}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      padding: '0.65rem 1.5rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: decisionMode === 'resolved' ? '#10b981' : '#ef4444',
                      color: '#ffffff',
                      fontWeight: 700,
                      fontSize: 'var(--font-size-xs)',
                      border: 'none',
                      cursor: isSubmitting || !adminReasonInput.trim() ? 'not-allowed' : 'pointer',
                      opacity: isSubmitting || !adminReasonInput.trim() ? 0.6 : 1,
                      boxShadow:
                        decisionMode === 'resolved'
                          ? '0 4px 12px rgba(16, 185, 129, 0.3)'
                          : '0 4px 12px rgba(239, 68, 68, 0.3)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <Send size={14} />
                    {isSubmitting
                      ? 'Saving Decision...'
                      : decisionMode === 'resolved'
                      ? 'Confirm & Mark Resolved'
                      : 'Confirm & Mark Rejected'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

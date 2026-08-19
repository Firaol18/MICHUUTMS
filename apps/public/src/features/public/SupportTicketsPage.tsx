import React, { useEffect, useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { RaiseIssueModal } from '@tms/shared/components/common/RaiseIssueModal';
import { tourismService, type IssueTicket } from '@tms/shared/services/tourismService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import {
  HelpCircle,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Tag,
  ShieldCheck,
  MessageSquare,
} from 'lucide-react';

export const SupportTicketsPage: React.FC = () => {
  const user = useAuthStore((state) => state.user);

  const [userTickets, setUserTickets] = useState<IssueTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved' | 'rejected'>('all');
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);

  const fetchUserTickets = async () => {
    setIsLoading(true);
    try {
      const allTickets = await tourismService.getIssueTickets();
      if (user?.email) {
        // Filter tickets matching user email
        const userEmailClean = user.email.toLowerCase();
        setUserTickets(
          allTickets.filter((t) => t.email.toLowerCase() === userEmailClean)
        );
      } else {
        setUserTickets([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserTickets();
  }, [user]);

  const filteredTickets = userTickets.filter((t) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'open') return t.status === 'open' || t.status === 'in_progress';
    return t.status === statusFilter;
  });

  const getStatusBadge = (status: IssueTicket['status']) => {
    switch (status) {
      case 'resolved':
        return <Badge variant="success" icon={<CheckCircle2 size={12} />}>RESOLVED</Badge>;
      case 'rejected':
        return <Badge variant="danger" icon={<XCircle size={12} />}>REJECTED</Badge>;
      case 'in_progress':
        return <Badge variant="warning" icon={<Clock size={12} />}>IN PROGRESS</Badge>;
      default:
        return <Badge variant="danger" icon={<AlertCircle size={12} />}>OPEN</Badge>;
    }
  };

  if (isLoading) return <LoadingSpinner label="Loading your support tickets..." />;

  return (
    <div>
      {/* Page Header */}
      <div className="flex-between" style={{ marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
            🎧 Support Tickets & Issue Tracker
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Track progress, view status updates, and read admin responses for your submitted issues.
          </p>
        </div>

        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => setIsRaiseModalOpen(true)}
        >
          Raise New Support Ticket
        </Button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
        }}
      >
        {(['all', 'open', 'resolved', 'rejected'] as const).map((filter) => {
          const isActive = statusFilter === filter;
          const labelMap = {
            all: `All (${userTickets.length})`,
            open: `Active / Open (${userTickets.filter((t) => t.status === 'open' || t.status === 'in_progress').length})`,
            resolved: `Resolved (${userTickets.filter((t) => t.status === 'resolved').length})`,
            rejected: `Rejected (${userTickets.filter((t) => t.status === 'rejected').length})`,
          };

          return (
            <button
              key={filter}
              type="button"
              onClick={() => setStatusFilter(filter)}
              style={{
                padding: '0.5rem 1rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: isActive ? 700 : 500,
                backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${isActive ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {labelMap[filter]}
            </button>
          );
        })}
      </div>

      {/* Tickets List */}
      {filteredTickets.length === 0 ? (
        <Card glass style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <HelpCircle size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
          <h3>No support tickets found</h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Have a question or encounter an issue with your booking? Submit a support ticket anytime.
          </p>
          <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsRaiseModalOpen(true)}>
            Raise New Support Ticket
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {filteredTickets.map((ticket) => (
            <Card key={ticket.id} glass style={{ padding: '1.5rem' }}>
              {/* Ticket Top Header */}
              <div
                className="flex-between"
                style={{
                  flexWrap: 'wrap',
                  gap: '0.75rem',
                  borderBottom: '1px solid var(--border-color)',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      #{ticket.ticketId}
                    </span>
                    <Badge variant="info">
                      <Tag size={10} style={{ marginRight: '3px' }} />
                      {ticket.issueType}
                    </Badge>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Submitted on {ticket.dateReported} · Reporter: {ticket.reportedBy} ({ticket.email})
                  </div>
                </div>

                <div className="flex-center" style={{ gap: '0.5rem' }}>
                  {getStatusBadge(ticket.status)}
                </div>
              </div>

              {/* Ticket Description */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  <MessageSquare size={12} style={{ display: 'inline', marginRight: '4px' }} />
                  Your Description
                </div>
                <div
                  style={{
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-tertiary)',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                  }}
                >
                  "{ticket.description}"
                </div>
              </div>

              {/* Admin Resolution / Rejection Response Box */}
              {ticket.adminReason ? (
                <div
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor:
                      ticket.status === 'resolved'
                        ? 'rgba(16, 185, 129, 0.08)'
                        : 'rgba(239, 68, 68, 0.08)',
                    border: `1px solid ${
                      ticket.status === 'resolved'
                        ? 'rgba(16, 185, 129, 0.3)'
                        : 'rgba(239, 68, 68, 0.3)'
                    }`,
                  }}
                >
                  <div className="flex-between" style={{ marginBottom: '0.35rem' }}>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 700,
                        color: ticket.status === 'resolved' ? '#10b981' : '#ef4444',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                      }}
                    >
                      <ShieldCheck size={14} />
                      MICHUU Concierge Support Response ({ticket.status.toUpperCase()})
                    </span>
                    {ticket.resolvedAt && (
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Resolved: {ticket.resolvedAt} {ticket.resolvedBy && `by ${ticket.resolvedBy}`}
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', lineHeight: 1.5, margin: 0 }}>
                    "{ticket.adminReason}"
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'rgba(245, 158, 11, 0.06)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}
                >
                  ⏳ Support ticket is currently under review by MICHUU Tourism Concierge Team. You will receive an in-app notification once updated.
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Modal for raising a new issue */}
      <RaiseIssueModal
        isOpen={isRaiseModalOpen}
        onClose={() => {
          setIsRaiseModalOpen(false);
          fetchUserTickets();
        }}
      />
    </div>
  );
};

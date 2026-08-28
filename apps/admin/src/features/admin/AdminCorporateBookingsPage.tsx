import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { ApiCompany, ApiTravelRequest } from '@tms/shared/services/corporateService';
import {
  ListOrdered,
  Search,
  Plane,
  Building,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  AlertTriangle,
  User,
  MapPin,
  Calendar,
  DollarSign,
} from 'lucide-react';

export const AdminCorporateBookingsPage: React.FC = () => {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [requests, setRequests] = useState<ApiTravelRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Review Modal State
  const [selectedRequest, setSelectedRequest] = useState<ApiTravelRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [grantOverride, setGrantOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Load Companies
  useEffect(() => {
    setLoadingCompanies(true);
    corporateService
      .getCompanies({ limit: 200 })
      .then((r) => {
        setCompanies(r.items);
        if (r.items.length > 0) {
          setSelectedCompanyId(r.items[0].id);
        }
      })
      .catch(() => setError('Failed to load companies'))
      .finally(() => setLoadingCompanies(false));
  }, []);

  // Fetch Travel Requests
  const fetchRequests = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await corporateService.getTravelRequests(selectedCompanyId, {
        limit: 100,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setRequests(res.items);
    } catch (e: any) {
      setError(e.message || 'Failed to load corporate travel requests');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenReview = (req: ApiTravelRequest) => {
    setSelectedRequest(req);
    setReviewComment('');
    setRejectionReason('');
    setGrantOverride(false);
    setOverrideReason('');
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !selectedCompanyId) return;
    setActionLoading(true);
    try {
      await corporateService.approveRequest(selectedCompanyId, selectedRequest.id, {
        comment: reviewComment,
        grantBudgetOverride: grantOverride,
        budgetOverrideReason: grantOverride ? overrideReason : undefined,
      });
      setIsReviewModalOpen(false);
      fetchRequests();
    } catch (e: any) {
      alert(e.message || 'Failed to approve travel request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !selectedCompanyId) return;
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await corporateService.rejectRequest(selectedCompanyId, selectedRequest.id, {
        reason: rejectionReason,
        comment: reviewComment,
      });
      setIsReviewModalOpen(false);
      fetchRequests();
    } catch (e: any) {
      alert(e.message || 'Failed to reject travel request');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = requests.filter((r) => {
    const q = searchTerm.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      r.requesterName.toLowerCase().includes(q) ||
      r.destination.toLowerCase().includes(q)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'COMPLETED':
        return <Badge variant="success">{status}</Badge>;
      case 'SUBMITTED':
      case 'UNDER_REVIEW':
      case 'PENDING':
        return <Badge variant="warning">{status.replace('_', ' ')}</Badge>;
      case 'REJECTED':
      case 'CANCELLED':
        return <Badge variant="danger">{status}</Badge>;
      case 'DRAFT':
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Travel Requests & Approval Queue"
        description="Monitor flight & corporate travel requests across enterprise client accounts, evaluate policy compliance, and action approval workflows"
      />

      {/* Metrics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Pending Review
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#ea580c', marginTop: '0.25rem' }}>
            {requests.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(r.status)).length}
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Approved Trips
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#16a34a', marginTop: '0.25rem' }}>
            {requests.filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED').length}
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Budget Overrides
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#8b5cf6', marginTop: '0.25rem' }}>
            {requests.filter((r) => r.budgetOverride).length}
          </div>
        </Card>
        <Card glass style={{ padding: '1.25rem' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
            Total Spend (Approved)
          </div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: 'var(--brand-primary)', marginTop: '0.25rem' }}>
            $
            {requests
              .filter((r) => r.status === 'APPROVED' || r.status === 'COMPLETED')
              .reduce((sum, r) => sum + Number(r.estimatedCost), 0)
              .toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Filter and Company Selector Row */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {loadingCompanies ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading companies…</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              style={{
                padding: '0.55rem 0.9rem',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
              }}
            >
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
          <Search
            size={16}
            style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
          />
          <input
            type="text"
            placeholder="Search by title, traveler, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.6rem 0.9rem 0.6rem 2.4rem',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-sm)',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '0.55rem 0.9rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            fontSize: 'var(--font-size-sm)',
          }}
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted / Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="COMPLETED">Completed</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSpinner label="Loading requests..." />
      ) : error ? (
        <Card glass style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error} —{' '}
          <button
            onClick={fetchRequests}
            style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700 }}
          >
            Retry
          </button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No travel requests found for this selection.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((req) => {
            const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(req.status);
            return (
              <Card
                key={req.id}
                glass
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  borderLeft: isPending ? '4px solid #ea580c' : req.status === 'APPROVED' ? '4px solid #16a34a' : '1px solid var(--border-color)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 800 }}>{req.title}</h4>
                      {getStatusBadge(req.status)}
                      {req.budgetOverride && (
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 800,
                            padding: '0.15rem 0.45rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(139,92,246,0.1)',
                            color: '#8b5cf6',
                          }}
                        >
                          Budget Override
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <User size={13} /> {req.requesterName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <MapPin size={13} /> {req.destination} {req.origin ? `(from ${req.origin})` : ''}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Calendar size={13} /> {req.departureDate} → {req.returnDate}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 900, color: 'var(--text-primary)' }}>
                      ${Number(req.estimatedCost).toLocaleString()} {req.currency}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                      {req.travelClass.toLowerCase()} class
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px' }}>
                  <strong>Purpose:</strong> {req.purpose}
                  {req.budgetOverrideReason && (
                    <div style={{ marginTop: '0.3rem', color: '#8b5cf6', fontWeight: 600 }}>
                      ⚠️ Override Note: {req.budgetOverrideReason}
                    </div>
                  )}
                  {req.rejectionReason && (
                    <div style={{ marginTop: '0.3rem', color: '#ef4444', fontWeight: 600 }}>
                      ❌ Rejection Reason: {req.rejectionReason}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Submitted on {new Date(req.createdAt).toLocaleDateString()}
                    {req.currentApprovalStep > 0 && ` · Step ${req.currentApprovalStep}`}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {isPending && (
                      <Button variant="primary" size="sm" onClick={() => handleOpenReview(req)}>
                        Review & Action
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <Card
            glass
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                Review Travel Request
              </h3>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '12px' }}>
              <div><strong>Trip:</strong> {selectedRequest.title}</div>
              <div><strong>Traveler:</strong> {selectedRequest.requesterName}</div>
              <div><strong>Destination:</strong> {selectedRequest.destination}</div>
              <div><strong>Estimated Cost:</strong> ${Number(selectedRequest.estimatedCost).toLocaleString()} {selectedRequest.currency}</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                  Approver Comment (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes to traveler..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', cursor: 'pointer', fontWeight: 700 }}>
                  <input
                    type="checkbox"
                    checked={grantOverride}
                    onChange={(e) => setGrantOverride(e.target.checked)}
                  />
                  Grant Budget Override Approval
                </label>
                {grantOverride && (
                  <input
                    type="text"
                    placeholder="Override justification (e.g. Critical executive client engagement)..."
                    value={overrideReason}
                    onChange={(e) => setOverrideReason(e.target.value)}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', marginTop: '0.4rem', boxSizing: 'border-box', fontSize: '12px' }}
                  />
                )}
              </div>

              <div style={{ padding: '0.85rem', border: '1px solid rgba(239,68,68,0.3)', backgroundColor: 'rgba(239,68,68,0.05)', borderRadius: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#ef4444', marginBottom: '0.3rem' }}>
                  If Rejecting, provide reason:
                </label>
                <input
                  type="text"
                  placeholder="Reason for rejection..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '12px' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button
                variant="ghost"
                type="button"
                onClick={handleReject}
                disabled={actionLoading}
                style={{ color: '#ef4444' }}
              >
                Reject Request
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Approve Request'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

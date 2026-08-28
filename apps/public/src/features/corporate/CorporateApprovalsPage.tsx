import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import {
  corporateService,
  type ApiTravelRequest,
  type ApiApproval,
} from '@tms/shared/services/corporateService';
import {
  CheckCircle2,
  XCircle,
  Plane,
  Hotel,
  User,
  Clock,
  MessageSquare,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  MapPin,
  Calendar,
} from 'lucide-react';

export const CorporateApprovalsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [requests, setRequests] = useState<ApiTravelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'PENDING' | 'HISTORY'>('PENDING');

  // Review modal state
  const [selectedRequest, setSelectedRequest] = useState<ApiTravelRequest | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [comment, setComment] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [grantBudgetOverride, setGrantBudgetOverride] = useState(false);
  const [approvalHistory, setApprovalHistory] = useState<ApiApproval[]>([]);
  const [actionLoading, setActionLoading] = useState(false);

  const rawCompanyId = user?.companyId || 'comp-1';
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string>(rawCompanyId);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      let cid = rawCompanyId;
      const compList = await corporateService.getCompanies({ limit: 50 });
      const matched = compList.items.find(
        (c) => c.id === rawCompanyId || (user?.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
      );
      if (matched) {
        cid = matched.id;
        setResolvedCompanyId(matched.id);
      }

      const res = await corporateService.getTravelRequests(cid, { limit: 100 });
      setRequests(res.items);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [rawCompanyId, user?.companyName]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleOpenReview = (req: ApiTravelRequest) => {
    setSelectedRequest(req);
    setComment('');
    setRejectionReason('');
    setGrantBudgetOverride(false);
    setApprovalHistory([]);
    if (resolvedCompanyId) {
      corporateService.getApprovalHistory(resolvedCompanyId, req.id)
        .then(setApprovalHistory)
        .catch(() => setApprovalHistory([]));
    }
    setIsReviewModalOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedRequest || !resolvedCompanyId) return;
    setActionLoading(true);
    try {
      await corporateService.approveRequest(resolvedCompanyId, selectedRequest.id, {
        comment,
        grantBudgetOverride,
      });
      setIsReviewModalOpen(false);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to approve request');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !resolvedCompanyId) return;
    if (!rejectionReason.trim()) {
      alert('Please specify a rejection reason.');
      return;
    }
    setActionLoading(true);
    try {
      await corporateService.rejectRequest(resolvedCompanyId, selectedRequest.id, {
        reason: rejectionReason,
        comment,
      });
      setIsReviewModalOpen(false);
      loadRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to reject request');
    } finally {
      setActionLoading(false);
    }
  };

  const pending = requests.filter((r) => ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(r.status));
  const history = requests.filter((r) => ['APPROVED', 'REJECTED', 'CANCELLED', 'COMPLETED'].includes(r.status));
  const displayList = activeTab === 'PENDING' ? pending : history;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>Corporate Approval Queue</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
          Evaluate employee trip budgets, policy compliance, and action approval workflows
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('PENDING')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'PENDING' ? 'var(--brand-primary)' : 'transparent',
            color: activeTab === 'PENDING' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Pending Review ({pending.length})
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: activeTab === 'HISTORY' ? 'var(--brand-primary)' : 'transparent',
            color: activeTab === 'HISTORY' ? '#ffffff' : 'var(--text-secondary)',
            fontWeight: 800,
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          Approval History ({history.length})
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <LoadingSpinner label="Loading approval queue..." />
      ) : displayList.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          {activeTab === 'PENDING' ? 'No travel requests currently pending approval.' : 'No approval history records found.'}
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {displayList.map((req) => {
            const isPending = ['SUBMITTED', 'UNDER_REVIEW', 'PENDING'].includes(req.status);
            return (
              <Card
                key={req.id}
                glass
                style={{
                  padding: '1.25rem 1.5rem',
                  borderLeft: isPending ? '4px solid #ea580c' : req.status === 'APPROVED' ? '4px solid #16a34a' : '1px solid var(--border-color)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h4 style={{ margin: 0, fontSize: 'var(--font-size-base)', fontWeight: 800 }}>{req.title}</h4>
                      <Badge variant={isPending ? 'warning' : req.status === 'APPROVED' ? 'success' : 'danger'}>
                        {req.status}
                      </Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.35rem', fontSize: '12px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><User size={13} /> {req.requesterName}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><MapPin size={13} /> {req.destination}</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Calendar size={13} /> {req.departureDate} → {req.returnDate}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 900, color: 'var(--text-primary)' }}>
                      ${Number(req.estimatedCost).toLocaleString()} {req.currency}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {req.travelClass.toLowerCase()} class
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.65rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px' }}>
                  <strong>Purpose:</strong> {req.purpose}
                  {req.rejectionReason && (
                    <div style={{ color: '#ef4444', marginTop: '0.3rem', fontWeight: 600 }}>❌ Rejection: {req.rejectionReason}</div>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Submitted {new Date(req.createdAt).toLocaleDateString()}</span>
                  {isPending && (
                    <Button variant="primary" size="sm" onClick={() => handleOpenReview(req)}>
                      Review & Decide
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <Card glass style={{ width: '100%', maxWidth: '500px', padding: '2rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>Review Travel Request</h3>
              <button type="button" onClick={() => setIsReviewModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
            </div>

            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.85rem', borderRadius: '8px', marginBottom: '1.25rem', fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              <div><strong>Trip:</strong> {selectedRequest.title}</div>
              <div><strong>Traveler:</strong> {selectedRequest.requesterName}</div>
              <div><strong>Cost:</strong> ${Number(selectedRequest.estimatedCost).toLocaleString()} {selectedRequest.currency}</div>
            </div>

            {/* Approval History if multiple steps */}
            {approvalHistory.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>Approval Workflow Progress</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', backgroundColor: 'var(--bg-secondary)', padding: '0.6rem', borderRadius: '8px' }}>
                  {approvalHistory.map((a) => (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', alignItems: 'center' }}>
                      <span>Step {a.stepOrder}: <strong>{a.approverName || 'Approver'}</strong></span>
                      <span style={{ color: a.decision === 'APPROVED' ? '#16a34a' : a.decision === 'REJECTED' ? '#ef4444' : '#f59e0b', fontWeight: 700 }}>
                        {a.decision}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Approver Comment (Optional)</label>
                <textarea rows={2} placeholder="Feedback or clearance notes..." value={comment} onChange={(e) => setComment(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', cursor: 'pointer', userSelect: 'none' }}>
                <input
                  type="checkbox"
                  checked={grantBudgetOverride}
                  onChange={(e) => setGrantBudgetOverride(e.target.checked)}
                />
                <span>Grant formal <strong>Budget / Policy Override</strong> for this booking</span>
              </label>

              <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', color: '#ef4444', marginBottom: '0.3rem' }}>If Rejecting, Specify Reason:</label>
                <input type="text" placeholder="Reason for rejection..." value={rejectionReason} onChange={(e) => setRejectionReason(e.target.value)} style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: '12px' }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={handleReject} disabled={actionLoading} style={{ color: '#ef4444' }}>Reject</Button>
              <Button variant="primary" onClick={handleApprove} disabled={actionLoading}>{actionLoading ? 'Processing...' : 'Approve Trip'}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

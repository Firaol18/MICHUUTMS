import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import {
  corporateService,
  type ApiCompany,
  type ApiTravelRequest,
} from '@tms/shared/services/corporateService';
import {
  Plane,
  Hotel,
  Search,
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Plus,
  Calendar,
  DollarSign,
  User,
  MapPin,
  XCircle,
} from 'lucide-react';

export const CorporateBookingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<ApiTravelRequest[]>([]);
  const [resolvedCompanyId, setResolvedCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal State for New Travel Request
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [origin, setOrigin] = useState('Addis Ababa (ADD)');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [travelClass, setTravelClass] = useState<'ECONOMY' | 'BUSINESS'>('ECONOMY');
  const [estimatedCost, setEstimatedCost] = useState<number>(850);
  const [purpose, setPurpose] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isManager = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';
  const isApprover = user?.role === 'APPROVER';
  const rawCompanyId = user?.companyId || 'comp-1';

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      let cid = resolvedCompanyId;
      if (!cid) {
        const compList = await corporateService.getCompanies({ limit: 50 });
        const matched = compList.items.find(
          (c) => c.id === rawCompanyId || (user?.companyName && c.name.toLowerCase() === user.companyName.toLowerCase())
        );
        if (matched) {
          cid = matched.id;
          setResolvedCompanyId(matched.id);
        } else if (rawCompanyId && rawCompanyId !== 'comp-1') {
          cid = rawCompanyId;
          setResolvedCompanyId(rawCompanyId);
        }
      }

      if (cid) {
        const res = isManager
          ? await corporateService.getTravelRequests(cid, { limit: 100 })
          : await corporateService.getMyTravelRequests(cid);
        setRequests(res.items);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  }, [resolvedCompanyId, rawCompanyId, user?.companyName, isManager]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resolvedCompanyId) return;
    setSubmitting(true);
    try {
      const created = await corporateService.createTravelRequest(resolvedCompanyId, {
        title,
        origin,
        destination,
        departureDate,
        returnDate,
        travelClass,
        estimatedCost: Number(estimatedCost),
        purpose,
      });

      // Automatically submit for approval
      await corporateService.submitRequest(resolvedCompanyId, created.id);
      setIsModalOpen(false);
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to submit travel request');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelRequest = async (id: string) => {
    if (!resolvedCompanyId) return;
    if (!confirm('Cancel this travel request?')) return;
    try {
      await corporateService.cancelRequest(resolvedCompanyId, id, 'Cancelled by traveler');
      fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel request');
    }
  };

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.requesterName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.destination.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, searchTerm, statusFilter]);

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
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, margin: 0 }}>
            {isManager ? 'All Corporate Travel Requests' : 'My Travel Requests'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.3rem' }}>
            {isManager ? 'Company-wide corporate flights and trip requests' : 'Your submitted travel requests and approval lifecycle'}
          </p>
        </div>

        <Button variant="primary" icon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
          New Travel Request
        </Button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '240px', maxWidth: '380px' }}>
          <Search size={15} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by title, traveler, or destination..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '0.55rem 0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}
        >
          <option value="ALL">All Statuses</option>
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {/* Requests List */}
      {loading ? (
        <LoadingSpinner label="Loading corporate requests..." />
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No travel requests found. Click "New Travel Request" to submit a trip.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map((req) => (
            <Card
              key={req.id}
              glass
              style={{
                padding: '1.25rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-full)', backgroundColor: 'rgba(37,99,235,0.1)', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Plane size={18} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{req.title}</span>
                      {getStatusBadge(req.status)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginTop: '0.25rem', fontSize: '11px', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <User size={12} /> {req.requesterName}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <MapPin size={12} /> {req.destination} {req.origin ? `(from ${req.origin})` : ''}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Calendar size={12} /> {req.departureDate} → {req.returnDate}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 'var(--font-size-base)', fontWeight: 900, color: 'var(--brand-primary)' }}>
                    ${Number(req.estimatedCost).toLocaleString()} {req.currency}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {req.travelClass.toLowerCase()} class
                  </div>
                </div>
              </div>

              <div style={{ padding: '0.65rem 0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '6px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <strong>Purpose:</strong> {req.purpose}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.4rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Submitted on {new Date(req.createdAt).toLocaleDateString()}
                </span>
                {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW'].includes(req.status) && (
                  <Button variant="ghost" size="sm" onClick={() => handleCancelRequest(req.id)} style={{ color: '#ef4444' }}>
                    Cancel Request
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── New Travel Request Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <Card glass style={{ width: '100%', maxWidth: '540px', padding: '2rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleCreateRequest}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>Create Corporate Travel Request</h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Trip Title / Event *</label>
                  <input type="text" placeholder="e.g. Dubai Aviation Expo 2026" value={title} onChange={(e) => setTitle(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Origin *</label>
                  <input type="text" value={origin} onChange={(e) => setOrigin(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Destination *</label>
                  <input type="text" placeholder="e.g. Dubai (DXB)" value={destination} onChange={(e) => setDestination(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Departure Date *</label>
                  <input type="date" value={departureDate} onChange={(e) => setDepartureDate(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Return Date *</label>
                  <input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Cabin Class</label>
                  <select value={travelClass} onChange={(e) => setTravelClass(e.target.value as any)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    <option value="ECONOMY">Economy Class</option>
                    <option value="BUSINESS">Business Class</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Estimated Cost ($ USD) *</label>
                  <input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Business Purpose *</label>
                  <textarea rows={2} placeholder="Explain the business objective of this trip..." value={purpose} onChange={(e) => setPurpose(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit for Approval'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

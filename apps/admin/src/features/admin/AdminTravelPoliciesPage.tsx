import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { TravelPolicy, CabinClass } from '@tms/shared/types/corporate';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Plane,
  Hotel,
  CheckCircle,
  Calendar,
  AlertCircle,
} from 'lucide-react';

const CABIN_OPTIONS: CabinClass[] = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];

export const AdminTravelPoliciesPage: React.FC = () => {
  const [policies, setPolicies] = useState<TravelPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<TravelPolicy | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [maxFlightPrice, setMaxFlightPrice] = useState(1000);
  const [allowedCabinClasses, setAllowedCabinClasses] = useState<CabinClass[]>(['ECONOMY']);
  const [requiresApprovalAbove, setRequiresApprovalAbove] = useState(800);
  const [maxHotelNightlyRate, setMaxHotelNightlyRate] = useState(200);
  const [requiresHotelApprovalAbove, setRequiresHotelApprovalAbove] = useState(150);
  const [advanceBookingDays, setAdvanceBookingDays] = useState(7);

  const fetchPolicies = async () => {
    setLoading(true);
    try {
      const data = await corporateService.getPolicies();
      setPolicies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPolicies();
  }, []);

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setName('');
    setDescription('');
    setMaxFlightPrice(1000);
    setAllowedCabinClasses(['ECONOMY']);
    setRequiresApprovalAbove(800);
    setMaxHotelNightlyRate(200);
    setRequiresHotelApprovalAbove(150);
    setAdvanceBookingDays(7);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pol: TravelPolicy) => {
    setEditingPolicy(pol);
    setName(pol.name);
    setDescription(pol.description || '');
    setMaxFlightPrice(pol.maxFlightPrice);
    setAllowedCabinClasses(pol.allowedCabinClasses);
    setRequiresApprovalAbove(pol.requiresApprovalAbove);
    setMaxHotelNightlyRate(pol.maxHotelNightlyRate);
    setRequiresHotelApprovalAbove(pol.requiresHotelApprovalAbove);
    setAdvanceBookingDays(pol.advanceBookingDays || 0);
    setIsModalOpen(true);
  };

  const handleToggleCabin = (cls: CabinClass) => {
    setAllowedCabinClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPolicy) {
      await corporateService.updatePolicy(editingPolicy.id, {
        name,
        description,
        maxFlightPrice,
        allowedCabinClasses,
        requiresApprovalAbove,
        maxHotelNightlyRate,
        requiresHotelApprovalAbove,
        advanceBookingDays,
      });
    } else {
      await corporateService.addPolicy({
        companyId: 'comp-1',
        name,
        description,
        maxFlightPrice,
        allowedCabinClasses,
        requiresApprovalAbove,
        approvalThreshold: requiresApprovalAbove,
        maxHotelNightlyRate,
        requiresHotelApprovalAbove,
        advanceBookingDays,
        effectiveDate: new Date().toISOString().split('T')[0],
        isActive: true,
      });
    }
    setIsModalOpen(false);
    fetchPolicies();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this corporate travel policy rule set?')) {
      await corporateService.deletePolicy(id);
      fetchPolicies();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Travel Policies & Spending Guardrails"
        description="Configure automatic flight cabin restrictions, maximum ticket fares, hotel nightly rate caps, and manager approval thresholds"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Create Travel Policy
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner label="Loading policy rules..." />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {policies.map((pol) => (
            <Card
              key={pol.id}
              glass
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.25rem',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                    {pol.name}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0.25rem 0 0 0' }}>
                    {pol.description}
                  </p>
                </div>
                <Badge variant={pol.isActive ? 'success' : 'neutral'}>
                  {pol.isActive ? 'Active Rule' : 'Inactive'}
                </Badge>
              </div>

              {/* Flight Policy Rules */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 700, color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Plane size={14} /> Flight Fare & Class Rules
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Maximum Allowed Fare:</span>
                  <strong>${pol.maxFlightPrice.toLocaleString()} USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approval Required Above:</span>
                  <strong style={{ color: '#ea580c' }}>${pol.requiresApprovalAbove.toLocaleString()} USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Permitted Cabins:</span>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    {pol.allowedCabinClasses.map((c) => (
                      <Badge key={c} variant="info" style={{ fontSize: '9px', padding: '0.1rem 0.35rem' }}>
                        {c}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Hotel Policy Rules */}
              <div
                style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 'var(--font-size-xs)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                }}
              >
                <div style={{ fontWeight: 700, color: '#059669', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Hotel size={14} /> Hotel Rate Allowance
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Max Nightly Rate Cap:</span>
                  <strong>${pol.maxHotelNightlyRate} USD / night</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Approval Required Above:</span>
                  <strong style={{ color: '#ea580c' }}>${pol.requiresHotelApprovalAbove} USD / night</strong>
                </div>
                {pol.advanceBookingDays ? (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Advance Notice Window:</span>
                    <strong>{pol.advanceBookingDays} Days Minimum</strong>
                  </div>
                ) : null}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleOpenEdit(pol)}>
                  Edit Policy
                </Button>
                <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(pol.id)} style={{ color: '#ef4444' }}>
                  Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
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
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                  {editingPolicy ? 'Edit Travel Policy Rules' : 'Create New Travel Policy'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Policy Title *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Description</label>
                  <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                {/* Flights Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Max Flight Fare ($ USD) *</label>
                    <input type="number" value={maxFlightPrice} onChange={(e) => setMaxFlightPrice(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Approval Trigger ($ USD) *</label>
                    <input type="number" value={requiresApprovalAbove} onChange={(e) => setRequiresApprovalAbove(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                </div>

                {/* Cabins Allowed */}
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>Permitted Cabin Classes</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CABIN_OPTIONS.map((cls) => {
                      const isSelected = allowedCabinClasses.includes(cls);
                      return (
                        <button
                          key={cls}
                          type="button"
                          onClick={() => handleToggleCabin(cls)}
                          style={{
                            padding: '0.35rem 0.75rem',
                            borderRadius: 'var(--radius-full)',
                            fontSize: '11px',
                            fontWeight: 700,
                            border: `1.5px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                            backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'transparent',
                            color: isSelected ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            cursor: 'pointer',
                          }}
                        >
                          {isSelected ? '✓ ' : ''}{cls}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hotels Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Max Hotel Rate ($/nt) *</label>
                    <input type="number" value={maxHotelNightlyRate} onChange={(e) => setMaxHotelNightlyRate(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Hotel Approval Trigger ($/nt) *</label>
                    <input type="number" value={requiresHotelApprovalAbove} onChange={(e) => setRequiresHotelApprovalAbove(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Advance Booking Notice (Days)</label>
                  <input type="number" value={advanceBookingDays} onChange={(e) => setAdvanceBookingDays(Number(e.target.value))} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingPolicy ? 'Save Policy Changes' : 'Activate Policy'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

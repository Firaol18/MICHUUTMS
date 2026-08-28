import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { ApiCompany, ApiTravelPolicy } from '@tms/shared/services/corporateService';
import {
  ShieldAlert,
  Plus,
  Edit2,
  Trash2,
  Plane,
  Building,
  CheckCircle,
  Clock,
  DollarSign,
  AlertCircle,
  Layers,
} from 'lucide-react';

const CABIN_OPTIONS = ['ECONOMY', 'PREMIUM_ECONOMY', 'BUSINESS', 'FIRST'];

const iStyle = {
  input: {
    width: '100%',
    padding: '0.6rem',
    borderRadius: '6px',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-secondary)',
    color: 'var(--text-primary)',
    boxSizing: 'border-box' as const,
    fontSize: 'var(--font-size-sm)',
  },
  label: {
    fontSize: '11px',
    fontWeight: 700,
    display: 'block',
    marginBottom: '0.3rem',
  } as React.CSSProperties,
};

export const AdminTravelPoliciesPage: React.FC = () => {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [policies, setPolicies] = useState<ApiTravelPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<ApiTravelPolicy | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(true);
  const [maxBudgetPerTrip, setMaxBudgetPerTrip] = useState<number>(1000);
  const [maxBudgetPerDay, setMaxBudgetPerDay] = useState<number>(200);
  const [allowedClasses, setAllowedClasses] = useState<string[]>(['ECONOMY']);
  const [advanceBookingDays, setAdvanceBookingDays] = useState<number>(7);
  const [currency, setCurrency] = useState('USD');
  const [stepsCount, setStepsCount] = useState<number>(1);

  // Fetch Companies
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

  // Fetch Policies for Selected Company
  const fetchPolicies = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await corporateService.getPolicies(selectedCompanyId, { limit: 100 });
      setPolicies(res.items);
    } catch (e: any) {
      setError(e.message || 'Failed to load travel policies');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => {
    fetchPolicies();
  }, [fetchPolicies]);

  const handleOpenAdd = () => {
    setEditingPolicy(null);
    setName('');
    setDescription('');
    setIsDefault(policies.length === 0);
    setRequiresApproval(true);
    setMaxBudgetPerTrip(1500);
    setMaxBudgetPerDay(250);
    setAllowedClasses(['ECONOMY']);
    setAdvanceBookingDays(7);
    setCurrency('USD');
    setStepsCount(1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (pol: ApiTravelPolicy) => {
    setEditingPolicy(pol);
    setName(pol.name);
    setDescription(pol.description || '');
    setIsDefault(pol.isDefault);
    setRequiresApproval(pol.requiresApproval);
    setMaxBudgetPerTrip(pol.maxBudgetPerTrip || 1000);
    setMaxBudgetPerDay(pol.maxBudgetPerDay || 200);
    setAllowedClasses(pol.allowedClasses || ['ECONOMY']);
    setAdvanceBookingDays(pol.advanceBookingDays || 0);
    setCurrency(pol.currency || 'USD');
    setStepsCount(pol.approvalSteps?.length || 1);
    setIsModalOpen(true);
  };

  const handleToggleCabin = (cls: string) => {
    setAllowedClasses((prev) =>
      prev.includes(cls) ? prev.filter((c) => c !== cls) : [...prev, cls]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSaving(true);
    try {
      const approvalSteps = Array.from({ length: stepsCount }, (_, idx) => ({
        stepOrder: idx + 1,
        stepName: `Approval Level ${idx + 1}`,
        approverRole: idx === 0 ? 'LINE_MANAGER' : 'FINANCE_DIRECTOR',
      }));

      if (editingPolicy) {
        await corporateService.updatePolicy(selectedCompanyId, editingPolicy.id, {
          name,
          description,
          isDefault,
          requiresApproval,
          maxBudgetPerTrip: Number(maxBudgetPerTrip),
          maxBudgetPerDay: Number(maxBudgetPerDay),
          allowedClasses,
          advanceBookingDays: Number(advanceBookingDays),
          currency,
          approvalSteps,
        });
      } else {
        await corporateService.addPolicy(selectedCompanyId, {
          name,
          description,
          isDefault,
          requiresApproval,
          maxBudgetPerTrip: Number(maxBudgetPerTrip),
          maxBudgetPerDay: Number(maxBudgetPerDay),
          allowedClasses,
          advanceBookingDays: Number(advanceBookingDays),
          currency,
          approvalSteps,
        });
      }
      setIsModalOpen(false);
      fetchPolicies();
    } catch (e: any) {
      setError(e.message || 'Failed to save travel policy');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!selectedCompanyId) return;
    if (!confirm('Are you sure you want to permanently delete this travel policy?')) return;
    try {
      await corporateService.deletePolicy(selectedCompanyId, id);
      fetchPolicies();
    } catch (e: any) {
      alert(e.message || 'Failed to delete policy');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Travel Policies & Approval Rules"
        description="Configure trip budget caps, allowed cabin classes, booking advance notice, and multi-tier approval chains"
        actions={
          <Button
            variant="primary"
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
            disabled={!selectedCompanyId}
          >
            Create Travel Policy
          </Button>
        }
      />

      {/* Company Selector */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
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
      </div>

      {loading ? (
        <LoadingSpinner label="Loading policies..." />
      ) : error ? (
        <Card glass style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error} —{' '}
          <button
            onClick={fetchPolicies}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--brand-primary)',
              cursor: 'pointer',
              fontWeight: 700,
            }}
          >
            Retry
          </button>
        </Card>
      ) : policies.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No travel policies found for this organization. Click "Create Travel Policy" to define rules.
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {policies.map((pol) => (
            <Card
              key={pol.id}
              glass
              style={{
                padding: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                borderTop: pol.isDefault ? '3px solid var(--brand-primary)' : '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>
                      {pol.name}
                    </h3>
                    {pol.isDefault && <Badge variant="primary">Default</Badge>}
                  </div>
                  {pol.description && (
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0.3rem 0 0 0', lineHeight: 1.4 }}>
                      {pol.description}
                    </p>
                  )}
                </div>
                <Badge variant={pol.isActive ? 'success' : 'neutral'}>
                  {pol.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Policy Rules Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-sm)',
                }}
              >
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Max Trip Cost
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    ${pol.maxBudgetPerTrip?.toLocaleString() ?? 'No Limit'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Daily Hotel Cap
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    ${pol.maxBudgetPerDay?.toLocaleString() ?? 'No Limit'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Advance Notice
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                    {pol.advanceBookingDays ? `${pol.advanceBookingDays} days` : 'Anytime'}
                  </strong>
                </div>
                <div>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
                    Approval Steps
                  </span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: '#2563eb' }}>
                    {pol.approvalSteps?.length ? `${pol.approvalSteps.length} Steps` : 'Auto-Approve'}
                  </strong>
                </div>
              </div>

              {/* Allowed Cabin Classes */}
              <div>
                <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'block', marginBottom: '0.3rem' }}>
                  Allowed Travel Classes:
                </span>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {pol.allowedClasses && pol.allowedClasses.length > 0 ? (
                    pol.allowedClasses.map((cls) => (
                      <span
                        key={cls}
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(37,99,235,0.1)',
                          color: '#2563eb',
                        }}
                      >
                        {cls.replace('_', ' ')}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>All classes</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: '0.5rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px solid var(--border-color)',
                }}
              >
                <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleOpenEdit(pol)}>
                  Edit
                </Button>
                {!pol.isDefault && (
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Trash2 size={13} />}
                    onClick={() => handleDelete(pol.id)}
                    style={{ color: '#ef4444' }}
                  >
                    Delete
                  </Button>
                )}
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
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleSubmit}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.25rem',
                }}
              >
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                  {editingPolicy ? 'Edit Travel Policy' : 'Create Travel Policy'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}
                >
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Policy Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Standard Corporate Travel Policy"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    style={iStyle.input}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Description / Rules Summary</label>
                  <input
                    type="text"
                    placeholder="Summary of travel rules..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    style={iStyle.input}
                  />
                </div>

                <div>
                  <label style={iStyle.label}>Max Trip Budget ($ USD)</label>
                  <input
                    type="number"
                    value={maxBudgetPerTrip}
                    onChange={(e) => setMaxBudgetPerTrip(Number(e.target.value))}
                    required
                    style={iStyle.input}
                  />
                </div>

                <div>
                  <label style={iStyle.label}>Max Daily Hotel Cap ($ USD)</label>
                  <input
                    type="number"
                    value={maxBudgetPerDay}
                    onChange={(e) => setMaxBudgetPerDay(Number(e.target.value))}
                    required
                    style={iStyle.input}
                  />
                </div>

                <div>
                  <label style={iStyle.label}>Advance Booking Days</label>
                  <input
                    type="number"
                    value={advanceBookingDays}
                    onChange={(e) => setAdvanceBookingDays(Number(e.target.value))}
                    style={iStyle.input}
                  />
                </div>

                <div>
                  <label style={iStyle.label}>Approval Workflow Steps</label>
                  <select
                    value={stepsCount}
                    onChange={(e) => setStepsCount(Number(e.target.value))}
                    style={{ ...iStyle.input }}
                  >
                    <option value={1}>1-Step (Direct Manager)</option>
                    <option value={2}>2-Step (Manager + Finance)</option>
                    <option value={3}>3-Step (Manager + Finance + VP)</option>
                  </select>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Allowed Travel Classes</label>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {CABIN_OPTIONS.map((cls) => {
                      const active = allowedClasses.includes(cls);
                      return (
                        <button
                          type="button"
                          key={cls}
                          onClick={() => handleToggleCabin(cls)}
                          style={{
                            padding: '0.4rem 0.75rem',
                            borderRadius: '6px',
                            border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                            backgroundColor: active ? 'rgba(37,99,235,0.1)' : 'transparent',
                            color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
                            fontWeight: active ? 700 : 500,
                            fontSize: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          {cls.replace('_', ' ')}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                    />
                    Set as default company policy
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={requiresApproval}
                      onChange={(e) => setRequiresApproval(e.target.checked)}
                    />
                    Requires manager approval
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingPolicy ? 'Save Policy' : 'Create Policy'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

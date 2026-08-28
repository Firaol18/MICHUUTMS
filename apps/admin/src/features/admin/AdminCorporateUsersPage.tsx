import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import {
  corporateService,
  generateTemporaryPassword,
} from '@tms/shared/services/corporateService';
import type { ApiCompany, ApiMember } from '@tms/shared/services/corporateService';
import type { CorporateRole } from '@tms/shared/types/corporate';
import {
  Users, Search, Plus, Edit2, Trash2, Shield, Building,
  Mail, Phone, UserCheck, KeyRound, Copy, Check, RotateCcw, CheckCircle2,
} from 'lucide-react';

const iStyle = {
  input: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' as const, fontSize: 'var(--font-size-sm)' },
  label: { fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' } as React.CSSProperties,
};

const CORPORATE_ROLES: { role: CorporateRole; label: string; desc: string }[] = [
  { role: 'CORPORATE_ADMIN', label: 'Corporate Admin', desc: 'Full company account control, policy & user admin' },
  { role: 'TRAVEL_MANAGER', label: 'Travel Manager', desc: 'Can book travel for employees & approve requests' },
  { role: 'APPROVER', label: 'Line Approver', desc: 'Reviews and approves/rejects out-of-policy bookings' },
  { role: 'TRAVELER', label: 'Employee / Traveler', desc: 'Can submit and request travel within company policy' },
];

const ROLE_COLORS: Record<string, string> = {
  CORPORATE_ADMIN: '#7c3aed',
  TRAVEL_MANAGER: '#2563eb',
  APPROVER: '#0891b2',
  TRAVELER: '#16a34a',
};

export const AdminCorporateUsersPage: React.FC = () => {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('');
  const [members, setMembers] = useState<ApiMember[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingCompanies, setLoadingCompanies] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<ApiMember | null>(null);

  // Form State
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [employeeCode, setEmployeeCode] = useState('');
  const [corporateRole, setCorporateRole] = useState<CorporateRole>('TRAVELER');
  const [tempPassword, setTempPassword] = useState('');

  // Credentials success modal
  const [credentialsModalData, setCredentialsModalData] = useState<{
    name: string; email: string; role: string; companyName: string; tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Load companies for the selector
  useEffect(() => {
    setLoadingCompanies(true);
    corporateService.getCompanies({ limit: 200 })
      .then((r) => {
        setCompanies(r.items);
        if (r.items.length > 0) setSelectedCompanyId(r.items[0].id);
      })
      .catch(() => setError('Failed to load companies'))
      .finally(() => setLoadingCompanies(false));
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!selectedCompanyId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await corporateService.getMembers(selectedCompanyId, { limit: 200 });
      setMembers(res.items);
    } catch (e: any) {
      setError(e.message || 'Failed to load members');
    } finally {
      setLoading(false);
    }
  }, [selectedCompanyId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleRandomizePassword = () => setTempPassword(generateTemporaryPassword());

  const handleOpenAdd = () => {
    setEditingMember(null);
    setMemberName(''); setMemberEmail(''); setMemberPhone('');
    setJobTitle(''); setEmployeeCode('');
    setCorporateRole('TRAVELER');
    handleRandomizePassword();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: ApiMember) => {
    setEditingMember(m);
    setMemberName(m.userName || '');
    setMemberEmail(m.userEmail || '');
    setMemberPhone(m.userPhone || '');
    setJobTitle(m.jobTitle || '');
    setEmployeeCode(m.employeeCode || '');
    setCorporateRole((m.corporateRole as CorporateRole) || 'TRAVELER');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCompanyId) return;
    setSaving(true);
    try {
      if (editingMember) {
        await corporateService.updateMember(selectedCompanyId, editingMember.id, {
          corporateRole, jobTitle, employeeCode,
        });
        setIsModalOpen(false);
        fetchMembers();
      } else {
        const result = await corporateService.inviteMember(selectedCompanyId, {
          name: memberName, email: memberEmail, phone: memberPhone,
          password: tempPassword, corporateRole, jobTitle, employeeCode,
        });
        setIsModalOpen(false);
        fetchMembers();
        const companyName = companies.find((c) => c.id === selectedCompanyId)?.name || '';
        setCredentialsModalData({
          name: memberName, email: memberEmail,
          role: corporateRole, companyName,
          tempPassword: result.tempPassword,
        });
      }
    } catch (e: any) {
      setError(e.message || 'Failed to save member');
    } finally {
      setSaving(false);
    }
  };

  const handleDeactivate = async (m: ApiMember) => {
    if (!selectedCompanyId) return;
    if (!confirm(`Deactivate "${m.userName || m.userEmail}"?`)) return;
    await corporateService.deactivateMember(selectedCompanyId, m.id);
    fetchMembers();
  };

  const handleCopyCredentials = () => {
    if (!credentialsModalData) return;
    const roleLabel = CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role;
    navigator.clipboard.writeText(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMICHUU TMS — Corporate User Credentials\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOrganization : ${credentialsModalData.companyName}\nUser Name    : ${credentialsModalData.name}\nRole         : ${roleLabel}\nLogin Email  : ${credentialsModalData.email}\nTemp Password: ${credentialsModalData.tempPassword}\nPortal URL   : ${window.location.origin.replace(':5174', ':5173')}/login\n\n🔒 NOTE: Password must be changed on first login.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filtered = members.filter((m) => {
    const q = searchTerm.toLowerCase();
    const matchSearch = (m.userName || '').toLowerCase().includes(q) ||
      (m.userEmail || '').toLowerCase().includes(q) ||
      (m.jobTitle || '').toLowerCase().includes(q);
    const matchRole = roleFilter === 'ALL' || m.corporateRole === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Members & Roles"
        description="Manage company employees, assign corporate roles, and invite new members"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd} disabled={!selectedCompanyId}>
            Invite Member
          </Button>
        }
      />

      {/* Company selector + search bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
        {loadingCompanies ? (
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Loading companies…</span>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedCompanyId}
              onChange={(e) => setSelectedCompanyId(e.target.value)}
              style={{ padding: '0.55rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}
            >
              {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        )}

        <div style={{ position: 'relative', flex: 1, maxWidth: '340px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }} />
        </div>

        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} style={{ padding: '0.55rem 0.9rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
          <option value="ALL">All Roles</option>
          {CORPORATE_ROLES.map((r) => <option key={r.role} value={r.role}>{r.label}</option>)}
        </select>
      </div>

      {/* Members grid */}
      {loading ? (
        <LoadingSpinner label="Loading members..." />
      ) : error ? (
        <Card glass style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error} — <button onClick={fetchMembers} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
        </Card>
      ) : !selectedCompanyId ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No company selected.</Card>
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No members found. Click "Invite Member" to add employees to this company.
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map((m) => (
            <Card key={m.id} glass style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.65rem', alignItems: 'center' }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', backgroundColor: `${ROLE_COLORS[m.corporateRole] || '#6b7280'}22`, color: ROLE_COLORS[m.corporateRole] || '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <UserCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>{m.userName || '—'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.jobTitle || 'Member'}</div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.15rem 0.5rem', borderRadius: '4px', backgroundColor: `${ROLE_COLORS[m.corporateRole] || '#6b7280'}15`, color: ROLE_COLORS[m.corporateRole] || '#6b7280' }}>
                  {CORPORATE_ROLES.find((r) => r.role === m.corporateRole)?.label || m.corporateRole}
                </span>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {m.userEmail && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={11} />{m.userEmail}</div>}
                {m.userPhone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={11} />{m.userPhone}</div>}
                {m.department?.name && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Shield size={11} />{m.department.name}</div>}
                {m.employeeCode && <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>ID: {m.employeeCode}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Badge variant={m.isActive ? 'success' : 'danger'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="ghost" size="sm" icon={<Edit2 size={12} />} onClick={() => handleOpenEdit(m)}>Edit</Button>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={12} />} onClick={() => handleDeactivate(m)} style={{ color: '#ef4444' }}>Remove</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Invite / Edit Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <Card glass style={{ width: '100%', maxWidth: '540px', padding: '2rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                  {editingMember ? 'Edit Member' : 'Invite New Member'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                {!editingMember && (
                  <>
                    <div style={{ gridColumn: 'span 2' }}>
                      <label style={iStyle.label}>Full Name *</label>
                      <input type="text" value={memberName} onChange={(e) => setMemberName(e.target.value)} required style={iStyle.input} />
                    </div>
                    <div>
                      <label style={iStyle.label}>Email Address *</label>
                      <input type="email" value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required style={iStyle.input} />
                    </div>
                    <div>
                      <label style={iStyle.label}>Phone</label>
                      <input type="text" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} style={iStyle.input} />
                    </div>
                  </>
                )}

                <div>
                  <label style={iStyle.label}>Job Title</label>
                  <input type="text" placeholder="e.g. Senior Engineer" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} style={iStyle.input} />
                </div>
                <div>
                  <label style={iStyle.label}>Employee ID</label>
                  <input type="text" placeholder="e.g. EMP-102" value={employeeCode} onChange={(e) => setEmployeeCode(e.target.value)} style={iStyle.input} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Corporate Role *</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    {CORPORATE_ROLES.map(({ role, label, desc }) => (
                      <div
                        key={role}
                        onClick={() => setCorporateRole(role)}
                        style={{ padding: '0.65rem', borderRadius: '8px', border: `2px solid ${corporateRole === role ? ROLE_COLORS[role] : 'var(--border-color)'}`, cursor: 'pointer', backgroundColor: corporateRole === role ? `${ROLE_COLORS[role]}10` : 'transparent', transition: 'all 0.15s' }}
                      >
                        <div style={{ fontWeight: 800, fontSize: '12px', color: corporateRole === role ? ROLE_COLORS[role] : 'var(--text-primary)' }}>{label}</div>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.2rem', lineHeight: 1.3 }}>{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {!editingMember && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ ...iStyle.label, marginBottom: 0 }}>Temporary Password *</label>
                      <button type="button" onClick={handleRandomizePassword} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <RotateCcw size={11} /> Regenerate
                      </button>
                    </div>
                    <div style={{ position: 'relative' }}>
                      <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                      <input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} required style={{ ...iStyle.input, paddingLeft: '2rem', color: '#8b5cf6', fontWeight: 800, fontFamily: 'monospace', border: '1px solid rgba(139,92,246,0.4)' }} />
                    </div>
                  </div>
                )}
              </div>

              {error && <div style={{ color: '#ef4444', fontSize: '12px', marginBottom: '1rem' }}>{error}</div>}

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingMember ? 'Save Changes' : 'Send Invite'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Credentials dialog */}
      {credentialsModalData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1.25rem' }}>
          <div style={{ width: '100%', maxWidth: '460px', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(37,99,235,0.08) 100%)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 42, height: 42, borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Member Invited Successfully</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Share these credentials with the new team member</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {[['Name', credentialsModalData.name], ['Role', CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role], ['Company', credentialsModalData.companyName], ['Email', credentialsModalData.email]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Temporary Password:</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)', padding: '3px 8px', borderRadius: '6px' }}>
                    {credentialsModalData.tempPassword}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="primary" onClick={handleCopyCredentials} icon={copied ? <Check size={15} /> : <Copy size={15} />} style={{ flex: 1, backgroundColor: copied ? '#10b981' : undefined }}>
                  {copied ? 'Copied!' : 'Copy Credentials'}
                </Button>
                <Button variant="ghost" onClick={() => setCredentialsModalData(null)}>Done</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

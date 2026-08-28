import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService, generateTemporaryPassword } from '@tms/shared/services/corporateService';
import type { ApiCompany } from '@tms/shared/services/corporateService';
import {
  Building2, Search, Plus, Edit2, Trash2, Users, CheckCircle2,
  Mail, Phone, MapPin, Briefcase, Shield, KeyRound, Copy, Check, RotateCcw,
} from 'lucide-react';

const iStyle = {
  input: { width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' as const, fontSize: 'var(--font-size-sm)' },
  label: { fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' } as React.CSSProperties,
};

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<ApiCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<ApiCompany | null>(null);

  // Form State — mapped to backend fields
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [industry, setIndustry] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [currency, setCurrency] = useState('USD');
  const [website, setWebsite] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Initial Corporate Admin (for new companies)
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  // Credentials success modal
  const [credentialsModalData, setCredentialsModalData] = useState<{
    companyName: string;
    adminName: string;
    adminEmail: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await corporateService.getCompanies({ limit: 100 });
      setCompanies(res.items);
    } catch (e: any) {
      setError(e.message || 'Failed to load companies');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchCompanies(); }, [fetchCompanies]);

  const handleRandomizePassword = () => setTempPassword(generateTemporaryPassword());

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setName(''); setCode(`CORP-${Math.floor(100 + Math.random() * 900)}`);
    setRegistrationNo(''); setIndustry('Aviation & Logistics');
    setContactEmail(''); setContactPhone('+251 9');
    setAddress('Addis Ababa, Ethiopia'); setCountry('Ethiopia');
    setCurrency('USD'); setWebsite('');
    setIsActive(true); setAdminName(''); setAdminEmail('');
    handleRandomizePassword();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: ApiCompany) => {
    setEditingCompany(comp);
    setName(comp.name); setCode(comp.code || '');
    setRegistrationNo(comp.registrationNo || ''); setIndustry(comp.industry || '');
    setContactEmail(comp.contactEmail || ''); setContactPhone(comp.contactPhone || '');
    setAddress(comp.address || ''); setCountry(comp.country || 'Ethiopia');
    setCurrency(comp.currency || 'USD'); setWebsite(comp.website || '');
    setIsActive(comp.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingCompany) {
        await corporateService.updateCompany(editingCompany.id, {
          name, code, registrationNo, industry,
          contactEmail, contactPhone, address, country, currency, website, isActive,
        });
        setIsModalOpen(false);
        fetchCompanies();
      } else {
        // 1. Create the company with initial corporate admin atomically
        const result = await corporateService.addCompany({
          name,
          code,
          registrationNo,
          industry,
          contactEmail,
          contactPhone,
          address,
          country,
          currency,
          website,
          adminName: adminName || undefined,
          adminEmail: adminEmail || undefined,
          adminPhone: contactPhone || undefined,
          adminPassword: tempPassword || undefined,
        });

        setIsModalOpen(false);
        fetchCompanies();

        // 2. If initial admin was created, show credentials modal
        if (result.initialAdmin) {
          setCredentialsModalData({
            companyName: name,
            adminName: result.initialAdmin.name,
            adminEmail: result.initialAdmin.email,
            tempPassword: result.initialAdmin.tempPassword || tempPassword,
          });
        }
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (comp: ApiCompany) => {
    if (!confirm(`Deactivate "${comp.name}"? The company and its members will be suspended.`)) return;
    await corporateService.deactivateCompany(comp.id);
    fetchCompanies();
  };

  const handleCopyCredentials = () => {
    if (!credentialsModalData) return;
    navigator.clipboard.writeText(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nMICHUU TMS — Corporate Admin Credentials\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nOrganization : ${credentialsModalData.companyName}\nAdmin Name   : ${credentialsModalData.adminName}\nEmail        : ${credentialsModalData.adminEmail}\nTemp Password: ${credentialsModalData.tempPassword}\nPortal URL   : ${window.location.origin.replace(':5174', ':5173')}/login\n\n🔒 NOTE: You will be prompted to change your temporary password immediately upon your first sign in.\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.contactEmail || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.industry || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Client Organizations"
        description="Master directory of enrolled enterprise clients and their Corporate Admins"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Register Corporate Client
          </Button>
        }
      />

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '420px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          type="text"
          placeholder="Search by name, code, email, or industry..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ ...iStyle.input, paddingLeft: '2.4rem' }}
        />
      </div>

      {loading ? (
        <LoadingSpinner label="Loading corporate clients..." />
      ) : error ? (
        <Card glass style={{ padding: '2rem', textAlign: 'center', color: '#ef4444' }}>
          {error} — <button onClick={fetchCompanies} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', cursor: 'pointer', fontWeight: 700 }}>Retry</button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No corporate organizations found. Click "Register Corporate Client" to onboard an enterprise.
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((comp) => (
            <Card key={comp.id} glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0 }}>{comp.name}</h3>
                      {comp.code && (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.1rem 0.4rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: '4px' }}>
                          {comp.code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {comp.industry || 'Enterprise Client'} {comp.country ? `· ${comp.country}` : ''}
                    </div>
                  </div>
                </div>
                <Badge variant={comp.isActive ? 'success' : 'danger'}>
                  {comp.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Contact */}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                {comp.contactEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {comp.contactEmail}
                  </div>
                )}
                {comp.contactPhone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Phone size={12} style={{ color: 'var(--text-muted)' }} /> {comp.contactPhone}
                  </div>
                )}
                {comp.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={12} style={{ color: 'var(--text-muted)' }} /> {comp.address}
                  </div>
                )}
              </div>

              {/* Meta strip */}
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Currency: <strong>{comp.currency || 'USD'}</strong>
                </span>
                {comp.registrationNo && (
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    · Reg: <strong>{comp.registrationNo}</strong>
                  </span>
                )}
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  · Since: <strong>{new Date(comp.createdAt).toLocaleDateString()}</strong>
                </span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleOpenEdit(comp)}>
                  Edit
                </Button>
                <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(comp)} style={{ color: '#ef4444' }}>
                  Deactivate
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <Card glass style={{ width: '100%', maxWidth: '600px', padding: '2rem', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', maxHeight: '90vh', overflowY: 'auto' }}>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                    {editingCompany ? 'Edit Corporate Client' : 'Register Corporate Client'}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    {editingCompany ? 'Update company details' : 'Setup organization and invite the primary Corporate Admin'}
                  </p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Company Legal Name *</label>
                  <input type="text" placeholder="e.g. Ethiopian Airlines Group" value={name} onChange={(e) => setName(e.target.value)} required style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Company Code *</label>
                  <input type="text" placeholder="e.g. EAG-001" value={code} onChange={(e) => setCode(e.target.value)} required style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Registration No.</label>
                  <input type="text" placeholder="e.g. ET-CORP-98421" value={registrationNo} onChange={(e) => setRegistrationNo(e.target.value)} style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Industry Sector</label>
                  <input type="text" placeholder="e.g. Aviation & Logistics" value={industry} onChange={(e) => setIndustry(e.target.value)} style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Country</label>
                  <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Contact Email</label>
                  <input type="email" placeholder="e.g. travel@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Contact Phone</label>
                  <input type="text" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} style={iStyle.input} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={iStyle.label}>Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} style={iStyle.input} />
                </div>

                <div>
                  <label style={iStyle.label}>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value)} style={{ ...iStyle.input }}>
                    {['USD', 'EUR', 'GBP', 'ETB', 'KES', 'ZAR'].map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label style={iStyle.label}>Website</label>
                  <input type="url" placeholder="https://..." value={website} onChange={(e) => setWebsite(e.target.value)} style={iStyle.input} />
                </div>

                {editingCompany && (
                  <div>
                    <label style={iStyle.label}>Status</label>
                    <select value={isActive ? 'true' : 'false'} onChange={(e) => setIsActive(e.target.value === 'true')} style={{ ...iStyle.input }}>
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                )}

                {/* Admin invite section (create only) */}
                {!editingCompany && (
                  <div style={{ gridColumn: 'span 2', padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.06)', border: '1.5px solid rgba(139,92,246,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '12px', color: '#8b5cf6', marginBottom: '0.75rem' }}>
                      <Shield size={14} /> First Corporate Admin (Will receive temporary credentials)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ ...iStyle.label, fontSize: '10px' }}>Admin Full Name</label>
                        <input type="text" placeholder="e.g. Abebe Kebede" value={adminName} onChange={(e) => setAdminName(e.target.value)} style={iStyle.input} />
                      </div>
                      <div>
                        <label style={{ ...iStyle.label, fontSize: '10px' }}>Admin Email</label>
                        <input type="email" placeholder="e.g. abebe@company.com" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} style={iStyle.input} />
                      </div>
                    </div>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label style={{ ...iStyle.label, fontSize: '10px', marginBottom: 0 }}>Temporary Password</label>
                        <button type="button" onClick={handleRandomizePassword} style={{ background: 'none', border: 'none', color: '#8b5cf6', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '3px' }}>
                          <RotateCcw size={10} /> Regenerate
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                        <input type="text" value={tempPassword} onChange={(e) => setTempPassword(e.target.value)} style={{ ...iStyle.input, paddingLeft: '2rem', color: '#8b5cf6', fontWeight: 800, fontFamily: 'monospace', border: '1px solid rgba(139,92,246,0.4)' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingCompany ? 'Save Changes' : 'Register Organization'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Credentials Confirmation Dialog ── */}
      {credentialsModalData && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '1.25rem' }}>
          <div style={{ width: '100%', maxWidth: '480px', backgroundColor: 'var(--bg-primary)', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 20px 40px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(37,99,235,0.08) 100%)', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '10px', backgroundColor: 'rgba(16,185,129,0.15)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Corporate Client Registered</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>Admin account provisioned with temporary credentials</p>
              </div>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', marginBottom: '1rem' }}>
                {[['Organization', credentialsModalData.companyName], ['Corporate Admin', credentialsModalData.adminName], ['Login Email', credentialsModalData.adminEmail]].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-muted)' }}>{k}:</span>
                    <span style={{ fontWeight: 700 }}>{v}</span>
                  </div>
                ))}
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Temporary Password:</span>
                  <span style={{ fontWeight: 800, fontFamily: 'monospace', color: '#2563eb', backgroundColor: 'rgba(37,99,235,0.08)', padding: '3px 8px', borderRadius: '6px', fontSize: '13px' }}>
                    {credentialsModalData.tempPassword}
                  </span>
                </div>
              </div>
              <div style={{ padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', color: '#b45309', fontSize: '11px', lineHeight: 1.4, marginBottom: '1.25rem' }}>
                🔒 <strong>Mandatory Reset:</strong> The admin will be prompted to change their password on first login.
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button variant="primary" onClick={handleCopyCredentials} icon={copied ? <Check size={15} /> : <Copy size={15} />} style={{ flex: 1, backgroundColor: copied ? '#10b981' : undefined }}>
                  {copied ? 'Credentials Copied!' : 'Copy Credentials'}
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

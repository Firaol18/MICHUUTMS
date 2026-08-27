import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { Company } from '@tms/shared/types/corporate';
import {
  Building2,
  Search,
  Plus,
  Edit2,
  Trash2,
  CreditCard,
  Users,
  CheckCircle2,
  XCircle,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Shield,
  Send,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
} from 'lucide-react';

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [industry, setIndustry] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [country, setCountry] = useState('Ethiopia');
  const [creditLimit, setCreditLimit] = useState(150000);
  const [isActive, setIsActive] = useState(true);
  const [employeeCount, setEmployeeCount] = useState(50);
  // Initial Corporate Admin & Temp Password
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  // Credentials Generated Modal
  const [credentialsModalData, setCredentialsModalData] = useState<{
    companyName: string;
    adminName: string;
    adminEmail: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const data = await corporateService.getCompanies();
      setCompanies(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleRandomizePassword = () => {
    const words = ['Michuu', 'Habesha', 'Abyssinia', 'Safari', 'Expedition', 'Summit'];
    const prefix = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(1000 + Math.random() * 9000);
    const symbols = ['!', '@', '#', '$', '&'];
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    setTempPassword(`${prefix}#${num}${symbol}`);
  };

  const handleOpenAdd = () => {
    setEditingCompany(null);
    setName('');
    setCode(`CORP-${Math.floor(100 + Math.random() * 900)}`);
    setRegistrationNo('');
    setIndustry('Aviation & Logistics');
    setEmail('');
    setPhone('+251 9');
    setAddress('Addis Ababa, Ethiopia');
    setCountry('Ethiopia');
    setCreditLimit(250000);
    setIsActive(true);
    setEmployeeCount(50);
    setAdminName('');
    setAdminEmail('');
    handleRandomizePassword();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setName(comp.name);
    setCode(comp.code || '');
    setRegistrationNo(comp.registrationNo || '');
    setIndustry(comp.industry || '');
    setEmail(comp.email);
    setPhone(comp.phone || '');
    setAddress(comp.address || '');
    setCountry(comp.country);
    setCreditLimit(comp.creditLimit);
    setIsActive(comp.isActive);
    setEmployeeCount(comp.employeeCount || 0);
    setAdminName(comp.adminName || '');
    setAdminEmail(comp.adminEmail || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCompany) {
      await corporateService.updateCompany(editingCompany.id, {
        name,
        code,
        registrationNo,
        industry,
        email,
        phone,
        address,
        country,
        creditLimit,
        isActive,
        employeeCount,
        adminName,
        adminEmail,
      });
      setIsModalOpen(false);
      fetchCompanies();
    } else {
      const result = await corporateService.addCompany({
        name,
        code,
        registrationNo,
        industry,
        email,
        phone,
        address,
        country,
        creditLimit,
        isActive,
        employeeCount,
        adminName,
        adminEmail,
        tempAdminPassword: tempPassword,
      });

      setIsModalOpen(false);
      fetchCompanies();

      // Show credentials popup if admin was created
      if (result.initialAdmin) {
        setCredentialsModalData({
          companyName: name,
          adminName: result.initialAdmin.name,
          adminEmail: result.initialAdmin.email,
          tempPassword: result.initialAdmin.tempPassword || tempPassword,
        });
      }
    }
  };

  const handleCopyCredentials = () => {
    if (!credentialsModalData) return;
    const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MICHUU TMS — Corporate Admin Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organization : ${credentialsModalData.companyName}
Admin Name   : ${credentialsModalData.adminName}
Email        : ${credentialsModalData.adminEmail}
Temp Password: ${credentialsModalData.tempPassword}
Portal URL   : ${window.location.origin.replace(':5174', ':5173')}/login

🔒 NOTE: You will be prompted to change your temporary password immediately upon your first sign in.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to deactivate and remove this corporate client?')) {
      await corporateService.deleteCompany(id);
      fetchCompanies();
    }
  };

  const filtered = companies.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.code && c.code.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Client Organizations"
        description="Master directory of enrolled enterprise clients, credit facilities, and assigned primary Corporate Admins"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Register Corporate Client
          </Button>
        }
      />

      {/* Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by company name, code, or billing email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.9rem 0.6rem 2.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>
      </div>

      {loading ? (
        <LoadingSpinner label="Loading corporate clients..." />
      ) : filtered.length === 0 ? (
        <Card glass style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No corporate organizations found. Click "Register Corporate Client" to onboard an enterprise.
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.25rem' }}>
          {filtered.map((comp) => (
            <Card
              key={comp.id}
              glass
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '12px', backgroundColor: 'rgba(37,99,235,0.1)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Building2 size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                        {comp.name}
                      </h3>
                      {comp.code && (
                        <span style={{ fontSize: '10px', fontWeight: 800, padding: '0.1rem 0.4rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: '4px' }}>
                          {comp.code}
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {comp.industry || 'Enterprise Client'} · {comp.country}
                    </div>
                  </div>
                </div>
                <Badge variant={comp.isActive ? 'success' : 'danger'}>
                  {comp.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {/* Contact Info */}
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Mail size={12} style={{ color: 'var(--text-muted)' }} /> {comp.email}
                </div>
                {comp.adminEmail && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#8b5cf6', fontWeight: 600 }}>
                    <Shield size={12} /> Primary Admin: {comp.adminName || 'Admin'} ({comp.adminEmail})
                  </div>
                )}
              </div>

              {/* Financials & Credit Balance Bar */}
              <div style={{ padding: '0.85rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Credit Limit</span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>${comp.creditLimit.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '10px', textTransform: 'uppercase' }}>Available Balance</span>
                  <strong style={{ fontSize: 'var(--font-size-sm)', color: '#16a34a' }}>${comp.availableBalance.toLocaleString()}</strong>
                </div>
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Users size={12} /> {comp.employeeCount || 0} Employees
                </span>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleOpenEdit(comp)}>
                    Edit
                  </Button>
                  <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(comp.id)} style={{ color: '#ef4444' }}>
                    Deactivate
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── Add / Edit Company Modal ── */}
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
              maxWidth: '580px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                    {editingCompany ? 'Edit Corporate Client' : 'Register Corporate Client'}
                  </h3>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: '0.2rem 0 0 0' }}>
                    Setup company credit facility and invite the primary Corporate Admin
                  </p>
                </div>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem', marginBottom: '1.5rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Company Legal Name *</label>
                  <input type="text" placeholder="e.g. Ethiopian Airlines Group" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Company Identifier Code *</label>
                  <input type="text" placeholder="e.g. EAG-001" value={code} onChange={(e) => setCode(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Industry Sector</label>
                  <input type="text" placeholder="e.g. Aviation & Logistics" value={industry} onChange={(e) => setIndustry(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Corporate Billing Email *</label>
                  <input type="email" placeholder="e.g. travel@ethiopianairlines.com" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Approved Credit Facility ($ USD) *</label>
                  <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                {/* Initial Corporate Admin Invite Box */}
                {!editingCompany && (
                  <div style={{ gridColumn: 'span 2', padding: '1rem', borderRadius: '10px', backgroundColor: 'rgba(139,92,246,0.06)', border: '1.5px solid rgba(139,92,246,0.25)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '12px', color: '#8b5cf6', marginBottom: '0.6rem' }}>
                      <Shield size={14} /> First Corporate Admin (Will receive temporary credentials)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Admin Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Abebe Kebede"
                          value={adminName}
                          onChange={(e) => setAdminName(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', boxSizing: 'border-box' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '10px', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Admin Corporate Email *</label>
                        <input
                          type="email"
                          placeholder="e.g. abebe@ethiopianairlines.com"
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          required
                          style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', boxSizing: 'border-box' }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)' }}>Generated Temporary Password *</label>
                        <button
                          type="button"
                          onClick={handleRandomizePassword}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: '#8b5cf6',
                            fontSize: '10px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '3px',
                          }}
                        >
                          <RotateCcw size={10} /> Generate New
                        </button>
                      </div>
                      <div style={{ position: 'relative' }}>
                        <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#8b5cf6' }} />
                        <input
                          type="text"
                          value={tempPassword}
                          onChange={(e) => setTempPassword(e.target.value)}
                          required
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.6rem 0.55rem 2rem',
                            borderRadius: '6px',
                            border: '1px solid rgba(139,92,246,0.4)',
                            backgroundColor: 'var(--bg-primary)',
                            color: '#8b5cf6',
                            fontWeight: 800,
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            boxSizing: 'border-box',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                      💡 A credentials confirmation dialog will appear once created so you can copy and provide these login details to the Corporate Admin. They will be required to change it on their first login.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingCompany ? 'Save Changes' : 'Register Organization & Generate Credentials'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* ── Credentials Created Confirmation Dialog ── */}
      {credentialsModalData && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '1.25rem',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '480px',
              backgroundColor: 'var(--bg-primary, #ffffff)',
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1.5rem',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(37, 99, 235, 0.08) 100%)',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '10px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: '#10b981',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <CheckCircle2 size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Corporate Client Registered</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  Corporate Admin account provisioned with temporary credentials
                </p>
              </div>
            </div>

            {/* Content & Credentials Box */}
            <div style={{ padding: '1.5rem' }}>
              <div
                style={{
                  backgroundColor: 'var(--bg-secondary, #f8fafc)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.6rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Organization:</span>
                  <span style={{ fontWeight: 700 }}>{credentialsModalData.companyName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Corporate Admin:</span>
                  <span style={{ fontWeight: 700 }}>{credentialsModalData.adminName}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Login Email:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{credentialsModalData.adminEmail}</span>
                </div>
                <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.2rem 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Temporary Password:</span>
                  <span
                    style={{
                      fontWeight: 800,
                      fontFamily: 'monospace',
                      color: '#2563eb',
                      backgroundColor: 'rgba(37, 99, 235, 0.08)',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '13px',
                    }}
                  >
                    {credentialsModalData.tempPassword}
                  </span>
                </div>
              </div>

              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.25)',
                  color: '#b45309',
                  fontSize: '11px',
                  lineHeight: 1.4,
                  marginBottom: '1.25rem',
                }}
              >
                🔒 <strong>Mandatory Reset:</strong> The admin will be prompted to create their permanent private password upon their first login to the portal.
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Button
                  variant="primary"
                  onClick={handleCopyCredentials}
                  icon={copied ? <Check size={15} /> : <Copy size={15} />}
                  style={{ flex: 1, backgroundColor: copied ? '#10b981' : undefined }}
                >
                  {copied ? 'Credentials Copied!' : 'Copy Credentials'}
                </Button>
                <Button variant="ghost" onClick={() => setCredentialsModalData(null)}>
                  Done
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

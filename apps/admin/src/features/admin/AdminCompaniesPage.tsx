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
  // Initial Corporate Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

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
    } else {
      await corporateService.addCompany({
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
    }
    setIsModalOpen(false);
    fetchCompanies();
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
                  <div style={{ gridColumn: 'span 2', padding: '1rem', borderRadius: '8px', backgroundColor: 'rgba(139,92,246,0.06)', border: '1.5px solid rgba(139,92,246,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 800, fontSize: '12px', color: '#8b5cf6', marginBottom: '0.6rem' }}>
                      <Shield size={14} /> First Corporate Admin (Will receive onboarding invite)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
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
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                      💡 This Corporate Admin will receive an email to activate their account and manage the rest of their company's employees.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingCompany ? 'Save Changes' : 'Register Organization & Send Invite'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

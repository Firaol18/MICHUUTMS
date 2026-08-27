import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import { corporateService } from '@tms/shared/services/corporateService';
import type { CorporateUser, CorporateRole } from '@tms/shared/types/corporate';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  Shield,
  Building,
  Mail,
  Phone,
  UserCheck,
  KeyRound,
  Copy,
  Check,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

const CORPORATE_ROLES: { role: CorporateRole; label: string; desc: string }[] = [
  { role: 'CORPORATE_ADMIN', label: 'Corporate Admin', desc: 'Full company account control, policy & user admin' },
  { role: 'TRAVEL_MANAGER', label: 'Travel Manager', desc: 'Can search/book travel for employees & approve requests' },
  { role: 'APPROVER', label: 'Line Approver', desc: 'Reviews and approves/rejects out-of-policy bookings' },
  { role: 'TRAVELER', label: 'Employee / Traveler', desc: 'Can search and request bookings within company policy' },
];

export const AdminCorporateUsersPage: React.FC = () => {
  const [users, setUsers] = useState<CorporateUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<CorporateUser | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [companyName, setCompanyName] = useState('Ethiopian Airlines Group');
  const [departmentName, setDepartmentName] = useState('Executive Management');
  const [corporateRole, setCorporateRole] = useState<CorporateRole>('TRAVELER');
  const [managerName, setManagerName] = useState('');
  const [tempPassword, setTempPassword] = useState('');

  // Credentials Dialog
  const [credentialsModalData, setCredentialsModalData] = useState<{
    name: string;
    email: string;
    role: string;
    companyName: string;
    tempPassword: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await corporateService.getCorporateUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('+251 9');
    setCompanyName('Ethiopian Airlines Group');
    setDepartmentName('Executive Management');
    setCorporateRole('TRAVELER');
    setManagerName('');
    handleRandomizePassword();
    setIsModalOpen(true);
  };

  const handleOpenEdit = (usr: CorporateUser) => {
    setEditingUser(usr);
    setName(usr.name);
    setEmail(usr.email);
    setPhone(usr.phone || '');
    setCompanyName(usr.companyName || 'Corporate Organization');
    setDepartmentName(usr.departmentName || '');
    setCorporateRole(usr.corporateRole);
    setManagerName(usr.managerName || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser) {
      await corporateService.updateCorporateUser(editingUser.id, {
        name,
        email,
        phone,
        companyName,
        departmentName,
        corporateRole,
        managerName,
      });
      setIsModalOpen(false);
      fetchUsers();
    } else {
      const created = await corporateService.addCorporateUser({
        name,
        email,
        phone,
        companyId: 'comp-1',
        companyName,
        department: departmentName || 'Corporate',
        departmentName,
        corporateRole,
        managerName,
        isActive: true,
        tempPassword,
      });

      setIsModalOpen(false);
      fetchUsers();

      // Show credentials popup
      setCredentialsModalData({
        name: created.name,
        email: created.email,
        role: created.corporateRole,
        companyName: created.companyName || companyName,
        tempPassword: created.tempPassword || tempPassword,
      });
    }
  };

  const handleCopyCredentials = () => {
    if (!credentialsModalData) return;
    const roleLabel = CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role;
    const text = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MICHUU TMS — Corporate User Credentials
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Organization : ${credentialsModalData.companyName}
User Name    : ${credentialsModalData.name}
Role         : ${roleLabel}
Login Email  : ${credentialsModalData.email}
Temp Password: ${credentialsModalData.tempPassword}
Portal URL   : ${window.location.origin.replace(':5174', ':5173')}/login

🔒 NOTE: You will be prompted to change your temporary password immediately upon your first sign in.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deactivate and remove this corporate traveler from directory?')) {
      await corporateService.deleteCorporateUser(id);
      fetchUsers();
    }
  };

  const filtered = users.filter((u) => {
    const matchSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.companyName && u.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchRole = roleFilter === 'ALL' || u.corporateRole === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <PageHeader
        title="Corporate Travelers & Approvers"
        description="Manage company employees, corporate role levels (Corporate Admin, Travel Manager, Approver, Traveler), and approval routing"
        actions={
          <Button variant="primary" icon={<Plus size={16} />} onClick={handleOpenAdd}>
            Add Corporate User
          </Button>
        }
      />

      {/* Role Breakdown Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {CORPORATE_ROLES.map((r) => {
          const count = users.filter((u) => u.corporateRole === r.role).length;
          return (
            <Card
              key={r.role}
              glass
              style={{
                padding: '1rem 1.25rem',
                cursor: 'pointer',
                border: roleFilter === r.role ? '2px solid var(--brand-primary)' : undefined,
              }}
              onClick={() => setRoleFilter(roleFilter === r.role ? 'ALL' : r.role)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-muted)' }}>
                  {r.label}
                </span>
                <Badge variant={r.role === 'CORPORATE_ADMIN' ? 'danger' : r.role === 'APPROVER' ? 'warning' : 'info'}>
                  {count}
                </Badge>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                {r.desc}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filter / Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '280px', maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search by user name, company, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.65rem 1rem 0.65rem 2.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
          />
        </div>

        {roleFilter !== 'ALL' && (
          <Button variant="ghost" size="sm" onClick={() => setRoleFilter('ALL')}>
            Clear Role Filter ({roleFilter})
          </Button>
        )}
      </div>

      {/* Users Table / Grid */}
      {loading ? (
        <LoadingSpinner label="Loading corporate members..." />
      ) : (
        <Card glass style={{ padding: '0.5rem', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Employee Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Company & Department</th>
                <th style={{ padding: '0.75rem 1rem' }}>Corporate Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Assigned Approver</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.email}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <div style={{ fontWeight: 600 }}>{u.companyName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{u.departmentName || 'General Staff'}</div>
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge
                      variant={
                        u.corporateRole === 'CORPORATE_ADMIN'
                          ? 'danger'
                          : u.corporateRole === 'APPROVER'
                          ? 'warning'
                          : u.corporateRole === 'TRAVEL_MANAGER'
                          ? 'info'
                          : 'neutral'
                      }
                    >
                      {u.corporateRole.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)' }}>
                    {u.managerName ? (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <UserCheck size={13} style={{ color: '#16a34a' }} /> {u.managerName}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Self / Policy-Driven</span>
                    )}
                  </td>
                  <td style={{ padding: '0.85rem 1rem' }}>
                    <Badge variant={u.isActive ? 'success' : 'danger'}>
                      {u.isActive ? 'Active' : 'Disabled'}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                      <Button variant="ghost" size="sm" icon={<Edit2 size={13} />} onClick={() => handleOpenEdit(u)}>
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" icon={<Trash2 size={13} />} onClick={() => handleDelete(u.id)} style={{ color: '#ef4444' }}>
                        Remove
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
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
              maxWidth: '520px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
            }}
          >
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                  {editingUser ? 'Edit Corporate User' : 'Add Corporate User'}
                </h3>
                <button type="button" onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>
                  ✕
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Full Name *</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Corporate Email *</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Phone</label>
                  <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Company</label>
                    <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Department</label>
                    <input type="text" value={departmentName} onChange={(e) => setDepartmentName(e.target.value)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Corporate Permission Role *</label>
                  <select value={corporateRole} onChange={(e) => setCorporateRole(e.target.value as CorporateRole)} style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }}>
                    {CORPORATE_ROLES.map((r) => (
                      <option key={r.role} value={r.role}>{r.label} — {r.desc}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>Line Manager / Approver Name</label>
                  <input type="text" value={managerName} onChange={(e) => setManagerName(e.target.value)} placeholder="Leave blank if self-approver" style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
                </div>

                {!editingUser && (
                  <div style={{ padding: '0.85rem', borderRadius: '8px', backgroundColor: 'rgba(139,92,246,0.06)', border: '1px solid rgba(139,92,246,0.25)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                      <label style={{ fontSize: '10px', fontWeight: 700, color: '#8b5cf6' }}>
                        Temporary Password (First-Time Login)
                      </label>
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
                          padding: '0.5rem 0.6rem 0.5rem 2rem',
                          borderRadius: '6px',
                          border: '1px solid rgba(139,92,246,0.3)',
                          backgroundColor: 'var(--bg-primary)',
                          color: '#8b5cf6',
                          fontWeight: 800,
                          fontFamily: 'monospace',
                          fontSize: '12px',
                          boxSizing: 'border-box',
                        }}
                      />
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.4 }}>
                      🔒 The user will be required to change their temporary password immediately upon first login.
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingUser ? 'Save User' : 'Create User & Generate Credentials'}
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
              maxWidth: '460px',
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
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>Corporate Account Created</h3>
                <p style={{ margin: '0.2rem 0 0 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                  User provisioned with temporary login credentials
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
                  <span style={{ color: 'var(--text-muted)' }}>User Name:</span>
                  <span style={{ fontWeight: 700 }}>{credentialsModalData.name}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Assigned Role:</span>
                  <span style={{ fontWeight: 700, color: '#8b5cf6' }}>
                    {CORPORATE_ROLES.find((r) => r.role === credentialsModalData.role)?.label || credentialsModalData.role}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Login Email:</span>
                  <span style={{ fontWeight: 700, fontFamily: 'monospace' }}>{credentialsModalData.email}</span>
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
                🔒 <strong>First-Time Password Reset:</strong> The user will be required to change their temporary password immediately upon their first sign in.
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

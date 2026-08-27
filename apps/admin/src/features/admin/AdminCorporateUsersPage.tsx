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

  const handleOpenAdd = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('+251 9');
    setCompanyName('Ethiopian Airlines Group');
    setDepartmentName('Executive Management');
    setCorporateRole('TRAVELER');
    setManagerName('');
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
    } else {
      await corporateService.addCorporateUser({
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
      });
    }
    setIsModalOpen(false);
    fetchUsers();
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
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit">
                  {editingUser ? 'Save User' : 'Create User'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};

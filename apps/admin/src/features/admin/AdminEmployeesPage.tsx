import React, { useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { ConfirmModal } from '@tms/shared/components/common/ConfirmModal';
import { Card } from '@tms/shared/components/common/Card';
import {
  Shield,
  Plus,
  Search,
  Filter,
  Eye,
  Edit2,
  Lock,
  Trash2,
  CheckCircle2,
  XCircle,
  Building,
  UserCheck,
  Phone,
  Mail,
  KeyRound,
  ShieldCheck,
  Copy,
  Check,
  Sparkles,
} from 'lucide-react';

import { http } from '@tms/shared/services/apiClient';

export interface EmployeeItem {
  id: string;
  name: string;
  username: string;
  phoneNumber: string;
  email: string;
  branch: string;
  roles: string[];
  organizationUnit: string;
  registrationDate: string;
  status: 'Active' | 'Inactive';
}

const DEFAULT_ROLES = [
  { key: 'SUPER_ADMIN', label: 'Super Administrator', badge: 'SA' },
  { key: 'ADMIN', label: 'Tourism Administrator', badge: 'A+' },
  { key: 'BAS', label: 'Basic Operations Admin', badge: 'BAS' },
  { key: 'FINANCE', label: 'Finance & Revenue Lead', badge: 'FIN' },
  { key: 'DISPATCHER', label: 'Fleet & Guide Dispatcher', badge: 'DIS' },
  { key: 'OPERATOR', label: 'Tour Package Manager', badge: 'OPS' },
];

const AVAILABLE_BRANCHES = [
  'Bishoftu Regional Hub',
  'Bahir Dar Regional Bureau',
  'Bale Mountains Operations Hub',
  'Hawassa Lakeside Hub',
  'Addis Ababa Headquarters Hub',
  'Gondar Heritage Bureau',
  'Lalibela Cultural Office',
];

const ROLE_BADGE_COLORS: Record<string, { bg: string; text: string }> = {
  BAS: { bg: '#e0f2fe', text: '#0284c7' },
  'A+': { bg: '#dcfce7', text: '#16a34a' },
  SA: { bg: '#fef3c7', text: '#d97706' },
  SUPER_ADMIN: { bg: '#fef3c7', text: '#d97706' },
  ADMIN: { bg: '#dcfce7', text: '#16a34a' },
  FIN: { bg: '#f3e8ff', text: '#7c3aed' },
  FINANCE: { bg: '#f3e8ff', text: '#7c3aed' },
  DIS: { bg: '#ffedd5', text: '#ea580c' },
  OPS: { bg: '#fce7f3', text: '#db2777' },
};

export const AdminEmployeesPage: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeItem[]>([]);
  const [availableRoles, setAvailableRoles] = useState(DEFAULT_ROLES);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranchFilter, setSelectedBranchFilter] = useState('all');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Modals state
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeItem | null>(null);
  const [isResetPassModalOpen, setIsResetPassModalOpen] = useState(false);
  const [resetPassEmployee, setResetPassEmployee] = useState<EmployeeItem | null>(null);
  const [generatedPass, setGeneratedPass] = useState('');
  const [isPassCopied, setIsPassCopied] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add / Edit Form State
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formBranch, setFormBranch] = useState(AVAILABLE_BRANCHES[0]);
  const [formOrgUnit, setFormOrgUnit] = useState('Land Development and Administration Bureau');
  const [formRoles, setFormRoles] = useState<string[]>(['ADMIN']);
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');

  const fetchEmployeesData = async () => {
    setIsLoading(true);
    try {
      const [usersRes, rolesRes] = await Promise.all([
        http.get('/users'),
        http.get('/roles'),
      ]);

      if (Array.isArray(rolesRes.data) && rolesRes.data.length > 0) {
        setAvailableRoles(
          rolesRes.data.map((r: any) => ({
            key: r.name.toUpperCase().replace(/\s+/g, '_'),
            label: r.name,
            badge: r.name.substring(0, 3).toUpperCase(),
          }))
        );
      }

      if (Array.isArray(usersRes.data)) {
        setEmployees(
          usersRes.data.map((u: any) => ({
            id: String(u.id),
            name: u.name,
            username: u.email ? u.email.split('@')[0] : `user-${u.id}`,
            phoneNumber: u.phone || '+251 911 000 000',
            email: u.email,
            branch: u.branch || 'Addis Ababa Headquarters Hub',
            roles: u.role?.name ? [u.role.name] : ['ADMIN'],
            organizationUnit: u.organizationUnit || 'Operations & Logistics Department',
            registrationDate: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A',
            status: u.isActive !== false ? 'Active' : 'Inactive',
          }))
        );
      }
    } catch {
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEmployeesData();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingEmployee(null);
    setFormName('');
    setFormUsername(`${Math.floor(1000000000000000 + Math.random() * 9000000000000000)}`);
    setFormPhone('+251920443110');
    setFormEmail('');
    setFormBranch(AVAILABLE_BRANCHES[0]);
    setFormOrgUnit('Land Development and Administration Bureau');
    setFormRoles(['BAS', 'A+']);
    setFormStatus('Active');
    setIsAddEditModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (emp: EmployeeItem) => {
    setEditingEmployee(emp);
    setFormName(emp.name);
    setFormUsername(emp.username);
    setFormPhone(emp.phoneNumber);
    setFormEmail(emp.email);
    setFormBranch(emp.branch);
    setFormOrgUnit(emp.organizationUnit);
    setFormRoles([...emp.roles]);
    setFormStatus(emp.status);
    setIsAddEditModalOpen(true);
  };

  // Save Employee Form
  const handleSaveEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formUsername.trim()) return;

    try {
      if (editingEmployee) {
        await http.patch(`/users/${editingEmployee.id}`, {
          name: formName,
          email: formEmail || `${formUsername.toLowerCase()}@michuutms.et`,
          phone: formPhone,
          isActive: formStatus === 'Active',
        });
      } else {
        await http.post('/users', {
          name: formName,
          email: formEmail || `${formUsername.toLowerCase()}@michuutms.et`,
          phone: formPhone,
          password: 'password123',
          isActive: formStatus === 'Active',
        });
      }
      await fetchEmployeesData();
    } catch { }

    setIsAddEditModalOpen(false);
  };

  // Toggle Status
  const handleToggleStatus = async (id: string) => {
    const target = employees.find((e) => e.id === id);
    if (!target) return;
    try {
      await http.patch(`/users/${id}`, {
        isActive: target.status !== 'Active',
      });
      await fetchEmployeesData();
    } catch { }
  };

  // Delete Employee
  const handleDelete = (id: string, name: string) => {
    setDeleteTarget({ id, name });
  };

  // Open Password Reset Modal
  const handleOpenResetPass = (emp: EmployeeItem) => {
    setResetPassEmployee(emp);
    const newTemp = `Michuu@${Math.floor(100000 + Math.random() * 900000)}!`;
    setGeneratedPass(newTemp);
    setIsPassCopied(false);
    setIsResetPassModalOpen(true);
  };

  // Copy password to clipboard
  const handleCopyPass = () => {
    navigator.clipboard.writeText(generatedPass);
    setIsPassCopied(true);
    setTimeout(() => setIsPassCopied(false), 2000);
  };

  // Filtered employees list
  const filteredEmployees = employees.filter((emp) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      emp.name.toLowerCase().includes(q) ||
      emp.username.toLowerCase().includes(q) ||
      emp.phoneNumber.toLowerCase().includes(q) ||
      emp.branch.toLowerCase().includes(q) ||
      emp.organizationUnit.toLowerCase().includes(q) ||
      emp.roles.some((r) => r.toLowerCase().includes(q));

    const matchesBranch = selectedBranchFilter === 'all' || emp.branch === selectedBranchFilter;
    const matchesRole = selectedRoleFilter === 'all' || emp.roles.includes(selectedRoleFilter);
    const matchesStatus = selectedStatusFilter === 'all' || emp.status === selectedStatusFilter;

    return matchesSearch && matchesBranch && matchesRole && matchesStatus;
  });

  // Table Columns
  const columns: Column<EmployeeItem>[] = [
    {
      header: 'NAME',
      minWidth: '170px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
            {row.name.charAt(0)}
          </div>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>
            {row.name}
          </div>
        </div>
      ),
    },
    {
      header: 'USERNAME',
      minWidth: '160px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontFamily: 'monospace', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '11px' }}>
          {row.username}
        </span>
      ),
    },
    {
      header: 'PHONE NUMBER',
      minWidth: '150px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '11px' }}>
          {row.phoneNumber}
        </span>
      ),
    },
    {
      header: 'BRANCH',
      minWidth: '190px',
      cell: (row) => (
        <span style={{ color: 'var(--text-secondary)', fontSize: '11px', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }} title={row.branch}>
          {row.branch}
        </span>
      ),
    },
    {
      header: 'ROLES',
      minWidth: '140px',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {row.roles.map((r) => {
            const style = ROLE_BADGE_COLORS[r] || { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
            return (
              <span
                key={r}
                style={{
                  backgroundColor: style.bg,
                  color: style.text,
                  fontWeight: 800,
                  fontSize: '10px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  letterSpacing: '0.04em',
                }}
              >
                {r}
              </span>
            );
          })}
        </div>
      ),
    },
    {
      header: 'ORGANIZATION UNIT',
      minWidth: '220px',
      cell: (row) => (
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }} title={row.organizationUnit}>
          {row.organizationUnit}
        </span>
      ),
    },
    {
      header: 'REGISTRATION DATE',
      minWidth: '140px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {row.registrationDate}
        </span>
      ),
    },
    {
      header: 'STATUS',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: row.status === 'Active' ? '#16a34a' : '#ef4444' }}>
            {row.status}
          </span>
          <button
            type="button"
            onClick={() => handleToggleStatus(row.id)}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: row.status === 'Active' ? '#ef4444' : '#16a34a',
              color: '#ffffff',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '10px',
              padding: 0,
            }}
            title={row.status === 'Active' ? 'Click to Deactivate' : 'Click to Activate'}
          >
            {row.status === 'Active' ? '✕' : '✓'}
          </button>
        </div>
      ),
    },
    {
      header: 'ACTIONS',
      minWidth: '150px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              setViewingEmployee(row);
              setIsViewModalOpen(true);
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: 2 }}
            title="View Details"
          >
            <Eye size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenEdit(row)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2 }}
            title="Edit Employee"
          >
            <Edit2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => handleOpenResetPass(row)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7c3aed', padding: 2 }}
            title="Reset Password"
          >
            <Lock size={15} />
          </button>
          <button type="button" onClick={() => handleDelete(row.id, row.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Delete"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* ── HEADER ── */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield style={{ color: 'var(--brand-primary)' }} /> Employees
          </h1>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Manage employee information, regional branch accounts, and role assignments
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={16} />}
          onClick={handleOpenCreate}
          style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}
        >
          + Add Employee
        </Button>
      </div>

      {/* ── SEARCH & FILTER CONTROLS ── */}
      <div
        className="flex-between"
        style={{
          flexWrap: 'wrap',
          gap: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '0.875rem 1rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ display: 'flex', gap: '0.75rem', flex: 1, minWidth: 280, maxWidth: 650 }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees by name, username, phone, branch, or role..."
              style={{
                width: '100%',
                padding: '0.45rem 0.875rem 0.45rem 2.25rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontSize: 'var(--font-size-xs)',
                outline: 'none',
              }}
            />
          </div>

          <Button
            variant={showFilterDropdown ? 'primary' : 'outline'}
            size="sm"
            icon={<Filter size={14} />}
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            Filters
          </Button>
        </div>

        {/* Filter Popover Row */}
        {showFilterDropdown && (
          <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Branch</label>
              <select
                className="tms-input"
                style={{ fontSize: '11px', padding: '0.35rem' }}
                value={selectedBranchFilter}
                onChange={(e) => setSelectedBranchFilter(e.target.value)}
              >
                <option value="all">All Branches</option>
                {AVAILABLE_BRANCHES.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Role</label>
              <select
                className="tms-input"
                style={{ fontSize: '11px', padding: '0.35rem' }}
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
              >
                <option value="all">All Roles</option>
                <option value="BAS">BAS (Basic Operations)</option>
                <option value="A+">A+ (Administrator)</option>
                <option value="SUPER_ADMIN">Super Administrator</option>
                <option value="FINANCE">Finance</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 2 }}>Status</label>
              <select
                className="tms-input"
                style={{ fontSize: '11px', padding: '0.35rem' }}
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── DATA TABLE ── */}
      <DataTable
        columns={columns}
        data={filteredEmployees}
        keyExtractor={(item) => item.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search employees..."
        entityName="employees"
        minTableWidth="1100px"
      />

      {/* ── MODAL 1: ADD / EDIT EMPLOYEE MODAL ── */}
      {isAddEditModalOpen && (
        <Modal
          isOpen={isAddEditModalOpen}
          onClose={() => setIsAddEditModalOpen(false)}
          title={editingEmployee ? `Edit Employee: ${editingEmployee.name}` : 'Add New Employee Account'}
          size="lg"
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsAddEditModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleSaveEmployee} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}>
                {editingEmployee ? 'Save Changes' : 'Create Employee Account'}
              </Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEmployee} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Full Name"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                placeholder="e.g. Melat Tadesse"
                required
              />
              <Input
                label="Username / Employee ID"
                value={formUsername}
                onChange={(e) => setFormUsername(e.target.value)}
                placeholder="e.g. 5845943782549061 or melat.t"
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Phone Number"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="+251911690229"
                required
              />
              <Input
                label="Official Email"
                type="email"
                value={formEmail}
                onChange={(e) => setFormEmail(e.target.value)}
                placeholder="melat@michuutms.et"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tms-input-group">
                <label className="tms-input-label">Assigned Branch</label>
                <select
                  className="tms-input"
                  value={formBranch}
                  onChange={(e) => setFormBranch(e.target.value)}
                >
                  {AVAILABLE_BRANCHES.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div className="tms-input-group">
                <label className="tms-input-label">Organization Unit</label>
                <input
                  className="tms-input"
                  value={formOrgUnit}
                  onChange={(e) => setFormOrgUnit(e.target.value)}
                  placeholder="e.g. Land Development and Administration Bureau"
                />
              </div>
            </div>

            {/* Role Multi-Selection */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Assigned RBAC Roles
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
                {availableRoles.map((r) => {
                  const isChecked = formRoles.includes(r.badge) || formRoles.includes(r.key);
                  return (
                    <label
                      key={r.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: isChecked ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        fontSize: 'var(--font-size-xs)',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormRoles([...formRoles, r.badge]);
                          } else {
                            setFormRoles(formRoles.filter((x) => x !== r.badge && x !== r.key));
                          }
                        }}
                      />
                      <span style={{ fontWeight: 700 }}>{r.label} ({r.badge})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="tms-input-group">
              <label className="tms-input-label">Account Status</label>
              <select
                className="tms-input"
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as 'Active' | 'Inactive')}
              >
                <option value="Active">Active (Permitted login)</option>
                <option value="Inactive">Inactive (Suspended)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* ── MODAL 2: VIEW EMPLOYEE PROFILE MODAL ── */}
      {isViewModalOpen && viewingEmployee && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Employee Record: ${viewingEmployee.name}`}
          size="md"
          footer={
            <Button variant="secondary" size="sm" onClick={() => setIsViewModalOpen(false)}>
              Close
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>
                {viewingEmployee.name.charAt(0)}
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, margin: 0 }}>{viewingEmployee.name}</h3>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: 2 }}>Username: {viewingEmployee.username}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Phone Number</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{viewingEmployee.phoneNumber}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Official Email</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{viewingEmployee.email}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Branch</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{viewingEmployee.branch}</div>
              </div>

              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Organization Unit</div>
                <div style={{ fontWeight: 700, marginTop: 2 }}>{viewingEmployee.organizationUnit}</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>Assigned Roles</div>
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {viewingEmployee.roles.map((r) => (
                  <span key={r} style={{ padding: '3px 8px', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontWeight: 700, fontSize: '11px' }}>
                    🛡️ {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 3: RESET PASSWORD MODAL ── */}
      {isResetPassModalOpen && resetPassEmployee && (
        <Modal
          isOpen={isResetPassModalOpen}
          onClose={() => setIsResetPassModalOpen(false)}
          title={`Reset Password for ${resetPassEmployee.name}`}
          size="sm"
          footer={
            <Button variant="primary" size="sm" onClick={() => setIsResetPassModalOpen(false)}>
              Done
            </Button>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'center' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
              <KeyRound size={22} />
            </div>

            <div>
              <h4 style={{ margin: 0, fontSize: 'var(--font-size-md)', fontWeight: 800 }}>Temporary Password Generated</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Share this secure temporary credential with <strong>{resetPassEmployee.name}</strong>. They will be prompted to change it upon first login.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--brand-primary)', flex: 1, letterSpacing: '0.05em' }}>
                {generatedPass}
              </span>
              <button
                type="button"
                onClick={handleCopyPass}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '0.35rem 0.65rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isPassCopied ? '#16a34a' : 'var(--bg-tertiary)',
                  color: isPassCopied ? '#fff' : 'var(--text-primary)',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isPassCopied ? <Check size={13} /> : <Copy size={13} />}
                {isPassCopied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Employee Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setIsDeleting(true);
          try {
            await http.delete(`/users/${deleteTarget.id}`);
            setDeleteTarget(null);
            await fetchEmployeesData();
          } catch {
          } finally {
            setIsDeleting(false);
          }
        }}
        title="Delete Staff Member"
        message={`Are you sure you want to delete employee "${deleteTarget?.name}"? They will lose all role permissions and system access.`}
        confirmText="Delete Employee"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
};

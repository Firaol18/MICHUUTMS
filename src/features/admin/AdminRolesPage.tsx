import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import {
  Users, Plus, ArrowLeft, Edit2, Trash2, Shield, Save, X,
} from 'lucide-react';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';

interface ExtendedRoleItem {
  id: string;
  roleKey: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
  isLocked?: boolean;
  isEditable?: boolean;
  isSwitchable?: boolean;
  permissions: string[]; // e.g. "tour:create", "booking:approve"
}

const INITIAL_ROLES_LIST: ExtendedRoleItem[] = [
  {
    id: 'role-1',
    roleKey: 'SUPER_ADMIN',
    name: 'Super Administrator',
    description: 'Unrestricted enterprise control across all platform resources and policies.',
    status: 'Active',
    createdDate: '4/6/2025',
    isLocked: true,
    isEditable: false,
    isSwitchable: true,
    permissions: [
      'tour:read', 'tour:update', 'tour:create', 'tour:delete',
      'booking:read', 'booking:update', 'booking:create', 'booking:approve', 'booking:cancel',
      'payment:read', 'payment:create', 'payment:refund', 'payment:authorize',
      'customer:read', 'customer:update', 'customer:verify',
      'supplier:read', 'supplier:manage',
      'report:read', 'report:export',
      'system:read', 'system:update',
    ],
  },
  {
    id: 'role-2',
    roleKey: 'ADMIN',
    name: 'Tourism Administrator',
    description: 'Full portal operations management, package approvals, and revenue oversight.',
    status: 'Active',
    createdDate: '5/5/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: [
      'tour:read', 'tour:update', 'tour:create', 'tour:delete',
      'booking:read', 'booking:update', 'booking:create', 'booking:approve',
      'payment:read', 'payment:create', 'payment:refund',
      'customer:read', 'customer:update',
      'supplier:read', 'supplier:manage',
      'report:read',
    ],
  },
  {
    id: 'role-3',
    roleKey: 'TOUR_MANAGER',
    name: 'Tour Operations Manager',
    description: 'Creates and manages tour packages, configures itineraries, and assigns guides.',
    status: 'Active',
    createdDate: '10/4/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: [
      'tour:read', 'tour:update', 'tour:create', 'tour:delete',
      'booking:read', 'booking:approve',
      'customer:read',
      'supplier:read', 'supplier:manage',
    ],
  },
  {
    id: 'role-4',
    roleKey: 'BOOKING_AGENT',
    name: 'Booking & Reservations Agent',
    description: 'Processes online customer reservations, confirms booking statuses, and verifies passport data.',
    status: 'Active',
    createdDate: '6/15/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: [
      'tour:read',
      'booking:read', 'booking:update', 'booking:create', 'booking:approve',
      'customer:read', 'customer:update', 'customer:verify',
    ],
  },
  {
    id: 'role-5',
    roleKey: 'ACCOUNTANT',
    name: 'Finance Accountant',
    description: 'Monitors booking transactions, processes refund payouts, generates ledger & tax reports.',
    status: 'Active',
    createdDate: '4/21/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: [
      'booking:read',
      'payment:read', 'payment:create', 'payment:refund', 'payment:authorize',
      'report:read', 'report:export',
    ],
  },
  {
    id: 'role-6',
    roleKey: 'GUIDE',
    name: 'Licensed Ranger Guide',
    description: 'Views assigned expedition schedules, passenger rosters, emergency contacts, and daily itineraries.',
    status: 'Active',
    createdDate: '12/8/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: ['tour:read', 'booking:read', 'customer:read'],
  },
  {
    id: 'role-7',
    roleKey: 'DRIVER',
    name: 'Expedition Fleet Driver',
    description: 'Accesses vehicle dispatch rosters, tourist pickup points, and passenger headcounts.',
    status: 'Active',
    createdDate: '9/9/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: ['tour:read', 'customer:read'],
  },
  {
    id: 'role-8',
    roleKey: 'CUSTOMER',
    name: 'Public Traveler / Customer',
    description: 'Browses destinations, reserves tour packages, manages self-service bookings & reviews.',
    status: 'Active',
    createdDate: '6/1/2025',
    isLocked: false,
    isEditable: true,
    isSwitchable: true,
    permissions: ['tour:read', 'booking:create', 'payment:create'],
  },
];

const MATRIX_RESOURCES = [
  'tour',
  'booking',
  'payment',
  'report',
  'customer',
  'supplier',
  'guide',
  'driver',
  'system',
];

const MATRIX_ACTIONS = [
  { key: 'read', label: 'READ' },
  { key: 'update', label: 'UPDATE' },
  { key: 'create', label: 'CREATE' },
  { key: 'delete', label: 'DELETE' },
  { key: 'verify', label: 'VERIFY' },
  { key: 'approve', label: 'APPROVE' },
  { key: 'refund', label: 'REFUND' },
  { key: 'authorize', label: 'AUTHORIZE' },
  { key: 'cancel', label: 'CANCEL' },
  { key: 'dispatch', label: 'DISPATCH' },
  { key: 'export', label: 'EXPORT' },
  { key: 'manage', label: 'MANAGE' },
];

export const AdminRolesPage: React.FC = () => {
  // Navigation mode: 'list' (Image 1) vs 'detail' (Image 2)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [rolesList, setRolesList] = useState<ExtendedRoleItem[]>(INITIAL_ROLES_LIST);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Form State for Image 2 (Create / Edit Role Detail)
  const [activeEditingId, setActiveEditingId] = useState<string | null>(null);
  const [formRoleName, setFormRoleName] = useState('');
  const [formRoleDesc, setFormRoleDesc] = useState('');
  const [formStatus, setFormStatus] = useState<'Active' | 'Inactive'>('Active');
  const [formIsEditable, setFormIsEditable] = useState(true);
  const [formIsSwitchable, setFormIsSwitchable] = useState(true);
  const [formPermissions, setFormPermissions] = useState<string[]>([]);

  // ── Open Create Mode ──
  const handleOpenCreate = () => {
    setActiveEditingId(null);
    setFormRoleName('');
    setFormRoleDesc('');
    setFormStatus('Active');
    setFormIsEditable(true);
    setFormIsSwitchable(true);
    setFormPermissions(['tour:read', 'booking:read']);
    setViewMode('detail');
  };

  // ── Open Edit Mode ──
  const handleOpenEdit = (role: ExtendedRoleItem) => {
    setActiveEditingId(role.id);
    setFormRoleName(role.name);
    setFormRoleDesc(role.description);
    setFormStatus(role.status);
    setFormIsEditable(role.isEditable ?? true);
    setFormIsSwitchable(role.isSwitchable ?? true);
    setFormPermissions([...role.permissions]);
    setViewMode('detail');
  };

  // ── Delete Role ──
  const handleDeleteRole = (id: string) => {
    setRolesList((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Toggle Matrix Cell Checkbox in Detail View ──
  const toggleMatrixCell = (resource: string, actionKey: string) => {
    const permKey = `${resource}:${actionKey}`;
    setFormPermissions((prev) =>
      prev.includes(permKey) ? prev.filter((p) => p !== permKey) : [...prev, permKey]
    );
  };

  // ── Toggle All Actions for a Resource ──
  const toggleResourceRow = (resource: string) => {
    const resourcePerms = MATRIX_ACTIONS.map((a) => `${resource}:${a.key}`);
    const allChecked = resourcePerms.every((p) => formPermissions.includes(p));

    if (allChecked) {
      setFormPermissions((prev) => prev.filter((p) => !resourcePerms.includes(p)));
    } else {
      const added = new Set([...formPermissions, ...resourcePerms]);
      setFormPermissions(Array.from(added));
    }
  };

  // ── Save Role Form (Image 2 -> Image 1) ──
  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) return;

    if (activeEditingId) {
      // Update existing role
      setRolesList((prev) =>
        prev.map((r) =>
          r.id === activeEditingId
            ? {
                ...r,
                name: formRoleName,
                description: formRoleDesc,
                status: formStatus,
                isEditable: formIsEditable,
                isSwitchable: formIsSwitchable,
                permissions: formPermissions,
              }
            : r
        )
      );
    } else {
      // Create new role
      const roleKey = formRoleName.trim().toUpperCase().replace(/\s+/g, '_');
      const newRole: ExtendedRoleItem = {
        id: `role-${Date.now()}`,
        roleKey,
        name: formRoleName,
        description: formRoleDesc || 'Custom enterprise RBAC role.',
        status: formStatus,
        createdDate: new Date().toLocaleDateString(),
        isEditable: formIsEditable,
        isSwitchable: formIsSwitchable,
        permissions: formPermissions,
      };
      setRolesList([newRole, ...rolesList]);
    }

    setViewMode('list');
  };

  // Filtered Roles List for Table
  const filteredRoles = rolesList.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.roleKey.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<ExtendedRoleItem>[] = [
    {
      header: 'Role Name',
      cell: (role) => (
        <>
          <div style={{ fontWeight: 800, color: '#034ea2', fontSize: 'var(--font-size-sm)' }}>
            {role.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {role.roleKey}
          </div>
        </>
      ),
    },
    {
      header: 'Description',
      cell: (role) => (
        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {role.description}
        </span>
      ),
    },
    {
      header: 'Status',
      width: '120px',
      align: 'center',
      cell: (role) => (
        <div style={{ display: 'inline-flex', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
          <span
            style={{
              padding: '2px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 10,
              fontWeight: 800,
              backgroundColor: role.status === 'Active' ? 'rgba(22, 163, 74, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: role.status === 'Active' ? '#16a34a' : '#ef4444',
            }}
          >
            {role.status}
          </span>
          {role.isLocked && (
            <span style={{ padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: 10, fontWeight: 700, backgroundColor: 'rgba(37, 99, 235, 0.12)', color: 'var(--brand-primary)' }}>
              Locked
            </span>
          )}
        </div>
      ),
    },
    {
      header: 'Created Date',
      width: '130px',
      cell: (role) => (
        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {role.createdDate}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '160px',
      align: 'center',
      cell: (role) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(role)}
            style={{
              padding: '0.3rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(37,99,235,0.3)',
              backgroundColor: 'rgba(37,99,235,0.08)',
              color: 'var(--brand-primary)',
              fontSize: 11,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
            title="Edit Role & Permissions Matrix"
          >
            <Edit2 size={12} /> Edit
          </button>

          {!role.isLocked && (
            <button
              type="button"
              onClick={() => handleDeleteRole(role.id)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid rgba(239,68,68,0.3)',
                backgroundColor: 'rgba(239,68,68,0.08)',
                color: '#ef4444',
                fontSize: 11,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Delete Role"
            >
              <Trash2 size={12} /> Delete
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* ─────────────────────────────────────────────────────────────────────────────
          PAGE 1: ROLES LIST DATA TABLE (Exact Image 1 Layout)
         ───────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          {/* Breadcrumb & Header Bar */}
          <div>
            <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Users style={{ color: 'var(--brand-primary)' }} /> Roles
                </h1>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Manage and configure user roles and their permissions
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                icon={<Plus size={16} />}
                onClick={handleOpenCreate}
                style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}
              >
                + Create Role
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredRoles}
            keyExtractor={(role) => role.id}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            searchPlaceholder="Search by role name or description..."
            entityName="roles"
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────────────────────
          PAGE 2: CREATE / EDIT ROLE OPERATION DETAIL VIEW (Exact Image 2 Layout)
         ───────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'detail' && (
        <form onSubmit={handleSaveRole} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Header Bar with Back Arrow */}
          <div style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-primary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                marginBottom: '0.5rem',
              }}
            >
              <ArrowLeft size={16} /> Back to Roles List
            </button>

            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Shield style={{ color: '#034ea2' }} /> {activeEditingId ? `Configure Role & Permissions` : 'Create New Role'}
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              {activeEditingId ? `Editing permissions for ${formRoleName}` : 'Create a new enterprise role and assign granular resources & actions'}
            </p>
          </div>

          {/* Section 1: Basic Information */}
          <Card glass style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 0.25rem 0' }}>
              Basic Information
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Enter the role name and description
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Role Name *
                </label>
                <input
                  type="text"
                  value={formRoleName}
                  onChange={(e) => setFormRoleName(e.target.value)}
                  placeholder="e.g. Admin, Manager, Viewer"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                  Status
                </label>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.6rem', fontSize: 'var(--font-size-xs)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="roleStatus"
                      checked={formStatus === 'Active'}
                      onChange={() => setFormStatus('Active')}
                    />
                    Active
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontWeight: 600 }}>
                    <input
                      type="radio"
                      name="roleStatus"
                      checked={formStatus === 'Inactive'}
                      onChange={() => setFormStatus('Inactive')}
                    />
                    Inactive
                  </label>
                </div>
              </div>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                Description
              </label>
              <textarea
                rows={3}
                value={formRoleDesc}
                onChange={(e) => setFormRoleDesc(e.target.value)}
                placeholder="Enter role description..."
                style={{
                  width: '100%',
                  padding: '0.625rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </Card>

          {/* Section 2: Advanced Settings */}
          <Card glass style={{ padding: '1.25rem' }}>
            <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-secondary)', margin: '0 0 0.875rem 0', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Advanced Settings
            </h4>

            <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', fontSize: 'var(--font-size-xs)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formIsEditable}
                  onChange={(e) => setFormIsEditable(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Editable</span>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Allow this role to be modified</div>
                </div>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formIsSwitchable}
                  onChange={(e) => setFormIsSwitchable(e.target.checked)}
                  style={{ marginTop: 2 }}
                />
                <div>
                  <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Switchable</span>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Allow users to switch to this role</div>
                </div>
              </label>
            </div>
          </Card>

          {/* Section 3: Full Horizontal Permissions Data Matrix (Exact Image 2 Layout) */}
          <Card glass style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                ⚡ Permissions Matrix
              </h3>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: 2, margin: 0 }}>
                Select the resources and actions this role can access
              </p>
            </div>

            <div style={{ overflowX: 'auto', maxHeight: '500px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr style={{ backgroundColor: '#034ea2', color: '#ffffff', position: 'sticky', top: 0, zIndex: 5 }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 160, borderRight: '1px solid rgba(255,255,255,0.15)' }}>
                      RESOURCE
                    </th>
                    {MATRIX_ACTIONS.map((act) => (
                      <th
                        key={act.key}
                        style={{
                          padding: '0.625rem 0.5rem',
                          textAlign: 'center',
                          fontWeight: 800,
                          fontSize: 10,
                          letterSpacing: '0.05em',
                          borderRight: '1px solid rgba(255,255,255,0.1)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {act.label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {MATRIX_RESOURCES.map((res, rIdx) => {
                    const rowPerms = MATRIX_ACTIONS.map((a) => `${res}:${a.key}`);
                    const isRowFullyChecked = rowPerms.every((p) => formPermissions.includes(p));

                    return (
                      <tr
                        key={res}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: rIdx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
                        }}
                      >
                        {/* Resource Name with Row Select-All Checkbox */}
                        <td
                          style={{
                            padding: '0.625rem 1rem',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                            borderRight: '1px solid var(--border-color)',
                          }}
                        >
                          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input
                              type="checkbox"
                              checked={isRowFullyChecked}
                              onChange={() => toggleResourceRow(res)}
                            />
                            <span style={{ textTransform: 'capitalize' }}>{res}</span>
                          </label>
                        </td>

                        {/* Interactive Checkbox Cell for Action */}
                        {MATRIX_ACTIONS.map((act) => {
                          const permKey = `${res}:${act.key}`;
                          const isChecked = formPermissions.includes(permKey);

                          return (
                            <td
                              key={act.key}
                              style={{
                                padding: '0.5rem',
                                textAlign: 'center',
                                borderRight: '1px solid var(--border-color)',
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => toggleMatrixCell(res, act.key)}
                                style={{ width: 14, height: 14, cursor: 'pointer' }}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Footer Submit Buttons */}
          <div className="flex-between" style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <Button variant="ghost" size="sm" type="button" onClick={() => setViewMode('list')} icon={<X size={14} />}>
              Cancel
            </Button>

            <Button variant="primary" size="sm" type="submit" icon={<Save size={14} />} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
              Save Role & Permissions
            </Button>
          </div>

        </form>
      )}

    </div>
  );
};

import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Modal } from '@tms/shared/components/common/Modal';
import {
  Users, Plus, ArrowLeft, Edit2, Trash2, Shield, Save, X, Eye, AlertTriangle, Key,
} from 'lucide-react';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';

import { http } from '@tms/shared/services/apiClient';

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

interface ApiResource {
  id: number;
  name: string;
  description?: string;
}

interface ApiAction {
  id: number;
  action: string;
  description?: string;
}

const DEFAULT_MATRIX_RESOURCES = [
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

const DEFAULT_MATRIX_ACTIONS = [
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
  const [rolesList, setRolesList] = useState<ExtendedRoleItem[]>([]);
  const [dbResources, setDbResources] = useState<ApiResource[]>([]);
  const [dbActions, setDbActions] = useState<ApiAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const fetchRolesData = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, resRes, actRes] = await Promise.all([
        http.get('/roles'),
        http.get('/permissions/resources'),
        http.get('/permissions/actions'),
      ]);

      if (Array.isArray(resRes.data)) {
        setDbResources(resRes.data);
      }
      if (Array.isArray(actRes.data)) {
        setDbActions(actRes.data);
      }

      if (Array.isArray(rolesRes.data)) {
        setRolesList(
          rolesRes.data.map((r: any) => {
            const perms: string[] = [];
            if (r.rolePermissionResources) {
              r.rolePermissionResources.forEach((rpr: any) => {
                const resName = (rpr.resource?.name || '').toLowerCase();
                if (rpr.rolePermissionResourceActions) {
                  rpr.rolePermissionResourceActions.forEach((rpra: any) => {
                    const actName = (rpra.action?.action || '').toLowerCase();
                    if (resName && actName) {
                      perms.push(`${resName}:${actName}`);
                    }
                  });
                }
              });
            }
            return {
              id: String(r.id),
              roleKey: r.name.toUpperCase().replace(/\s+/g, '_'),
              name: r.name,
              description: r.description || '',
              status: r.is_active !== false ? 'Active' : 'Inactive',
              createdDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A',
              isLocked: r.isLocked ?? false,
              isEditable: r.editable ?? true,
              isSwitchable: r.switchable ?? true,
              permissions: perms,
            };
          })
        );
      }
    } catch {
      setRolesList([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRolesData();
  }, []);

  // ── Dynamic Resources & Actions for Matrix ──
  const matrixResources = dbResources.length > 0
    ? dbResources.map((r) => r.name.toLowerCase())
    : DEFAULT_MATRIX_RESOURCES;

  const matrixActions = dbActions.length > 0
    ? dbActions.map((a) => ({ key: a.action.toLowerCase(), label: a.action.toUpperCase() }))
    : DEFAULT_MATRIX_ACTIONS;

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

  // View Modal State
  const [viewingRole, setViewingRole] = useState<ExtendedRoleItem | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Delete Reason Modal State
  const [deletingRole, setDeletingRole] = useState<ExtendedRoleItem | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteReason, setDeleteReason] = useState('Deprecated Role');
  const [deleteCustomNote, setDeleteCustomNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Open View Mode ──
  const handleOpenView = (role: ExtendedRoleItem) => {
    setViewingRole(role);
    setIsViewModalOpen(true);
  };

  // ── Open Delete Modal with Reason ──
  const handleOpenDelete = (role: ExtendedRoleItem) => {
    setDeletingRole(role);
    setDeleteReason('Deprecated Role');
    setDeleteCustomNote('');
    setIsDeleteModalOpen(true);
  };

  // ── Confirm Delete Role ──
  const handleConfirmDeleteRole = async () => {
    if (!deletingRole) return;
    setIsDeleting(true);
    try {
      await http.delete(`/roles/${deletingRole.id}`);
      await fetchRolesData();
      setIsDeleteModalOpen(false);
      setDeletingRole(null);
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Delete Role ──
  const handleDeleteRole = async (id: string) => {
    try {
      await http.delete(`/roles/${id}`);
      await fetchRolesData();
    } catch {}
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
    const resourcePerms = matrixActions.map((a) => `${resource}:${a.key}`);
    const allChecked = resourcePerms.every((p) => formPermissions.includes(p));

    if (allChecked) {
      setFormPermissions((prev) => prev.filter((p) => !resourcePerms.includes(p)));
    } else {
      const added = new Set([...formPermissions, ...resourcePerms]);
      setFormPermissions(Array.from(added));
    }
  };

  // ── Save Role Form (Image 2 -> Image 1) ──
  const handleSaveRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formRoleName.trim()) return;

    try {
      const rolePermissionResources = dbResources
        .map((res) => {
          const resourceKey = res.name.toLowerCase();
          const matchedActions = dbActions
            .filter((act) => formPermissions.includes(`${resourceKey}:${act.action.toLowerCase()}`))
            .map((act) => ({ permission_action_id: act.id }));

          return {
            permission_resource_id: res.id,
            rolePermissionResourceActions: matchedActions,
          };
        })
        .filter((rpr) => rpr.rolePermissionResourceActions.length > 0);

      const payload = {
        name: formRoleName.trim(),
        description: formRoleDesc || 'Custom RBAC role.',
        is_active: formStatus === 'Active',
        editable: formIsEditable,
        switchable: formIsSwitchable,
        rolePermissionResources,
      };

      if (activeEditingId) {
        await http.put(`/roles/${activeEditingId}`, { ...payload, id: Number(activeEditingId) });
      } else {
        await http.post('/roles', payload);
      }
      await fetchRolesData();
    } catch {}

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
      width: '120px',
      align: 'center',
      cell: (role) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenView(role)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEdit(role)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="Edit Role & Permissions"
          >
            <Edit2 size={16} />
          </button>

          {!role.isLocked && (
            <button type="button" onClick={() => handleOpenDelete(role)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Delete"><Trash2 size={16} /></button>
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
                    {matrixActions.map((act) => (
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
                  {matrixResources.map((res, rIdx) => {
                    const rowPerms = matrixActions.map((a) => `${res}:${a.key}`);
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
                        {matrixActions.map((act) => {
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

      {/* ── VIEW ROLE DETAIL MODAL ── */}
      {isViewModalOpen && viewingRole && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Role Details: ${viewingRole.name}`}
          size="md"
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<Edit2 size={14} />}
                onClick={() => {
                  setIsViewModalOpen(false);
                  handleOpenEdit(viewingRole);
                }}
                style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}
              >
                Edit Role
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(3,78,162,0.1)', color: '#034ea2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Key size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Role ID #{viewingRole.id}
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewingRole.name}
                </div>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: viewingRole.status === 'Active' ? 'rgba(22,163,74,0.12)' : 'rgba(239,68,68,0.12)',
                  color: viewingRole.status === 'Active' ? '#16a34a' : '#ef4444',
                }}
              >
                {viewingRole.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Created Date</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingRole.createdDate}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Permissions Assigned</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingRole.permissions.length} actions</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Editable</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingRole.isEditable ? 'Yes' : 'No'}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Locked System Role</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingRole.isLocked ? 'Yes' : 'No'}</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>Role Description</div>
              <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {viewingRole.description || 'No description provided.'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── DELETE ROLE WITH REASON MODAL ── */}
      {isDeleteModalOpen && deletingRole && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Role Deletion"
          size="md"
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                isLoading={isDeleting}
                icon={<Trash2 size={14} />}
                onClick={handleConfirmDeleteRole}
              >
                Confirm & Permanently Delete
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '0.875rem', backgroundColor: 'rgba(239,68,68,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
              <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
                You are about to delete role <strong>"{deletingRole.name}"</strong> (ID: {deletingRole.id}). All users assigned to this role will lose their permissions.
              </div>
            </div>

            <div className="tms-input-group">
              <label className="tms-input-label">
                Reason for Deletion <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                className="tms-input"
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
              >
                <option value="Deprecated Role">Deprecated / Outdated Role</option>
                <option value="Organizational Restructure">Organizational Restructure</option>
                <option value="Security Policy Update">Security Policy Update</option>
                <option value="Accidental Duplicate">Accidental Duplicate / Mistake</option>
                <option value="Roles Consolidation">Roles Consolidation</option>
                <option value="Other">Other (Specify below)</option>
              </select>
            </div>

            <div className="tms-input-group">
              <label className="tms-input-label">Additional Deletion Notes / Audit Log</label>
              <textarea
                className="tms-input"
                rows={2}
                value={deleteCustomNote}
                onChange={(e) => setDeleteCustomNote(e.target.value)}
                placeholder="Enter audit explanation for this role deletion..."
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

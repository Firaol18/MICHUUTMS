import React, { useState } from 'react';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { ShieldCheck, Plus, Edit2, Trash2, Eye, AlertTriangle, Key } from 'lucide-react';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';

import { http } from '@tms/shared/services/apiClient';

interface PermissionResourceItem {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export const AdminPermissionResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<PermissionResourceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // View Detail Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingResource, setViewingResource] = useState<PermissionResourceItem | null>(null);

  // Delete Reason Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<PermissionResourceItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Deprecated Resource');
  const [deleteCustomNote, setDeleteCustomNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchResources = async () => {
    setIsLoading(true);
    try {
      const res = await http.get('/permissions/resources');
      if (Array.isArray(res.data)) {
        setResources(
          res.data.map((r: any) => ({
            id: String(r.id),
            key: r.name,
            name: r.name,
            description: r.description || 'N/A',
            status: r.draft ? 'Inactive' : 'Active',
            createdDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          }))
        );
      }
    } catch {
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchResources();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenView = (res: PermissionResourceItem) => {
    setViewingResource(res);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (res: PermissionResourceItem) => {
    setEditingId(res.id);
    setName(res.name);
    setDescription(res.description === 'N/A' ? '' : res.description);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (res: PermissionResourceItem) => {
    setDeletingResource(res);
    setDeleteReason('Deprecated Resource');
    setDeleteCustomNote('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingResource) return;
    setIsDeleting(true);
    try {
      await http.delete(`/permissions/resources/${deletingResource.id}`);
      await fetchResources();
      setIsDeleteModalOpen(false);
      setDeletingResource(null);
    } catch {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await http.put(`/permissions/resources/${editingId}`, {
          name: name.trim(),
          description: description || 'N/A',
          draft: false,
        });
      } else {
        await http.post('/permissions/resources', {
          name: name.trim(),
          description: description || 'N/A',
          draft: false,
        });
      }
      await fetchResources();
    } catch {}

    setIsModalOpen(false);
  };

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<PermissionResourceItem>[] = [
    {
      header: 'Resource Name',
      cell: (res) => (
        <div style={{ fontWeight: 700, color: '#034ea2', fontFamily: 'monospace' }}>
          {res.name}
        </div>
      ),
    },
    {
      header: 'Description',
      cell: (res) => (
        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {res.description}
        </span>
      ),
    },
    {
      header: 'Status',
      width: '120px',
      align: 'center',
      cell: (res) => (
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 'var(--radius-full)',
            fontSize: 10,
            fontWeight: 800,
            backgroundColor: 'rgba(22, 163, 74, 0.12)',
            color: '#16a34a',
          }}
        >
          {res.status}
        </span>
      ),
    },
    {
      header: 'Created Date',
      width: '130px',
      cell: (res) => (
        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {res.createdDate}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '120px',
      align: 'center',
      cell: (res) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenView(res)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEdit(res)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="Edit Resource"
          >
            <Edit2 size={16} />
          </button>

          <button type="button" onClick={() => handleOpenDelete(res)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Delete"><Trash2 size={16} /></button>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Bar */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck style={{ color: '#034ea2' }} /> Permission Resources
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage and configure permission resources for access control
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}
          >
            + Create Resource
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredResources}
        keyExtractor={(res) => res.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by resource name..."
        entityName="resources"
      />

      {/* ── MODAL 1: CREATE / EDIT RESOURCE MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Permission Resource' : 'Create Permission Resource'}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} icon={<Plus size={14} />} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}>
              Save Resource
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="tms-input-group">
            <label className="tms-input-label">
              Resource Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. tour-packages, customer-profiles, booking-engine"
              required
            />
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Unique alphanumeric slug for backend route authorization matching.
            </span>
          </div>

          <div className="tms-input-group">
            <label className="tms-input-label">Description</label>
            <textarea
              className="tms-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe which module or features this permission resource covers..."
              style={{
                width: '100%',
                padding: '0.625rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-xs)',
              }}
            />
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: VIEW RESOURCE DETAIL MODAL ── */}
      {isViewModalOpen && viewingResource && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Resource Details: ${viewingResource.name}`}
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
                  handleOpenEdit(viewingResource);
                }}
                style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}
              >
                Edit Resource
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
                  Resource Slug ID #{viewingResource.id}
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'monospace' }}>
                  {viewingResource.name}
                </div>
              </div>
              <span
                style={{
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 11,
                  fontWeight: 800,
                  backgroundColor: 'rgba(22, 163, 74, 0.12)',
                  color: '#16a34a',
                }}
              >
                {viewingResource.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Created Date</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingResource.createdDate}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Access Scope</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>Enterprise Platform RBAC</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>Resource Description</div>
              <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {viewingResource.description || 'No specific description provided for this permission resource.'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION WITH REASON MODAL ── */}
      {isDeleteModalOpen && deletingResource && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Resource Deletion"
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
                onClick={handleConfirmDelete}
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
                You are about to delete resource <strong>"{deletingResource.name}"</strong> (ID: {deletingResource.id}). This may affect roles utilizing this resource for authorization.
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
                <option value="Deprecated Resource">Deprecated / Outdated Resource</option>
                <option value="Security Policy Cleanup">Security & Compliance Policy Cleanup</option>
                <option value="Accidental Duplicate">Accidental Duplicate / Mistake</option>
                <option value="Refactoring Permissions Structure">Refactoring Permissions Structure</option>
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
                placeholder="Enter audit explanation for this deletion..."
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

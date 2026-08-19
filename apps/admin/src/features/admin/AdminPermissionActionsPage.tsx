import React, { useState } from 'react';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Plus, Edit2, Trash2, Zap, Eye, AlertTriangle } from 'lucide-react';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';

import { http } from '@tms/shared/services/apiClient';

interface PermissionActionItem {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

export const AdminPermissionActionsPage: React.FC = () => {
  const [actions, setActions] = useState<PermissionActionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Create / Edit Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  // View Detail Modal
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingAction, setViewingAction] = useState<PermissionActionItem | null>(null);

  // Delete Reason Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAction, setDeletingAction] = useState<PermissionActionItem | null>(null);
  const [deleteReason, setDeleteReason] = useState('Deprecated Action');
  const [deleteCustomNote, setDeleteCustomNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      const res = await http.get('/permissions/actions');
      if (Array.isArray(res.data)) {
        setActions(
          res.data.map((a: any) => ({
            id: String(a.id),
            key: a.action,
            name: a.action,
            description: a.description || 'N/A',
            status: a.draft ? 'Inactive' : 'Active',
            createdDate: a.createdAt ? new Date(a.createdAt).toLocaleDateString() : new Date().toLocaleDateString(),
          }))
        );
      }
    } catch {
      setActions([]);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchActions();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenView = (act: PermissionActionItem) => {
    setViewingAction(act);
    setIsViewModalOpen(true);
  };

  const handleOpenEdit = (act: PermissionActionItem) => {
    setEditingId(act.id);
    setName(act.name);
    setDescription(act.description === 'N/A' ? '' : act.description);
    setIsModalOpen(true);
  };

  const handleOpenDelete = (act: PermissionActionItem) => {
    setDeletingAction(act);
    setDeleteReason('Deprecated Action');
    setDeleteCustomNote('');
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingAction) return;
    setIsDeleting(true);
    try {
      await http.delete(`/permissions/actions/${deletingAction.id}`);
      await fetchActions();
      setIsDeleteModalOpen(false);
      setDeletingAction(null);
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
        await http.put(`/permissions/actions/${editingId}`, {
          action: name.trim(),
          description: description || 'N/A',
          draft: false,
        });
      } else {
        await http.post('/permissions/actions', {
          action: name.trim(),
          description: description || 'N/A',
          draft: false,
        });
      }
      await fetchActions();
    } catch {}

    setIsModalOpen(false);
  };

  const filteredActions = actions.filter(
    (a) =>
      a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: Column<PermissionActionItem>[] = [
    {
      header: 'Action Name',
      cell: (act) => (
        <>
          <div style={{ fontWeight: 700, color: '#034ea2' }}>
            {act.name}
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
            {act.name.toLowerCase()}
          </div>
        </>
      ),
    },
    {
      header: 'Description',
      cell: (act) => (
        <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          {act.description}
        </span>
      ),
    },
    {
      header: 'Status',
      width: '120px',
      align: 'center',
      cell: (act) => (
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
          {act.status}
        </span>
      ),
    },
    {
      header: 'Created Date',
      width: '130px',
      cell: (act) => (
        <span style={{ color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {act.createdDate}
        </span>
      ),
    },
    {
      header: 'Actions',
      width: '120px',
      align: 'center',
      cell: (act) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenView(act)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="View Details"
          >
            <Eye size={16} />
          </button>

          <button
            type="button"
            onClick={() => handleOpenEdit(act)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="Edit Action"
          >
            <Edit2 size={16} />
          </button>

          <button type="button" onClick={() => handleOpenDelete(act)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Delete"><Trash2 size={16} /></button>
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
              <Zap style={{ color: '#034ea2' }} /> Permission Actions
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Define CRUD operations and execution verbs for permission control
            </p>
          </div>

          <Button
            variant="primary"
            size="sm"
            icon={<Plus size={16} />}
            onClick={handleOpenAdd}
            style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}
          >
            + Create Action
          </Button>
        </div>
      </div>

      <DataTable
        columns={columns}
        data={filteredActions}
        keyExtractor={(act) => act.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search by action name..."
        entityName="actions"
      />

      {/* ── MODAL 1: CREATE / EDIT ACTION MODAL ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Permission Action' : 'Create Permission Action'}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleSave} icon={<Plus size={14} />} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}>
              Save Action
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="tms-input-group">
            <label className="tms-input-label">
              Action Name (Verb) <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Create, Read, Update, Delete, Approve, Authorize"
              required
            />
          </div>

          <div className="tms-input-group">
            <label className="tms-input-label">Description</label>
            <textarea
              className="tms-input"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Explain the scope and effect of this permission verb..."
            />
          </div>
        </form>
      </Modal>

      {/* ── MODAL 2: VIEW ACTION DETAIL MODAL ── */}
      {isViewModalOpen && viewingAction && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Action Details: ${viewingAction.name}`}
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
                  handleOpenEdit(viewingAction);
                }}
                style={{ backgroundColor: '#034ea2', borderColor: '#034ea2' }}
              >
                Edit Action
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: 'rgba(3,78,162,0.1)', color: '#034ea2', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Zap size={20} />
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Permission Verb ID #{viewingAction.id}
                </div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {viewingAction.name}
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
                {viewingAction.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Created Date</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>{viewingAction.createdDate}</div>
              </div>
              <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Operation Type</div>
                <div style={{ fontWeight: 700, marginTop: 4 }}>REST / API Verb</div>
              </div>
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)' }}>
              <div style={{ color: 'var(--text-muted)', fontWeight: 600, fontSize: 'var(--font-size-xs)' }}>Verb Description</div>
              <div style={{ marginTop: 4, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {viewingAction.description || 'No description provided.'}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MODAL 3: DELETE CONFIRMATION WITH REASON MODAL ── */}
      {isDeleteModalOpen && deletingAction && (
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Confirm Action Deletion"
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
                You are about to delete permission action verb <strong>"{deletingAction.name}"</strong> (ID: {deletingAction.id}). Any roles using this action will lose this authorization rule.
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
                <option value="Deprecated Action">Deprecated / Unused Action Verb</option>
                <option value="Security Consolidation">Security Policy Consolidation</option>
                <option value="Accidental Duplicate">Accidental Duplicate / Typo</option>
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
                placeholder="Enter reason for deletion audit..."
              />
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};

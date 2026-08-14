import React, { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Plus, Edit2, Trash2, Zap } from 'lucide-react';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';

interface PermissionActionItem {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

const INITIAL_ACTIONS: PermissionActionItem[] = [
  { id: 'act-1', key: 'approve', name: 'Approve', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-2', key: 'validate', name: 'Validate', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-3', key: 'archive', name: 'Archive', description: 'N/A', status: 'Active', createdDate: '10/14/2025' },
  { id: 'act-4', key: 'create', name: 'Create', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-5', key: 'verify', name: 'Verify', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-6', key: 'delete', name: 'Delete', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-7', key: 'reject', name: 'Reject', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-8', key: 'authorize', name: 'Authorize', description: 'N/A', status: 'Active', createdDate: '9/9/2025' },
  { id: 'act-9', key: 'dispatch', name: 'Dispatch', description: 'Dispatch', status: 'Active', createdDate: '10/3/2025' },
  { id: 'act-10', key: 'refund', name: 'Refund', description: 'Refund authorizing & ledger reversals', status: 'Active', createdDate: '11/1/2025' },
];

export const AdminPermissionActionsPage: React.FC = () => {
  const [actions, setActions] = useState<PermissionActionItem[]>(INITIAL_ACTIONS);
  const [searchQuery, setSearchQuery] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setName('');
    setDescription('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (act: PermissionActionItem) => {
    setEditingId(act.id);
    setName(act.name);
    setDescription(act.description === 'N/A' ? '' : act.description);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setActions((prev) =>
        prev.map((a) =>
          a.id === editingId
            ? { ...a, name: name.trim(), description: description || 'N/A' }
            : a
        )
      );
    } else {
      const newAct: PermissionActionItem = {
        id: `act-${Date.now()}`,
        key: name.trim().toLowerCase(),
        name: name.trim(),
        description: description || 'N/A',
        status: 'Active',
        createdDate: new Date().toLocaleDateString(),
      };
      setActions([newAct, ...actions]);
    }

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
      width: '160px',
      align: 'center',
      cell: (act) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={() => handleOpenEdit(act)}
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
          >
            <Edit2 size={12} /> Edit
          </button>

          <button
            type="button"
            onClick={() => handleDelete(act.id)}
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
          >
            <Trash2 size={12} /> Delete
          </button>
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
              Manage and configure permission actions for access control
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

      {/* Modal matching Image 4 creation */}
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
          <Input
            label="Action Verb (e.g. Approve, Create, Delete)"
            placeholder="e.g. Approve"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter action description..."
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

    </div>
  );
};

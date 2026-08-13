import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { ShieldCheck, Plus, Search, Edit2, Trash2 } from 'lucide-react';

interface PermissionResourceItem {
  id: string;
  key: string;
  name: string;
  description: string;
  status: 'Active' | 'Inactive';
  createdDate: string;
}

const INITIAL_RESOURCES: PermissionResourceItem[] = [
  { id: 'res-1', key: 'title-deed-application-lease-payment', name: 'title-deed-application-lease-payment', description: 'N/A', status: 'Active', createdDate: '3/27/2026' },
  { id: 'res-2', key: 'land-auction', name: 'land-auction', description: 'land-auction and auction complaint', status: 'Active', createdDate: '4/24/2026' },
  { id: 'res-3', key: 'title-deed-deactivation-application', name: 'title-deed-deactivation-application', description: 'N/A', status: 'Active', createdDate: '12/4/2025' },
  { id: 'res-4', key: 'manual-title-deed-application', name: 'manual-title-deed-application', description: 'N/A', status: 'Active', createdDate: '4/21/2026' },
  { id: 'res-5', key: 'bank-restriction-application', name: 'bank-restriction-application', description: 'bank restriction-application', status: 'Active', createdDate: '9/28/2025' },
  { id: 'res-6', key: 'land-bank-plot', name: 'land-bank-plot', description: 'N/A', status: 'Active', createdDate: '3/1/2026' },
  { id: 'res-7', key: 'complaint-appointment', name: 'complaint-appointment', description: 'complaint appointment', status: 'Active', createdDate: '2/16/2026' },
  { id: 'res-8', key: 'land_bank_deposit_application', name: 'land_bank_deposit_application', description: 'LAND_BANK_DEPOSIT_APPLICATION', status: 'Active', createdDate: '2/28/2026' },
  { id: 'res-9', key: 'boundary-demarcation-review', name: 'boundary-demarcation-review', description: 'boundary-demarcation-review', status: 'Active', createdDate: '11/14/2025' },
  { id: 'res-10', key: 'tour-expedition-package', name: 'tour-expedition-package', description: 'Tour packages & custom itinerary builder', status: 'Active', createdDate: '1/10/2026' },
  { id: 'res-11', key: 'booking-reservation-engine', name: 'booking-reservation-engine', description: 'Online customer booking reservations & guest manifests', status: 'Active', createdDate: '1/15/2026' },
];

export const AdminPermissionResourcesPage: React.FC = () => {
  const [resources, setResources] = useState<PermissionResourceItem[]>(INITIAL_RESOURCES);
  const [searchQuery, setSearchQuery] = useState('');
  const [entriesPerPage, setEntriesPerPage] = useState(15);

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

  const handleOpenEdit = (res: PermissionResourceItem) => {
    setEditingId(res.id);
    setName(res.name);
    setDescription(res.description === 'N/A' ? '' : res.description);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setResources((prev) => prev.filter((r) => r.id !== id));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setResources((prev) =>
        prev.map((r) =>
          r.id === editingId
            ? { ...r, name: name.trim().toLowerCase().replace(/\s+/g, '-'), description: description || 'N/A' }
            : r
        )
      );
    } else {
      const newRes: PermissionResourceItem = {
        id: `res-${Date.now()}`,
        key: name.trim().toLowerCase().replace(/\s+/g, '-'),
        name: name.trim().toLowerCase().replace(/\s+/g, '-'),
        description: description || 'N/A',
        status: 'Active',
        createdDate: new Date().toLocaleDateString(),
      };
      setResources([newRes, ...resources]);
    }

    setIsModalOpen(false);
  };

  const filteredResources = resources.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Bar matching Image 3 */}
      <div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          / Auth / Permission Resources
        </div>
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

      {/* Filter & Search Bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 400 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by resource name..."
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

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
          <span>Show</span>
          <select
            value={entriesPerPage}
            onChange={(e) => setEntriesPerPage(Number(e.target.value))}
            style={{
              padding: '0.35rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
            }}
          >
            <option value={10}>10</option>
            <option value={15}>15</option>
            <option value={25}>25</option>
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Data Table Matching Image 3 */}
      <Card glass style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: '#034ea2', color: '#ffffff' }}>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50 }}># ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>RESOURCE NAME ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>DESCRIPTION ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 120 }}>STATUS ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 130 }}>CREATED DATE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 160 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredResources.map((res, idx) => (
              <tr
                key={res.id}
                style={{
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                  {idx + 1}
                </td>

                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: '#034ea2', fontFamily: 'monospace' }}>
                    {res.name}
                  </div>
                </td>

                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  {res.description}
                </td>

                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
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
                </td>

                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  {res.createdDate}
                </td>

                <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(res)}
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
                      onClick={() => handleDelete(res.id)}
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Modal matching Image 3 creation */}
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
          <Input
            label="Resource Name (Key)"
            placeholder="e.g. land-auction, title-deed"
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
              placeholder="Enter resource description..."
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

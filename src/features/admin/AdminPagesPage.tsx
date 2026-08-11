import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Edit } from 'lucide-react';

interface CMSPage {
  id: string;
  title: string;
  type: string;
  slug: string;
  lastUpdated: string;
  status: 'published' | 'draft';
}

const INITIAL_PAGES: CMSPage[] = [
  { id: 'page-1', title: 'About Us & Company History', type: 'aboutus', slug: '/about', lastUpdated: '2026-08-01', status: 'published' },
  { id: 'page-2', title: 'Terms & Conditions of Travel', type: 'terms', slug: '/terms', lastUpdated: '2026-07-28', status: 'published' },
  { id: 'page-3', title: 'Privacy & Cookie Policy', type: 'privacy', slug: '/privacy', lastUpdated: '2026-07-20', status: 'published' },
  { id: 'page-4', title: 'Contact Us & Concierge Desk', type: 'contactus', slug: '/contact', lastUpdated: '2026-08-05', status: 'published' },
];

export const AdminPagesPage: React.FC = () => {
  const [pages, setPages] = useState<CMSPage[]>(INITIAL_PAGES);
  const [selectedPage, setSelectedPage] = useState<CMSPage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleEditClick = (pg: CMSPage) => {
    setSelectedPage(pg);
    setEditTitle(pg.title);
    setIsModalOpen(true);
  };

  const handleSavePage = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPage) {
      setPages(pages.map((p) => (p.id === selectedPage.id ? { ...p, title: editTitle, lastUpdated: new Date().toISOString().split('T')[0] } : p)));
    }
    setIsModalOpen(false);
  };

  const columns: Column<CMSPage>[] = [
    {
      header: 'Page Title',
      cell: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</span>,
    },
    { header: 'Type / Code', accessorKey: 'type' },
    { header: 'URL Slug', accessorKey: 'slug' },
    { header: 'Last Modified', accessorKey: 'lastUpdated' },
    {
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'published' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <Button variant="outline" size="sm" icon={<Edit size={14} />} onClick={() => handleEditClick(row)}>
          Edit Page Content
        </Button>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Pages (CMS Content)"
        description="Update static content pages including About Us, Terms & Conditions, Privacy Policy, and Contact pages."
      />

      <DataTable columns={columns} data={pages} keyExtractor={(item) => item.id} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit CMS Page - ${selectedPage?.title}`}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePage}>
              Save Page Changes
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSavePage} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Page Title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />
          <div className="tms-input-group">
            <label className="tms-input-label">HTML Content Body</label>
            <textarea
              className="tms-input"
              rows={6}
              defaultValue={`<h3>Welcome to ${selectedPage?.title}</h3><p>Official Wanderlust Tourism Management System legal and information content.</p>`}
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

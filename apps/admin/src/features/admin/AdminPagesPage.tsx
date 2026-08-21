import React, { useState, useEffect } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Edit, RefreshCw } from 'lucide-react';
import { cmsService, type CmsPage } from '@tms/shared/services/cmsService';

export const AdminPagesPage: React.FC = () => {
  const [pages, setPages] = useState<CmsPage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPage, setSelectedPage] = useState<CmsPage | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const loadPages = async () => {
    setIsLoading(true);
    try {
      const data = await cmsService.getAll();
      setPages(data);
    } catch {
      // Keep existing
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPages();
  }, []);

  const handleEditClick = (pg: CmsPage) => {
    setSelectedPage(pg);
    setEditTitle(pg.title);
    setEditContent(pg.content || '');
    setIsModalOpen(true);
  };

  const handleSavePage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPage) return;
    setIsSaving(true);
    try {
      const updated = await cmsService.update(selectedPage.id, {
        title: editTitle,
        content: editContent,
      });
      setPages(pages.map((p) => (p.id === updated.id ? updated : p)));
      setIsModalOpen(false);
    } catch (err) {
      console.error('Failed to update CMS page', err);
    } finally {
      setIsSaving(false);
    }
  };

  const columns: Column<CmsPage>[] = [
    {
      header: 'Page Title',
      cell: (row) => <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.title}</span>,
    },
    { header: 'Type / Code', accessorKey: 'type' },
    { header: 'URL Slug', accessorKey: 'slug' },
    { header: 'Last Modified', accessorKey: 'updatedAt' },
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
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={loadPages}>
            Refresh
          </Button>
        }
      />

      <DataTable columns={columns} data={pages} keyExtractor={(item) => item.id} isLoading={isLoading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Edit CMS Page - ${selectedPage?.title}`}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSavePage} isLoading={isSaving}>
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
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="Enter HTML or text content..."
            />
          </div>
        </form>
      </Modal>
    </div>
  );
};

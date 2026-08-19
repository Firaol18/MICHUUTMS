import React, { useEffect, useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { tourismService, type EnquiryRecord } from '@tms/shared/services/tourismService';
import { Search, RefreshCw } from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchEnquiries = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getEnquiries();
      setEnquiries(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEnquiries();
  }, []);

  const filtered = enquiries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markReplied = async (id: string) => {
    await tourismService.updateEnquiryStatus(id, 'replied');
    fetchEnquiries();
  };

  const columns: Column<EnquiryRecord>[] = [
    {
      header: 'Name',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.email} | {row.mobile}</div>
        </div>
      ),
    },
    { header: 'Subject', accessorKey: 'subject' },
    { header: 'Message Details', accessorKey: 'message' },
    { header: 'Posting Date', accessorKey: 'date' },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'replied' ? 'success' : row.status === 'read' ? 'info' : 'warning'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {row.status !== 'replied' && (
            <Button variant="outline" size="sm" onClick={() => markReplied(row.id)}>
              Mark Replied
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Enquiries & Custom Trips"
        description="View customer inquiry form submissions, custom trip requests, and corporate travel quotes."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchEnquiries}>
            Refresh Enquiries
          </Button>
        }
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
        <Input
          placeholder="Search enquiries by name, subject..."
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} isLoading={isLoading} />
    </div>
  );
};

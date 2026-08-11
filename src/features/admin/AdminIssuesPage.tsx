import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { tourismService, type IssueTicket } from '@/services/tourismService';
import { Search, RefreshCw } from 'lucide-react';

export const AdminIssuesPage: React.FC = () => {
  const [issues, setIssues] = useState<IssueTicket[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchIssues = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getIssueTickets();
      setIssues(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const filtered = issues.filter(
    (i) =>
      i.ticketId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.reportedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.issueType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = async (id: string, status: 'open' | 'in_progress' | 'resolved') => {
    await tourismService.updateIssueStatus(id, status);
    fetchIssues();
  };

  const columns: Column<IssueTicket>[] = [
    {
      header: 'Ticket ID',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{row.ticketId}</span>,
    },
    {
      header: 'Reported By',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.reportedBy}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => <Badge variant="info">{row.issueType}</Badge>,
    },
    { header: 'Description', accessorKey: 'description' },
    { header: 'Date Reported', accessorKey: 'dateReported' },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'resolved' ? 'success' : row.status === 'in_progress' ? 'warning' : 'danger'}>
          {row.status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Action',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          {row.status !== 'resolved' && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(row.id, 'resolved')}>
              Mark Resolved
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Issues & Support Tickets"
        description="Review customer reported complaints, booking discrepancies, and support tickets submitted from the public portal."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchIssues}>
            Refresh Tickets
          </Button>
        }
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
        <Input
          placeholder="Search issues, ticket #, traveler..."
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} isLoading={isLoading} />
    </div>
  );
};

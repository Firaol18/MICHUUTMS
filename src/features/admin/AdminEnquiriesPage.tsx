import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Search } from 'lucide-react';

interface EnquiryRecord {
  id: string;
  name: string;
  email: string;
  mobile: string;
  subject: string;
  message: string;
  date: string;
  status: 'unread' | 'read' | 'replied';
}

const INITIAL_ENQUIRIES: EnquiryRecord[] = [
  { id: 'enq-1', name: 'David Miller', email: 'david.m@example.com', mobile: '+1 (555) 441-2091', subject: 'Private Danakil Lava Lake Expedition', message: 'Looking for a private 8-person charter to Danakil & Erta Ale in October.', date: '2026-08-10', status: 'unread' },
  { id: 'enq-2', name: 'Claire Dupont', email: 'claire.d@example.fr', mobile: '+33 1 42 68 55 00', subject: 'Corporate Retreat at Wenchi Eco-Lodge', message: 'Inquiring about resort room block reservations for 25 executives in Oromia.', date: '2026-08-07', status: 'read' },
  { id: 'enq-3', name: 'Kenji Sato', email: 'kenji.s@example.jp', mobile: '+81 3 1234 5678', subject: 'Lalibela Cultural Coffee Ceremony', message: 'Can we request a private coffee ceremony master for a family of 4 in Lalibela?', date: '2026-08-04', status: 'replied' },
];

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>(INITIAL_ENQUIRIES);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = enquiries.filter(
    (e) =>
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const markReplied = (id: string) => {
    setEnquiries(enquiries.map((e) => (e.id === id ? { ...e, status: 'replied' } : e)));
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
        title="Manage Enquiries"
        description="View customer inquiry form submissions, corporate travel quotes, and message requests."
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
        <Input
          placeholder="Search enquiries by name, subject..."
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} />
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Card } from '@tms/shared/components/common/Card';
import { tourismService, type EnquiryRecord } from '@tms/shared/services/tourismService';
import {
  Search,
  RefreshCw,
  Eye,
  Mail,
  Send,
  Trash2,
  CheckCircle2,
  Clock,
  MessageSquare,
  Phone,
  Calendar,
  User,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export const AdminEnquiriesPage: React.FC = () => {
  const [enquiries, setEnquiries] = useState<EnquiryRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read' | 'replied'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Modals state
  const [selectedEnquiry, setSelectedEnquiry] = useState<EnquiryRecord | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
  const [replySubject, setReplySubject] = useState('');
  const [replyMessage, setReplyMessage] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [replySuccessMsg, setReplySuccessMsg] = useState(false);
  const [enquiryToDelete, setEnquiryToDelete] = useState<EnquiryRecord | null>(null);

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

  const handleOpenView = (item: EnquiryRecord) => {
    setSelectedEnquiry(item);
    setIsViewModalOpen(true);
    // If unread, mark as read on view
    if (item.status === 'unread') {
      tourismService.updateEnquiryStatus(item.id, 'read').then(() => fetchEnquiries());
    }
  };

  const handleOpenReply = (item: EnquiryRecord) => {
    setSelectedEnquiry(item);
    setReplySubject(`Re: ${item.subject}`);
    setReplyMessage(`Dear ${item.name},\n\nThank you for contacting MICHUU Tourism. In regards to your inquiry about "${item.subject}"...\n\nBest regards,\nMICHUU Operations Team`);
    setIsReplyModalOpen(true);
    setReplySuccessMsg(false);
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;
    setIsReplying(true);

    try {
      await tourismService.updateEnquiryStatus(selectedEnquiry.id, 'replied');
      setReplySuccessMsg(true);
      await fetchEnquiries();
      setTimeout(() => {
        setIsReplyModalOpen(false);
        setReplySuccessMsg(false);
      }, 1200);
    } finally {
      setIsReplying(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: 'unread' | 'read' | 'replied') => {
    await tourismService.updateEnquiryStatus(id, status);
    fetchEnquiries();
    if (selectedEnquiry && selectedEnquiry.id === id) {
      setSelectedEnquiry({ ...selectedEnquiry, status });
    }
  };

  const handleDeleteEnquiry = async () => {
    if (!enquiryToDelete) return;
    await tourismService.deleteEnquiry(enquiryToDelete.id);
    setEnquiryToDelete(null);
    fetchEnquiries();
  };

  const filtered = enquiries.filter((e) => {
    const matchesQuery =
      e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesQuery && matchesStatus;
  });

  const totalCount = enquiries.length;
  const unreadCount = enquiries.filter((e) => e.status === 'unread').length;
  const repliedCount = enquiries.filter((e) => e.status === 'replied').length;

  const columns: Column<EnquiryRecord>[] = [
    {
      header: 'Name & Contact',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{row.name}</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {row.email} • {row.mobile || 'No phone'}
          </div>
        </div>
      ),
    },
    {
      header: 'Subject',
      cell: (row) => (
        <div style={{ fontWeight: 500, color: 'var(--text-primary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {row.subject}
        </div>
      ),
    },
    {
      header: 'Message Excerpt',
      cell: (row) => (
        <div style={{ maxWidth: '300px', color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {row.message}
        </div>
      ),
    },
    {
      header: 'Posting Date',
      cell: (row) => (
        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          {typeof row.date === 'string' && row.date.includes('T') ? row.date.split('T')[0] : row.date}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'replied' ? 'success' : row.status === 'read' ? 'info' : 'warning'}>
          {row.status.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          {/* View Details */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenView(row)}
            title="View Details"
            style={{ padding: '0.35rem' }}
          >
            <Eye size={15} style={{ color: 'var(--brand-primary)' }} />
          </Button>

          {/* Quick Reply */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleOpenReply(row)}
            title="Send Email Reply"
            style={{ padding: '0.35rem' }}
          >
            <Mail size={15} style={{ color: '#0ea5e9' }} />
          </Button>

          {/* Toggle Read/Replied status */}
          {row.status === 'unread' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(row.id, 'read')}
              style={{ fontSize: '11px', padding: '0.2rem 0.5rem' }}
            >
              Mark Read
            </Button>
          )}

          {row.status === 'read' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(row.id, 'replied')}
              style={{ fontSize: '11px', padding: '0.2rem 0.5rem', color: '#16a34a', borderColor: 'rgba(22,163,74,0.3)' }}
            >
              Mark Replied
            </Button>
          )}

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEnquiryToDelete(row)}
            title="Delete Enquiry"
            style={{ padding: '0.35rem', color: 'var(--status-danger)' }}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Enquiries & Inquiries"
        description="Review incoming customer inquiries, corporate travel requests, and send direct email responses."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchEnquiries}>
            Refresh Enquiries
          </Button>
        }
      />

      {/* Metrics Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              <Inbox size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL INQUIRIES</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{totalCount}</div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(234, 179, 8, 0.12)', color: '#ca8a04' }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>UNREAD / PENDING</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#ca8a04' }}>{unreadCount}</div>
            </div>
          </div>
        </Card>

        <Card style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.6rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(22, 163, 74, 0.12)', color: '#16a34a' }}>
              <CheckCircle2 size={22} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>RESOLVED & REPLIED</div>
              <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#16a34a' }}>{repliedCount}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'unread', 'read', 'replied'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: statusFilter === st ? 700 : 500,
                backgroundColor: statusFilter === st ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: statusFilter === st ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${statusFilter === st ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ width: '100%', maxWidth: '300px' }}>
          <Input
            placeholder="Search inquiries by name, subject..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable columns={columns} data={filtered} keyExtractor={(item) => item.id} isLoading={isLoading} />

      {/* ── View Detail Modal ── */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Inquiry Details"
        size="lg"
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {selectedEnquiry && selectedEnquiry.status !== 'replied' && (
                <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(selectedEnquiry.id, 'replied')}>
                  Mark as Replied
                </Button>
              )}
              {selectedEnquiry && selectedEnquiry.status !== 'unread' && (
                <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(selectedEnquiry.id, 'unread')}>
                  Mark as Unread
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                size="sm"
                icon={<Mail size={14} />}
                onClick={() => {
                  setIsViewModalOpen(false);
                  if (selectedEnquiry) handleOpenReply(selectedEnquiry);
                }}
              >
                Compose Reply
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {selectedEnquiry && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Sender Info Card */}
            <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <User size={12} /> SENDER NAME
                </div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{selectedEnquiry.name}</div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Mail size={12} /> EMAIL ADDRESS
                </div>
                <div style={{ fontWeight: 600, color: 'var(--brand-primary)', marginTop: '2px' }}>
                  <a href={`mailto:${selectedEnquiry.email}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {selectedEnquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Phone size={12} /> PHONE / WHATSAPP
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginTop: '2px' }}>
                  {selectedEnquiry.mobile || 'Not provided'}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <Calendar size={12} /> RECEIVED AT
                </div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {selectedEnquiry.date}
                </div>
              </div>
            </div>

            {/* Subject */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>SUBJECT</div>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)' }}>
                {selectedEnquiry.subject}
              </div>
            </div>

            {/* Full Message Body */}
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, marginBottom: '4px' }}>FULL MESSAGE</div>
              <div
                style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                {selectedEnquiry.message}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* ── Reply Modal ── */}
      <Modal
        isOpen={isReplyModalOpen}
        onClose={() => setIsReplyModalOpen(false)}
        title={`Reply to ${selectedEnquiry?.name || 'Customer'}`}
        size="lg"
      >
        {selectedEnquiry && (
          <form onSubmit={handleSendReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {replySuccessMsg && (
              <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                <CheckCircle2 size={16} /> Reply sent successfully and marked as Replied!
              </div>
            )}

            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
              To: <strong>{selectedEnquiry.name}</strong> &lt;{selectedEnquiry.email}&gt;
            </div>

            <Input
              label="Subject Line"
              value={replySubject}
              onChange={(e) => setReplySubject(e.target.value)}
              required
            />

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.375rem' }}>
                Response Message
              </label>
              <textarea
                rows={6}
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-sm)',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Button type="button" variant="secondary" onClick={() => setIsReplyModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" isLoading={isReplying} icon={<Send size={14} />}>
                Send Email Reply
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ── Delete Confirmation Modal ── */}
      <Modal
        isOpen={Boolean(enquiryToDelete)}
        onClose={() => setEnquiryToDelete(null)}
        title="Delete Customer Inquiry"
        footer={
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', width: '100%' }}>
            <Button variant="secondary" size="sm" onClick={() => setEnquiryToDelete(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" icon={<Trash2 size={14} />} onClick={handleDeleteEnquiry}>
              Confirm Delete
            </Button>
          </div>
        }
      >
        <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>
          Are you sure you want to delete the inquiry from <strong>{enquiryToDelete?.name}</strong> regarding <em>"{enquiryToDelete?.subject}"</em>? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

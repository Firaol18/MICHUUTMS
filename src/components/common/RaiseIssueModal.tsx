import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useAuthStore } from '@/store/useAuthStore';
import { tourismService } from '@/services/tourismService';
import { CheckCircle2 } from 'lucide-react';

interface RaiseIssueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RaiseIssueModal: React.FC<RaiseIssueModalProps> = ({ isOpen, onClose }) => {
  const user = useAuthStore((state) => state.user);

  const [issueType, setIssueType] = useState('Select Issue');
  const [description, setDescription] = useState('');
  const [reporterName, setReporterName] = useState(user?.name || '');
  const [reporterEmail, setReporterEmail] = useState(user?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (issueType === 'Select Issue') return;

    setIsSubmitting(true);
    try {
      const ticket = await tourismService.createIssueTicket({
        reportedBy: reporterName || user?.name || 'Public Traveler',
        email: reporterEmail || user?.email || 'traveler@example.com',
        issueType,
        description: description || `${issueType} report from public portal`,
      });

      setTicketId(ticket.ticketId);
      setIsSubmitted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setIsSubmitted(false);
    setIssueType('Select Issue');
    setDescription('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleResetAndClose}
      title=""
      footer={null}
    >
      {isSubmitted ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '1.25rem', padding: '2rem 1rem', textAlign: 'center' }}>
          <div
            className="flex-center"
            style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}
          >
            <CheckCircle2 size={36} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Ticket #{ticketId} Submitted!
            </h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Thank you for contacting MICHUU Support. Our concierge team has received your ticket and will respond shortly.
            </p>
          </div>

          <Button
            variant="primary"
            style={{ backgroundColor: '#16a34a', borderColor: '#16a34a', color: '#ffffff', minWidth: '140px' }}
            onClick={handleResetAndClose}
          >
            Close Window
          </Button>
        </div>
      ) : (
        <div style={{ padding: '0.5rem 0' }}>
          {/* Header title matching exact reference screenshot */}
          <h2
            style={{
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#16a34a',
              letterSpacing: '0.02em',
              marginBottom: '2rem',
              textTransform: 'uppercase',
            }}
          >
            HOW CAN WE HELP YOU
          </h2>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!user && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Your Full Name"
                  placeholder="e.g. Eleanor Vance"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. eleanor@example.com"
                  value={reporterEmail}
                  onChange={(e) => setReporterEmail(e.target.value)}
                  required
                />
              </div>
            )}

            {/* Select Issue Dropdown matching exact options from screenshot */}
            <div className="tms-input-group">
              <select
                className="tms-input"
                value={issueType}
                onChange={(e) => setIssueType(e.target.value)}
                required
                style={{
                  fontSize: 'var(--font-size-md)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: issueType === 'Select Issue' ? 'var(--text-muted)' : 'var(--text-primary)',
                }}
              >
                <option value="Select Issue" disabled>
                  Select Issue
                </option>
                <option value="Booking Issues">Booking Issues</option>
                <option value="Cancellation">Cancellation</option>
                <option value="Refund">Refund</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Description Textarea matching screenshot */}
            <div className="tms-input-group">
              <textarea
                className="tms-input"
                rows={4}
                placeholder="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                style={{
                  fontSize: 'var(--font-size-sm)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* Green Submit Button matching exact reference screenshot */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
              <button
                type="submit"
                disabled={isSubmitting || issueType === 'Select Issue'}
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  padding: '0.75rem 2.25rem',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 700,
                  cursor: isSubmitting || issueType === 'Select Issue' ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting || issueType === 'Select Issue' ? 0.6 : 1,
                  boxShadow: '0 4px 12px rgba(22, 163, 74, 0.25)',
                  transition: 'all 0.2s ease',
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      )}
    </Modal>
  );
};

import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { tourismService } from '@/services/tourismService';
import type { Booking, BookingStatus } from '@/types/booking';
import { Search, RefreshCw } from 'lucide-react';

export const AdminBookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<BookingStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  const fetchBookings = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getBookings(activeStatus, searchQuery);
      setBookings(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [activeStatus, searchQuery]);

  const handleStatusChange = async (id: string, newStatus: BookingStatus) => {
    await tourismService.updateBookingStatus(id, newStatus);
    fetchBookings();
  };

  const columns: Column<Booking>[] = [
    {
      header: 'Reference #',
      accessorKey: 'bookingReference',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{row.bookingReference}</span>,
    },
    { header: 'Tour Title', accessorKey: 'tourTitle' },
    {
      header: 'Traveler Details',
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.traveler.name}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.traveler.email}</div>
        </div>
      ),
    },
    { header: 'Departure Date', accessorKey: 'travelDate' },
    {
      header: 'Guests',
      cell: (row) => <span>{row.numberOfTravelers} Guests</span>,
    },
    {
      header: 'Total Price',
      cell: (row) => <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>${row.totalPrice.toLocaleString()}</span>,
    },
    {
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'confirmed' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <PermissionGuard resource="bookings" action="update">
          <div style={{ display: 'flex', gap: '0.375rem' }}>
            {row.status !== 'confirmed' && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(row.id, 'confirmed')}>
                Confirm
              </Button>
            )}
            {row.status !== 'cancelled' && (
              <Button variant="ghost" size="sm" onClick={() => handleStatusChange(row.id, 'cancelled')}>
                Cancel
              </Button>
            )}
          </div>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Reservations & Passenger Manifest"
        description="Verify incoming traveler reservations, issue confirmation vouchers, and assign ranger guides."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchBookings}>
            Refresh Reservations
          </Button>
        }
      />

      {/* Search & Status Filters */}
      <div className="flex-between" style={{ marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(['all', 'confirmed', 'pending', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              style={{
                padding: '0.4rem 0.875rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: activeStatus === st ? 700 : 500,
                color: activeStatus === st ? 'var(--brand-primary)' : 'var(--text-secondary)',
                backgroundColor: activeStatus === st ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
              }}
            >
              {st.toUpperCase()}
            </button>
          ))}
        </div>

        <div style={{ width: '280px' }}>
          <Input
            placeholder="Search by reference, traveler, tour..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <DataTable
        columns={columns}
        data={bookings}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};

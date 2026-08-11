import React, { useEffect, useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { tourismService } from '@/services/tourismService';
import type { TourGuide } from '@/types/guide';
import { RefreshCw } from 'lucide-react';

export const AdminGuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getGuides();
      setGuides(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGuides();
  }, []);

  const columns: Column<TourGuide>[] = [
    {
      header: 'Guide Name & Specialization',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={row.avatarUrl} alt={row.name} style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{row.specializations.join(' • ')}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Languages Spoken',
      cell: (row) => <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>{row.languages.join(', ')}</span>,
    },
    {
      header: 'Tours Guided',
      cell: (row) => <span>{row.toursGuidedCount} Expeditions</span>,
    },
    {
      header: 'Rating',
      cell: (row) => <span style={{ fontWeight: 700, color: '#fbbf24' }}>★ {row.rating} / 5.0</span>,
    },
    {
      header: 'Status',
      cell: (row) => (
        <Badge variant={row.status === 'available' ? 'success' : row.status === 'on_tour' ? 'in-transit' : 'danger'}>
          {row.status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Certified Tour Guides & Rangers"
        description="Oversee guide availability, language masteries, customer satisfaction ratings, and expedition assignments."
        actions={
          <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchGuides}>
            Refresh Roster
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={guides}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />
    </div>
  );
};

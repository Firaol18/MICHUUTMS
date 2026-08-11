import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { tourismService } from '@/services/tourismService';
import type { TourPackage, TourCategory } from '@/types/tour';
import { Plus, Search, Palmtree, RefreshCw, Tag } from 'lucide-react';

export const AdminToursPage: React.FC = () => {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New tour form state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TourCategory>('luxury');
  const [newPrice, setNewPrice] = useState(450);
  const [newDuration, setNewDuration] = useState(3);
  const [newGroupSize, setNewGroupSize] = useState(12);
  const [newSummary, setNewSummary] = useState('');
  const [newDestinationName, setNewDestinationName] = useState('Wenchi Crater Lake');
  const [newCountry, setNewCountry] = useState('Ethiopia');

  // Special Offer state
  const [hasOffer, setHasOffer] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [originalPrice, setOriginalPrice] = useState(530);
  const [offerTag, setOfferTag] = useState('15% OFF SPECIAL PROMO');

  const location = useLocation();

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getTours('all', searchQuery);
      setTours(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTours();
  }, [searchQuery]);

  useEffect(() => {
    if (location.search.includes('create=true')) {
      setIsCreateModalOpen(true);
    }
  }, [location.search]);

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    await tourismService.createTourPackage({
      title: newTitle || 'Wenchi Eco-Resort & Crater Expedition',
      slug: (newTitle || 'wenchi-eco-expedition').toLowerCase().replace(/\s+/g, '-'),
      category: newCategory,
      destination: {
        id: `dest-${Date.now()}`,
        name: newDestinationName || 'Wenchi Crater Lake',
        country: newCountry || 'Ethiopia',
        region: 'Oromia Region',
        imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
        description: 'Ethiopian tourist destination.',
      },
      pricePerPerson: newPrice,
      durationDays: newDuration,
      maxGroupSize: newGroupSize,
      difficulty: 'moderate',
      imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000',
      galleryImages: ['https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000'],
      summary: newSummary || 'Luxury Ethiopian eco-lodge expedition.',
      included: ['Luxury Accommodations', 'Private Transport', 'Certified Ranger Guides'],
      excluded: ['Flights', 'Personal Souvenirs'],
      itinerary: [
        { dayNumber: 1, title: 'Arrival & Scenic Welcome Dinner', description: 'Check into luxury resort and meet ranger guide team.' },
        { dayNumber: 2, title: 'Guided Crater Lake Boat & Hot Springs Trek', description: 'Explore volcanic crater lake, island monastery, and thermal baths.' },
      ],
      isFeatured: false,
      status: 'active',
      hasOffer: hasOffer,
      discountPercent: hasOffer ? discountPercent : undefined,
      originalPrice: hasOffer ? originalPrice : undefined,
      offerTag: hasOffer ? offerTag : undefined,
    });

    setIsCreateModalOpen(false);
    // reset
    setNewTitle('');
    setNewSummary('');
    setHasOffer(false);
    fetchTours();
  };

  const columns: Column<TourPackage>[] = [
    {
      header: 'Tour Package Title',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={row.imageUrl} alt={row.title} style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
              {row.destination.name}, {row.destination.country}
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      cell: (row) => <Badge variant="info">{row.category.toUpperCase()}</Badge>,
    },
    {
      header: 'Special Offer',
      cell: (row) => row.hasOffer ? (
        <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
          <Tag size={12} /> {row.offerTag || `${row.discountPercent}% OFF`}
        </Badge>
      ) : (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Standard Price</span>
      ),
    },
    {
      header: 'Price / Person',
      cell: (row) => (
        <div>
          {row.hasOffer && row.originalPrice && (
            <span style={{ textDecoration: 'line-through', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginRight: '0.375rem' }}>
              ${row.originalPrice}
            </span>
          )}
          <span style={{ fontWeight: 700, color: row.hasOffer ? '#16a34a' : 'var(--text-primary)' }}>
            ${row.pricePerPerson.toLocaleString()}
          </span>
        </div>
      ),
    },
    {
      header: 'Duration',
      cell: (row) => <span>{row.durationDays} Days</span>,
    },
    {
      header: 'Status',
      cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Actions',
      cell: (row) => (
        <PermissionGuard resource="tours" action="delete">
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <Button
              variant="ghost"
              size="sm"
              style={{ color: '#ef4444' }}
              onClick={async () => {
                if (window.confirm(`Delete tour package "${row.title}" from public catalog?`)) {
                  await tourismService.deleteTourPackage(row.id);
                  fetchTours();
                }
              }}
            >
              Delete
            </Button>
          </div>
        </PermissionGuard>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Tour Packages Inventory"
        description="Create, publish, edit pricing, assign promotional offers, and manage daily itineraries."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchTours}>
              Refresh Inventory
            </Button>
            <PermissionGuard resource="tours" action="create">
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsCreateModalOpen(true)}>
                Add Tour Package
              </Button>
            </PermissionGuard>
          </>
        }
      />

      <div style={{ marginBottom: '1.25rem', maxWidth: '300px' }}>
        <Input
          placeholder="Search tour inventory..."
          icon={<Search size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <DataTable
        columns={columns}
        data={tours}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
      />

      {/* Create Tour Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Luxury Tour Package"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleCreateTour} icon={<Palmtree size={16} />}>
              Publish Package to Portal
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTour} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Tour Package Title" placeholder="e.g. Wenchi Crater Lake Eco-Resort Expedition" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Destination Name" placeholder="e.g. Wenchi Crater Lake" value={newDestinationName} onChange={(e) => setNewDestinationName(e.target.value)} />
            <Input label="Country" placeholder="e.g. Ethiopia" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
            <div className="tms-input-group">
              <label className="tms-input-label">Category</label>
              <select
                className="tms-input"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as TourCategory)}
              >
                <option value="safari">Safari</option>
                <option value="mountain">Mountain</option>
                <option value="beach">Beach</option>
                <option value="cultural">Cultural</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Final Sale Price ($)" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required />
            <Input label="Duration (Days)" type="number" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} required />
            <Input label="Max Group Size" type="number" value={newGroupSize} onChange={(e) => setNewGroupSize(Number(e.target.value))} required />
          </div>

          <Input label="Summary Description" placeholder="Brief tour overview for travelers" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} />

          {/* Promotional Offer Box */}
          <div
            style={{
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
            }}
          >
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
              <input
                type="checkbox"
                checked={hasOffer}
                onChange={(e) => setHasOffer(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }}
              />
              <Tag size={16} style={{ color: 'var(--status-danger)' }} /> Apply Special Promotional Offer / Discount Tag
            </label>

            {hasOffer && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input
                    label="Original Pre-Discount Price ($)"
                    type="number"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(Number(e.target.value))}
                    required={hasOffer}
                  />
                  <Input
                    label="Discount Percentage (%)"
                    type="number"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    required={hasOffer}
                  />
                </div>

                <Input
                  label="Offer Badge Tag Text"
                  placeholder="e.g. 15% OFF SEASONAL PROMO"
                  value={offerTag}
                  onChange={(e) => setOfferTag(e.target.value)}
                  required={hasOffer}
                />

                <div style={{ fontSize: 'var(--font-size-xs)', color: '#16a34a', fontWeight: 600, backgroundColor: 'rgba(22, 163, 74, 0.1)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)' }}>
                  ✓ Offer Preview: Travelers save ${(originalPrice - newPrice > 0 ? originalPrice - newPrice : 0)}! (Original: ${originalPrice} → Sale Price: ${newPrice})
                </div>
              </div>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

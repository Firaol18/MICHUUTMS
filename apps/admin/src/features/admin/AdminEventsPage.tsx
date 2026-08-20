import React, { useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { useContentStore } from '@tms/shared/store/useContentStore';
import type { EthiopianEvent } from '@tms/shared/services/mockEventsData';
import {
  CalendarDays,
  Plus,
  Search,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Sparkles,
} from 'lucide-react';

const CATEGORY_COLORS: Record<EthiopianEvent['category'], string> = {
  religious: '#7c3aed',
  cultural: '#0284c7',
  nature: '#16a34a',
  music: '#db2777',
  food: '#d97706',
  sport: '#dc2626',
};

const CATEGORIES: EthiopianEvent['category'][] = [
  'religious',
  'cultural',
  'nature',
  'music',
  'food',
  'sport',
];

export const AdminEventsPage: React.FC = () => {
  const { events, fetchEvents, addEvent, updateEvent, deleteEvent, toggleFeaturedEvent } = useContentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EthiopianEvent | null>(null);

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Form State
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [category, setCategory] = useState<EthiopianEvent['category']>('cultural');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [tipForVisitors, setTipForVisitors] = useState('');
  // Offer/Price fields
  const [price, setPrice] = useState<string>('');
  const [hasOffer, setHasOffer] = useState(false);
  const [offerTag, setOfferTag] = useState('');
  const [discountPercent, setDiscountPercent] = useState<string>('');
  const [originalPrice, setOriginalPrice] = useState<string>('');

  const openCreateModal = () => {
    setEditingEvent(null);
    setTitle('');
    setDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setLocation('');
    setRegion('');
    setCategory('cultural');
    setDescription('');
    setImageUrl('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800');
    setIsFeatured(false);
    setTipForVisitors('');
    setPrice('');
    setHasOffer(false);
    setOfferTag('');
    setDiscountPercent('');
    setOriginalPrice('');
    setIsModalOpen(true);
  };

  const openEditModal = (evt: EthiopianEvent) => {
    setEditingEvent(evt);
    setTitle(evt.title);
    setDate(evt.date);
    setEndDate(evt.endDate || '');
    setLocation(evt.location);
    setRegion(evt.region);
    setCategory(evt.category);
    setDescription(evt.description);
    setImageUrl(evt.imageUrl);
    setIsFeatured(evt.isFeatured);
    setTipForVisitors(evt.tipForVisitors || '');
    setPrice(evt.price !== undefined ? String(evt.price) : '');
    setHasOffer(evt.hasOffer ?? false);
    setOfferTag(evt.offerTag ?? '');
    setDiscountPercent(evt.discountPercent !== undefined ? String(evt.discountPercent) : '');
    setOriginalPrice(evt.originalPrice !== undefined ? String(evt.originalPrice) : '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !location || !description) return;

    if (editingEvent) {
      updateEvent(editingEvent.id, {
        title,
        date,
        endDate: endDate || undefined,
        location,
        region,
        category,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        isFeatured,
        tipForVisitors: tipForVisitors || undefined,
        price: price !== '' ? Number(price) : 0,
        hasOffer,
        offerTag: hasOffer && offerTag ? offerTag : undefined,
        discountPercent: hasOffer && discountPercent !== '' ? Number(discountPercent) : undefined,
        originalPrice: hasOffer && originalPrice !== '' ? Number(originalPrice) : undefined,
      });
    } else {
      addEvent({
        title,
        date,
        endDate: endDate || undefined,
        location,
        region,
        category,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        isFeatured,
        tipForVisitors: tipForVisitors || undefined,
        price: price !== '' ? Number(price) : 0,
        hasOffer,
        offerTag: hasOffer && offerTag ? offerTag : undefined,
        discountPercent: hasOffer && discountPercent !== '' ? Number(discountPercent) : undefined,
        originalPrice: hasOffer && originalPrice !== '' ? Number(originalPrice) : undefined,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
      deleteEvent(id);
    }
  };

  const filteredEvents = events.filter((evt) => {
    const matchesSearch =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.region.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || evt.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const columns: Column<EthiopianEvent>[] = [
    {
      header: 'Event / Festival',
      minWidth: '260px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 240 }}>
          <img
            src={row.imageUrl}
            alt={row.title}
            style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', lineHeight: 1.35 }}>
              {row.title}
              {row.isFeatured && (
                <span title="Featured Event" style={{ color: '#eab308', flexShrink: 0 }}>
                  <Star size={14} fill="#eab308" />
                </span>
              )}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
              <MapPin size={11} /> {row.location} ({row.region})
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Date(s)',
      minWidth: '120px',
      noWrap: true,
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)' }}>
          <div style={{ fontWeight: 600 }}>{row.date}</div>
          {row.endDate && <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>to {row.endDate}</div>}
        </div>
      ),
    },
    {
      header: 'Category',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 700,
            color: CATEGORY_COLORS[row.category],
            backgroundColor: `${CATEGORY_COLORS[row.category]}18`,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-full)',
            textTransform: 'capitalize',
            display: 'inline-block',
          }}
        >
          {row.category}
        </span>
      ),
    },
    {
      header: 'Price / Offer',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)' }}>
          {row.hasOffer ? (
            <>
              <span style={{ fontSize: '9px', fontWeight: 800, color: '#ef4444', textTransform: 'uppercase', display: 'block', marginBottom: '1px' }}>
                🏷 {row.offerTag || (row.discountPercent ? `${row.discountPercent}% OFF` : 'SPECIAL OFFER')}
              </span>
              {row.originalPrice && (
                <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: 4 }}>
                  ${row.originalPrice}
                </span>
              )}
              <span style={{ fontWeight: 700, color: '#16a34a' }}>${row.price ?? 0}</span>
            </>
          ) : (
            <span style={{ fontWeight: 600 }}>${row.price ?? 0}</span>
          )}
        </div>
      ),
    },
    {
      header: 'Featured',
      minWidth: '90px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <button
          onClick={() => toggleFeaturedEvent(row.id)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem',
            color: row.isFeatured ? '#eab308' : 'var(--text-muted)',
          }}
          title={row.isFeatured ? 'Click to unfeature' : 'Click to feature on calendar'}
        >
          <Star size={18} fill={row.isFeatured ? '#eab308' : 'none'} />
        </button>
      ),
    },
    {
      header: 'Actions',
      minWidth: '100px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
          <button type="button" onClick={() => openEditModal(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Edit"><Edit2 size={16} /></button>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} style={{ color: 'var(--status-danger)' }} />} onClick={() => handleDelete(row.id, row.title)} />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Events & Festivals"
        description="Add and organize nationwide cultural, religious, and sporting events displayed on the public Festivals Calendar."
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openCreateModal}>
            Add New Event
          </Button>
        }
      />

      {/* Main Events Data Table with Unified Filter and Search */}
      <DataTable
        columns={columns}
        data={filteredEvents}
        keyExtractor={(item) => item.id}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search events by title, location, or tag..."
        filterModalTitle="Filter Events"
        filterFields={[
          {
            id: 'category',
            label: 'Event Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Category', value: 'all' },
              ...CATEGORIES.map((cat) => ({
                label: cat.charAt(0).toUpperCase() + cat.slice(1),
                value: cat,
              })),
            ],
          },
        ]}
        onApplyFilters={() => {}}
        onClearFilters={() => {
          setCategoryFilter('all');
        }}
      />

      {/* Create / Edit Event Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? `Edit Event: ${editingEvent.title}` : 'Add New Ethiopian Event / Festival'}
        size="lg"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingEvent ? 'Save Event Updates' : 'Publish Event'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Event / Festival Title"
            placeholder="e.g. Timkat – Ethiopian Epiphany"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Start Date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
            <Input
              label="End Date (Optional)"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Location"
              placeholder="e.g. Gondar & Lalibela"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
            <Input
              label="Region"
              placeholder="e.g. Amhara / Nationwide"
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="tms-input-group">
              <label className="tms-input-label">Category</label>
              <select
                className="tms-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as EthiopianEvent['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.75rem', gap: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                />
                ⭐ Highlight as Featured Event
              </label>
            </div>
          </div>

          <Input
            label="Cover Image URL"
            placeholder="https://images.unsplash.com/..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            required
          />

          <div className="tms-input-group">
            <label className="tms-input-label">Event Description & Cultural Context</label>
            <textarea
              className="tms-input"
              rows={4}
              placeholder="Explain the background, significance, ceremonies and schedule..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <Input
            label="Tip for International Travelers & Photographers"
            placeholder="e.g. Arrive 2 days early to reserve good vantage points..."
            value={tipForVisitors}
            onChange={(e) => setTipForVisitors(e.target.value)}
          />

          {/* ── Offer / Pricing Section ── */}
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>🏷 Pricing & Offer Settings</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Base Price (USD / guest)"
                type="number"
                placeholder="e.g. 65"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min={0}
              />
              <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.75rem', gap: '0.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                  <input
                    type="checkbox"
                    checked={hasOffer}
                    onChange={(e) => setHasOffer(e.target.checked)}
                  />
                  🏷️ Enable Special Offer
                </label>
              </div>
            </div>

            {hasOffer && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                  <Input
                    label="Original Price (for strikethrough)"
                    type="number"
                    placeholder="e.g. 95"
                    value={originalPrice}
                    onChange={(e) => setOriginalPrice(e.target.value)}
                    min={0}
                  />
                  <Input
                    label="Discount % (optional)"
                    type="number"
                    placeholder="e.g. 20"
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(e.target.value)}
                    min={0}
                    max={99}
                  />
                  <Input
                    label="Offer Tag Label"
                    placeholder="e.g. EARLY BIRD -20%"
                    value={offerTag}
                    onChange={(e) => setOfferTag(e.target.value)}
                  />
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '0.5rem 0.75rem', backgroundColor: 'rgba(239,68,68,0.06)', borderRadius: 'var(--radius-sm)', border: '1px dashed rgba(239,68,68,0.25)' }}>
                  Preview: <strong style={{ color: '#ef4444' }}>{offerTag || (discountPercent ? `${discountPercent}% OFF` : 'SPECIAL OFFER')}</strong> — was <s>${originalPrice || '?'}</s> now <strong style={{ color: '#16a34a' }}>${price || '?'}</strong> / guest
                </div>
              </>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
};

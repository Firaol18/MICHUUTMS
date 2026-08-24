import React, { useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { ConfirmModal } from '@tms/shared/components/common/ConfirmModal';
import { useContentStore } from '@tms/shared/store/useContentStore';
import type { EthiopianEvent } from '@tms/shared/services/mockEventsData';
import {
  Search,
  Edit2,
  Trash2,
  Star,
  MapPin,
  Plus,
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
  const { events, addEvent, updateEvent, deleteEvent, toggleFeaturedEvent } = useContentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EthiopianEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

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
    setDeleteTarget({ id, name });
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
          <Button variant="ghost" size="sm" icon={<Edit2 size={14} />} onClick={() => openEditModal(row)} />
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

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <Input
            placeholder="Search events by name or location..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${categoryFilter === 'all' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
              backgroundColor: categoryFilter === 'all' ? 'var(--brand-primary-light)' : 'transparent',
              color: categoryFilter === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All Categories ({events.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${categoryFilter === cat ? CATEGORY_COLORS[cat] : 'var(--border-color)'}`,
                backgroundColor: categoryFilter === cat ? `${CATEGORY_COLORS[cat]}15` : 'transparent',
                color: categoryFilter === cat ? CATEGORY_COLORS[cat] : 'var(--text-secondary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
                textTransform: 'capitalize',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filteredEvents} keyExtractor={(item) => item.id} />

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
        </form>
      </Modal>

      {/* Delete Event Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
          await deleteEvent(deleteTarget.id);
          setDeleteTarget(null);
        }}
        title="Delete Festival / Event"
        message={`Are you sure you want to permanently delete "${deleteTarget?.name}"? It will no longer appear on the public events calendar.`}
        confirmText="Delete Event"
        variant="danger"
      />
    </div>
  );
};

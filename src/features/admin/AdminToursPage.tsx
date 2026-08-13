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
import type { TourPackage, TourCategory, DifficultyLevel, ItineraryDay } from '@/types/tour';
import type { TourGuide } from '@/types/guide';
import {
  Plus,
  Palmtree,
  RefreshCw,
  Tag,
  Edit,
  Trash2,
  CheckCircle2,
  PlusCircle,
  MinusCircle,
  Image,
  ListChecks,
  Route,
} from 'lucide-react';

// Section header divider
const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      fontWeight: 700,
      fontSize: 'var(--font-size-xs)',
      color: 'var(--text-secondary)',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      borderBottom: '1px solid var(--border-color)',
      paddingBottom: '0.5rem',
      marginTop: '0.5rem',
    }}
  >
    {icon}
    {label}
  </div>
);

// Dynamic string list editor
interface StringListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  addLabel?: string;
}
const StringListEditor: React.FC<StringListEditorProps> = ({ label, items, onChange, placeholder = 'Enter value', addLabel = 'Add Item' }) => {
  const handleChange = (idx: number, val: string) => {
    const updated = [...items];
    updated[idx] = val;
    onChange(updated);
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--text-muted)' }}>{label}</span>
      {items.map((item, idx) => (
        <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            className="tms-input"
            value={item}
            placeholder={placeholder}
            onChange={(e) => handleChange(idx, e.target.value)}
            style={{ flex: 1, fontSize: 'var(--font-size-sm)' }}
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)', flexShrink: 0 }}
          >
            <MinusCircle size={18} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'none', border: '1px dashed var(--border-color)',
          borderRadius: 'var(--radius-sm)', padding: '0.375rem 0.75rem',
          cursor: 'pointer', color: 'var(--brand-primary)',
          fontSize: 'var(--font-size-xs)', fontWeight: 600,
        }}
      >
        <PlusCircle size={14} /> {addLabel}
      </button>
    </div>
  );
};

// Itinerary day builder
interface ItineraryEditorProps {
  days: ItineraryDay[];
  onChange: (days: ItineraryDay[]) => void;
}
const ItineraryEditor: React.FC<ItineraryEditorProps> = ({ days, onChange }) => {
  const handleDayChange = (idx: number, field: keyof ItineraryDay, value: string) => {
    const updated = days.map((d, i) => {
      if (i !== idx) return d;
      if (field === 'mealsIncluded') return { ...d, mealsIncluded: value ? value.split(',').map((s) => s.trim()) : undefined };
      if (field === 'dayNumber') return { ...d, dayNumber: Number(value) };
      return { ...d, [field]: value };
    });
    onChange(updated);
  };
  const addDay = () => onChange([...days, { dayNumber: days.length + 1, title: '', description: '', mealsIncluded: [], accommodation: '' }]);
  const removeDay = (idx: number) => onChange(days.filter((_, i) => i !== idx).map((d, i) => ({ ...d, dayNumber: i + 1 })));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
      {days.map((day, idx) => (
        <div
          key={idx}
          style={{
            padding: '0.875rem', border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column',
            gap: '0.625rem', backgroundColor: 'var(--bg-secondary)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-light)', padding: '0.2rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
              Day {day.dayNumber}
            </span>
            <button type="button" onClick={() => removeDay(idx)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--status-danger)' }}>
              <MinusCircle size={16} />
            </button>
          </div>
          <input className="tms-input" placeholder="Day Title (e.g. Arrival & Scenic Welcome)" value={day.title} onChange={(e) => handleDayChange(idx, 'title', e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
          <textarea className="tms-input" placeholder="Day description" value={day.description} onChange={(e) => handleDayChange(idx, 'description', e.target.value)} rows={2} style={{ fontSize: 'var(--font-size-sm)', resize: 'vertical', fontFamily: 'inherit' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
            <input className="tms-input" placeholder="Meals (e.g. Breakfast, Dinner)" value={day.mealsIncluded?.join(', ') || ''} onChange={(e) => handleDayChange(idx, 'mealsIncluded', e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
            <input className="tms-input" placeholder="Accommodation (e.g. Mezena Lodge)" value={day.accommodation || ''} onChange={(e) => handleDayChange(idx, 'accommodation', e.target.value)} style={{ fontSize: 'var(--font-size-sm)' }} />
          </div>
        </div>
      ))}
      <button type="button" onClick={addDay} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', background: 'none', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', cursor: 'pointer', color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
        <PlusCircle size={14} /> Add Itinerary Day
      </button>
    </div>
  );
};

const defaultIncluded = ['Luxury Accommodations', 'Private Transport', 'Certified Ranger Guides'];
const defaultExcluded = ['Flights', 'Personal Souvenirs'];
const defaultItinerary: ItineraryDay[] = [{ dayNumber: 1, title: 'Arrival & Scenic Welcome Dinner', description: 'Check into resort and meet ranger guide team.', mealsIncluded: ['Dinner'], accommodation: '' }];

export const AdminToursPage: React.FC = () => {
  const [tours, setTours] = useState<TourPackage[]>([]);
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<TourCategory>('luxury');
  const [newPrice, setNewPrice] = useState(450);
  const [newDuration, setNewDuration] = useState(3);
  const [newGroupSize, setNewGroupSize] = useState(12);
  const [newSummary, setNewSummary] = useState('');
  const [newDestinationName, setNewDestinationName] = useState('');
  const [newCountry, setNewCountry] = useState('Ethiopia');
  const [newDifficulty, setNewDifficulty] = useState<DifficultyLevel>('moderate');
  const [newStatus, setNewStatus] = useState<'active' | 'draft'>('active');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newGalleryImages, setNewGalleryImages] = useState<string[]>(['']);
  const [newIncluded, setNewIncluded] = useState<string[]>([...defaultIncluded]);
  const [newExcluded, setNewExcluded] = useState<string[]>([...defaultExcluded]);
  const [newItinerary, setNewItinerary] = useState<ItineraryDay[]>([...defaultItinerary]);
  const [hasOffer, setHasOffer] = useState(false);
  const [discountPercent, setDiscountPercent] = useState(15);
  const [originalPrice, setOriginalPrice] = useState(530);
  const [offerTag, setOfferTag] = useState('15% OFF SPECIAL PROMO');
  const [newAssignedGuideId, setNewAssignedGuideId] = useState('');

  // Edit state
  const [editingTour, setEditingTour] = useState<TourPackage | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState<TourCategory>('luxury');
  const [editPrice, setEditPrice] = useState(0);
  const [editDuration, setEditDuration] = useState(1);
  const [editGroupSize, setEditGroupSize] = useState(10);
  const [editSummary, setEditSummary] = useState('');
  const [editDestinationName, setEditDestinationName] = useState('');
  const [editCountry, setEditCountry] = useState('Ethiopia');
  const [editDifficulty, setEditDifficulty] = useState<DifficultyLevel>('moderate');
  const [editStatus, setEditStatus] = useState<'active' | 'draft' | 'sold_out'>('active');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [editGalleryImages, setEditGalleryImages] = useState<string[]>(['']);
  const [editIncluded, setEditIncluded] = useState<string[]>([]);
  const [editExcluded, setEditExcluded] = useState<string[]>([]);
  const [editItinerary, setEditItinerary] = useState<ItineraryDay[]>([]);
  const [editHasOffer, setEditHasOffer] = useState(false);
  const [editDiscountPercent, setEditDiscountPercent] = useState(15);
  const [editOriginalPrice, setEditOriginalPrice] = useState(0);
  const [editOfferTag, setEditOfferTag] = useState('');
  const [editAssignedGuideId, setEditAssignedGuideId] = useState('');

  const location = useLocation();

  const fetchTours = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getTours('all', searchQuery);
      setTours(data);
      const guideData = await tourismService.getGuides();
      setGuides(guideData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchTours(); }, [searchQuery]);
  useEffect(() => { if (location.search.includes('create=true')) setIsCreateModalOpen(true); }, [location.search]);

  const resetCreateForm = () => {
    setNewTitle(''); setNewCategory('luxury'); setNewPrice(450); setNewDuration(3); setNewGroupSize(12);
    setNewSummary(''); setNewDestinationName(''); setNewCountry('Ethiopia'); setNewDifficulty('moderate');
    setNewStatus('active'); setNewImageUrl(''); setNewGalleryImages(['']);
    setNewIncluded([...defaultIncluded]); setNewExcluded([...defaultExcluded]); setNewItinerary([...defaultItinerary]);
    setHasOffer(false); setDiscountPercent(15); setOriginalPrice(530); setOfferTag('15% OFF SPECIAL PROMO');
    setNewAssignedGuideId('');
  };

  const handleStartEdit = (tour: TourPackage) => {
    setEditingTour(tour);
    setEditTitle(tour.title); setEditCategory(tour.category); setEditPrice(tour.pricePerPerson);
    setEditDuration(tour.durationDays); setEditGroupSize(tour.maxGroupSize); setEditSummary(tour.summary);
    setEditDestinationName(tour.destination.name); setEditCountry(tour.destination.country);
    setEditDifficulty(tour.difficulty); setEditStatus(tour.status); setEditImageUrl(tour.imageUrl);
    setEditGalleryImages(tour.galleryImages?.length ? tour.galleryImages : ['']);
    setEditIncluded(tour.included?.length ? [...tour.included] : [...defaultIncluded]);
    setEditExcluded(tour.excluded?.length ? [...tour.excluded] : [...defaultExcluded]);
    setEditItinerary(tour.itinerary?.length ? [...tour.itinerary] : [...defaultItinerary]);
    setEditHasOffer(!!tour.hasOffer); setEditDiscountPercent(tour.discountPercent || 15);
    setEditOriginalPrice(tour.originalPrice || Math.round(tour.pricePerPerson * 1.25));
    setEditOfferTag(tour.offerTag || 'SPECIAL OFFER');
    setEditAssignedGuideId(tour.assignedGuideId || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTour) return;
    const selectedGuide = guides.find((g) => g.id === editAssignedGuideId);
    await tourismService.updateTourPackage(editingTour.id, {
      title: editTitle, category: editCategory, pricePerPerson: editPrice, durationDays: editDuration,
      maxGroupSize: editGroupSize, difficulty: editDifficulty, summary: editSummary,
      imageUrl: editImageUrl || editingTour.imageUrl, galleryImages: editGalleryImages.filter(Boolean),
      included: editIncluded.filter(Boolean), excluded: editExcluded.filter(Boolean), itinerary: editItinerary,
      destination: { ...editingTour.destination, name: editDestinationName, country: editCountry },
      status: editStatus, hasOffer: editHasOffer,
      discountPercent: editHasOffer ? editDiscountPercent : undefined,
      originalPrice: editHasOffer ? editOriginalPrice : undefined,
      offerTag: editHasOffer ? editOfferTag : undefined,
      assignedGuideId: editAssignedGuideId || undefined,
      assignedGuideName: selectedGuide ? selectedGuide.name : undefined,
    });
    setIsEditModalOpen(false); setEditingTour(null); fetchTours();
  };

  const handleCreateTour = async (e: React.FormEvent) => {
    e.preventDefault();
    const fb = 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1000';
    const selectedGuide = guides.find((g) => g.id === newAssignedGuideId);
    await tourismService.createTourPackage({
      title: newTitle,
      slug: newTitle.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      category: newCategory,
      destination: { id: `dest-${Date.now()}`, name: newDestinationName || 'Ethiopia', country: newCountry || 'Ethiopia', region: 'Ethiopia', imageUrl: newImageUrl || fb, description: newSummary || 'Ethiopian tourist destination.' },
      pricePerPerson: newPrice, durationDays: newDuration, maxGroupSize: newGroupSize, difficulty: newDifficulty,
      imageUrl: newImageUrl || fb,
      galleryImages: newGalleryImages.filter(Boolean).length ? newGalleryImages.filter(Boolean) : [fb],
      summary: newSummary, included: newIncluded.filter(Boolean), excluded: newExcluded.filter(Boolean),
      itinerary: newItinerary, isFeatured: false, status: newStatus, hasOffer,
      discountPercent: hasOffer ? discountPercent : undefined,
      originalPrice: hasOffer ? originalPrice : undefined,
      offerTag: hasOffer ? offerTag : undefined,
      assignedGuideId: newAssignedGuideId || undefined,
      assignedGuideName: selectedGuide ? selectedGuide.name : undefined,
    });
    setIsCreateModalOpen(false); resetCreateForm(); fetchTours();
  };

  const columns: Column<TourPackage>[] = [
    {
      header: 'Tour Package Title',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <img src={row.imageUrl} alt={row.title} style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.title}</div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>{row.destination.name}, {row.destination.country}</div>
          </div>
        </div>
      ),
    },
    { header: 'Category', cell: (row) => <Badge variant="info">{row.category.toUpperCase()}</Badge> },
    {
      header: 'Difficulty',
      cell: (row) => (
        <Badge variant={row.difficulty === 'easy' ? 'success' : row.difficulty === 'moderate' ? 'warning' : 'danger'}>
          {row.difficulty.toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Special Offer',
      cell: (row) => row.hasOffer ? (
        <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={12} /> {row.offerTag || `${row.discountPercent}% OFF`}</Badge>
      ) : (<span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Standard Price</span>),
    },
    {
      header: 'Price / Person',
      cell: (row) => (
        <div>
          {row.hasOffer && row.originalPrice && <span style={{ textDecoration: 'line-through', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginRight: '0.375rem' }}>${row.originalPrice}</span>}
          <span style={{ fontWeight: 700, color: row.hasOffer ? '#16a34a' : 'var(--text-primary)' }}>${row.pricePerPerson.toLocaleString()}</span>
        </div>
      ),
    },
    { header: 'Duration', cell: (row) => <span>{row.durationDays} Days</span> },
    {
      header: 'Ranger Guide',
      cell: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, color: row.assignedGuideName ? 'var(--brand-primary)' : 'var(--text-muted)' }}>
          {row.assignedGuideName ? `👤 ${row.assignedGuideName}` : 'Unassigned'}
        </span>
      ),
    },
    { header: 'Status', cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'warning'}>{row.status.toUpperCase()}</Badge> },
    {
      header: 'Actions',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
          <Button variant="outline" size="sm" icon={<Edit size={14} />} onClick={() => handleStartEdit(row)}>Edit</Button>
          <PermissionGuard resource="tours" action="delete">
            <Button variant="ghost" size="sm" style={{ color: '#ef4444' }} icon={<Trash2 size={14} />}
              onClick={async () => { if (window.confirm(`Delete "${row.title}"?`)) { await tourismService.deleteTourPackage(row.id); fetchTours(); } }}>
              Delete
            </Button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const renderOfferSection = (
    hasOfferVal: boolean, setHasOfferVal: (v: boolean) => void,
    origPrice: number, setOrigPrice: (v: number) => void,
    discPct: number, setDiscPct: (v: number) => void,
    tag: string, setTag: (v: string) => void
  ) => (
    <div style={{ padding: '1rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)' }}>
        <input type="checkbox" checked={hasOfferVal} onChange={(e) => setHasOfferVal(e.target.checked)} style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
        <Tag size={16} style={{ color: 'var(--status-danger)' }} /> Apply Special Promotional Offer / Discount Tag
      </label>
      {hasOfferVal && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginTop: '0.5rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Original Pre-Discount Price ($)" type="number" value={origPrice} onChange={(e) => setOrigPrice(Number(e.target.value))} required={hasOfferVal} />
            <Input label="Discount Percentage (%)" type="number" value={discPct} onChange={(e) => setDiscPct(Number(e.target.value))} required={hasOfferVal} />
          </div>
          <Input label="Offer Badge Tag Text" placeholder="e.g. 15% OFF SEASONAL PROMO" value={tag} onChange={(e) => setTag(e.target.value)} required={hasOfferVal} />
        </div>
      )}
    </div>
  );

  const categoryOptions = (
    <>
      <option value="safari">Safari</option>
      <option value="mountain">Mountain</option>
      <option value="beach">Beach</option>
      <option value="cultural">Cultural</option>
      <option value="luxury">Luxury</option>
      <option value="city">City</option>
    </>
  );

  const difficultyOptions = (
    <>
      <option value="easy">Easy</option>
      <option value="moderate">Moderate</option>
      <option value="challenging">Challenging</option>
      <option value="extreme">Extreme</option>
    </>
  );

  return (
    <div>
      <PageHeader
        title="Tour Packages Inventory"
        description="Create, publish, edit pricing, update itineraries, assign promotional offers, and manage active status."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchTours}>Refresh Inventory</Button>
            <PermissionGuard resource="tours" action="create">
              <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsCreateModalOpen(true)}>Add Tour Package</Button>
            </PermissionGuard>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={tours}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search tour package title, destination, or category..."
        entityName="tours"
      />

      {/* CREATE MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => { setIsCreateModalOpen(false); resetCreateForm(); }}
        title="Create New Tour Package"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => { setIsCreateModalOpen(false); resetCreateForm(); }}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateTour} icon={<Palmtree size={16} />}>Publish Package to Portal</Button>
          </div>
        }
      >
        <form onSubmit={handleCreateTour} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Input label="Tour Package Title *" placeholder="e.g. Lalibela World Heritage Pilgrimage" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Destination Name *" placeholder="e.g. Lalibela" value={newDestinationName} onChange={(e) => setNewDestinationName(e.target.value)} required />
            <Input label="Country" placeholder="e.g. Ethiopia" value={newCountry} onChange={(e) => setNewCountry(e.target.value)} />
            <div className="tms-input-group">
              <label className="tms-input-label">Category *</label>
              <select className="tms-input" value={newCategory} onChange={(e) => setNewCategory(e.target.value as TourCategory)}>{categoryOptions}</select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Sale Price ($) *" type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} required />
            <Input label="Duration (Days) *" type="number" value={newDuration} onChange={(e) => setNewDuration(Number(e.target.value))} required />
            <Input label="Max Group Size *" type="number" value={newGroupSize} onChange={(e) => setNewGroupSize(Number(e.target.value))} required />
            <div className="tms-input-group">
              <label className="tms-input-label">Difficulty *</label>
              <select className="tms-input" value={newDifficulty} onChange={(e) => setNewDifficulty(e.target.value as DifficultyLevel)}>{difficultyOptions}</select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Summary Description *" placeholder="Brief tour overview" value={newSummary} onChange={(e) => setNewSummary(e.target.value)} required />
            <div className="tms-input-group">
              <label className="tms-input-label">Assigned Ranger Guide</label>
              <select className="tms-input" value={newAssignedGuideId} onChange={(e) => setNewAssignedGuideId(e.target.value)}>
                <option value="">-- Unassigned --</option>
                {guides.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className="tms-input-group">
              <label className="tms-input-label">Status</label>
              <select className="tms-input" value={newStatus} onChange={(e) => setNewStatus(e.target.value as 'active' | 'draft')}>
                <option value="active">Active (Public)</option>
                <option value="draft">Draft (Hidden)</option>
              </select>
            </div>
          </div>

          <SectionLabel icon={<Image size={14} />} label="Images" />
          <Input label="Main Hero Image URL *" placeholder="https://images.unsplash.com/..." value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} />
          {newImageUrl && (
            <img src={newImageUrl} alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')}
              style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
          )}
          <StringListEditor label="Gallery Image URLs (additional photos)" items={newGalleryImages} onChange={setNewGalleryImages} placeholder="https://images.unsplash.com/..." addLabel="Add Gallery Image" />

          <SectionLabel icon={<ListChecks size={14} />} label="What's Included / Excluded" />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <StringListEditor label="Included Items *" items={newIncluded} onChange={setNewIncluded} placeholder="e.g. 4-Star Hotel" addLabel="Add Inclusion" />
            <StringListEditor label="Excluded Items *" items={newExcluded} onChange={setNewExcluded} placeholder="e.g. International Airfare" addLabel="Add Exclusion" />
          </div>

          <SectionLabel icon={<Route size={14} />} label="Day-by-Day Itinerary *" />
          <ItineraryEditor days={newItinerary} onChange={setNewItinerary} />

          <SectionLabel icon={<Tag size={14} />} label="Promotional Offer" />
          {renderOfferSection(hasOffer, setHasOffer, originalPrice, setOriginalPrice, discountPercent, setDiscountPercent, offerTag, setOfferTag)}
        </form>
      </Modal>

      {/* EDIT MODAL */}
      {isEditModalOpen && editingTour && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Tour Package — ${editingTour.title}`}
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSaveEdit} icon={<CheckCircle2 size={16} />}>Save Changes & Sync Public Catalog</Button>
            </div>
          }
        >
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Input label="Tour Package Title *" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} required />

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Destination Name *" value={editDestinationName} onChange={(e) => setEditDestinationName(e.target.value)} required />
              <Input label="Country *" value={editCountry} onChange={(e) => setEditCountry(e.target.value)} required />
              <div className="tms-input-group">
                <label className="tms-input-label">Category *</label>
                <select className="tms-input" value={editCategory} onChange={(e) => setEditCategory(e.target.value as TourCategory)}>{categoryOptions}</select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Sale Price ($) *" type="number" value={editPrice} onChange={(e) => setEditPrice(Number(e.target.value))} required />
              <Input label="Duration (Days) *" type="number" value={editDuration} onChange={(e) => setEditDuration(Number(e.target.value))} required />
              <Input label="Max Group Size *" type="number" value={editGroupSize} onChange={(e) => setEditGroupSize(Number(e.target.value))} required />
              <div className="tms-input-group">
                <label className="tms-input-label">Difficulty *</label>
                <select className="tms-input" value={editDifficulty} onChange={(e) => setEditDifficulty(e.target.value as DifficultyLevel)}>{difficultyOptions}</select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Summary Description *" value={editSummary} onChange={(e) => setEditSummary(e.target.value)} required />
              <div className="tms-input-group">
                <label className="tms-input-label">Assigned Ranger Guide</label>
                <select className="tms-input" value={editAssignedGuideId} onChange={(e) => setEditAssignedGuideId(e.target.value)}>
                  <option value="">-- Unassigned --</option>
                  {guides.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name} ({g.status.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
              <div className="tms-input-group">
                <label className="tms-input-label">Status</label>
                <select className="tms-input" value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'active' | 'draft' | 'sold_out')}>
                  <option value="active">Active (Public)</option>
                  <option value="draft">Draft (Hidden)</option>
                  <option value="sold_out">Sold Out</option>
                </select>
              </div>
            </div>

            <SectionLabel icon={<Image size={14} />} label="Images" />
            <Input label="Main Hero Image URL *" value={editImageUrl} onChange={(e) => setEditImageUrl(e.target.value)} placeholder="https://..." />
            {editImageUrl && (
              <img src={editImageUrl} alt="Preview" onError={(e) => (e.currentTarget.style.display = 'none')}
                style={{ width: '100%', height: 120, objectFit: 'cover', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }} />
            )}
            <StringListEditor label="Gallery Image URLs" items={editGalleryImages} onChange={setEditGalleryImages} placeholder="https://..." addLabel="Add Gallery Image" />

            <SectionLabel icon={<ListChecks size={14} />} label="What's Included / Excluded" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <StringListEditor label="Included Items *" items={editIncluded} onChange={setEditIncluded} placeholder="e.g. 4-Star Hotel" addLabel="Add Inclusion" />
              <StringListEditor label="Excluded Items *" items={editExcluded} onChange={setEditExcluded} placeholder="e.g. International Airfare" addLabel="Add Exclusion" />
            </div>

            <SectionLabel icon={<Route size={14} />} label="Day-by-Day Itinerary *" />
            <ItineraryEditor days={editItinerary} onChange={setEditItinerary} />

            <SectionLabel icon={<Tag size={14} />} label="Promotional Offer" />
            {renderOfferSection(editHasOffer, setEditHasOffer, editOriginalPrice, setEditOriginalPrice, editDiscountPercent, setEditDiscountPercent, editOfferTag, setEditOfferTag)}
          </form>
        </Modal>
      )}
    </div>
  );
};

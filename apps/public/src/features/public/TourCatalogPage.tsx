import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TourCard } from '@tms/shared/components/data-display/TourCard';
import { Input } from '@tms/shared/components/common/Input';
import { Card } from '@tms/shared/components/common/Card';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { InteractiveLocationMap, type LocationPin } from '@tms/shared/components/common/InteractiveLocationMap';
import { tourismService } from '@tms/shared/services/tourismService';
import type { TourPackage, TourCategory } from '@tms/shared/types/tour';
import { Search, Compass, SlidersHorizontal, Map, Grid3X3, ChevronDown, ChevronUp, Star, X } from 'lucide-react';

const CATEGORY_FILTERS: { label: string; value: TourCategory | 'all'; emoji: string }[] = [
  { label: 'All', value: 'all', emoji: '🌍' },
  { label: 'Safari', value: 'safari', emoji: '🦁' },
  { label: 'Mountain', value: 'mountain', emoji: '⛰️' },
  { label: 'Cultural', value: 'cultural', emoji: '🏛️' },
  { label: 'Luxury', value: 'luxury', emoji: '✨' },
  { label: 'Beach', value: 'beach', emoji: '🏖️' },
  { label: 'City', value: 'city', emoji: '🏙️' },
];

const DIFFICULTY_OPTIONS = ['All', 'Easy', 'Moderate', 'Challenging', 'Extreme'];
const SEASON_OPTIONS = ['Any Season', 'Oct–Feb (Dry)', 'Mar–May (Short Rains)', 'Jun–Sep (Green)'];

// Geographic coordinates lookup for Ethiopian destinations
const DESTINATION_COORDINATES: Record<string, { lat: number; lng: number; region: string }> = {
  wenchi: { lat: 8.7983, lng: 37.9000, region: 'Oromia Region' },
  lalibela: { lat: 12.0319, lng: 39.0475, region: 'Amhara Region' },
  simien: { lat: 13.2500, lng: 38.3500, region: 'Gondar / Amhara' },
  danakil: { lat: 14.2417, lng: 40.3000, region: 'Afar Region' },
  erta: { lat: 13.6033, lng: 40.6628, region: 'Afar Region' },
  bale: { lat: 6.8500, lng: 39.7500, region: 'Bale / Oromia' },
  harar: { lat: 9.3139, lng: 42.1278, region: 'Harari Region' },
  gondar: { lat: 12.6000, lng: 37.4667, region: 'Amhara Region' },
  axum: { lat: 14.1333, lng: 38.7167, region: 'Tigray Region' },
  arba: { lat: 6.0333, lng: 37.5500, region: 'Southern Ethiopia' },
  omo: { lat: 5.3000, lng: 36.3000, region: 'Southern Ethiopia' },
  addis: { lat: 9.0108, lng: 38.7617, region: 'Finfinnee (Addis Ababa)' },
};

function getCoordinatesForTour(t: TourPackage): { lat: number; lng: number } {
  const query = `${t.destination.name} ${t.destination.region} ${t.title}`.toLowerCase();
  for (const [key, coords] of Object.entries(DESTINATION_COORDINATES)) {
    if (query.includes(key)) {
      return { lat: coords.lat, lng: coords.lng };
    }
  }
  // Default coordinates in central Ethiopia
  return { lat: 9.145, lng: 40.489 };
}

export const TourCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TourCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

  // Advanced filters
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);

  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedSeason, setSelectedSeason] = useState('Any Season');
  const [offersOnly, setOffersOnly] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getTours(selectedCategory, debouncedSearch);
      setTours(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, debouncedSearch]);

  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      if (t.pricePerPerson < minPrice || t.pricePerPerson > maxPrice) return false;
      if (t.rating < minRating) return false;
      if (selectedDifficulty !== 'All' && t.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      if (offersOnly && !t.hasOffer) return false;
      return true;
    });
  }, [tours, minPrice, maxPrice, minRating, selectedDifficulty, offersOnly]);

  // Convert filtered tours to Leaflet map pins dynamically
  const mapPins: LocationPin[] = useMemo(() => {
    return filteredTours.map((t) => {
      const coords = getCoordinatesForTour(t);
      return {
        id: t.id,
        name: t.title,
        category: 'destination' as const,
        latitude: coords.lat,
        longitude: coords.lng,
        imageUrl: t.imageUrl || t.destination.imageUrl,
        description: `${t.destination.name} (${t.destination.region || 'Ethiopia'}) • ${t.durationDays} Days • $${t.pricePerPerson} USD`,
        address: `${t.destination.name}, Ethiopia`,
      };
    });
  }, [filteredTours]);

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.45rem 0.95rem',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--font-size-xs)',
    fontWeight: active ? 700 : 500,
    color: active ? '#fff' : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--brand-primary)' : 'var(--bg-primary)',
    border: `1px solid ${active ? 'var(--brand-primary)' : 'var(--border-color)'}`,
    cursor: 'pointer',
    transition: 'all var(--transition-fast)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.3rem',
  });

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Explore Ethiopian <span className="text-gradient">Destinations & Tours</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Wenchi Crater Lake, Lalibela rock-hewn churches, Simien wildlife treks, Danakil lava lakes & more.
        </p>
      </div>

      {/* Top Filter Bar */}
      <Card glass style={{ padding: '1rem 1.25rem', marginBottom: '1.25rem' }}>
        <div className="flex-between" style={{ gap: '1rem', flexWrap: 'wrap' }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {CATEGORY_FILTERS.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                style={pillStyle(selectedCategory === cat.value)}
              >
                {cat.emoji} {cat.label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {/* Search Input with Debounce & Clear button */}
            <div style={{ width: '260px', position: 'relative' }}>
              <Input
                placeholder="Search destinations..."
                icon={<Search size={15} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                ...pillStyle(showFilters),
                backgroundColor: showFilters ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                color: showFilters ? 'var(--brand-primary)' : 'var(--text-secondary)',
              }}
            >
              <SlidersHorizontal size={14} />
              Filters {showFilters ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {/* View Mode Toggle: Grid vs Map */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
              <button
                onClick={() => setViewMode('grid')}
                title="Grid view"
                style={{
                  padding: '0.4rem 0.75rem',
                  border: 'none',
                  backgroundColor: viewMode === 'grid' ? 'var(--brand-primary)' : 'transparent',
                  color: viewMode === 'grid' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                }}
              >
                <Grid3X3 size={14} /> Grid
              </button>
              <button
                onClick={() => setViewMode('map')}
                title="Interactive map view"
                style={{
                  padding: '0.4rem 0.75rem',
                  border: 'none',
                  backgroundColor: viewMode === 'map' ? 'var(--brand-primary)' : 'transparent',
                  color: viewMode === 'map' ? '#fff' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                }}
              >
                <Map size={14} /> Map
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Advanced Filters Drawer */}
        {showFilters && (
          <div style={{ marginTop: '1.25rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1.25rem' }}>
            {/* Price Filter */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Max Price: ${maxPrice.toLocaleString()} USD
              </label>
              <input
                type="range"
                min={0}
                max={5000}
                step={50}
                value={maxPrice > 5000 ? 5000 : maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--brand-primary)' }}
              />
            </div>

            {/* Difficulty Filter */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Difficulty Level
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Min Rating Filter */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.4rem' }}>
                Minimum Rating: {minRating > 0 ? `★ ${minRating}.0+` : 'Any'}
              </label>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.45rem 0.75rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                <option value={0}>All Ratings</option>
                <option value={4.5}>★ 4.5 & Above</option>
                <option value={4.8}>★ 4.8 & Above</option>
                <option value={4.9}>★ 4.9 & Above</option>
              </select>
            </div>

            {/* Special Offers Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingTop: '1.2rem' }}>
              <input
                type="checkbox"
                id="offersToggle"
                checked={offersOnly}
                onChange={(e) => setOffersOnly(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="offersToggle" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, cursor: 'pointer' }}>
                🔥 Special Offers Only
              </label>
            </div>
          </div>
        )}
      </Card>

      {/* Results Count Banner */}
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={14} style={{ color: '#fbbf24' }} />
        <span><strong style={{ color: 'var(--text-primary)' }}>{filteredTours.length}</strong> tour packages match your filters</span>
      </div>

      {/* ─── MAP VIEW (Interactive Leaflet Map) ─── */}
      {viewMode === 'map' && (
        <Card glass style={{ marginBottom: '2rem', overflow: 'hidden', padding: 0 }}>
          <InteractiveLocationMap
            title="🗺️ Ethiopia — Dynamic Geographic Tour Explorer"
            pins={mapPins}
          />
        </Card>
      )}

      {/* ─── GRID VIEW ─── */}
      {isLoading ? (
        <LoadingSpinner label="Searching tour packages..." />
      ) : filteredTours.length === 0 ? (
        <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '4rem', color: 'var(--text-muted)' }}>
          <Compass size={48} style={{ opacity: 0.5 }} />
          <h3>No tour packages found matching your criteria.</h3>
          <p style={{ fontSize: 'var(--font-size-sm)' }}>Try searching for "Wenchi", "Lalibela", "Simien", or "Danakil".</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {filteredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { TourCard } from '@tms/shared/components/data-display/TourCard';
import { Input } from '@tms/shared/components/common/Input';
import { Card } from '@tms/shared/components/common/Card';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { tourismService } from '@tms/shared/services/tourismService';
import type { TourPackage, TourCategory } from '@tms/shared/types/tour';
import { Search, Compass, SlidersHorizontal, Map, Grid3X3, ChevronDown, ChevronUp, Star } from 'lucide-react';

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

// Map view pin coordinates for Ethiopian destinations
const MAP_PINS = [
  { id: 'wenchi',   name: 'Wenchi Crater Lake',   region: 'Oromia',  top: '52%',  left: '28%', tours: 1 },
  { id: 'lalibela', name: 'Lalibela',              region: 'Amhara',  top: '32%',  left: '51%', tours: 1 },
  { id: 'simien',   name: 'Simien Mountains',      region: 'Amhara',  top: '20%',  left: '40%', tours: 1 },
  { id: 'danakil',  name: 'Danakil Depression',    region: 'Afar',    top: '15%',  left: '62%', tours: 1 },
  { id: 'bale',     name: 'Bale Mountains',        region: 'Oromia',  top: '62%',  left: '50%', tours: 1 },
  { id: 'harar',    name: 'Harar Jugol City',      region: 'Harari',  top: '48%',  left: '67%', tours: 1 },
  { id: 'addis',    name: 'Addis Ababa',           region: 'Capital', top: '48%',  left: '38%', tours: 0 },
  { id: 'gondar',   name: 'Gondar (Castles)',      region: 'Amhara',  top: '22%',  left: '38%', tours: 0 },
];

export const TourCatalogPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSearch = searchParams.get('search') || '';

  const [tours, setTours] = useState<TourPackage[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<TourCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
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

  // Hovered map pin
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  const fetchCatalog = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getTours(selectedCategory, searchQuery);
      setTours(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [selectedCategory, searchQuery]);

  const filteredTours = useMemo(() => {
    return tours.filter((t) => {
      if (t.pricePerPerson < minPrice || t.pricePerPerson > maxPrice) return false;
      if (t.rating < minRating) return false;
      if (selectedDifficulty !== 'All' && t.difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()) return false;
      if (offersOnly && !t.hasOffer) return false;
      return true;
    });
  }, [tours, minPrice, maxPrice, minRating, selectedDifficulty, offersOnly]);

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
            {/* Search */}
            <div style={{ width: '240px' }}>
              <Input
                placeholder="Search destinations..."
                icon={<Search size={15} />}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
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

            {/* View Toggle */}
            <div style={{ display: 'flex', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{ ...pillStyle(viewMode === 'grid'), borderRadius: 0, border: 'none', padding: '0.45rem 0.75rem' }}>
                <Grid3X3 size={14} />
              </button>
              <button onClick={() => setViewMode('map')} style={{ ...pillStyle(viewMode === 'map'), borderRadius: 0, border: 'none', padding: '0.45rem 0.75rem', borderLeft: '1px solid var(--border-color)' }}>
                <Map size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem' }}>
            {/* Price Range */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                💵 Price Range (USD)
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input type="number" value={minPrice} onChange={(e) => setMinPrice(Number(e.target.value))}
                  style={{ width: '80px', padding: '0.375rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  placeholder="Min" />
                <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>—</span>
                <input type="number" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}
                  style={{ width: '80px', padding: '0.375rem 0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
                  placeholder="Max" />
              </div>
            </div>

            {/* Min Rating */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                ⭐ Min Rating
              </label>
              <div style={{ display: 'flex', gap: '0.3rem' }}>
                {[0, 4, 4.5, 4.8].map((r) => (
                  <button key={r} onClick={() => setMinRating(r)}
                    style={{ ...pillStyle(minRating === r), padding: '0.3rem 0.6rem', fontSize: '11px' }}>
                    {r === 0 ? 'Any' : `${r}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                🥾 Difficulty
              </label>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button key={d} onClick={() => setSelectedDifficulty(d)}
                    style={{ ...pillStyle(selectedDifficulty === d), padding: '0.3rem 0.6rem', fontSize: '11px' }}>
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Best Season */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', display: 'block', marginBottom: '0.5rem' }}>
                🗓️ Best Season to Visit
              </label>
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {SEASON_OPTIONS.map((s) => (
                  <button key={s} onClick={() => setSelectedSeason(s)}
                    style={{ ...pillStyle(selectedSeason === s), padding: '0.3rem 0.6rem', fontSize: '11px' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Offers Only */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="checkbox" id="offers-only" checked={offersOnly} onChange={(e) => setOffersOnly(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: 'var(--brand-primary)' }} />
              <label htmlFor="offers-only" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 600, cursor: 'pointer' }}>
                🏷️ Show Offers & Deals Only
              </label>
            </div>

            {/* Reset Filters */}
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => { setMinPrice(0); setMaxPrice(5000); setMinRating(0); setSelectedDifficulty('All'); setSelectedSeason('Any Season'); setOffersOnly(false); }}
                style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
              >
                ↺ Reset All Filters
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Results Count */}
      <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Star size={14} style={{ color: '#fbbf24' }} />
        <span><strong style={{ color: 'var(--text-primary)' }}>{filteredTours.length}</strong> tour packages match your filters</span>
      </div>

      {/* ─── MAP VIEW ─── */}
      {viewMode === 'map' && (
        <Card glass style={{ marginBottom: '2rem', overflow: 'hidden', padding: 0 }}>
          <div style={{ position: 'relative', width: '100%', height: '480px', backgroundColor: '#c8e6c9' }}>
            {/* Stylized Ethiopia Map Background */}
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, #a5d6a7 0%, #81c784 40%, #66bb6a 70%, #c8e6c9 100%)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Map title */}
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', fontWeight: 700, fontSize: 'var(--font-size-sm)', zIndex: 10 }}>
                🗺️ Ethiopia — Interactive Destination Map
              </div>

              {/* Country outline hint */}
              <div style={{ position: 'absolute', inset: '5%', border: '2px dashed rgba(255,255,255,0.5)', borderRadius: '40% 35% 30% 45% / 35% 40% 45% 30%' }} />

              {/* Legend */}
              <div style={{ position: 'absolute', bottom: '1rem', right: '1rem', backgroundColor: 'rgba(255,255,255,0.9)', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)', zIndex: 10 }}>
                <div style={{ fontWeight: 700, marginBottom: '0.4rem' }}>Legend</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--brand-primary)', display: 'inline-block' }} /> Tour Destination
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#64748b', display: 'inline-block' }} /> Major City / Hub
                </div>
              </div>

              {/* Map Pins */}
              {MAP_PINS.map((pin) => (
                <div
                  key={pin.id}
                  style={{ position: 'absolute', top: pin.top, left: pin.left, transform: 'translate(-50%, -100%)', zIndex: 5, cursor: 'pointer' }}
                  onMouseEnter={() => setHoveredPin(pin.id)}
                  onMouseLeave={() => setHoveredPin(null)}
                  onClick={() => pin.tours > 0 && navigate(`/tours?search=${encodeURIComponent(pin.name)}`)}
                >
                  {/* Pin dot */}
                  <div style={{
                    width: pin.tours > 0 ? 18 : 12,
                    height: pin.tours > 0 ? 18 : 12,
                    borderRadius: '50%',
                    backgroundColor: pin.tours > 0 ? 'var(--brand-primary)' : '#64748b',
                    border: '3px solid #fff',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s ease',
                    transform: hoveredPin === pin.id ? 'scale(1.4)' : 'scale(1)',
                  }} />
                  {/* Tooltip */}
                  {hoveredPin === pin.id && (
                    <div style={{
                      position: 'absolute', bottom: '120%', left: '50%', transform: 'translateX(-50%)',
                      backgroundColor: 'var(--bg-elevated)',
                      color: 'var(--text-primary)',
                      padding: '0.4rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      boxShadow: 'var(--shadow-lg)',
                      whiteSpace: 'nowrap',
                      fontSize: '11px',
                      fontWeight: 600,
                      border: '1px solid var(--border-color)',
                      zIndex: 20,
                    }}>
                      📍 {pin.name}
                      <div style={{ fontSize: '10px', fontWeight: 400, color: 'var(--text-muted)' }}>{pin.region} {pin.tours > 0 ? '• Click to explore tours' : '• Hub city'}</div>
                    </div>
                  )}
                  {/* Label */}
                  <div style={{
                    position: 'absolute', top: '110%', left: '50%', transform: 'translateX(-50%)',
                    fontSize: '9px', fontWeight: 700, whiteSpace: 'nowrap', color: '#0f172a',
                    textShadow: '0 0 4px rgba(255,255,255,0.8)',
                  }}>
                    {pin.name.split(' ')[0]}
                  </div>
                </div>
              ))}
            </div>
          </div>
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

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TourCard } from '@tms/shared/components/data-display/TourCard';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { tourismService } from '@tms/shared/services/tourismService';
import type { TourPackage, Destination } from '@tms/shared/types/tour';
import { useLanguageStore } from '@tms/shared/store/useLanguageStore';
import { DestinationWeatherWidget } from '@tms/shared/components/data-display/DestinationWeatherWidget';
import { Search, Compass, ShieldCheck, Award, MapPin, Sparkles, ArrowRight, DollarSign, Smartphone } from 'lucide-react';

// Ethiopian destination background images for hero slideshow
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1600',  // Wenchi Crater Lake
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1600',  // Lalibela
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600',  // Simien Mountains
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1600',  // Danakil
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1600',  // Bale Mountains
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1600',  // Harar
];

export const HomePage: React.FC = () => {
  const { t } = useLanguageStore();
  const [featuredTours, setFeaturedTours] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [prevHeroIndex, setPrevHeroIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      const [tours, dests] = await Promise.all([
        tourismService.getTours('all'),
        tourismService.getDestinations(),
      ]);
      setFeaturedTours(tours);
      setDestinations(dests);
    };
    loadHomeData();
  }, []);

  // Hero background slideshow: crossfade every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPrevHeroIndex(heroIndex);
        setHeroIndex((prev) => (prev + 1) % HERO_IMAGES.length);
        setIsFading(false);
      }, 600);
    }, 3000);
    return () => clearInterval(interval);
  }, [heroIndex]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/tours?search=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-section"
        style={{
          position: 'relative',
          padding: '6rem 0 7rem 0',
          textAlign: 'center',
          overflow: 'hidden',
          minHeight: '520px',
          width: '100%',
        }}
      >
        {/* Previous background (fading out) */}
        {prevHeroIndex !== null && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${HERO_IMAGES[prevHeroIndex]})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: isFading ? 0 : 1,
              transition: 'opacity 0.6s ease-in-out',
              zIndex: 0,
            }}
          />
        )}

        {/* Current background (fading in) */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${HERO_IMAGES[heroIndex]})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: isFading ? 0 : 1,
            transition: 'opacity 0.6s ease-in-out',
            zIndex: 1,
          }}
        />

        {/* Dark gradient overlay for text legibility */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(5, 12, 38, 0.62) 0%, rgba(5, 12, 38, 0.50) 60%, rgba(5, 12, 38, 0.72) 100%)',
            zIndex: 2,
          }}
        />

        {/* Slide indicator dots */}
        <div
          style={{
            position: 'absolute',
            bottom: '1.5rem',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: '0.5rem',
            zIndex: 4,
          }}
        >
          {HERO_IMAGES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              style={{
                width: idx === heroIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                border: 'none',
                backgroundColor: idx === heroIndex ? '#ffffff' : 'rgba(255,255,255,0.45)',
                cursor: 'pointer',
                padding: 0,
                transition: 'all 0.35s ease',
              }}
            />
          ))}
        </div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 3, padding: '0 1.5rem' }}>
          <div
            className="flex-center"
            style={{
              display: 'inline-flex',
              gap: '0.5rem',
              padding: '0.35rem 0.875rem',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(255,255,255,0.15)',
              backdropFilter: 'blur(6px)',
              color: '#ffffff',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 700,
              marginBottom: '1.25rem',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            <Sparkles size={14} /> {t('hero_badge')}
          </div>

          <h1 className="hero-title" style={{ fontSize: '3rem', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.15, marginBottom: '1.25rem', color: '#ffffff', textShadow: '0 2px 16px rgba(0,0,0,0.4)' }}>
            {t('hero_title_pre')}<span style={{ color: '#60a5fa' }}>{t('hero_title_brand')}</span>{t('hero_title_post')}
          </h1>

          <p style={{ fontSize: 'var(--font-size-lg)', color: 'rgba(255,255,255,0.85)', marginBottom: '2.5rem', maxWidth: '750px', margin: '0 auto 2.5rem auto', textShadow: '0 1px 8px rgba(0,0,0,0.4)' }}>
            {t('hero_desc')}
          </p>

          {/* Hero Floating Search Widget */}
          <Card
            glass
            className="hero-search-card"
            style={{
              maxWidth: '750px',
              margin: '0 auto',
              padding: '0.875rem',
              borderRadius: 'var(--radius-full)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.35)',
              backgroundColor: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <form className="hero-search-form" onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Search local destinations (e.g. Wenchi, Lalibela)..."
                  icon={<Search size={18} />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ border: 'none', backgroundColor: 'transparent' }}
                />
              </div>
              <Button type="submit" variant="primary" size="lg" icon={<Compass size={18} />}>
                Find Tours
              </Button>
            </form>
          </Card>
        </div>
      </section>


      {/* Promotional Discount Offers Banner Strip (Exact requested component) */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '1.5rem 1.5rem',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
        }}
      >
        <div
          className="promo-strip-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
            alignItems: 'center',
          }}
        >
          {/* Promo Offer 1: Travel Smart */}
          <div
            className="flex-center"
            style={{
              justifyContent: 'flex-start',
              gap: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onClick={() => navigate('/tours')}
          >
            <div
              className="flex-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                flexShrink: 0,
              }}
            >
              <DollarSign size={32} style={{ strokeWidth: 2.5 }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}>
                UP TO USD. 50 OFF
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                TRAVEL SMART
              </div>
            </div>
          </div>

          {/* Promo Offer 2: Hotels Across Ethiopia */}
          <div
            className="flex-center"
            style={{
              justifyContent: 'flex-start',
              gap: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onClick={() => navigate('/tours')}
          >
            <div
              className="flex-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: '#0284c7',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '24px',
                flexShrink: 0,
                boxShadow: '0 4px 10px rgba(2, 132, 199, 0.25)',
              }}
            >
              H
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}>
                UP TO 70% OFF
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                ON HOTELS ACROSS Ethiopia
              </div>
            </div>
          </div>

          {/* Promo Offer 3: App Offer */}
          <div
            className="flex-center"
            style={{
              justifyContent: 'flex-start',
              gap: '1.25rem',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onClick={() => navigate('/tours')}
          >
            <div
              className="flex-center"
              style={{
                width: 48,
                height: 48,
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284c7',
                flexShrink: 0,
              }}
            >
              <Smartphone size={32} style={{ strokeWidth: 2.2 }} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#16a34a', letterSpacing: '0.04em' }}>
                FLAT USD. 50 OFF
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                US APP OFFER
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Destination Climate & Weather Indicator */}
      <section style={{ maxWidth: '1280px', margin: '2.5rem auto 0 auto', padding: '0 1.5rem' }}>
        <DestinationWeatherWidget />
      </section>

      {/* Featured Destinations Section */}
      <section style={{ maxWidth: '1280px', margin: '3rem auto 4rem auto', padding: '0 1.5rem' }}>
        <div className="flex-between section-header-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Top Ethiopian Tourist Destinations</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Explore Ethiopia's premier natural wonders and UNESCO World Heritage locations</p>
          </div>
          <Button variant="ghost" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/tours')}>
            View All Destinations
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
          {destinations.map((d) => (
            <div
              key={d.id}
              onClick={() => navigate(`/tours?search=${encodeURIComponent(d.name)}`)}
              style={{
                position: 'relative',
                height: 220,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <img
                src={d.imageUrl}
                alt={d.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s ease' }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, transparent 60%)',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  color: '#ffffff',
                }}
              >
                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.25rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-accent)', fontWeight: 600 }}>
                  <MapPin size={12} /> {d.region}
                </div>
                <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 700 }}>{d.name}</h3>
                <span style={{ fontSize: 'var(--font-size-xs)', opacity: 0.85 }}>{d.country}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Tour Packages Grid */}
      <section style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem 4rem 1.5rem' }}>
        <div className="flex-between section-header-between" style={{ marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700 }}>Featured Ethiopian Tour Packages</h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>Handcrafted daily itineraries led by certified local Ethiopian rangers</p>
          </div>
          <Button variant="outline" size="sm" icon={<ArrowRight size={14} />} onClick={() => navigate('/tours')}>
            Browse Full Catalog
          </Button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.75rem' }}>
          {featuredTours.map((tour) => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      </section>

      {/* Value Proposition Highlights */}
      <section style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '4rem 1.5rem' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
              <Compass size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.25rem' }}>Authentic Local Expeditions</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Curated travel schedules balance high-end eco-lodges with wild volcanic and mountain exploration.</p>
            </div>
          </Card>

          <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.25rem' }}>Certified Ethiopian Guides</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Native Ethiopian guides fluent in Amharic, Oromiffa, Afar & English ensure safety and heritage mastery.</p>
            </div>
          </Card>

          <Card glass style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            <div className="flex-center" style={{ width: 44, height: 44, borderRadius: 'var(--radius-md)', backgroundColor: 'var(--status-warning-bg)', color: 'var(--status-warning)' }}>
              <Award size={24} />
            </div>
            <div>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginBottom: '0.25rem' }}>Best Local Price Guarantee</h4>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Transparent ETB & USD booking options with zero hidden charges and instant E-Tickets.</p>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

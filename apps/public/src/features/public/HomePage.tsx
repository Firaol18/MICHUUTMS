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

      {/* ─── WHY TRAVEL WITH US / ETHIOPIAN VALUE PROPOSITION ─── */}
      <section
        style={{
          position: 'relative',
          backgroundColor: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          borderBottom: '1px solid var(--border-color)',
          padding: '5rem 1.5rem',
          overflow: 'hidden',
        }}
      >
        {/* Subtle Ambient Ethiopian Glow */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '240px',
            background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, rgba(245,158,11,0.04) 50%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '1280px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Section Header */}
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem auto' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--bg-tertiary)',
                border: '1px solid var(--border-color)',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--brand-primary)',
                marginBottom: '1rem',
              }}
            >
              <Sparkles size={12} style={{ color: '#f59e0b' }} />
              Why Travel With MICHUU TMS
            </div>

            <h2 style={{ fontSize: 'clamp(1.75rem, 3.5vw, 2.35rem)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '0.75rem' }}>
              Authentic Experiences. Local Expertise.{' '}
              <span className="text-gradient">Unforgettable Ethiopia.</span>
            </h2>

            <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Crafted around deep indigenous heritage, certified mountain rangers, and direct community-first tourism.
            </p>
          </div>

          {/* 3 Value Proposition Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Card 1: Authentic Local Expeditions */}
            <div
              className="tms-feature-card"
              onClick={() => navigate('/tours')}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 35px -10px rgba(37,99,235,0.12), 0 0 0 1px rgba(37,99,235,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(37,99,235,0.15), rgba(6,182,212,0.15))',
                    border: '1px solid rgba(37,99,235,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--brand-primary)',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Compass size={26} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
                  Authentic Local Expeditions
                </h3>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Explore Ethiopia beyond the usual tourist routes, from Danakil’s glowing volcanic lava lakes to breathtaking Simien & Bale mountain trails.
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  color: 'var(--brand-primary)',
                }}
              >
                <span>Explore expeditions</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 2: Certified Ethiopian Guides */}
            <div
              className="tms-feature-card"
              onClick={() => navigate('/tours?category=cultural')}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 35px -10px rgba(16,185,129,0.12), 0 0 0 1px rgba(16,185,129,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(5,150,105,0.15))',
                    border: '1px solid rgba(16,185,129,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#10b981',
                    marginBottom: '1.25rem',
                  }}
                >
                  <ShieldCheck size={26} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
                  Certified Ethiopian Guides
                </h3>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Travel with native, accredited local guides who bring Ethiopia's ancient 3,000-year history, living cultures, and hidden gems to life.
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  color: '#10b981',
                }}
              >
                <span>Meet our guides</span>
                <ArrowRight size={14} />
              </div>
            </div>

            {/* Card 3: Best Local Price Guarantee */}
            <div
              className="tms-feature-card"
              onClick={() => navigate('/tours')}
              style={{
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '20px',
                padding: '2rem 1.75rem',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
                cursor: 'pointer',
                position: 'relative',
                boxShadow: 'var(--shadow-sm)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 20px 35px -10px rgba(245,158,11,0.12), 0 0 0 1px rgba(245,158,11,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
              }}
            >
              <div>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.15))',
                    border: '1px solid rgba(245,158,11,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#f59e0b',
                    marginBottom: '1.25rem',
                  }}
                >
                  <Award size={26} />
                </div>

                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', letterSpacing: '-0.01em' }}>
                  Best Local Price Guarantee
                </h3>

                <p style={{ fontSize: '0.925rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                  Transparent ETB and USD pricing with zero hidden fees, flexible Ethiopian mobile payment support, and instant verified e-tickets.
                </p>
              </div>

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 700,
                  color: '#f59e0b',
                }}
              >
                <span>View all packages</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

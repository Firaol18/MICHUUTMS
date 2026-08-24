import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TourCard } from '@tms/shared/components/data-display/TourCard';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { tourismService } from '@tms/shared/services/tourismService';
import type { TourPackage, Destination } from '@tms/shared/types/tour';
import { useLanguageStore } from '@tms/shared/store/useLanguageStore';
import { DestinationWeatherWidget } from '@tms/shared/components/data-display/DestinationWeatherWidget';
import { Search, Compass, ShieldCheck, Award, MapPin, Sparkles, ArrowRight, DollarSign, Smartphone, CalendarDays, Tag, Clock, Heart, Star, Users } from 'lucide-react';

// Ethiopian destination background images for hero slideshow
const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=1600',  // Wenchi Crater Lake
  'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=1600',  // Lalibela
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=1600',  // Simien Mountains
  'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=1600',  // Danakil
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=1600',  // Bale Mountains
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=1600',  // Harar
];

const FALLBACK_FESTIVALS = [
  {
    id: 'timkat-gondar',
    title: 'Timkat (Epiphany) Festival Celebration',
    date: '2026-01-19',
    ethiopianDate: 'Tir 11 (ጥር ፲፩)',
    location: 'Gondar & Lalibela, Ethiopia',
    category: 'religious',
    description: 'Ethiopia’s most colorful Orthodox festival featuring sacred Tabot processions, ceremonial bath immersions, and white Netela robes.',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
    price: 45,
    isFree: false,
    hasOffer: true,
    offerTag: '15% Off with MICHUU15',
  },
  {
    id: 'meskel-addis',
    title: 'Meskel Festival (Finding of the True Cross)',
    date: '2026-09-27',
    ethiopianDate: 'Meskerem 17 (መስከረም ፲፯)',
    location: 'Meskel Square, Addis Ababa',
    category: 'cultural',
    description: 'UNESCO-inscribed ancient bonfire celebration with tens of thousands of worshippers gathering around the massive Demera pyre.',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=800',
    price: 0,
    isFree: true,
    hasOffer: false,
  },
  {
    id: 'irreecha-bishoftu',
    title: 'Irreecha Oromo Thanksgiving Celebration',
    date: '2026-10-04',
    ethiopianDate: 'Birraa / Autumn (ቢራ)',
    location: 'Lake Hora Arsadi, Bishoftu',
    category: 'cultural',
    description: 'The premier Oromo thanksgiving festival welcoming the spring harvest with wet green grass blessings and colorful traditional attire.',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
    price: 30,
    isFree: false,
    hasOffer: true,
    offerTag: 'Festival Pass',
  },
  {
    id: 'great-ethiopian-run',
    title: 'Great Ethiopian Run International 10K',
    date: '2026-11-15',
    ethiopianDate: 'Hidar 6 (ኅዳር ፮)',
    location: 'Addis Ababa City Center',
    category: 'sport',
    description: 'Africa’s biggest road race founded by Haile Gebrselassie, uniting 45,000 runners in an energetic street carnival atmosphere.',
    imageUrl: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?auto=format&fit=crop&q=80&w=800',
    price: 55,
    isFree: false,
    hasOffer: false,
  },
];

export const HomePage: React.FC = () => {
  const { t } = useLanguageStore();
  const [featuredTours, setFeaturedTours] = useState<TourPackage[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [prevHeroIndex, setPrevHeroIndex] = useState<number | null>(null);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const loadHomeData = async () => {
      const [tours, dests, eventList] = await Promise.all([
        tourismService.getTours('all'),
        tourismService.getDestinations(),
        tourismService.getEvents(),
      ]);
      setFeaturedTours(tours);
      setDestinations(dests);
      if (Array.isArray(eventList) && eventList.length > 0) {
        setEvents(eventList.slice(0, 4));
      } else {
        setEvents(FALLBACK_FESTIVALS);
      }
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


      {/* ─── LUXURY TRAVEL HIGHLIGHTS & PERKS STRIP ─── */}
      <section
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E2E8F0',
          borderBottom: '1px solid #E2E8F0',
          padding: '1.75rem 1.5rem',
          boxShadow: '0 4px 20px rgba(15, 23, 42, 0.03)',
        }}
      >
        <div
          className="promo-strip-grid"
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
            alignItems: 'center',
          }}
        >
          {/* Highlight 1: Welcome Offer */}
          <div
            onClick={() => navigate('/tours')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#2563EB';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(37, 99, 235, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Tag size={22} style={{ color: '#2563EB' }} />
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#16A34A', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                15% Welcome Offer Active
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                Save 15% on 1st Tour or Event
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '0.15rem' }}>
                Use promo code <strong>MICHUU15</strong>
              </div>
            </div>
          </div>

          {/* Highlight 2: Certified Local Rangers */}
          <div
            onClick={() => navigate('/tours')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#0284C7';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(2, 132, 199, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(2, 132, 199, 0.1)',
                color: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Compass size={22} style={{ color: '#0284C7' }} />
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#0284C7', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Certified Local Guides
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                100% Verified Local Rangers
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '0.15rem' }}>
                Simien, Danakil & Bale specialists
              </div>
            </div>
          </div>

          {/* Highlight 3: 24/7 Concierge Protection */}
          <div
            onClick={() => navigate('/contact')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.85rem 1.15rem',
              borderRadius: '16px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
              e.currentTarget.style.borderColor = '#059669';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(5, 150, 105, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F8FAFC';
              e.currentTarget.style.borderColor = '#E2E8F0';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: '12px',
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <ShieldCheck size={22} style={{ color: '#059669' }} />
            </div>
            <div>
              <div style={{ fontSize: '10.5px', fontWeight: 800, color: '#059669', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Travel With Confidence
              </div>
              <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                24/7 Addis Concierge & Care
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '0.15rem' }}>
                Direct support & departure guarantee
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

      {/* ─── UPCOMING ETHIOPIAN FESTIVALS & CULTURAL EVENTS ─── */}
      <section
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '0 1.5rem 5rem 1.5rem',
        }}
      >
        <div className="flex-between section-header-between" style={{ marginBottom: '2rem' }}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '11px',
                fontWeight: 800,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--brand-primary)',
                marginBottom: '0.4rem',
              }}
            >
              <Sparkles size={12} style={{ color: '#f59e0b' }} />
              <span>Ethiopian Cultural Calendar & Festivities</span>
            </div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Upcoming Ethiopian Festivals & Events
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Immerse yourself in centuries-old Orthodox ceremonies, Oromo Thanksgiving, and energetic cultural carnivals
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowRight size={14} />}
            onClick={() => navigate('/events')}
            style={{ borderRadius: '12px' }}
          >
            Explore Events Calendar
          </Button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.75rem',
          }}
        >
          {events.map((event) => {
            const formattedDate = event.eventDate || event.date;
            const displayDate = formattedDate
              ? new Date(formattedDate).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Upcoming';

            return (
              <Card
                key={event.id}
                glass
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 0,
                  overflow: 'hidden',
                  height: '100%',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  cursor: 'pointer',
                  border: event.hasOffer ? '1.5px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                }}
                onClick={() => navigate('/events')}
              >
                {/* Cover Image Container */}
                <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden' }}>
                  <img
                    src={event.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800'}
                    alt={event.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Category Pill Badges */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <Badge variant="info">{(event.category || 'cultural').toUpperCase()}</Badge>
                    {event.hasOffer ? (
                      <Badge variant="danger" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Tag size={10} /> {event.offerTag || '15% OFF OFFER'}
                      </Badge>
                    ) : event.isFree || !event.price ? (
                      <Badge variant="success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        FREE ENTRY
                      </Badge>
                    ) : null}
                  </div>

                  {/* Wishlist Heart Toggle Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate('/events');
                    }}
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      width: 34,
                      height: 34,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(15, 23, 42, 0.75)',
                      backdropFilter: 'blur(4px)',
                      border: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#ffffff',
                      transition: 'transform 0.2s ease, color 0.2s ease',
                    }}
                    title="Explore Event"
                  >
                    <Heart size={18} />
                  </button>

                  {/* Rating / Festival Status Overlay */}
                  <div
                    className="flex-center"
                    style={{
                      position: 'absolute',
                      bottom: 12,
                      right: 12,
                      backgroundColor: 'rgba(15, 23, 42, 0.85)',
                      backdropFilter: 'blur(4px)',
                      padding: '0.25rem 0.625rem',
                      borderRadius: 'var(--radius-full)',
                      color: '#fbbf24',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 700,
                      gap: '0.25rem',
                    }}
                  >
                    <Star size={13} fill="#fbbf24" />
                    <span>4.95</span>
                    <span style={{ color: '#94a3b8', fontWeight: 500 }}>(Festival)</span>
                  </div>
                </div>

                {/* Card Content Body */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                  {/* Location Tag */}
                  <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.375rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    <MapPin size={14} />
                    <span>{event.location}</span>
                  </div>

                  {/* Event Title */}
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35 }}>
                    {event.title}
                  </h3>

                  {/* Summary */}
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {event.description}
                  </p>

                  {/* Event Specs (Date / Ethiopian Calendar & Public Passes) */}
                  <div
                    className="flex-between"
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div className="flex-center" style={{ gap: '0.375rem' }}>
                      <CalendarDays size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>{event.ethiopianDate || displayDate}</span>
                    </div>

                    <div className="flex-center" style={{ gap: '0.375rem' }}>
                      <Users size={14} style={{ color: 'var(--text-muted)' }} />
                      <span>Public & Passes</span>
                    </div>
                  </div>

                  {/* Price & CTA Button */}
                  <div className="flex-between" style={{ paddingTop: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                        {event.hasOffer ? 'Special Offer Pass' : event.isFree || !event.price ? 'Admission' : 'From'}
                      </span>
                      <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: event.hasOffer || event.isFree || !event.price ? '#16a34a' : 'var(--text-primary)' }}>
                        {event.isFree || !event.price ? (
                          'Free Entry'
                        ) : (
                          <>
                            ${event.price} <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
                          </>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/events');
                      }}
                    >
                      Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
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

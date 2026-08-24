import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Wind, Calendar, Mountain, ArrowRight, CloudSun, Flame, MapPin, Sparkles } from 'lucide-react';

interface DestinationWeather {
  id: string;
  name: string;
  shortName: string;
  region: string;
  tempC: number;
  tempF: number;
  condition: string;
  iconType: 'sunny' | 'mild' | 'breeze' | 'hot';
  bestMonths: string;
  bestNote: string;
  altitude: string;
  altitudeNote: string;
  searchTag: string;
  imageUrl: string;
}

const DESTINATION_WEATHER_DATA: DestinationWeather[] = [
  {
    id: 'wenchi',
    name: 'Wenchi Crater Lake',
    shortName: 'Wenchi',
    region: 'Oromia Region',
    tempC: 21,
    tempF: 70,
    condition: 'Pleasant Highland Breeze',
    iconType: 'breeze',
    bestMonths: 'Oct – Feb (Dry Season)',
    bestNote: 'Clear sunny days & serene volcanic crater lake treks',
    altitude: '2,800m',
    altitudeNote: 'Highland caldera plateau',
    searchTag: 'Wenchi',
    imageUrl: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'lalibela',
    name: 'Lalibela Rock Churches',
    shortName: 'Lalibela',
    region: 'Amhara Region',
    tempC: 24,
    tempF: 75,
    condition: 'Clear & Sunny Skies',
    iconType: 'sunny',
    bestMonths: 'Oct – Mar (Festive Season)',
    bestNote: 'Optimal for exploring monolithic UNESCO rock churches',
    altitude: '2,630m',
    altitudeNote: 'Historic Lasta mountain ridge',
    searchTag: 'Lalibela',
    imageUrl: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'simien',
    name: 'Simien Mountains Peaks',
    shortName: 'Simien',
    region: 'Amhara Region',
    tempC: 14,
    tempF: 57,
    condition: 'Crisp Alpine Breeze',
    iconType: 'mild',
    bestMonths: 'Sep – Nov (Wildflower Bloom)',
    bestNote: 'Prime Gelada baboon & Walia ibex ridge trekking',
    altitude: '3,600m – 4,550m',
    altitudeNote: 'Roof of Africa escarpments',
    searchTag: 'Simien',
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'danakil',
    name: 'Danakil & Erta Ale',
    shortName: 'Danakil',
    region: 'Afar Region',
    tempC: 38,
    tempF: 100,
    condition: 'Sunny Volcanic Warmth',
    iconType: 'hot',
    bestMonths: 'Nov – Feb (Cooler Expeditions)',
    bestNote: 'Nighttime active lava lake & neon hydrothermal salt flats',
    altitude: '-125m',
    altitudeNote: 'Depression below sea level',
    searchTag: 'Danakil',
    imageUrl: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&q=80&w=800',
  },
  {
    id: 'bale',
    name: 'Bale Mountains Park',
    shortName: 'Bale',
    region: 'Oromia Region',
    tempC: 16,
    tempF: 61,
    condition: 'Cool Afro-Alpine Mist',
    iconType: 'breeze',
    bestMonths: 'Oct – Mar',
    bestNote: 'Rare Ethiopian wolf safaris & ancient Harenna cloud forest',
    altitude: '3,100m – 4,377m',
    altitudeNote: 'Sanetti alpine plateau & wild valleys',
    searchTag: 'Bale',
    imageUrl: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&q=80&w=800',
  },
];

export const DestinationWeatherWidget: React.FC = () => {
  const [selectedDest, setSelectedDest] = useState<DestinationWeather>(DESTINATION_WEATHER_DATA[0]);
  const navigate = useNavigate();

  const renderWeatherIcon = (type: DestinationWeather['iconType']) => {
    switch (type) {
      case 'sunny':
        return <Sun size={28} style={{ color: '#F59E0B' }} />;
      case 'hot':
        return <Flame size={28} style={{ color: '#EF4444' }} />;
      case 'mild':
        return <CloudSun size={28} style={{ color: '#0284C7' }} />;
      case 'breeze':
      default:
        return <Wind size={28} style={{ color: '#06B6D4' }} />;
    }
  };

  return (
    <div
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '24px',
        border: '1px solid #E2E8F0',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.06)',
        padding: '1.75rem 2rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Top Header Row with Destination Selector Pills ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
          paddingBottom: '1.25rem',
          borderBottom: '1px solid #F1F5F9',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: '12px',
              backgroundColor: 'rgba(37, 99, 235, 0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB',
            }}
          >
            <Sun size={22} style={{ color: '#F59E0B' }} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: '50%',
                  backgroundColor: '#16A34A',
                  display: 'inline-block',
                }}
              />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                Live Climate & Destination Forecast Hub
              </h3>
            </div>
            <p style={{ fontSize: '12.5px', color: '#64748B', margin: '0.15rem 0 0 0' }}>
              Real-time Ethiopian mountain conditions, seasonal guides, and expedition forecasts
            </p>
          </div>
        </div>

        {/* Destination Photo Avatars & Pills */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F8FAFC',
            padding: '0.3rem',
            borderRadius: '14px',
            border: '1px solid #E2E8F0',
            gap: '0.35rem',
            flexWrap: 'wrap',
          }}
        >
          {DESTINATION_WEATHER_DATA.map((dest) => {
            const isSelected = selectedDest.id === dest.id;
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => setSelectedDest(dest)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  padding: '0.35rem 0.75rem 0.35rem 0.4rem',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: isSelected ? 800 : 600,
                  backgroundColor: isSelected ? '#2563EB' : 'transparent',
                  color: isSelected ? '#FFFFFF' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(37, 99, 235, 0.25)' : 'none',
                }}
              >
                <img
                  src={dest.imageUrl}
                  alt={dest.shortName}
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: isSelected ? '1.5px solid #FFFFFF' : '1px solid #CBD5E1',
                  }}
                />
                <span>{dest.shortName}</span>
                <span style={{ fontSize: '11px', opacity: isSelected ? 0.9 : 0.65 }}>{dest.tempC}°</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Visual Showcase: Photo Preview + Weather Telemetry ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(280px, 340px) 1fr',
          gap: '1.75rem',
          alignItems: 'stretch',
        }}
      >
        {/* Left: Destination Photo Preview Card */}
        <div
          style={{
            position: 'relative',
            borderRadius: '18px',
            overflow: 'hidden',
            minHeight: '230px',
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
            backgroundColor: '#0F172A',
          }}
        >
          <img
            src={selectedDest.imageUrl}
            alt={selectedDest.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.4s ease',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(15, 23, 42, 0.92) 0%, rgba(15, 23, 42, 0.3) 50%, transparent 100%)',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  padding: '0.25rem 0.65rem',
                  borderRadius: '9999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                }}
              >
                <Sparkles size={11} style={{ color: '#F59E0B' }} />
                <span>Featured Expedition</span>
              </span>
              <span
                style={{
                  padding: '0.25rem 0.55rem',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(15, 23, 42, 0.75)',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#38BDF8',
                }}
              >
                {selectedDest.altitude}
              </span>
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '11.5px', color: '#93C5FD', fontWeight: 700 }}>
                <MapPin size={13} />
                <span>{selectedDest.region}</span>
              </div>
              <h4 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0.2rem 0 0 0', lineHeight: 1.25 }}>
                {selectedDest.name}
              </h4>
            </div>
          </div>
        </div>

        {/* Right: Rich Forecast Telemetry Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: '1rem' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
            }}
          >
            {/* Metric 1: Temperature */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '1.15rem 1.25rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em' }}>
                Current Temperature
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginTop: '0.35rem' }}>
                {renderWeatherIcon(selectedDest.iconType)}
                <div>
                  <span style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0F172A' }}>
                    {selectedDest.tempC}°C
                  </span>{' '}
                  <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>({selectedDest.tempF}°F)</span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: 700, marginTop: '0.25rem' }}>
                {selectedDest.condition}
              </div>
            </div>

            {/* Metric 2: Best Travel Window */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '1.15rem 1.25rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em' }}>
                Best Travel Window
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.45rem', color: '#0F172A', fontWeight: 800, fontSize: '13.5px' }}>
                <Calendar size={16} style={{ color: '#2563EB', flexShrink: 0 }} />
                <span>{selectedDest.bestMonths}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {selectedDest.bestNote}
              </div>
            </div>

            {/* Metric 3: Topography & Altitude */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                padding: '1.15rem 1.25rem',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
              }}
            >
              <div style={{ fontSize: '10.5px', textTransform: 'uppercase', color: '#64748B', fontWeight: 800, letterSpacing: '0.04em' }}>
                Elevation & Terrain
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.45rem', color: '#0F172A', fontWeight: 800, fontSize: '13.5px' }}>
                <Mountain size={16} style={{ color: '#06B6D4', flexShrink: 0 }} />
                <span>{selectedDest.altitude}</span>
              </div>
              <div style={{ fontSize: '11px', color: '#64748B', marginTop: '0.25rem', lineHeight: 1.4 }}>
                {selectedDest.altitudeNote}
              </div>
            </div>
          </div>

          {/* Bottom Row Action Bar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: '#F8FAFC',
              padding: '0.85rem 1.25rem',
              borderRadius: '14px',
              border: '1px solid #E2E8F0',
              flexWrap: 'wrap',
              gap: '0.75rem',
            }}
          >
            <div style={{ fontSize: '12px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ color: '#16A34A', fontWeight: 800 }}>✓ Local ranger guided tours available</span> in {selectedDest.shortName}
            </div>

            <button
              type="button"
              onClick={() => navigate(`/tours?search=${encodeURIComponent(selectedDest.searchTag)}`)}
              style={{
                padding: '0.65rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 800,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1D4ED8';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#2563EB';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <span>Explore {selectedDest.shortName} Tours</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

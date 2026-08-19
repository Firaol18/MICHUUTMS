import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Sun, Wind, Thermometer, Calendar } from 'lucide-react';

interface DestinationWeather {
  id: string;
  name: string;
  region: string;
  tempC: number;
  tempF: number;
  condition: string;
  icon: 'sunny' | 'mild' | 'breeze' | 'hot';
  bestMonths: string;
  altitude: string;
}

const DESTINATION_WEATHER_DATA: DestinationWeather[] = [
  {
    id: 'wenchi',
    name: 'Wenchi Crater Lake',
    region: 'Oromia Region',
    tempC: 21,
    tempF: 70,
    condition: 'Pleasant Highland Breeze',
    icon: 'breeze',
    bestMonths: 'Oct – Feb (Dry Season)',
    altitude: '2,800m',
  },
  {
    id: 'lalibela',
    name: 'Lalibela Rock Churches',
    region: 'Amhara Region',
    tempC: 24,
    tempF: 75,
    condition: 'Clear & Sunny',
    icon: 'sunny',
    bestMonths: 'Oct – Mar (Timkat Season)',
    altitude: '2,630m',
  },
  {
    id: 'simien',
    name: 'Simien Mountains Peak',
    region: 'Amhara Region',
    tempC: 14,
    tempF: 57,
    condition: 'Crisp Mountain Alpine',
    icon: 'breeze',
    bestMonths: 'Sep – Nov (Wildflower Bloom)',
    altitude: '3,600m',
  },
  {
    id: 'danakil',
    name: 'Danakil & Erta Ale',
    region: 'Afar Region',
    tempC: 38,
    tempF: 100,
    condition: 'Sunny & Volcanic Heat',
    icon: 'hot',
    bestMonths: 'Nov – Feb (Cooler Window)',
    altitude: '-125m (Below Sea Level)',
  },
  {
    id: 'bale',
    name: 'Bale Mountains Park',
    region: 'Oromia Region',
    tempC: 16,
    tempF: 61,
    condition: 'Cool & Mist Forests',
    icon: 'mild',
    bestMonths: 'Oct – Mar',
    altitude: '3,100m',
  },
];

export const DestinationWeatherWidget: React.FC = () => {
  const [selectedDest, setSelectedDest] = useState<DestinationWeather>(DESTINATION_WEATHER_DATA[0]);

  return (
    <Card
      glass
      style={{
        padding: '1.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-color)',
        background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.06) 0%, rgba(16, 185, 129, 0.08) 100%)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: 'var(--brand-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--brand-primary)' }}>
            <Sun size={20} style={{ color: '#f59e0b', margin: 'auto' }} />
          </div>
          <div>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)' }}>
              Live Climate & Weather Indicator
            </h3>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              Real-time temperature & best travel seasons across Ethiopia
            </p>
          </div>
        </div>

        {/* Destination Pills Selector */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {DESTINATION_WEATHER_DATA.map((dest) => (
            <button
              key={dest.id}
              onClick={() => setSelectedDest(dest)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '11px',
                fontWeight: selectedDest.id === dest.id ? 700 : 500,
                backgroundColor: selectedDest.id === dest.id ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: selectedDest.id === dest.id ? '#ffffff' : 'var(--text-secondary)',
                border: `1px solid ${selectedDest.id === dest.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {dest.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Weather Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          backgroundColor: 'var(--bg-secondary)',
          padding: '1.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-color)',
        }}
      >
        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            CURRENT TEMP
          </span>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.2rem' }}>
            <Thermometer size={22} style={{ color: '#ef4444' }} />
            {selectedDest.tempC}°C <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, color: 'var(--text-muted)' }}>({selectedDest.tempF}°F)</span>
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, marginTop: '0.15rem' }}>
            {selectedDest.condition}
          </div>
        </div>

        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            RECOMMENDED TRAVEL WINDOW
          </span>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
            <Calendar size={15} style={{ color: 'var(--brand-primary)' }} />
            {selectedDest.bestMonths}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Dry, sunny days & pleasant nights
          </div>
        </div>

        <div>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700 }}>
            ELEVATION / ALTITUDE
          </span>
          <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.35rem' }}>
            <Wind size={15} style={{ color: '#06b6d4' }} />
            {selectedDest.altitude}
          </div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            {selectedDest.name} ({selectedDest.region})
          </div>
        </div>
      </div>
    </Card>
  );
};

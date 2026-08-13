import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import {
  MapPin, Compass, Navigation, Hotel, Camera, Bus, Plus,
} from 'lucide-react';

export type MapPinCategory = 'destination' | 'attraction' | 'hotel' | 'pickup' | 'waypoint';

export interface LocationPin {
  id: string;
  name: string;
  category: MapPinCategory;
  dayNumber?: number;
  latitude: number;
  longitude: number;
  xPercent: number; // For SVG/Visual map positioning (0 - 100%)
  yPercent: number; // For SVG/Visual map positioning (0 - 100%)
  imageUrl?: string;
  description: string;
  travelTime?: string;
  address?: string;
}

interface InteractiveLocationMapProps {
  title?: string;
  pins?: LocationPin[];
  isEditable?: boolean;
  onAddPin?: (pin: Omit<LocationPin, 'id'>) => void;
}

const DEFAULT_PINS: LocationPin[] = [
  {
    id: 'pin-1',
    name: 'Bole International Airport (Gate 2)',
    category: 'pickup',
    dayNumber: 1,
    latitude: 8.9779,
    longitude: 38.7993,
    xPercent: 18,
    yPercent: 78,
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?auto=format&fit=crop&q=80&w=400',
    description: 'Primary international arrival pickup point & meeting lounge.',
    travelTime: 'Start Point',
    address: 'Bole Rd, Addis Ababa, Ethiopia',
  },
  {
    id: 'pin-2',
    name: 'Meskel Square Meeting Point',
    category: 'pickup',
    dayNumber: 1,
    latitude: 9.0106,
    longitude: 38.7613,
    xPercent: 28,
    yPercent: 72,
    imageUrl: 'https://images.unsplash.com/photo-1578637387939-43c525550085?auto=format&fit=crop&q=80&w=400',
    description: 'Central city group assembly point before 4x4 convoy departure.',
    travelTime: '+30 mins',
    address: 'Meskel Square, Addis Ababa',
  },
  {
    id: 'pin-3',
    name: 'Wenchi Crater Lake Rim & Viewpoint',
    category: 'destination',
    dayNumber: 1,
    latitude: 8.7905,
    longitude: 37.8992,
    xPercent: 52,
    yPercent: 52,
    imageUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400',
    description: 'Panoramic volcanic crater rim viewpoint sitting 3,386m above sea level.',
    travelTime: '2 hrs 45 mins drive',
    address: 'Ambo/Wenchi District, Oromia Region',
  },
  {
    id: 'pin-4',
    name: 'Wenchi Eco-Lodge & Lakeside Villas',
    category: 'hotel',
    dayNumber: 1,
    latitude: 8.7880,
    longitude: 37.9010,
    xPercent: 58,
    yPercent: 58,
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=400',
    description: 'Luxury eco-lodge featuring private lakeside wooden bungalows and campfire dining.',
    travelTime: 'Check-in 15:00',
    address: 'Wenchi Lake Shoreline',
  },
  {
    id: 'pin-5',
    name: 'Cherkos Monastery Island',
    category: 'attraction',
    dayNumber: 2,
    latitude: 8.7920,
    longitude: 37.9050,
    xPercent: 66,
    yPercent: 44,
    imageUrl: 'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&q=80&w=400',
    description: 'Historic 13th-century island monastery accessible via traditional wooden boat ride.',
    travelTime: '20 mins boat ride',
    address: 'Wenchi Lake Island',
  },
  {
    id: 'pin-6',
    name: 'Mineral Thermal Springs & Waterfall',
    category: 'attraction',
    dayNumber: 3,
    latitude: 8.7830,
    longitude: 37.9120,
    xPercent: 82,
    yPercent: 32,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400',
    description: 'Natural therapeutic thermal hot springs & cascading waterfall trail.',
    travelTime: '45 mins trek',
    address: 'East Wenchi Valley Trail',
  },
];

export const InteractiveLocationMap: React.FC<InteractiveLocationMapProps> = ({
  title = 'Expedition Interactive Location Map & Visual Route',
  pins = DEFAULT_PINS,
  isEditable = true,
  onAddPin,
}) => {
  const [mapPins, setMapPins] = useState<LocationPin[]>(pins);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [activePin, setActivePin] = useState<LocationPin | null>(null);

  // Add Pin Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPinName, setNewPinName] = useState('');
  const [newPinCategory, setNewPinCategory] = useState<MapPinCategory>('attraction');
  const [newPinDay, setNewPinDay] = useState(1);
  const [newPinDesc, setNewPinDesc] = useState('');
  const [newPinAddress, setNewPinAddress] = useState('');
  const newPinX = 50;
  const newPinY = 50;

  const filteredPins = mapPins.filter((p) => {
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesDay = selectedDay === 'all' || p.dayNumber === selectedDay;
    return matchesCat && matchesDay;
  });

  const getCategoryMeta = (cat: MapPinCategory) => {
    switch (cat) {
      case 'destination':
        return { icon: <Compass size={14} />, label: 'Destination', color: '#034ea2', bg: 'rgba(3,78,162,0.15)' };
      case 'attraction':
        return { icon: <Camera size={14} />, label: 'Attraction / Sight', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
      case 'hotel':
        return { icon: <Hotel size={14} />, label: 'Hotel & Eco-Lodge', color: '#10b981', bg: 'rgba(16,185,129,0.15)' };
      case 'pickup':
        return { icon: <Bus size={14} />, label: 'Pickup / Meeting Point', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
      default:
        return { icon: <MapPin size={14} />, label: 'Waypoint Stop', color: '#ec4899', bg: 'rgba(236,72,153,0.15)' };
    }
  };

  const handleCreatePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPinName.trim()) return;

    const created: LocationPin = {
      id: `pin-${Date.now()}`,
      name: newPinName,
      category: newPinCategory,
      dayNumber: newPinDay,
      latitude: 8.9 + Math.random() * 0.2,
      longitude: 38.7 + Math.random() * 0.2,
      xPercent: newPinX,
      yPercent: newPinY,
      description: newPinDesc || 'Custom itinerary location stop.',
      address: newPinAddress || 'Ethiopia Expedition Stop',
    };

    setMapPins([...mapPins, created]);
    if (onAddPin) onAddPin(created);

    setNewPinName('');
    setNewPinDesc('');
    setIsAddModalOpen(false);
  };

  return (
    <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header Bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Navigation style={{ color: 'var(--brand-primary)' }} /> {title}
          </h2>
          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
            Explore visual route waypoints, pickup locations, hotels, attractions, and meeting points
          </p>
        </div>

        {isEditable && (
          <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={() => setIsAddModalOpen(true)}>
            Add Map Pin
          </Button>
        )}
      </div>

      {/* Filter Tabs & Day Selector Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.875rem', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        
        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Map Pins' },
            { key: 'destination', label: '📍 Destinations' },
            { key: 'attraction', label: '🏛️ Sights' },
            { key: 'hotel', label: '🏨 Hotels' },
            { key: 'pickup', label: '🚐 Pickup Points' },
          ].map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setSelectedCategory(cat.key)}
              style={{
                padding: '0.3rem 0.65rem',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                backgroundColor: selectedCategory === cat.key ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                color: selectedCategory === cat.key ? '#ffffff' : 'var(--text-secondary)',
                fontSize: 11,
                fontWeight: selectedCategory === cat.key ? 700 : 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Day Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-muted)' }}>Itinerary Day:</span>
          {[
            { day: 'all', label: 'Full Route' },
            { day: 1, label: 'Day 1' },
            { day: 2, label: 'Day 2' },
            { day: 3, label: 'Day 3' },
          ].map((d) => (
            <button
              key={d.day.toString()}
              type="button"
              onClick={() => setSelectedDay(d.day as any)}
              style={{
                padding: '0.25rem 0.55rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: selectedDay === d.day ? 'var(--brand-primary-light)' : 'transparent',
                color: selectedDay === d.day ? 'var(--brand-primary)' : 'var(--text-muted)',
                fontWeight: selectedDay === d.day ? 800 : 500,
                fontSize: 11,
                cursor: 'pointer',
              }}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Interactive Vector Map Container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '420px',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          backgroundColor: '#0a192f',
          backgroundImage: 'radial-gradient(circle at 50% 50%, #112240 0%, #0a192f 100%)',
          border: '1px solid var(--border-color)',
          boxShadow: 'inset 0 0 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* SVG Topographic Grid & Route Connecting Lines */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          {/* Topographic Contour Lines */}
          <path d="M 0,100 Q 200,50 400,150 T 800,200 T 1200,100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
          <path d="M 0,250 Q 300,180 600,280 T 1200,220" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="2" />
          <path d="M 0,380 Q 400,320 800,400" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="2" />

          {/* Expedition Route Polyline Connecting Waypoints */}
          <polyline
            points={mapPins.map((p) => `${p.xPercent * 10} ${p.yPercent * 4.2}`).join(' ')}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeDasharray="6 4"
          />
        </svg>

        {/* Map Watermark & Scale Indicator */}
        <div style={{ position: 'absolute', bottom: 12, left: 16, fontSize: 10, color: 'rgba(255,255,255,0.4)', fontWeight: 700, pointerEvents: 'none' }}>
          🗺️ ETHIOPIAN HIGHLANDS EXPEDITION VECTOR ROUTE MAP
        </div>

        {/* Render Map Pins */}
        {filteredPins.map((pin) => {
          const meta = getCategoryMeta(pin.category);
          const isSelected = activePin?.id === pin.id;

          return (
            <div
              key={pin.id}
              onClick={() => setActivePin(pin)}
              style={{
                position: 'absolute',
                left: `${pin.xPercent}%`,
                top: `${pin.yPercent}%`,
                transform: 'translate(-50%, -50%)',
                cursor: 'pointer',
                zIndex: isSelected ? 30 : 10,
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            >
              {/* Pin Icon Bubble */}
              <div
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-full)',
                  backgroundColor: meta.color,
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: 11,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4), 0 0 0 3px rgba(255,255,255,0.2)',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta.icon}
                <span>{pin.name}</span>
                {pin.dayNumber && (
                  <span style={{ fontSize: 9, backgroundColor: 'rgba(0,0,0,0.25)', padding: '1px 5px', borderRadius: 'var(--radius-sm)' }}>
                    Day {pin.dayNumber}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Location Details Modal / Drawer */}
      {activePin && (
        <Modal
          isOpen={Boolean(activePin)}
          onClose={() => setActivePin(null)}
          title={`📍 ${activePin.name}`}
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>📍 {activePin.address}</span>
              <Button variant="primary" size="sm" onClick={() => setActivePin(null)}>Close</Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {activePin.imageUrl && (
              <img
                src={activePin.imageUrl}
                alt={activePin.name}
                style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
              />
            )}

            <div className="flex-between">
              <Badge variant="warning">{activePin.category.toUpperCase()}</Badge>
              {activePin.dayNumber && <Badge variant="info">Day {activePin.dayNumber} Itinerary Stop</Badge>}
            </div>

            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              {activePin.description}
            </p>

            {activePin.travelTime && (
              <div style={{ padding: '0.625rem 0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                ⏰ Est. Travel Duration: <strong>{activePin.travelTime}</strong>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Add Map Pin Modal for Admins */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Map Pin Stop"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreatePin} icon={<Plus size={14} />}>
              Save Location Pin
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreatePin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Location Name *
            </label>
            <input
              type="text"
              value={newPinName}
              onChange={(e) => setNewPinName(e.target.value)}
              placeholder="e.g. Mount Entoto Viewpoint"
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Category
              </label>
              <select
                value={newPinCategory}
                onChange={(e) => setNewPinCategory(e.target.value as MapPinCategory)}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              >
                <option value="destination">Destination</option>
                <option value="attraction">Attraction / Sight</option>
                <option value="hotel">Hotel / Eco-Lodge</option>
                <option value="pickup">Pickup / Meeting Point</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                Itinerary Day Number
              </label>
              <input
                type="number"
                min={1}
                max={14}
                value={newPinDay}
                onChange={(e) => setNewPinDay(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-primary)',
                  color: 'var(--text-primary)',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Address / Stop Location
            </label>
            <input
              type="text"
              value={newPinAddress}
              onChange={(e) => setNewPinAddress(e.target.value)}
              placeholder="e.g. Bole Rd, Addis Ababa"
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                marginBottom: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
              Description
            </label>
            <textarea
              rows={3}
              value={newPinDesc}
              onChange={(e) => setNewPinDesc(e.target.value)}
              placeholder="Describe sight highlights, meeting times, and travel notes..."
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit',
                fontSize: 'var(--font-size-xs)',
              }}
            />
          </div>
        </form>
      </Modal>

    </Card>
  );
};

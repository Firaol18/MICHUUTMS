import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import type { HotelSearchParams } from '@tms/shared/types/corporate';
import { POPULAR_DESTINATIONS } from '@tms/shared/services/mockHotelData';
import {
  Hotel,
  Plane,
  MapPin,
  Calendar,
  Users,
  Search,
  Building,
  ShieldCheck,
  Star,
  Sparkles,
  Coffee,
  Wifi,
} from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const inTwoDays = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];
const inFiveDays = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.75rem 1rem',
  borderRadius: 'var(--radius-md)',
  border: '1.5px solid var(--border-color)',
  backgroundColor: 'var(--bg-primary)',
  color: 'var(--text-primary)',
  fontSize: 'var(--font-size-sm)',
  outline: 'none',
  transition: 'border-color 0.15s ease',
  boxSizing: 'border-box',
};

const labelStyle: React.CSSProperties = {
  fontSize: 'var(--font-size-xs)',
  fontWeight: 700,
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'flex',
  alignItems: 'center',
  gap: '0.35rem',
  marginBottom: '0.4rem',
};

const POPULAR_HOTEL_CITIES = [
  { city: 'Addis Ababa', country: 'Ethiopia', price: 120, img: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&q=80&w=600' },
  { city: 'Dubai', country: 'UAE', price: 165, img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=600' },
  { city: 'Nairobi', country: 'Kenya', price: 95, img: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&q=80&w=600' },
  { city: 'Lalibela', country: 'Ethiopia', price: 85, img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&q=80&w=600' },
];

export const HotelSearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [destination, setDestination] = useState('Addis Ababa');
  const [checkIn, setCheckIn] = useState(inTwoDays);
  const [checkOut, setCheckOut] = useState(inFiveDays);
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);

  const handleSearch = () => {
    const params: HotelSearchParams = {
      destination,
      destinationCity: destination,
      checkIn,
      checkOut,
      rooms,
      guests,
    };
    const qs = new URLSearchParams({
      destination,
      destinationCity: destination,
      checkIn,
      checkOut,
      rooms: String(rooms),
      guests: String(guests),
    }).toString();
    navigate(`/hotels/results?${qs}`, { state: { params } });
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Hero Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #134e4a 0%, #064e3b 40%, #0f172a 100%)',
          padding: '4rem 1.5rem 6rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '450px',
            height: '450px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
            <button
              onClick={() => navigate('/flights')}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.06)',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 500,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <Plane size={16} /> Flights
            </button>
            <button
              onClick={() => navigate('/hotels')}
              style={{
                padding: '0.6rem 1.5rem',
                borderRadius: 'var(--radius-full)',
                border: '1.5px solid rgba(16,185,129,0.8)',
                backgroundColor: 'rgba(16,185,129,0.2)',
                color: '#34d399',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Hotel size={16} /> Hotels
            </button>
          </div>

          <h1
            style={{
              fontSize: 'clamp(1.75rem, 4vw, 2.75rem)',
              fontWeight: 900,
              color: '#fff',
              lineHeight: 1.15,
              marginBottom: '0.5rem',
              letterSpacing: '-0.03em',
            }}
          >
            Find Corporate <span style={{ color: '#34d399' }}>Hotel Stays</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-md)', marginBottom: '2.5rem' }}>
            Book partner hotels with negotiated corporate rates and instant policy verification
          </p>

          {/* ── Search Form Card ── */}
          <div
            style={{
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              padding: '1.75rem',
              boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 0.8fr 0.8fr',
                gap: '0.75rem',
                alignItems: 'end',
              }}
            >
              {/* Destination */}
              <div>
                <label style={labelStyle}><MapPin size={13} /> Destination City</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)} style={inputStyle}>
                  {POPULAR_DESTINATIONS.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Check-In */}
              <div>
                <label style={labelStyle}><Calendar size={13} /> Check-In</label>
                <input
                  type="date"
                  value={checkIn}
                  min={today}
                  onChange={(e) => setCheckIn(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Check-Out */}
              <div>
                <label style={labelStyle}><Calendar size={13} /> Check-Out</label>
                <input
                  type="date"
                  value={checkOut}
                  min={checkIn}
                  onChange={(e) => setCheckOut(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Rooms */}
              <div>
                <label style={labelStyle}><Building size={13} /> Rooms</label>
                <select value={rooms} onChange={(e) => setRooms(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <option key={r} value={r}>{r} {r === 1 ? 'Room' : 'Rooms'}</option>
                  ))}
                </select>
              </div>

              {/* Guests */}
              <div>
                <label style={labelStyle}><Users size={13} /> Guests</label>
                <select value={guests} onChange={(e) => setGuests(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 6, 8].map((g) => (
                    <option key={g} value={g}>{g} {g === 1 ? 'Guest' : 'Guests'}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Search button */}
            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                size="lg"
                icon={<Search size={18} />}
                onClick={handleSearch}
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontWeight: 800, backgroundColor: '#059669', borderColor: '#059669' }}
              >
                Search Hotel Stays
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Below Hero ── */}
      <div style={{ maxWidth: '900px', margin: '-2rem auto 0', padding: '0 1.5rem 4rem', position: 'relative', zIndex: 2 }}>
        {/* Popular Hotel Destinations */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={20} style={{ color: '#10b981' }} /> Popular Corporate Destinations
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {POPULAR_HOTEL_CITIES.map((c) => (
              <Card
                key={c.city}
                glass
                style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => {
                  setDestination(c.city);
                  const qs = new URLSearchParams({
                    destination: c.city,
                    destinationCity: c.city,
                    checkIn,
                    checkOut,
                    rooms: String(rooms),
                    guests: String(guests),
                  }).toString();
                  navigate(`/hotels/results?${qs}`);
                }}
              >
                <div style={{ height: 110, backgroundImage: `url(${c.img})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div style={{ padding: '0.85rem' }}>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{c.city}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.35rem' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{c.country}</span>
                    <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: '#059669' }}>From ${c.price}/nt</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Corporate Hotel Amenities Features */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: <ShieldCheck size={22} style={{ color: '#10b981' }} />, title: 'Pre-Approved Limits', desc: 'Auto checks night rate caps according to company tier' },
            { icon: <Wifi size={22} style={{ color: 'var(--brand-primary)' }} />, title: 'Business Ready', desc: 'High-speed fiber Wi-Fi, executive lounges, meeting halls' },
            { icon: <Coffee size={22} style={{ color: '#f59e0b' }} />, title: 'Breakfast & Transfers', desc: 'Complimentary buffet breakfast and airport shuttles' },
          ].map((item) => (
            <Card key={item.title} glass style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>{item.icon}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.2rem' }}>{item.title}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

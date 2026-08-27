import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import type { FlightSearchParams, CabinClass } from '@tms/shared/types/corporate';
import { AIRPORTS } from '@tms/shared/services/mockFlightData';
import {
  Plane,
  PlaneTakeoff,
  PlaneLanding,
  Calendar,
  Users,
  ArrowLeftRight,
  Search,
  ArrowRight,
  Hotel,
  MapPin,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

const CABIN_CLASSES: { value: CabinClass; label: string }[] = [
  { value: 'ECONOMY', label: 'Economy' },
  { value: 'PREMIUM_ECONOMY', label: 'Premium Economy' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'FIRST', label: 'First Class' },
];

const POPULAR_ROUTES = [
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'DXB', toCity: 'Dubai', price: 480 },
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'LHR', toCity: 'London', price: 620 },
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'NBO', toCity: 'Nairobi', price: 395 },
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'LLI', toCity: 'Lalibela', price: 145 },
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'BJR', toCity: 'Bahir Dar', price: 110 },
  { from: 'ADD', fromCity: 'Addis Ababa', to: 'GDQ', toCity: 'Gondar', price: 130 },
];

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

export const FlightSearchPage: React.FC = () => {
  const navigate = useNavigate();

  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ROUND_TRIP');
  const [origin, setOrigin] = useState('ADD');
  const [destination, setDestination] = useState('DXB');
  const [departureDate, setDepartureDate] = useState(nextWeek);
  const [returnDate, setReturnDate] = useState(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
  const [passengers, setPassengers] = useState(1);
  const [cabinClass, setCabinClass] = useState<CabinClass>('ECONOMY');

  const handleSwapAirports = () => {
    const tmp = origin;
    setOrigin(destination);
    setDestination(tmp);
  };

  const handleSearch = () => {
    const params: FlightSearchParams = {
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
      passengers,
      cabinClass,
    };
    const qs = new URLSearchParams({
      tripType,
      origin,
      destination,
      departureDate,
      returnDate: tripType === 'ROUND_TRIP' ? returnDate : '',
      passengers: String(passengers),
      cabinClass,
    }).toString();
    navigate(`/flights/results?${qs}`, { state: { params } });
  };

  const handleQuickRoute = (route: typeof POPULAR_ROUTES[0]) => {
    setOrigin(route.from);
    setDestination(route.to);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* ── Hero Banner ── */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #0f2444 40%, #162c50 100%)',
          padding: '4rem 1.5rem 6rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-60px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-80px',
            left: '-40px',
            width: '300px',
            height: '300px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)',
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
                border: '1.5px solid rgba(37,99,235,0.8)',
                backgroundColor: 'rgba(37,99,235,0.2)',
                color: '#60a5fa',
                fontWeight: 700,
                fontSize: 'var(--font-size-sm)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backdropFilter: 'blur(8px)',
              }}
            >
              <Plane size={16} /> Flights
            </button>
            <button
              onClick={() => navigate('/hotels')}
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
            Find Your Next <span style={{ color: '#60a5fa' }}>Flight</span>
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'var(--font-size-md)', marginBottom: '2.5rem' }}>
            Search flights across Ethiopian Airlines, Emirates, Qatar Airways & more
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
            {/* Trip type selector */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {['ROUND_TRIP', 'ONE_WAY'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTripType(type as 'ONE_WAY' | 'ROUND_TRIP')}
                  style={{
                    padding: '0.4rem 1rem',
                    borderRadius: 'var(--radius-full)',
                    border: `1.5px solid ${tripType === type ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: tripType === type ? 'var(--brand-primary-light)' : 'transparent',
                    color: tripType === type ? 'var(--brand-primary)' : 'var(--text-secondary)',
                    fontWeight: tripType === type ? 700 : 500,
                    fontSize: 'var(--font-size-xs)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {type === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
                </button>
              ))}
            </div>

            {/* Main search row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: tripType === 'ROUND_TRIP' ? '1fr 44px 1fr 1.1fr 1.1fr 0.8fr 0.9fr' : '1fr 44px 1fr 1.1fr 0.8fr 0.9fr',
                gap: '0.75rem',
                alignItems: 'end',
              }}
            >
              {/* Origin */}
              <div>
                <label style={labelStyle}><PlaneTakeoff size={13} /> From</label>
                <select value={origin} onChange={(e) => setOrigin(e.target.value)} style={inputStyle}>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                  ))}
                </select>
              </div>

              {/* Swap button */}
              <button
                onClick={handleSwapAirports}
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  border: '1.5px solid var(--border-color)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  flexShrink: 0,
                  transition: 'all 0.15s ease',
                  alignSelf: 'flex-end',
                  marginBottom: '0px',
                }}
                title="Swap airports"
              >
                <ArrowLeftRight size={16} />
              </button>

              {/* Destination */}
              <div>
                <label style={labelStyle}><PlaneLanding size={13} /> To</label>
                <select value={destination} onChange={(e) => setDestination(e.target.value)} style={inputStyle}>
                  {AIRPORTS.map((a) => (
                    <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
                  ))}
                </select>
              </div>

              {/* Departure */}
              <div>
                <label style={labelStyle}><Calendar size={13} /> Departure</label>
                <input
                  type="date"
                  value={departureDate}
                  min={today}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              {/* Return (round trip only) */}
              {tripType === 'ROUND_TRIP' && (
                <div>
                  <label style={labelStyle}><Calendar size={13} /> Return</label>
                  <input
                    type="date"
                    value={returnDate}
                    min={departureDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Passengers */}
              <div>
                <label style={labelStyle}><Users size={13} /> Passengers</label>
                <select value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} style={inputStyle}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Adult' : 'Adults'}</option>
                  ))}
                </select>
              </div>

              {/* Cabin class */}
              <div>
                <label style={labelStyle}>Cabin Class</label>
                <select value={cabinClass} onChange={(e) => setCabinClass(e.target.value as CabinClass)} style={inputStyle}>
                  {CABIN_CLASSES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
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
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', fontWeight: 800 }}
              >
                Search Flights
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Content Below Hero ── */}
      <div style={{ maxWidth: '900px', margin: '-2rem auto 0', padding: '0 1.5rem 4rem', position: 'relative', zIndex: 2 }}>
        {/* Popular Routes */}
        <div style={{ marginBottom: '3rem' }}>
          <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={20} style={{ color: 'var(--brand-primary)' }} /> Popular Routes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {POPULAR_ROUTES.map((route) => (
              <Card
                key={`${route.from}-${route.to}`}
                glass
                style={{ padding: '1.25rem', cursor: 'pointer', transition: 'all 0.15s ease' }}
                onClick={() => handleQuickRoute(route)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                      {route.fromCity} <ArrowRight size={14} style={{ display: 'inline', verticalAlign: 'middle', color: 'var(--text-muted)' }} /> {route.toCity}
                    </div>
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      {route.from} → {route.to}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>From</div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', color: 'var(--brand-primary)' }}>
                      ${route.price}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Trust Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          {[
            { icon: <ShieldCheck size={22} style={{ color: '#10b981' }} />, title: 'Policy Compliant Booking', desc: 'Automatically checks your company travel policy' },
            { icon: <Plane size={22} style={{ color: 'var(--brand-primary)' }} />, title: 'Major Airlines', desc: 'Ethiopian Airlines, Emirates, Qatar Airways & more' },
            { icon: <MapPin size={22} style={{ color: '#f59e0b' }} />, title: '50+ Destinations', desc: 'Domestic & international routes covered' },
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

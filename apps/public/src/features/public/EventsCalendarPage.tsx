import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Modal } from '@tms/shared/components/common/Modal';
import { Input } from '@tms/shared/components/common/Input';
import { useContentStore } from '@tms/shared/store/useContentStore';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { ETHIOPIAN_REGIONS, type EthiopianEvent } from '@tms/shared/services/mockEventsData';
import {
  CalendarDays,
  MapPin,
  Tag,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  Search,
  SlidersHorizontal,
  Compass,
  Sparkles,
  ExternalLink,
  Layers,
  ListOrdered,
  LayoutGrid,
  Calendar as CalendarIcon,
  Map as MapIcon,
  Shirt,
  Camera,
  Share2,
  Check,
  Ticket,
  Users,
  ShieldCheck,
  Coffee,
} from 'lucide-react';

const CATEGORY_LABELS: Record<EthiopianEvent['category'], string> = {
  religious: 'Religious',
  cultural: 'Cultural',
  nature: 'Nature',
  music: 'Music & Arts',
  food: 'Food & Drink',
  sport: 'Sport',
};

const CATEGORY_COLORS: Record<EthiopianEvent['category'], string> = {
  religious: '#7c3aed',
  cultural: '#0284c7',
  nature: '#16a34a',
  music: '#db2777',
  food: '#d97706',
  sport: '#dc2626',
};

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

type ViewMode = 'cards' | 'timeline' | 'map';

interface EventPackageOption {
  id: 'vip' | 'standard' | 'community';
  title: string;
  pricePerPerson: number;
  badge: string;
  description: string;
  features: string[];
}

const EVENT_PACKAGES: EventPackageOption[] = [
  {
    id: 'vip',
    title: '🌟 VIP Cultural Experience & Reserved Viewing',
    pricePerPerson: 180,
    badge: 'ALL-INCLUSIVE VIP',
    description: 'Reserved grandstand viewing, private 4x4 transport, VIP festival access, certified multilingual guide & traditional feast banquet.',
    features: ['Reserved Grandstand Seating', 'Private 4x4 Chauffeur', 'Traditional Multi-Course Feast', 'Commemorative Netela Scarf / Gift'],
  },
  {
    id: 'standard',
    title: '🎟️ Guided Festival Tour & Group Transport',
    pricePerPerson: 95,
    badge: 'MOST POPULAR',
    description: 'Shared convoy roundtrip transport, English-speaking certified guide, hydration, snack pack, and ceremony blessing escort.',
    features: ['Group Convoy Transport', 'Certified Cultural Guide', 'Festival Blessing Escort', 'Bottled Mineral Water & Snacks'],
  },
  {
    id: 'community',
    title: '🎫 Community Festival Day Pass & Local Ranger',
    pricePerPerson: 45,
    badge: 'COMMUNITY SUPPORT',
    description: 'Official festival entry pass, local resident scout guide, and yellow Adey Abeba / blessing grass donation token.',
    features: ['Official Festival Access Pass', 'Local Community Guide', 'Cultural Blessing Grass / Flowers'],
  },
];

export const EventsCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { events } = useContentStore();
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  // View & Filter States (Cards Grid as default view)
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EthiopianEvent['category'] | 'all'>('all');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');
  
  // Modals state
  const [activeModalEvent, setActiveModalEvent] = useState<EthiopianEvent | null>(null);
  const [bookingEvent, setBookingEvent] = useState<EthiopianEvent | null>(null);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Booking Form State
  const [selectedPackageId, setSelectedPackageId] = useState<'vip' | 'standard' | 'community'>('standard');
  const [travelersCount, setTravelersCount] = useState<number>(2);
  const [pickupPoint, setPickupPoint] = useState<string>('bole-airport');
  const [addCostumeRental, setAddCostumeRental] = useState<boolean>(false);
  const [addPhotoPermit, setAddPhotoPermit] = useState<boolean>(false);
  const [addBuffetDining, setAddBuffetDining] = useState<boolean>(true);
  const [travelerName, setTravelerName] = useState<string>('');
  const [travelerEmail, setTravelerEmail] = useState<string>('');
  const [travelerPhone, setTravelerPhone] = useState<string>('');

  // Leaflet Map Reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // All 12 Ethiopian Regional States + 2 Chartered Cities + Nationwide
  const regions = ETHIOPIAN_REGIONS;

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.region.toLowerCase().includes(q) ||
        e.description.toLowerCase().includes(q) ||
        (e.ethiopianDate && e.ethiopianDate.toLowerCase().includes(q));

      const matchesCat = selectedCategory === 'all' || e.category === selectedCategory;

      let matchesReg = selectedRegion === 'all';
      if (!matchesReg) {
        if (selectedRegion === 'Addis Ababa (Finfinnee)') {
          matchesReg =
            e.region.includes('Addis Ababa') ||
            e.region.includes('Finfinnee') ||
            e.location.includes('Finfinnee') ||
            e.region === 'Nationwide';
        } else if (selectedRegion === 'Oromia') {
          matchesReg = e.region.includes('Oromia') || e.region === 'Nationwide';
        } else {
          matchesReg = e.region === selectedRegion || e.region === 'Nationwide';
        }
      }
      
      const eventMonth = new Date(e.date).getMonth();
      const matchesMonth = selectedMonth === 'all' || eventMonth === selectedMonth;

      return matchesSearch && matchesCat && matchesReg && matchesMonth;
    });
  }, [events, searchQuery, selectedCategory, selectedRegion, selectedMonth]);

  // Sort chronologically by date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredEvents]);

  // Next Upcoming Festival Spotlight
  const upcomingFeaturedEvent = useMemo(() => {
    const featured = events.find((e) => e.isFeatured) || events[0];
    return featured;
  }, [events]);

  // Live Countdown Calculation
  const [countdown, setCountdown] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    if (!upcomingFeaturedEvent) return;

    const targetTime = new Date(upcomingFeaturedEvent.date).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetTime - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [upcomingFeaturedEvent]);

  // Map Initialization for Map View
  useEffect(() => {
    if (viewMode !== 'map' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [9.145, 38.76],
        zoom: 6,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map);

      const markersGroup = L.layerGroup().addTo(map);
      markersGroupRef.current = markersGroup;
      mapInstanceRef.current = map;
    }

    // Refresh markers
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (map && markersGroup) {
      markersGroup.clearLayers();
      const latLngs: L.LatLngExpression[] = [];

      filteredEvents.forEach((evt) => {
        const lat = evt.latitude || 9.03;
        const lng = evt.longitude || 38.74;
        latLngs.push([lat, lng]);

        const catColor = CATEGORY_COLORS[evt.category] || '#7c3aed';

        const customIcon = L.divIcon({
          className: 'festival-osm-marker',
          html: `
            <div style="
              display: flex;
              align-items: center;
              gap: 6px;
              padding: 5px 12px;
              background-color: ${catColor};
              color: #ffffff;
              font-weight: 800;
              font-size: 11px;
              border-radius: 9999px;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 12px rgba(0,0,0,0.35);
              white-space: nowrap;
              transform: translate(-50%, -50%);
              cursor: pointer;
            ">
              <span>⭐</span>
              <span>${evt.title.split('–')[0].trim()}</span>
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.on('click', () => {
          setActiveModalEvent(evt);
        });
        marker.addTo(markersGroup);
      });

      if (latLngs.length > 0) {
        map.fitBounds(L.latLngBounds(latLngs), { padding: [60, 60], maxZoom: 10 });
      }
    }
  }, [viewMode, filteredEvents]);

  // Google Calendar URL Generator
  const generateGoogleCalendarUrl = (evt: EthiopianEvent) => {
    const startDate = evt.date.replace(/-/g, '');
    const endDate = (evt.endDate || evt.date).replace(/-/g, '');
    const title = encodeURIComponent(evt.title);
    const details = encodeURIComponent(
      `${evt.description}\n\nVisitor Tip: ${evt.tipForVisitors || 'N/A'}\nDress Code: ${evt.dressCode || 'Modest traditional clothes'}\nOrganized by MICHUU Tourism System`
    );
    const location = encodeURIComponent(`${evt.location}, ${evt.region}, Ethiopia`);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;
  };

  // Open Booking Modal for an Event
  const handleOpenBooking = (evt: EthiopianEvent) => {
    setBookingEvent(evt);
    setTravelerName(user?.fullName || '');
    setTravelerEmail(user?.email || '');
    setTravelerPhone(user?.phone || '');
    setTravelersCount(2);
    setSelectedPackageId('standard');
    setBookingSuccessMsg(null);
  };

  // Calculate Event Booking Total
  const selectedPkg = EVENT_PACKAGES.find((p) => p.id === selectedPackageId) || EVENT_PACKAGES[1];
  const addonsTotalPerPerson = (addCostumeRental ? 25 : 0) + (addPhotoPermit ? 35 : 0) + (addBuffetDining ? 20 : 0);
  const totalPerGuest = selectedPkg.pricePerPerson + addonsTotalPerPerson;
  const bookingGrandTotal = totalPerGuest * travelersCount;

  // Submit Event Booking to Cart
  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingEvent) return;

    addItem({
      id: `event-${bookingEvent.id}-${Date.now()}`,
      type: 'event',
      title: `${bookingEvent.title} (${selectedPkg.title.split(' ')[0]} Pass)`,
      subtitle: `${travelersCount} Guests • ${bookingEvent.location} • ${selectedPkg.badge}`,
      imageUrl: bookingEvent.imageUrl,
      unitPrice: totalPerGuest,
      quantity: travelersCount,
      date: bookingEvent.date,
      details: {
        location: `${bookingEvent.location} (${bookingEvent.region})`,
        duration: bookingEvent.endDate ? '2 Days Festival' : '1 Day Festival',
        guideName: 'Certified Cultural Guide & Escort',
      },
    });

    setBookingSuccessMsg(`✓ Successfully added "${bookingEvent.title}" to your booking cart!`);
    setTimeout(() => {
      setBookingEvent(null);
      openCart();
    }, 900);
  };

  return (
    <div style={{ maxWidth: '1320px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      
      {/* ── 1. SPOTLIGHT HERO BANNER WITH COUNTDOWN & 1-CLICK BOOKING ── */}
      {upcomingFeaturedEvent && (
        <div
          style={{
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            marginBottom: '2.5rem',
            position: 'relative',
            backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.8) 50%, rgba(15, 23, 42, 0.4) 100%), url(${upcomingFeaturedEvent.imageUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
            padding: '3rem 2.5rem',
            color: '#ffffff',
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: '#f59e0b', color: '#000000', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                <Sparkles size={13} /> NEXT UPCOMING SPOTLIGHT FESTIVAL
              </div>

              <h1 style={{ fontSize: '2.4rem', fontWeight: 800, lineHeight: 1.2, color: '#ffffff', marginBottom: '0.75rem' }}>
                {upcomingFeaturedEvent.title}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--font-size-sm)', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CalendarDays size={16} style={{ color: '#f59e0b' }} />
                  {new Date(upcomingFeaturedEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
                {upcomingFeaturedEvent.ethiopianDate && (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(255,255,255,0.12)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontSize: '12px' }}>
                    🇪🇹 {upcomingFeaturedEvent.ethiopianDate}
                  </span>
                )}
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                  <MapPin size={16} style={{ color: '#f59e0b' }} />
                  {upcomingFeaturedEvent.location}
                </span>
              </div>

              <p style={{ fontSize: 'var(--font-size-sm)', color: 'rgba(255, 255, 255, 0.8)', lineHeight: 1.65, maxWidth: '640px', marginBottom: '1.75rem' }}>
                {upcomingFeaturedEvent.description}
              </p>

              <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap' }}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Ticket size={18} />}
                  onClick={() => handleOpenBooking(upcomingFeaturedEvent)}
                  style={{ backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800 }}
                >
                  Book Festival Pass & Guide ($95)
                </Button>

                <Button
                  variant="secondary"
                  size="lg"
                  icon={<Info size={16} />}
                  onClick={() => setActiveModalEvent(upcomingFeaturedEvent)}
                >
                  Cultural Etiquette & Tips
                </Button>
              </div>
            </div>

            {/* Live Countdown Box */}
            <div style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(12px)', padding: '2rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(255, 255, 255, 0.12)', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: '#f59e0b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.25rem' }}>
                ⏳ COUNTDOWN TO CELEBRATION
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {[
                  { num: countdown.days, label: 'DAYS' },
                  { num: countdown.hours, label: 'HOURS' },
                  { num: countdown.minutes, label: 'MINS' },
                  { num: countdown.seconds, label: 'SECS' },
                ].map((t) => (
                  <div key={t.label} style={{ backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '0.875rem 0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1 }}>{t.num}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)', marginTop: '0.35rem', fontWeight: 700 }}>{t.label}</div>
                  </div>
                ))}
              </div>

              <a
                href={generateGoogleCalendarUrl(upcomingFeaturedEvent)}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  textDecoration: 'none',
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  padding: '0.5rem 1rem',
                  borderRadius: 'var(--radius-full)',
                  transition: 'all 0.2s',
                }}
              >
                <CalendarDays size={14} style={{ color: '#f59e0b' }} /> Add to Google Calendar ↗
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. CONTROLS BAR: SEARCH, FILTERS & VIEW MODE SWITCHER ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginBottom: '2.5rem' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Ethiopian Festivals & <span className="text-gradient">Cultural Calendar</span>
            </h2>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Explore and book passes for religious holidays, thanksgiving festivals, and ceremonies across all Ethiopian regions ({filteredEvents.length} events found)
            </p>
          </div>

          {/* View Mode Switcher */}
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-secondary)', padding: '0.3rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            {[
              { mode: 'cards', label: 'Cards Grid', icon: <LayoutGrid size={15} /> },
              { mode: 'timeline', label: 'Timeline', icon: <ListOrdered size={15} /> },
              { mode: 'map', label: 'Festival Map', icon: <MapIcon size={15} /> },
            ].map((v) => (
              <button
                key={v.mode}
                onClick={() => setViewMode(v.mode as ViewMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.45rem 0.875rem',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: viewMode === v.mode ? 'var(--brand-primary)' : 'transparent',
                  color: viewMode === v.mode ? '#ffffff' : 'var(--text-secondary)',
                  fontWeight: viewMode === v.mode ? 700 : 500,
                  fontSize: 'var(--font-size-xs)',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {v.icon}
                <span>{v.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Search & Multi-Filter Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '1rem', alignItems: 'center' }}>
          <Input
            placeholder="Search events by name, ritual (e.g. Irreecha), or venue (Finfinnee, Bishoftu)..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className="tms-input-group" style={{ margin: 0 }}>
            <select
              className="tms-input"
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
            >
              <option value="all">📍 All Regions of Ethiopia (12 States & Cities)</option>
              {regions.map((reg) => (
                <option key={reg} value={reg}>
                  {reg}
                </option>
              ))}
            </select>
          </div>

          <div className="tms-input-group" style={{ margin: 0 }}>
            <select
              className="tms-input"
              value={selectedMonth.toString()}
              onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">📅 All Months (Full Year)</option>
              {MONTH_NAMES.map((m, idx) => (
                <option key={m} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['all', ...Object.keys(CATEGORY_LABELS)].map((cat) => {
            const isActive = selectedCategory === cat;
            const color = cat === 'all' ? 'var(--brand-primary)' : CATEGORY_COLORS[cat as EthiopianEvent['category']];
            const count = cat === 'all' ? events.length : events.filter((e) => e.category === cat).length;

            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat as EthiopianEvent['category'] | 'all')}
                style={{
                  padding: '0.4rem 0.9rem',
                  borderRadius: 'var(--radius-full)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#ffffff' : 'var(--text-secondary)',
                  backgroundColor: isActive ? color : 'var(--bg-secondary)',
                  border: `1px solid ${isActive ? color : 'var(--border-color)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <span>{cat === 'all' ? '🌍 All Events' : CATEGORY_LABELS[cat as EthiopianEvent['category']]}</span>
                <span style={{ fontSize: '10px', opacity: 0.8, backgroundColor: isActive ? 'rgba(0,0,0,0.2)' : 'var(--bg-tertiary)', padding: '1px 6px', borderRadius: '999px' }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 3. VIEW 1: TIMELINE VIEW ── */}
      {viewMode === 'timeline' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
          {MONTH_NAMES.map((month, monthIndex) => {
            const monthEvents = sortedEvents.filter((e) => new Date(e.date).getMonth() === monthIndex);
            if (monthEvents.length === 0) return null;

            return (
              <div key={month} style={{ display: 'flex', gap: '2rem', paddingBottom: '2.5rem' }}>
                {/* Month Label Badge */}
                <div style={{ width: '100px', flexShrink: 0, textAlign: 'right', paddingTop: '0.5rem' }}>
                  <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    {month}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {monthEvents.length} {monthEvents.length === 1 ? 'Celebration' : 'Events'}
                  </div>
                </div>

                {/* Timeline connector + event cards */}
                <div style={{ flex: 1, position: 'relative', paddingLeft: '2rem', borderLeft: '2px solid var(--border-color)' }}>
                  <div style={{ position: 'absolute', left: -7, top: 12, width: 12, height: 12, borderRadius: '50%', backgroundColor: 'var(--brand-primary)', border: '2px solid var(--bg-primary)', boxShadow: '0 0 0 4px var(--brand-primary-light)' }} />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    {monthEvents.map((evt) => (
                      <Card
                        key={evt.id}
                        glass
                        style={{
                          padding: 0,
                          overflow: 'hidden',
                          border: evt.isFeatured ? '2px solid #f59e0b' : '1px solid var(--border-color)',
                          transition: 'transform 0.2s, box-shadow 0.2s',
                        }}
                      >
                        <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', minHeight: '170px' }}>
                          <div style={{ backgroundImage: `url(${evt.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                            {evt.isFeatured && (
                              <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', backgroundColor: '#f59e0b', color: '#000000', fontSize: '10px', fontWeight: 800, padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                                ⭐ FEATURED
                              </div>
                            )}
                          </div>

                          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: CATEGORY_COLORS[evt.category], backgroundColor: `${CATEGORY_COLORS[evt.category]}18`, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                                  {CATEGORY_LABELS[evt.category]}
                                </span>

                                {evt.ethiopianDate && (
                                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                    🇪🇹 {evt.ethiopianDate}
                                  </span>
                                )}
                              </div>

                              <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                                {evt.title}
                              </h3>

                              <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '0.75rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', flexWrap: 'wrap' }}>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <CalendarDays size={13} style={{ color: 'var(--brand-primary)' }} />
                                  {new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                  {evt.endDate && ` — ${new Date(evt.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                                </span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                                  <MapPin size={13} style={{ color: 'var(--brand-primary)' }} /> {evt.location} ({evt.region})
                                </span>
                              </div>

                              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.65, margin: 0 }}>
                                {evt.description}
                              </p>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '0.75rem' }}>
                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  icon={<Ticket size={14} />}
                                  onClick={() => handleOpenBooking(evt)}
                                  style={{ backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800 }}
                                >
                                  Book Festival Pass ($95)
                                </Button>

                                <Button variant="outline" size="sm" icon={<Info size={14} />} onClick={() => setActiveModalEvent(evt)}>
                                  Guide & Tips
                                </Button>
                              </div>

                              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                <a
                                  href={generateGoogleCalendarUrl(evt)}
                                  target="_blank"
                                  rel="noreferrer"
                                  style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600, textDecoration: 'none', padding: '0.35rem 0.65rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--brand-primary-light)' }}
                                >
                                  + Google Cal
                                </a>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── 4. VIEW 2: CARDS GRID VIEW ── */}
      {viewMode === 'cards' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '1.5rem' }}>
          {sortedEvents.map((evt) => (
            <Card
              key={evt.id}
              glass
              style={{
                padding: 0,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                border: evt.isFeatured ? '2px solid #f59e0b' : '1px solid var(--border-color)',
              }}
            >
              <div style={{ height: 200, backgroundImage: `url(${evt.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', display: 'flex', gap: '0.4rem' }}>
                  <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', backgroundColor: CATEGORY_COLORS[evt.category], padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', textTransform: 'uppercase' }}>
                    {CATEGORY_LABELS[evt.category]}
                  </span>
                  {evt.isFeatured && (
                    <span style={{ fontSize: '10px', fontWeight: 800, color: '#000', backgroundColor: '#f59e0b', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)' }}>
                      ⭐ FEATURED
                    </span>
                  )}
                </div>

                {evt.ethiopianDate && (
                  <div style={{ position: 'absolute', bottom: '0.75rem', left: '0.75rem', backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', color: '#ffffff', fontSize: '11px', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-sm)' }}>
                    🇪🇹 {evt.ethiopianDate}
                  </div>
                )}
              </div>

              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                    {evt.title}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.875rem', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <CalendarDays size={13} style={{ color: 'var(--brand-primary)' }} />
                      {new Date(evt.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={13} style={{ color: 'var(--brand-primary)' }} /> {evt.location} ({evt.region})
                    </span>
                  </div>

                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                    {evt.description.slice(0, 140)}...
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', gap: '0.5rem' }}>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Ticket size={14} />}
                    onClick={() => handleOpenBooking(evt)}
                    style={{ backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800 }}
                  >
                    Book Pass ($95)
                  </Button>

                  <Button variant="ghost" size="sm" onClick={() => setActiveModalEvent(evt)}>
                    Details
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ── 5. VIEW 3: INTERACTIVE FESTIVAL MAP VIEW ── */}
      {viewMode === 'map' && (
        <Card glass style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              🗺️ Nationwide Festival Map of Ethiopia
            </h3>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Explore festival venues across Ethiopia. Click any pin to open festival details and book tickets.
            </p>
          </div>

          <div
            ref={mapContainerRef}
            style={{
              height: '520px',
              width: '100%',
              borderRadius: 'var(--radius-md)',
              overflow: 'hidden',
              border: '1px solid var(--border-color)',
            }}
          />
        </Card>
      )}

      {/* ── 7. DETAILED EVENT MODAL (CULTURAL ETIQUETTE & STORY) ── */}
      {activeModalEvent && (
        <Modal
          isOpen={Boolean(activeModalEvent)}
          onClose={() => setActiveModalEvent(null)}
          title={`🇪🇹 ${activeModalEvent.title}`}
          size="lg"
          footer={
            <div className="flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <a
                  href={generateGoogleCalendarUrl(activeModalEvent)}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    textDecoration: 'none',
                    backgroundColor: 'var(--brand-primary-light)',
                    color: 'var(--brand-primary)',
                    padding: '0.4rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <CalendarDays size={14} /> Add to Google Calendar ↗
                </a>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button
                  variant="primary"
                  size="sm"
                  icon={<Ticket size={14} />}
                  onClick={() => {
                    const evt = activeModalEvent;
                    setActiveModalEvent(null);
                    handleOpenBooking(evt);
                  }}
                  style={{ backgroundColor: '#f59e0b', color: '#000000', fontWeight: 800 }}
                >
                  Book Festival Pass ($95)
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setActiveModalEvent(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ height: 240, backgroundImage: `url(${activeModalEvent.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-md)', position: 'relative' }}>
              <div style={{ position: 'absolute', top: '1rem', left: '1rem', display: 'flex', gap: '0.5rem' }}>
                <Badge variant="warning">{CATEGORY_LABELS[activeModalEvent.category].toUpperCase()}</Badge>
                {activeModalEvent.isFeatured && <Badge variant="success">⭐ FEATURED CELEBRATION</Badge>}
              </div>

              {activeModalEvent.ethiopianDate && (
                <div style={{ position: 'absolute', bottom: '1rem', left: '1rem', backgroundColor: 'rgba(0,0,0,0.8)', color: '#fff', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-sm)', fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>
                  🇪🇹 Ethiopian Ge'ez Calendar: {activeModalEvent.ethiopianDate}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gregorian Date</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '0.2rem' }}>
                  {new Date(activeModalEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  {activeModalEvent.endDate && ` to ${new Date(activeModalEvent.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Location & Host Region</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '0.2rem' }}>
                  {activeModalEvent.location} ({activeModalEvent.region})
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                Cultural Significance & History
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {activeModalEvent.description}
              </p>
            </div>

            {activeModalEvent.dressCode && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  <Shirt size={15} style={{ color: 'var(--brand-primary)' }} />
                  Traditional Dress Code & Modesty Guidelines
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
                  {activeModalEvent.dressCode}
                </div>
              </div>
            )}

            {activeModalEvent.tipForVisitors && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                  <Camera size={15} />
                  Insider Visitor & Photography Tips
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                  {activeModalEvent.tipForVisitors}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* ── 8. DEDICATED FESTIVAL BOOKING MODAL ── */}
      {bookingEvent && (
        <Modal
          isOpen={Boolean(bookingEvent)}
          onClose={() => setBookingEvent(null)}
          title={`🎟️ Book Festival Experience: ${bookingEvent.title}`}
          size="lg"
          footer={
            <div className="flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Estimated Total:</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                  ${bookingGrandTotal.toLocaleString()} USD
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(${totalPerGuest}/guest)</span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Button variant="ghost" size="sm" onClick={() => setBookingEvent(null)}>
                  Cancel
                </Button>
                <Button variant="primary" size="md" icon={<Ticket size={16} />} onClick={handleConfirmBooking}>
                  Confirm & Add to Cart
                </Button>
              </div>
            </div>
          }
        >
          <form onSubmit={handleConfirmBooking} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {bookingSuccessMsg && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-success-light)', color: 'var(--status-success)', borderRadius: 'var(--radius-sm)', fontWeight: 700, fontSize: 'var(--font-size-xs)' }}>
                {bookingSuccessMsg}
              </div>
            )}

            {/* Event Quick Summary Banner */}
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', padding: '1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <img
                src={bookingEvent.imageUrl}
                alt={bookingEvent.title}
                style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
              />
              <div>
                <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  {bookingEvent.title}
                </h4>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem' }}>
                  <span>📅 {new Date(bookingEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>📍 {bookingEvent.location}</span>
                </div>
              </div>
            </div>

            {/* Select Experience Tier */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Festival Package Tier
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                {EVENT_PACKAGES.map((pkg) => {
                  const isSelected = selectedPackageId === pkg.id;
                  return (
                    <div
                      key={pkg.id}
                      onClick={() => setSelectedPackageId(pkg.id)}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        border: `2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                        backgroundColor: isSelected ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '9px', fontWeight: 800, padding: '2px 6px', borderRadius: 'var(--radius-full)', backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: isSelected ? '#fff' : 'var(--text-muted)' }}>
                            {pkg.badge}
                          </span>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                          {pkg.title}
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                          {pkg.description}
                        </div>
                      </div>

                      <div style={{ marginTop: '0.875rem', fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)' }}>
                        ${pkg.pricePerPerson} <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>/ guest</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Travelers count & Pickup point */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.35rem' }}>
                  Number of Guests
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setTravelersCount((c) => Math.max(1, c - 1))}
                    style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', fontWeight: 700 }}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', minWidth: 30, textAlign: 'center' }}>
                    {travelersCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelersCount((c) => c + 1)}
                    style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', cursor: 'pointer', fontWeight: 700 }}
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="tms-input-group" style={{ margin: 0 }}>
                <label className="tms-input-label">Meeting & Pickup Location</label>
                <select
                  className="tms-input"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                >
                  <option value="bole-airport">✈️ Bole International Airport (Terminal 2 VIP Gate)</option>
                  <option value="meskel-square">📍 Meskel Square Central Hub (Finfinnee)</option>
                  <option value="hotel-pickup">🏨 Hotel Pickup (In City Center)</option>
                  <option value="venue-gate">🏛️ Direct Festival Venue Gate Meeting Point</option>
                </select>
              </div>
            </div>

            {/* Cultural Add-ons */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Optional Cultural Enhancements
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                <label style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: addCostumeRental ? 'var(--brand-primary-light)' : 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                  <input
                    type="checkbox"
                    checked={addCostumeRental}
                    onChange={(e) => setAddCostumeRental(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>👗 Traditional Attire</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+$25 / guest</div>
                  </div>
                </label>

                <label style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: addPhotoPermit ? 'var(--brand-primary-light)' : 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                  <input
                    type="checkbox"
                    checked={addPhotoPermit}
                    onChange={(e) => setAddPhotoPermit(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>📸 Photo Pass & Escort</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+$35 / guest</div>
                  </div>
                </label>

                <label style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: addBuffetDining ? 'var(--brand-primary-light)' : 'var(--bg-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                  <input
                    type="checkbox"
                    checked={addBuffetDining}
                    onChange={(e) => setAddBuffetDining(e.target.checked)}
                  />
                  <div>
                    <div style={{ fontWeight: 700 }}>🍽️ Traditional Feast</div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>+$20 / guest</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Primary Guest Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
              <Input
                label="Full Name"
                placeholder="Marcus Vance"
                value={travelerName}
                onChange={(e) => setTravelerName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="marcus@example.com"
                value={travelerEmail}
                onChange={(e) => setTravelerEmail(e.target.value)}
                required
              />
              <Input
                label="Mobile Phone"
                placeholder="+251 911 000 000"
                value={travelerPhone}
                onChange={(e) => setTravelerPhone(e.target.value)}
              />
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
};

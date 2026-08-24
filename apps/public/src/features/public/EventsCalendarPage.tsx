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
import { tourismService } from '@tms/shared/services/tourismService';
import type { Booking } from '@tms/shared/types/booking';
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
  CheckCircle2,
  AlertCircle,
  Utensils,
  Car,
  Globe,
  ShoppingCart,
  ArrowRight,
  UploadCloud,
  Copy,
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

export interface EventPackageOption {
  id: 'vip' | 'standard' | 'community';
  title: string;
  pricePerPerson: number;
  badge: string;
  description: string;
  features: string[];
}

export function getEventBasePrice(evt?: EthiopianEvent | null): number {
  if (!evt) return 65;
  if (evt.price && evt.price > 0 && evt.price < 500) {
    return Math.round(evt.price);
  }
  if (evt.price && evt.price >= 500) {
    // If stored in ETB (e.g. 3000 ETB / 2500 ETB), convert to USD equivalent
    return Math.round(evt.price / 120);
  }
  const title = (evt.title || '').toLowerCase();
  if (title.includes('dallol') || title.includes('erta ale')) return 220;
  if (title.includes('hamar') || title.includes('bull jumping')) return 150;
  if (title.includes('kaffa') || title.includes('coffee')) return 95;
  if (title.includes('timkat')) return 65;
  if (title.includes('ashenda')) return 60;
  if (title.includes('meskel')) return 55;
  if (title.includes('arsedi')) return 50;
  if (title.includes('gurage')) return 50;
  if (title.includes('finfinnee')) return 45;
  if (title.includes('fichee') || title.includes('sidama')) return 45;
  if (title.includes('shawal') || title.includes('harar')) return 40;
  if (title.includes('enkutatash') || title.includes('new year')) return 40;
  if (title.includes('run') || title.includes('10k')) return 25;
  return 60;
}

export function getEventPackages(evt?: EthiopianEvent | null): EventPackageOption[] {
  const basePrice = getEventBasePrice(evt);
  const isSport = evt?.category === 'sport';

  if (isSport) {
    return [
      {
        id: 'vip',
        title: '🌟 Elite Runner VIP Hospitality & Race Kit',
        pricePerPerson: Math.round(basePrice * 2.5),
        badge: 'VIP ATHLETE',
        description: 'VIP start zone seeding, official dri-fit marathon kit, elite hospitality lounge access, and recovery massage banquet.',
        features: ['VIP Starting Pen', 'Official Running Kit & Medal', 'VIP Hospitality Lounge', 'Hotel Convoy Transfer'],
      },
      {
        id: 'standard',
        title: '🎟️ Standard Runner Entry & Official Kit',
        pricePerPerson: basePrice,
        badge: 'OFFICIAL RACE PASS',
        description: 'Official race bib registration, timing chip, commemorative race t-shirt, and finish line medal ceremony.',
        features: ['Official Race Number / Bib', 'Commemorative T-Shirt', 'Hydration & Snack Stations', 'Finish Line Medal'],
      },
      {
        id: 'community',
        title: '🎫 Spectator & Cheer Squad Grandstand Pass',
        pricePerPerson: Math.max(15, Math.round(basePrice * 0.6)),
        badge: 'CHEER SQUAD',
        description: 'Reserved finish line grandstand seating, carnival cheering accessories, and hydration voucher.',
        features: ['Reserved Finish Grandstand', 'Cheering Flags / Megaphone', 'Hydration Token'],
      },
    ];
  }

  return [
    {
      id: 'vip',
      title: '🌟 VIP Cultural Experience & Reserved Viewing',
      pricePerPerson: Math.round(basePrice * 1.8),
      badge: 'ALL-INCLUSIVE VIP',
      description: 'Reserved grandstand viewing, private 4x4 transport, VIP festival access, certified multilingual guide & traditional feast banquet.',
      features: ['Reserved Grandstand Seating', 'Private 4x4 Chauffeur', 'Traditional Multi-Course Feast', 'Commemorative Netela Scarf / Gift'],
    },
    {
      id: 'standard',
      title: '🎟️ Guided Festival Tour & Group Transport',
      pricePerPerson: basePrice,
      badge: 'MOST POPULAR',
      description: 'Shared convoy roundtrip transport, English-speaking certified guide, hydration, snack pack, and ceremony blessing escort.',
      features: ['Group Convoy Transport', 'Certified Cultural Guide', 'Festival Blessing Escort', 'Bottled Mineral Water & Snacks'],
    },
    {
      id: 'community',
      title: '🎫 Community Festival Day Pass & Local Ranger',
      pricePerPerson: Math.max(15, Math.round(basePrice * 0.45)),
      badge: 'COMMUNITY SUPPORT',
      description: 'Official festival entry pass, local resident scout guide, and yellow Adey Abeba / blessing grass donation token.',
      features: ['Official Festival Access Pass', 'Local Community Guide', 'Cultural Blessing Grass / Flowers'],
    },
  ];
}

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: '📱',
    badge: 'Instant / Birr',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '0930222784',
    instructions: 'Pay via Telebirr App or *127# to 0930222784, then upload the transaction confirmation screenshot below.',
  },
  {
    id: 'cbe_birr',
    name: 'Commercial Bank of Ethiopia (CBE / CBE Birr)',
    icon: '🏦',
    badge: 'CBE Mobile / *847#',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '1000299280164',
    instructions: 'Transfer to CBE account 1000299280164, enter the FT transaction reference code, and upload the transfer receipt screenshot.',
  },
  {
    id: 'bank_transfer',
    name: 'Awash / Dashen / BOA Bank Transfer',
    icon: '🏛️',
    badge: 'Direct Bank Wire',
    accountName: 'MICHUU TOURISM PLC',
    accountNumber: 'Awash Bank: 01320495839001 | Dashen: 504938291001',
    instructions: 'Transfer to our Awash/Dashen account, then attach a photo of your bank deposit slip or mobile screenshot.',
  },
  {
    id: 'credit_card',
    name: 'Credit / Debit Card (Visa / Mastercard)',
    icon: '💳',
    badge: 'Card Checkout',
    accountName: 'MICHUU Global Checkout',
    accountNumber: 'Encrypted 256-Bit SSL',
    instructions: 'Enter your card authorization reference or upload a screenshot of your successful transaction slip.',
  },
  {
    id: 'cash',
    name: 'Pay Cash on Arrival / Bole Office Hub',
    icon: '💵',
    badge: 'Pay in Person',
    accountName: 'MICHUU Hub — Bole Medhanialem',
    accountNumber: 'Bole Medhanialem Tower, 4th Floor',
    instructions: 'Your reservation is held. Please settle the remaining fee at our Bole hub or upon meeting your Ranger Guide.',
  },
];

export const EventsCalendarPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, fetchEvents } = useContentStore();
  const { addItem, openCart } = useCartStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);


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
  const [adultsCount, setAdultsCount] = useState<number>(2);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [travelDate, setTravelDate] = useState<string>('');
  const [pickupPoint, setPickupPoint] = useState<string>('meskel-square');
  const [addCostumeRental, setAddCostumeRental] = useState<boolean>(false);
  const [addPhotoPermit, setAddPhotoPermit] = useState<boolean>(false);
  const [addBuffetDining, setAddBuffetDining] = useState<boolean>(true);
  const [travelerName, setTravelerName] = useState<string>('');
  const [travelerEmail, setTravelerEmail] = useState<string>('');
  const [travelerPhone, setTravelerPhone] = useState<string>('');
  const [travelerNationality, setTravelerNationality] = useState<string>('Ethiopia');
  const [specialRequests, setSpecialRequests] = useState<string>('');

  // Payment Selection & Screenshot Upload State
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer' | 'credit_card' | 'cash'>('telebirr');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);

  // Live direct booking submission state
  const [isDirectSubmitting, setIsDirectSubmitting] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [confirmedDirectBooking, setConfirmedDirectBooking] = useState<Booking | null>(null);

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

  // Next Upcoming Festival Spotlight — pick nearest event whose date >= today
  const upcomingFeaturedEvent = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Sort all events ascending by date, pick first one that hasn't ended yet
    const future = [...events]
      .filter((e) => {
        const endOrStart = e.endDate ? new Date(e.endDate) : new Date(e.date);
        endOrStart.setHours(23, 59, 59, 999);
        return endOrStart >= today;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return future[0] ?? events[0];
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
    setTravelDate(evt.date);
    setTravelerName(user?.name || '');
    setTravelerEmail(user?.email || '');
    setTravelerPhone((user as any)?.phone || '');
    setTravelerNationality('Ethiopia');
    setSpecialRequests('');
    setAdultsCount(2);
    setChildrenCount(0);
    setSelectedPackageId('standard');
    setAddCostumeRental(false);
    setAddPhotoPermit(false);
    setAddBuffetDining(true);
    setBookingSuccessMsg(null);
    setBookingError(null);
    setConfirmedDirectBooking(null);
  };

  // Dynamic Package computation for current booking event
  const currentEventPackages = useMemo(() => {
    return getEventPackages(bookingEvent);
  }, [bookingEvent]);

  // Calculate Event Booking Total
  const totalTravelers = Math.max(1, adultsCount + childrenCount);
  const selectedPkg = currentEventPackages.find((p) => p.id === selectedPackageId) || currentEventPackages[1];
  const addonsTotalPerPerson = (addCostumeRental ? 25 : 0) + (addPhotoPermit ? 35 : 0) + (addBuffetDining ? 20 : 0);
  const totalPerGuest = selectedPkg.pricePerPerson + addonsTotalPerPerson;
  const bookingGrandTotal = totalPerGuest * totalTravelers;

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setBookingError('File size must be under 8MB.');
      return;
    }
    setBookingError(null);
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentReceiptUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  // Direct Live Backend Booking Submission (Same as Tour flow)
  const handleDirectBookingSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!bookingEvent) return;

    if (!travelerName.trim()) {
      setBookingError('Please enter the lead guest full name.');
      return;
    }
    if (!travelerEmail.trim()) {
      setBookingError('Please enter a valid contact email address.');
      return;
    }

    if (paymentMethod !== 'cash' && !paymentReceiptUrl && !transactionReference.trim()) {
      setBookingError('Please upload a screenshot of your payment receipt or enter the transaction reference code.');
      return;
    }

    setIsDirectSubmitting(true);
    setBookingError(null);

    try {
      const packageTitle = `${bookingEvent.title} (${selectedPkg.title.split(' ')[0]} Festival Pass)`;
      const destination = `${bookingEvent.location}, ${bookingEvent.region}`;

      const booking = await tourismService.createBooking(
        bookingEvent.id,
        {
          name: travelerName.trim(),
          email: travelerEmail.trim(),
          phone: travelerPhone.trim() || '+251 91 123 4567',
          nationality: travelerNationality.trim() || 'Ethiopia',
          specialRequests: [
            `Pickup: ${pickupPoint}`,
            addCostumeRental ? 'Traditional Attire Included' : null,
            addPhotoPermit ? 'VIP Photo Escort Pass Included' : null,
            addBuffetDining ? 'Traditional Cultural Feast Included' : null,
            specialRequests ? `Special Request: ${specialRequests}` : null,
          ].filter(Boolean).join(' • '),
        },
        travelDate || bookingEvent.date,
        totalTravelers,
        adultsCount,
        childrenCount,
        {
          title: packageTitle,
          destination: destination,
          totalPrice: bookingGrandTotal,
          status: 'confirmed',
          paymentStatus: paymentReceiptUrl || transactionReference ? 'paid' : 'paid',
          paymentMethod,
          paymentReceiptUrl,
          transactionReference,
        }
      );

      setConfirmedDirectBooking(booking);
    } catch (err: any) {
      console.error('Event booking failed:', err);
      const errMsg = err?.response?.data?.message || err?.message || 'Failed to confirm booking on the server. Please try again.';
      setBookingError(errMsg);
    } finally {
      setIsDirectSubmitting(false);
    }
  };

  // Submit Event Booking to Cart
  const handleAddToCartFromModal = (evt: EthiopianEvent) => {
    addItem({
      id: `event-${evt.id}-${selectedPackageId}-${Date.now()}`,
      type: 'event',
      title: `${evt.title} (${selectedPkg.title.split(' ')[0]} Pass)`,
      subtitle: `${totalTravelers} Guest${totalTravelers !== 1 ? 's' : ''} • ${evt.location} • ${selectedPkg.badge}`,
      imageUrl: evt.imageUrl,
      unitPrice: totalPerGuest,
      quantity: totalTravelers,
      date: travelDate || evt.date,
      details: {
        location: `${evt.location} (${evt.region})`,
        duration: evt.endDate ? '2 Days Festival' : '1 Day Festival',
        guideName: 'Certified Cultural Guide & Escort',
      },
    });

    setBookingSuccessMsg(`✓ Successfully added "${evt.title}" to your booking cart!`);
    setTimeout(() => {
      setBookingEvent(null);
      setActiveModalEvent(null);
      openCart();
    }, 600);
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '2.5rem', alignItems: 'center' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: upcomingFeaturedEvent.status === 'ongoing' ? '#16a34a' : '#f59e0b', color: upcomingFeaturedEvent.status === 'ongoing' ? '#ffffff' : '#000000', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1.25rem' }}>
                <Sparkles size={13} /> {upcomingFeaturedEvent.status === 'ongoing' ? '🟢 HAPPENING NOW' : 'NEXT UPCOMING SPOTLIGHT FESTIVAL'}
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
                  {upcomingFeaturedEvent.category === 'sport'
                    ? `Register for Event ($${getEventBasePrice(upcomingFeaturedEvent)})`
                    : `Book Festival Pass & Guide ($${getEventBasePrice(upcomingFeaturedEvent)})`}
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
                                  {evt.category === 'sport'
                                    ? `Register ($${getEventBasePrice(evt)})`
                                    : `Book Festival Pass ($${getEventBasePrice(evt)})`}
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {sortedEvents.map((evt) => {
            const basePrice = getEventBasePrice(evt);
            const hasOffer = evt.hasOffer;
            const computedOriginal = evt.originalPrice
              ? evt.originalPrice
              : evt.discountPercent
                ? Math.round(basePrice / (1 - evt.discountPercent / 100))
                : null;

            return (
              <Card
                key={evt.id}
                glass
                style={{
                  padding: 0,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease',
                  border: hasOffer
                    ? '1.5px solid rgba(239,68,68,0.4)'
                    : evt.isFeatured
                      ? '2px solid #f59e0b'
                      : '1px solid var(--border-color)',
                }}
                onClick={() => handleOpenBooking(evt)}
              >
                {/* ── Cover Image ── */}
                <div style={{ position: 'relative', height: 210, width: '100%', overflow: 'hidden' }}>
                  <img
                    src={evt.imageUrl}
                    alt={evt.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                    onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                  />

                  {/* Top-left badges */}
                  <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: '0.375rem', flexWrap: 'wrap' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 800,
                        color: '#ffffff',
                        backgroundColor: CATEGORY_COLORS[evt.category],
                        padding: '0.25rem 0.65rem',
                        borderRadius: 'var(--radius-full)',
                        textTransform: 'uppercase',
                      }}
                    >
                      {CATEGORY_LABELS[evt.category]}
                    </span>
                    {hasOffer && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#ffffff',
                          backgroundColor: '#ef4444',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Tag size={10} />
                        {evt.offerTag || (evt.discountPercent ? `${evt.discountPercent}% OFF` : 'SPECIAL OFFER')}
                      </span>
                    )}
                    {evt.isFeatured && !hasOffer && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          color: '#000',
                          backgroundColor: '#f59e0b',
                          padding: '0.25rem 0.65rem',
                          borderRadius: 'var(--radius-full)',
                        }}
                      >
                        ⭐ FEATURED
                      </span>
                    )}
                  </div>

                  {/* Ethiopian date bottom-left */}
                  {evt.ethiopianDate && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 10,
                        left: 10,
                        backgroundColor: 'rgba(0,0,0,0.7)',
                        backdropFilter: 'blur(4px)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '0.2rem 0.55rem',
                        borderRadius: 'var(--radius-sm)',
                      }}
                    >
                      🇪🇹 {evt.ethiopianDate}
                    </div>
                  )}
                </div>

                {/* ── Card Body ── */}
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem' }}>
                  {/* Location tag */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                    <MapPin size={13} />
                    <span>{evt.location}, {evt.region}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.35, margin: 0 }}>
                    {evt.title}
                  </h3>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-muted)',
                      lineHeight: 1.6,
                      margin: 0,
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {evt.description}
                  </p>

                  {/* Date & Guests row */}
                  <div
                    style={{
                      marginTop: 'auto',
                      paddingTop: '0.75rem',
                      borderTop: '1px solid var(--border-color)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                      <CalendarDays size={13} style={{ color: 'var(--text-muted)' }} />
                      <span>{new Date(evt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    {evt.endDate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)' }}>
                        <span>Multi-Day</span>
                      </div>
                    )}
                  </div>

                  {/* ── Price & CTA Row ── */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '0.5rem' }}>
                    <div>
                      <span style={{ fontSize: '10px', color: hasOffer ? '#ef4444' : 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.04em' }}>
                        {hasOffer ? 'Special Offer Price' : 'From'}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginTop: '0.125rem' }}>
                        {computedOriginal && (
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>
                            ${computedOriginal.toLocaleString()}
                          </span>
                        )}
                        <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: hasOffer ? '#16a34a' : 'var(--text-primary)' }}>
                          ${basePrice.toLocaleString()}
                        </span>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      icon={<ArrowRight size={14} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalEvent(evt);
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

      {/* ── 7. ENHANCED DETAILED EVENT MODAL (STORY, HIGHLIGHTS & BOOKING WIDGET) ── */}
      {activeModalEvent && (
        <Modal
          isOpen={Boolean(activeModalEvent)}
          onClose={() => setActiveModalEvent(null)}
          title={`🇪🇹 ${activeModalEvent.title}`}
          size="lg"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Hero Image with Floating Badges */}
            <div
              style={{
                height: 280,
                backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.75)), url(${activeModalEvent.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 'var(--radius-lg)',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '1.25rem',
                color: '#fff',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge variant="warning">{CATEGORY_LABELS[activeModalEvent.category].toUpperCase()}</Badge>
                  {activeModalEvent.isFeatured && <Badge variant="success">⭐ FEATURED CELEBRATION</Badge>}
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(8px)',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                  }}
                >
                  📍 {activeModalEvent.region}
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: '#fff', textShadow: '0 2px 4px rgba(0,0,0,0.6)' }}>
                  {activeModalEvent.title}
                </h3>
                {activeModalEvent.ethiopianDate && (
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', backgroundColor: 'rgba(0,0,0,0.6)', padding: '0.25rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontWeight: 600 }}>
                    🇪🇹 Ethiopian Ge'ez Calendar: <strong>{activeModalEvent.ethiopianDate}</strong>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Festival Pass</div>
                <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                  $45 – $180 <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>/ guest</span>
                </div>
              </div>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Gregorian Date</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '0.2rem' }}>
                  {new Date(activeModalEvent.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Host Location</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '0.2rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {activeModalEvent.location}
                </div>
              </div>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Duration</div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginTop: '0.2rem' }}>
                  {activeModalEvent.endDate ? '2-Day Festival' : 'Full Day Celebration'}
                </div>
              </div>
            </div>

            {/* Cultural Story & Significance */}
            <div>
              <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={18} style={{ color: 'var(--brand-primary)' }} /> Cultural Significance & Story
              </h4>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)', lineHeight: 1.75, margin: 0 }}>
                {activeModalEvent.description}
              </p>
            </div>

            {/* Highlights Included with Festival Booking */}
            <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={16} style={{ color: 'var(--brand-primary)' }} /> Available Experience Inclusions
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: 'var(--font-size-xs)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} style={{ color: 'var(--status-success)' }} />
                  <span>Official Festival Entry & Grandstand</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} style={{ color: 'var(--status-success)' }} />
                  <span>Certified Multilingual Cultural Guide</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} style={{ color: 'var(--status-success)' }} />
                  <span>Roundtrip Convoy / Private 4x4 Transport</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={14} style={{ color: 'var(--status-success)' }} />
                  <span>Traditional Coffee Ceremony & Blessing</span>
                </div>
              </div>
            </div>

            {/* Modesty Guidelines & Dress Code */}
            {activeModalEvent.dressCode && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                  <Shirt size={15} style={{ color: 'var(--brand-primary)' }} />
                  Traditional Dress Code & Modesty Guidelines
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {activeModalEvent.dressCode}
                </div>
              </div>
            )}

            {/* Insider Visitor & Photography Tips */}
            {activeModalEvent.tipForVisitors && (
              <div style={{ padding: '1rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(var(--brand-primary-rgb), 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', marginBottom: '0.35rem' }}>
                  <Camera size={15} />
                  Insider Visitor & Photography Tips
                </div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, lineHeight: 1.5 }}>
                  {activeModalEvent.tipForVisitors}
                </div>
              </div>
            )}

            {/* Dedicated Action Box — Styled same as Tour Detail CTA */}
            <Card
              glass
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                <div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>
                    FESTIVAL EXPERIENCE PASS
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    $45 – $180 <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 400, color: 'var(--text-muted)' }}>/ guest</span>
                  </div>
                </div>

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
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                    padding: '0.5rem 0.875rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <CalendarDays size={14} /> Add to Calendar ↗
                </a>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                <Button
                  variant="primary"
                  size="lg"
                  icon={<Ticket size={18} />}
                  onClick={() => {
                    const evt = activeModalEvent;
                    setActiveModalEvent(null);
                    handleOpenBooking(evt);
                  }}
                  style={{ width: '100%' }}
                >
                  Book Now
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  onClick={() => handleAddToCartFromModal(activeModalEvent)}
                  style={{ width: '100%' }}
                >
                  🛒 Add to Cart (Multi-Item Package)
                </Button>
              </div>

              <div className="flex-center" style={{ gap: '0.5rem', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
                <ShieldCheck size={16} style={{ color: 'var(--status-success)' }} /> Instant confirmation & 100% money-back guarantee
              </div>
            </Card>
          </div>
        </Modal>
      )}

      {/* ── 8. DEDICATED FESTIVAL BOOKING MODAL (LIVE BACKEND + CART SUPPORT) ── */}
      {bookingEvent && (
        <Modal
          isOpen={Boolean(bookingEvent)}
          onClose={() => {
            setBookingEvent(null);
            setConfirmedDirectBooking(null);
          }}
          title={
            confirmedDirectBooking
              ? '🎉 Reservation Confirmed!'
              : `🎟️ Book Festival: ${bookingEvent.title}`
          }
          size="lg"
          footer={
            confirmedDirectBooking ? (
              <div className="flex-between" style={{ width: '100%' }}>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setBookingEvent(null);
                    setConfirmedDirectBooking(null);
                  }}
                >
                  Close
                </Button>
                <Button variant="primary" size="sm" onClick={() => navigate('/my-bookings')}>
                  View My Reservations
                </Button>
              </div>
            ) : (
              <div className="flex-between" style={{ width: '100%', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Total:</span>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    ${bookingGrandTotal.toLocaleString()} USD
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>(${totalPerGuest}/guest)</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <Button variant="ghost" size="sm" onClick={() => setBookingEvent(null)}>
                    Cancel
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddToCartFromModal(bookingEvent)}
                  >
                    🛒 Add to Cart
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Ticket size={16} />}
                    onClick={handleDirectBookingSubmit}
                    isLoading={isDirectSubmitting}
                  >
                    Confirm Booking (${bookingGrandTotal.toLocaleString()})
                  </Button>
                </div>
              </div>
            )
          }
        >
          {confirmedDirectBooking ? (
            <div className="flex-center" style={{ flexDirection: 'column', gap: '1.25rem', textAlign: 'center', padding: '1rem 0' }}>
              <div
                className="flex-center"
                style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: 'var(--status-success-bg)', color: 'var(--status-success)' }}
              >
                <CheckCircle2 size={38} />
              </div>
              <div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                  Booking Reference #{confirmedDirectBooking.bookingReference}
                </h3>
                <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Thank you <strong>{confirmedDirectBooking.traveler.name}</strong>! Your festival experience for <strong>{confirmedDirectBooking.tourTitle}</strong> is officially confirmed in the live system.
                </p>
              </div>

              <Card glass style={{ width: '100%', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '0.625rem', fontSize: 'var(--font-size-sm)', padding: '1.25rem' }}>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Travel Date:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedDirectBooking.travelDate}</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Travelers:</span>
                  <span style={{ fontWeight: 700 }}>{confirmedDirectBooking.numberOfTravelers} Guests ({confirmedDirectBooking.numberOfAdults ?? adultsCount} Adults, {confirmedDirectBooking.numberOfChildren ?? childrenCount} Children)</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Total Amount:</span>
                  <span style={{ fontWeight: 800, color: 'var(--brand-primary)', fontSize: 'var(--font-size-md)' }}>${confirmedDirectBooking.totalPrice.toLocaleString()} USD</span>
                </div>
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Payment Method:</span>
                  <Badge variant="info">{(confirmedDirectBooking.paymentMethod || paymentMethod).toUpperCase()}</Badge>
                </div>
                {confirmedDirectBooking.transactionReference && (
                  <div className="flex-between">
                    <span style={{ color: 'var(--text-muted)' }}>Transaction Reference:</span>
                    <code style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>{confirmedDirectBooking.transactionReference}</code>
                  </div>
                )}
                {confirmedDirectBooking.paymentReceiptUrl && (
                  <div style={{ marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', display: 'block', marginBottom: '0.35rem' }}>
                      ✓ Attached Payment Receipt:
                    </span>
                    <img
                      src={confirmedDirectBooking.paymentReceiptUrl}
                      alt="Receipt Attachment"
                      style={{ maxHeight: 110, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}
                    />
                  </div>
                )}
                <div className="flex-between">
                  <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                  <Badge variant={confirmedDirectBooking.status === 'confirmed' ? 'success' : 'warning'}>
                    {(confirmedDirectBooking.status || 'pending').toUpperCase()}
                  </Badge>
                </div>
              </Card>
            </div>
          ) : (
            <form onSubmit={handleDirectBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {bookingError && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                  ⚠️ {bookingError}
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
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.2rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
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

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                  {currentEventPackages.map((pkg) => {
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
                          transition: 'all 0.2s ease',
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

              {/* Guests and Departure Date */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <Input
                  label="Adults"
                  type="number"
                  min={1}
                  max={20}
                  value={adultsCount}
                  onChange={(e) => setAdultsCount(Math.max(1, Number(e.target.value)))}
                  required
                />
                <Input
                  label="Children (under 12)"
                  type="number"
                  min={0}
                  max={20}
                  value={childrenCount}
                  onChange={(e) => setChildrenCount(Math.max(0, Number(e.target.value)))}
                />
                <Input
                  label="Attendance Date"
                  type="date"
                  value={travelDate}
                  onChange={(e) => setTravelDate(e.target.value)}
                  required
                />
              </div>

              {/* Meeting / Pickup Location */}
              <div className="tms-input-group" style={{ margin: 0 }}>
                <label className="tms-input-label">Meeting & Pickup Location</label>
                <select
                  className="tms-input"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                >
                  <option value="meskel-square">📍 Meskel Square Central Hub (Finfinnee)</option>
                  <option value="bole-airport">✈️ Bole International Airport (Terminal 2 VIP Gate)</option>
                  <option value="hotel-pickup">🏨 Hotel Pickup (In City Center)</option>
                  <option value="venue-gate">🏛️ Direct Festival Venue Gate Meeting Point</option>
                </select>
              </div>

              {/* Cultural Add-ons */}
              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, display: 'block', marginBottom: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Optional Cultural Enhancements
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
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
              <Input
                label="Lead Guest Full Name"
                placeholder="Marcus Vance"
                value={travelerName}
                onChange={(e) => setTravelerName(e.target.value)}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Email Address"
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
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input
                  label="Nationality / Country"
                  placeholder="Ethiopia"
                  value={travelerNationality}
                  onChange={(e) => setTravelerNationality(e.target.value)}
                  required
                />
                <Input
                  label="Special Dietary or Accessibility Requests"
                  placeholder="e.g. Vegetarian feast, wheelchair access"
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
              </div>

              {/* ── PAYMENT METHOD SELECTION ── */}
              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                  💳 Select Payment Method *
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
                  {PAYMENT_METHODS.map((pm) => {
                    const isSelected = paymentMethod === pm.id;
                    return (
                      <div
                        key={pm.id}
                        onClick={() => {
                          setPaymentMethod(pm.id as any);
                          setBookingError(null);
                        }}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--bg-secondary)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                        }}
                      >
                        <div className="flex-between">
                          <span style={{ fontSize: '1.25rem' }}>{pm.icon}</span>
                          <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: isSelected ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>
                            {pm.badge}
                          </span>
                        </div>
                        <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                          {pm.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Payment Instructions & Account Box */}
                {(() => {
                  const activePaymentOption = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];
                  return (
                    <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: 'var(--font-size-xs)' }}>
                      <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                        {activePaymentOption.instructions}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>TRANSFER ACCOUNT / TILL:</div>
                          <div style={{ fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                            {activePaymentOption.accountNumber}
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Name: {activePaymentOption.accountName}</div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          icon={copiedAccount ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                          onClick={() => handleCopyAccount(activePaymentOption.accountNumber)}
                        >
                          {copiedAccount ? 'Copied' : 'Copy'}
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Transaction Reference & Screenshot Upload */}
                {paymentMethod !== 'cash' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                    <Input
                      label="Transaction Reference / Bank Confirmation Code (e.g. FT2609...)"
                      placeholder="Enter TXN ID / Reference Code"
                      value={transactionReference}
                      onChange={(e) => setTransactionReference(e.target.value)}
                    />

                    <div>
                      <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                        📸 Upload Screenshot / Photo of Payment Receipt
                      </label>

                      <div
                        style={{
                          border: '2px dashed var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem',
                          textAlign: 'center',
                          backgroundColor: 'var(--bg-secondary)',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        <input
                          type="file"
                          accept="image/*,.pdf"
                          onChange={handleReceiptUpload}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                        />
                        {paymentReceiptUrl ? (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                            <img
                              src={paymentReceiptUrl}
                              alt="Receipt Preview"
                              style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                            />
                            <div style={{ textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                              <span style={{ fontWeight: 800, color: '#16a34a', display: 'block' }}>✓ Screenshot Attached</span>
                              <span style={{ color: 'var(--text-muted)' }}>{receiptFileName || 'payment_receipt.jpg'}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPaymentReceiptUrl('');
                                setReceiptFileName('');
                              }}
                              style={{ color: '#ef4444' }}
                            >
                              Remove
                            </Button>
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                            <UploadCloud size={24} style={{ color: 'var(--brand-primary)' }} />
                            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Click to browse or drop payment screenshot</span>
                            <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>JPEG, PNG, WebP up to 8MB</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </form>
          )}
        </Modal>
      )}

    </div>
  );
};

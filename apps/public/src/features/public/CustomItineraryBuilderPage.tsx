import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Badge } from '@tms/shared/components/common/Badge';
import { Input } from '@tms/shared/components/common/Input';
import { LoadingSpinner } from '@tms/shared/components/common/LoadingSpinner';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { useContentStore, type CustomDestinationOption } from '@tms/shared/store/useContentStore';
import { tourismService } from '@tms/shared/services/tourismService';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomItineraryBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const { customDestinations, pricingConfig, addCustomTripInquiry } = useContentStore();

  const [availableDestinations, setAvailableDestinations] = useState<CustomDestinationOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>([]);
  const [tripDays, setTripDays] = useState(5);
  const [travelersCount, setTravelersCount] = useState(2);
  const [startDate, setStartDate] = useState(new Date(Date.now() + 86400000 * 14).toISOString().split('T')[0]);
  const [accommodationTier, setAccommodationTier] = useState<'luxury' | 'standard' | 'budget'>('luxury');
  const [transportType, setTransportType] = useState<'landcruiser' | 'flight' | 'bus'>('landcruiser');

  useEffect(() => {
    const loadDestinations = async () => {
      try {
        const tours = await tourismService.getTours();
        if (tours.length > 0) {
          const mapped: CustomDestinationOption[] = tours.map((t) => ({
            id: t.id,
            name: t.destination.name || t.title,
            region: t.destination.region || 'Ethiopia',
            pricePerDay: Math.max(80, Math.round(t.pricePerPerson / (t.durationDays || 3))),
            image: t.destination.imageUrl || t.imageUrl || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
            description: t.summary || t.destination.description,
            isActive: true,
          }));

          // Deduplicate by name
          const seen = new Set<string>();
          const unique = mapped.filter((d) => {
            if (seen.has(d.name)) return false;
            seen.add(d.name);
            return true;
          });

          setAvailableDestinations(unique);
          if (unique.length > 0) {
            setSelectedDestinations([unique[0].id]);
          }
        } else {
          // Fallback to store destinations
          const active = customDestinations.filter((d) => d.isActive);
          setAvailableDestinations(active);
          if (active.length > 0) {
            setSelectedDestinations([active[0].id]);
          }
        }
      } catch {
        const active = customDestinations.filter((d) => d.isActive);
        setAvailableDestinations(active);
        if (active.length > 0) {
          setSelectedDestinations([active[0].id]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDestinations();
  }, [customDestinations]);

  const toggleDest = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // Price Calculation Engine using dynamic config from store
  const baseRatePerDay =
    selectedDestinations.reduce((sum, id) => {
      const dest = availableDestinations.find((d) => d.id === id);
      return sum + (dest?.pricePerDay || 150);
    }, 0) / (selectedDestinations.length || 1);

  const tierMultiplier =
    pricingConfig.tierMultipliers[accommodationTier] ||
    (accommodationTier === 'luxury' ? 1.4 : accommodationTier === 'standard' ? 1.0 : 0.8);

  const transportCost =
    transportType === 'landcruiser'
      ? (pricingConfig.transportRates.landcruiserPerDay || 120) * tripDays
      : transportType === 'flight'
      ? pricingConfig.transportRates.flightFixedRate || 250
      : pricingConfig.transportRates.busFixedRate || 50;

  const estimatedPerPerson = Math.round(baseRatePerDay * tripDays * tierMultiplier + transportCost / (travelersCount || 1));
  const totalCustomPrice = estimatedPerPerson * travelersCount;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      navigate('/login?mode=signin');
      return;
    }

    const destNames = selectedDestinations
      .map((id) => availableDestinations.find((d) => d.id === id)?.name)
      .filter(Boolean)
      .join(' + ');

    // Register inquiry in Content Store
    addCustomTripInquiry({
      destinations: selectedDestinations,
      destinationsNames: destNames,
      tripDays,
      travelersCount,
      startDate,
      accommodationTier,
      transportType,
      estimatedPerPerson,
      totalEstimatedPrice: totalCustomPrice,
      customerName: user?.name || 'Traveler',
      customerEmail: user?.email,
      customerPhone: (user as any)?.phone,
    });

    // Add to cart
    addItem({
      id: `custom-expedition-${Date.now()}`,
      type: 'tour',
      title: `Custom Expedition: ${destNames}`,
      subtitle: `${tripDays} Days • ${travelersCount} Guests • ${accommodationTier.toUpperCase()} Stay`,
      imageUrl: availableDestinations.find((d) => d.id === selectedDestinations[0])?.image || availableDestinations[0]?.image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
      unitPrice: estimatedPerPerson,
      quantity: travelersCount,
      date: startDate,
      details: {
        location: destNames,
        duration: `${tripDays} Days`,
      },
    });

    navigate('/tours');
  };

  if (isLoading) return <LoadingSpinner label="Loading destinations and planner..." />;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1rem' }}>
          <Sparkles size={14} /> Custom Trip Planning Wizard
        </div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Design Your Own <span className="text-gradient">Ethiopian Expedition</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Pick your destinations, accommodation tier, and transport preference for an instant custom quote!
        </p>
      </div>

      {/* Progress Steps Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '2.5rem' }}>
        {[
          { num: 1, label: 'Destinations' },
          { num: 2, label: 'Dates & Guests' },
          { num: 3, label: 'Stay & 4x4' },
          { num: 4, label: 'Instant Quote' },
        ].map((s) => (
          <button
            key={s.num}
            onClick={() => setStep(s.num as any)}
            style={{
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              border: `2px solid ${step === s.num ? 'var(--brand-primary)' : 'var(--border-color)'}`,
              backgroundColor: step === s.num ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
              color: step === s.num ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontWeight: 700,
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
            }}
          >
            <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: step === s.num ? 'var(--brand-primary)' : 'var(--border-color)', color: '#fff', fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {s.num}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      {/* ─── STEP 1: DESTINATIONS ─── */}
      {step === 1 && (
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '0.5rem' }}>
            Step 1: Select Ethiopian Destinations to Include
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Choose one or multiple destinations for your itinerary.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {availableDestinations.map((dest) => {
              const isSelected = selectedDestinations.includes(dest.id);
              return (
                <div
                  key={dest.id}
                  onClick={() => toggleDest(dest.id)}
                  style={{
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${isSelected ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    backgroundColor: 'var(--bg-secondary)',
                    position: 'relative',
                    transition: 'transform 0.2s ease',
                  }}
                >
                  <div style={{ height: 140, backgroundImage: `url(${dest.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                  <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{dest.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Est. ${dest.pricePerDay}/day ({dest.region})</div>
                    </div>
                    {isSelected && <CheckCircle2 size={20} style={{ color: 'var(--brand-primary)' }} />}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: 'right' }}>
            <Button
              variant="primary"
              size="lg"
              icon={<ArrowRight size={18} />}
              onClick={() => setStep(2)}
              disabled={selectedDestinations.length === 0}
            >
              Continue to Dates & Guests
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 2: DATES & GUESTS ─── */}
      {step === 2 && (
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Step 2: Expedition Dates & Traveler Count
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            <Input label="Departure Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            <Input label="Trip Duration (Days)" type="number" min={2} max={30} value={tripDays} onChange={(e) => setTripDays(Number(e.target.value))} required />
            <Input label="Number of Travelers" type="number" min={1} max={20} value={travelersCount} onChange={(e) => setTravelersCount(Number(e.target.value))} required />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setStep(1)}>
              ← Back
            </Button>
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={() => setStep(3)}>
              Continue to Stay & Transport
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 3: STAY & TRANSPORT ─── */}
      {step === 3 && (
        <Card glass style={{ padding: '2rem' }}>
          <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, marginBottom: '1.5rem' }}>
            Step 3: Accommodation Tier & Transport Charter
          </h3>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
              Select Accommodation Preference
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { id: 'luxury', title: '✨ Luxury Eco-Lodge', desc: 'Haile Resort, Skylight Hotel, Kuriftu Resort' },
                { id: 'standard', title: '🏨 4-Star Premium Hotel', desc: 'Modern high-comfort hotels with breakfast & amenities' },
                { id: 'budget', title: '🏕️ Cultural Guesthouse / Camp', desc: 'Authentic traditional lodges and national park safari camps' },
              ].map((tier) => (
                <div
                  key={tier.id}
                  onClick={() => setAccommodationTier(tier.id as any)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${accommodationTier === tier.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: accommodationTier === tier.id ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>{tier.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tier.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
              Select Transport Expedition Type
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              {[
                { id: 'landcruiser', title: '🚙 4x4 Toyota Land Cruiser', desc: 'Dedicated safari chauffeur, unlimited mileage & fuel' },
                { id: 'flight', title: '✈️ Domestic Flight + Airport Shuttles', desc: 'Ethiopian Airlines scheduled flights between circuits' },
                { id: 'bus', title: '🚐 Private Coaster Mini-Coach', desc: 'Spacious air-conditioned mini-coach for groups' },
              ].map((trans) => (
                <div
                  key={trans.id}
                  onClick={() => setTransportType(trans.id as any)}
                  style={{
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${transportType === trans.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: transportType === trans.id ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.25rem' }}>{trans.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{trans.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={() => setStep(4)}>
              Review Instant Quote
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 4: INSTANT QUOTE & BOOKING ─── */}
      {step === 4 && (
        <Card glass style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Badge variant="success">✨ AI-Powered Dynamic Quote Ready</Badge>
            <h3 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '0.75rem' }}>
              Your Tailor-Made Ethiopian Tour Itinerary
            </h3>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
              <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Trip Overview
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-sm)' }}>
                <div><strong>Destinations:</strong> {selectedDestinations.map((id) => availableDestinations.find((d) => d.id === id)?.name).filter(Boolean).join(', ')}</div>
                <div><strong>Departure Date:</strong> {startDate}</div>
                <div><strong>Duration:</strong> {tripDays} Days / {tripDays - 1} Nights</div>
                <div><strong>Party Size:</strong> {travelersCount} Travelers</div>
                <div><strong>Accommodation:</strong> {accommodationTier.toUpperCase()} Eco-Stay</div>
                <div><strong>Transport:</strong> {transportType.toUpperCase()} Charter</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--brand-primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h4 style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', marginBottom: '1rem', color: 'var(--brand-primary)' }}>
                  Estimated Price Breakdown
                </h4>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: 'var(--font-size-sm)' }}>
                  <span>Price per Traveler:</span>
                  <strong>${estimatedPerPerson.toLocaleString()} USD</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: 'var(--font-size-lg)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                  <span>Total Expedition:</span>
                  <strong style={{ color: 'var(--brand-primary)', fontSize: '1.4rem' }}>${totalCustomPrice.toLocaleString()} USD</strong>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  Includes certified Eco-Ranger guide, park entry permits, all breakfasts & dinners, and chosen transportation.
                </div>
              </div>

              <div style={{ marginTop: '1.5rem' }}>
                <Button variant="primary" size="lg" style={{ width: '100%' }} onClick={handleAddToCart}>
                  Book & Reserve This Custom Expedition
                </Button>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <Button variant="ghost" onClick={() => setStep(3)}>
              ← Modify Options
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

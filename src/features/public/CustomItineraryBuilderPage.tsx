import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Badge } from '@/components/common/Badge';
import { Input } from '@/components/common/Input';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useContentStore } from '@/store/useContentStore';
import {
  Compass,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CustomItineraryBuilderPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const addItem = useCartStore((state) => state.addItem);
  const { customDestinations, pricingConfig, addCustomTripInquiry } = useContentStore();

  const activeDestinations = customDestinations.filter((d) => d.isActive);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form selections
  const [selectedDestinations, setSelectedDestinations] = useState<string[]>(
    activeDestinations.slice(0, 2).map((d) => d.id)
  );
  const [tripDays, setTripDays] = useState(5);
  const [travelersCount, setTravelersCount] = useState(2);
  const [startDate, setStartDate] = useState('2026-10-15');
  const [accommodationTier, setAccommodationTier] = useState<'luxury' | 'standard' | 'budget'>('luxury');
  const [transportType, setTransportType] = useState<'landcruiser' | 'flight' | 'bus'>('landcruiser');

  const toggleDest = (id: string) => {
    setSelectedDestinations((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  // Price Calculation Engine using dynamic config from store
  const baseRatePerDay =
    selectedDestinations.reduce((sum, id) => {
      const dest = activeDestinations.find((d) => d.id === id);
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
      .map((id) => activeDestinations.find((d) => d.id === id)?.name)
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
      customerName: user?.fullName || 'Traveler',
      customerEmail: user?.email,
      customerPhone: user?.phone,
    });

    // Add to cart
    addItem({
      id: `custom-expedition-${Date.now()}`,
      type: 'tour',
      title: `Custom Expedition: ${destNames}`,
      subtitle: `${tripDays} Days • ${travelersCount} Guests • ${accommodationTier.toUpperCase()} Stay`,
      imageUrl: activeDestinations.find((d) => d.id === selectedDestinations[0])?.image || activeDestinations[0]?.image || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=400',
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem', marginBottom: '2.5rem' }}>
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
            {activeDestinations.map((dest) => {
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: '2rem' }}>
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
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { id: 'luxury', title: '✨ Luxury Eco-Lodge', desc: 'Haile Resort, Skylight Hotel, Kuriftu Resort' },
                { id: 'standard', title: '🏨 4-Star Boutique Hotel', desc: 'Comfortable hotel with breakfast & Wi-Fi' },
                { id: 'budget', title: '🏕️ Trekking / Safari Camp', desc: 'Highland tents & safari campsites' },
              ].map((acc) => (
                <button
                  key={acc.id}
                  type="button"
                  onClick={() => setAccommodationTier(acc.id as any)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${accommodationTier === acc.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: accommodationTier === acc.id ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{acc.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{acc.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.75rem' }}>
              Select Ground & Air Transport
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              {[
                { id: 'landcruiser', title: '🚘 4x4 Land Cruiser Charter', desc: 'Private English-speaking driver' },
                { id: 'flight', title: '✈️ Domestic Flight Transfers', desc: 'Ethiopian Airlines flight legs' },
                { id: 'bus', title: '🚌 Coaster Tour Bus', desc: 'Ideal for larger group tours' },
              ].map((tr) => (
                <button
                  key={tr.id}
                  type="button"
                  onClick={() => setTransportType(tr.id as any)}
                  style={{
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${transportType === tr.id ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: transportType === tr.id ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{tr.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.25rem' }}>{tr.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button variant="ghost" onClick={() => setStep(2)}>
              ← Back
            </Button>
            <Button variant="primary" size="lg" icon={<ArrowRight size={18} />} onClick={() => setStep(4)}>
              Generate Instant Quote
            </Button>
          </div>
        </Card>
      )}

      {/* ─── STEP 4: INSTANT QUOTE & CHECKOUT ─── */}
      {step === 4 && (
        <Card glass style={{ padding: '2rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <Badge variant="success">✓ CUSTOM ITINERARY READY</Badge>
            <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, marginTop: '0.5rem' }}>
              Estimated Custom Expedition Quote
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--brand-primary)', marginBottom: '0.75rem' }}>
                Summary of Selected Preferences
              </h4>
              <div style={{ fontSize: 'var(--font-size-xs)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div><strong>Destinations:</strong> {selectedDestinations.map((id) => activeDestinations.find((d) => d.id === id)?.name).join(', ')}</div>
                <div><strong>Trip Duration:</strong> {tripDays} Days ({startDate})</div>
                <div><strong>Group Size:</strong> {travelersCount} Guests</div>
                <div><strong>Accommodation:</strong> {accommodationTier.toUpperCase()} Stay</div>
                <div><strong>Transport:</strong> {transportType.toUpperCase()} Charter</div>
                <div><strong>Certified Guide:</strong> Eco-Ranger (Amharic/Oromiffa/English)</div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--brand-primary-light)', padding: '1.5rem', borderRadius: 'var(--radius-md)', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--brand-primary)', fontWeight: 700 }}>
                ESTIMATED PACKAGE TOTAL
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--brand-primary)', margin: '0.35rem 0' }}>
                ${totalCustomPrice.toLocaleString()} USD
              </div>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                (${estimatedPerPerson.toLocaleString()} per guest • Includes taxes & ranger fees)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button variant="ghost" onClick={() => setStep(3)}>
              ← Adjust Preferences
            </Button>

            <Button variant="primary" size="lg" icon={<Compass size={18} />} onClick={handleAddToCart}>
              🛒 Add Custom Expedition to Cart & Checkout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

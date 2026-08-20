import React, { useState, useEffect } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Card } from '@tms/shared/components/common/Card';
import { Modal } from '@tms/shared/components/common/Modal';
import { useContentStore, type CustomDestinationOption, type CustomTripInquiry } from '@tms/shared/store/useContentStore';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Sliders,
  Sparkles,
  DollarSign,
  MapPin,
  CheckCircle,
  Clock,
  Car,
  Plane,
  Building,
} from 'lucide-react';

export const AdminCustomTripsPage: React.FC = () => {
  const {
    customDestinations,
    addCustomDestination,
    updateCustomDestination,
    deleteCustomDestination,
    pricingConfig,
    updatePricingConfig,
    customTripInquiries,
    fetchCustomTripInquiries,
    updateInquiryStatus,
    deleteCustomTripInquiry,
  } = useContentStore();

  useEffect(() => {
    fetchCustomTripInquiries();
  }, [fetchCustomTripInquiries]);

  const [activeTab, setActiveTab] = useState<'destinations' | 'pricing' | 'inquiries'>('destinations');

  // Destination modal state
  const [isDestModalOpen, setIsDestModalOpen] = useState(false);
  const [editingDest, setEditingDest] = useState<CustomDestinationOption | null>(null);
  const [destName, setDestName] = useState('');
  const [destRegion, setDestRegion] = useState('');
  const [destPricePerDay, setDestPricePerDay] = useState(150);
  const [destImage, setDestImage] = useState('');
  const [destDescription, setDestDescription] = useState('');
  const [destIsActive, setDestIsActive] = useState(true);

  // Pricing form state
  const [luxuryMultiplier, setLuxuryMultiplier] = useState(pricingConfig.tierMultipliers.luxury);
  const [standardMultiplier, setStandardMultiplier] = useState(pricingConfig.tierMultipliers.standard);
  const [budgetMultiplier, setBudgetMultiplier] = useState(pricingConfig.tierMultipliers.budget);
  const [landcruiserRate, setLandcruiserRate] = useState(pricingConfig.transportRates.landcruiserPerDay);
  const [flightRate, setFlightRate] = useState(pricingConfig.transportRates.flightFixedRate);
  const [busRate, setBusRate] = useState(pricingConfig.transportRates.busFixedRate);
  const [pricingSaved, setPricingSaved] = useState(false);

  const openAddDestModal = () => {
    setEditingDest(null);
    setDestName('');
    setDestRegion('Amhara');
    setDestPricePerDay(160);
    setDestImage('https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800');
    setDestDescription('');
    setDestIsActive(true);
    setIsDestModalOpen(true);
  };

  const openEditDestModal = (d: CustomDestinationOption) => {
    setEditingDest(d);
    setDestName(d.name);
    setDestRegion(d.region);
    setDestPricePerDay(d.pricePerDay);
    setDestImage(d.image);
    setDestDescription(d.description || '');
    setDestIsActive(d.isActive);
    setIsDestModalOpen(true);
  };

  const handleSaveDest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!destName || destPricePerDay <= 0) return;

    if (editingDest) {
      updateCustomDestination(editingDest.id, {
        name: destName,
        region: destRegion,
        pricePerDay: Number(destPricePerDay),
        image: destImage || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        description: destDescription,
        isActive: destIsActive,
      });
    } else {
      addCustomDestination({
        name: destName,
        region: destRegion,
        pricePerDay: Number(destPricePerDay),
        image: destImage || 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800',
        description: destDescription,
        isActive: destIsActive,
      });
    }
    setIsDestModalOpen(false);
  };

  const handleDeleteDest = (id: string, name: string) => {
    if (window.confirm(`Delete destination option "${name}"?`)) {
      deleteCustomDestination(id);
    }
  };

  const handleSavePricing = (e: React.FormEvent) => {
    e.preventDefault();
    updatePricingConfig({
      tierMultipliers: {
        luxury: Number(luxuryMultiplier),
        standard: Number(standardMultiplier),
        budget: Number(budgetMultiplier),
      },
      transportRates: {
        landcruiserPerDay: Number(landcruiserRate),
        flightFixedRate: Number(flightRate),
        busFixedRate: Number(busRate),
      },
    });
    setPricingSaved(true);
    setTimeout(() => setPricingSaved(false), 3000);
  };

  const destinationColumns: Column<CustomDestinationOption>[] = [
    {
      header: 'Destination',
      minWidth: '240px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 220 }}>
          <img
            src={row.image}
            alt={row.name}
            style={{ width: 48, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{row.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.region} Region</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Base Rate / Day',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>
          ${row.pricePerDay} USD
        </span>
      ),
    },
    {
      header: 'Description',
      minWidth: '220px',
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
          {row.description || '—'}
        </div>
      ),
    },
    {
      header: 'Status in Wizard',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <Badge variant={row.isActive ? 'success' : 'neutral'}>
          {row.isActive ? 'ACTIVE' : 'HIDDEN'}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      minWidth: '100px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
          <button type="button" onClick={() => openEditDestModal(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }} title="Edit"><Edit2 size={16} /></button>
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} style={{ color: 'var(--status-danger)' }} />} onClick={() => handleDeleteDest(row.id, row.name)} />
        </div>
      ),
    },
  ];

  const inquiryColumns: Column<CustomTripInquiry>[] = [
    {
      header: 'Trip Itinerary & Destinations',
      minWidth: '260px',
      cell: (row) => (
        <div style={{ minWidth: 240 }}>
          <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>
            {row.destinationsNames}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', gap: '0.5rem', marginTop: '0.15rem' }}>
            <span>📅 {row.tripDays} Days ({row.startDate})</span>
            <span>•</span>
            <span>👥 {row.travelersCount} Guests</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Tier & Transport',
      minWidth: '140px',
      noWrap: true,
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)' }}>
          <div style={{ textTransform: 'capitalize', fontWeight: 600 }}>Stay: {row.accommodationTier}</div>
          <div style={{ color: 'var(--text-muted)', textTransform: 'capitalize' }}>Transit: {row.transportType}</div>
        </div>
      ),
    },
    {
      header: 'Total Estimate',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-sm)' }}>
          <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>${row.totalEstimatedPrice?.toLocaleString()} USD</div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>(${row.estimatedPerPerson}/guest)</div>
        </div>
      ),
    },
    {
      header: 'Customer',
      minWidth: '160px',
      noWrap: true,
      cell: (row) => (
        <div style={{ fontSize: 'var(--font-size-xs)' }}>
          <div style={{ fontWeight: 600 }}>{row.customerName || 'Online Guest'}</div>
          <div style={{ color: 'var(--text-muted)' }}>{row.customerEmail || '—'}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      minWidth: '120px',
      noWrap: true,
      cell: (row) => (
        <select
          className="tms-input"
          style={{ fontSize: '11px', padding: '0.2rem 0.5rem', height: 'auto', width: 'auto' }}
          value={row.status}
          onChange={(e) => updateInquiryStatus(row.id, e.target.value as CustomTripInquiry['status'])}
        >
          <option value="pending">PENDING</option>
          <option value="reviewing">REVIEWING</option>
          <option value="quoted">QUOTED</option>
          <option value="confirmed">CONFIRMED</option>
          <option value="cancelled">CANCELLED</option>
        </select>
      ),
    },
    {
      header: 'Actions',
      minWidth: '80px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} style={{ color: 'var(--status-danger)' }} />}
          onClick={() => {
            if (window.confirm(`Delete inquiry for "${row.customerName}"?`)) {
              deleteCustomTripInquiry(row.id);
            }
          }}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Custom Trip Builder & Pricing Management"
        description="Configure available destination options, pricing formulas, accommodation multipliers, and review customer-designed itineraries."
        actions={
          activeTab === 'destinations' ? (
            <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openAddDestModal}>
              Add Destination
            </Button>
          ) : undefined
        }
      />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
        <button
          onClick={() => setActiveTab('destinations')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'destinations' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'destinations' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'destinations' ? 700 : 500,
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <MapPin size={16} /> Destination Options ({customDestinations.length})
        </button>

        <button
          onClick={() => setActiveTab('pricing')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'pricing' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'pricing' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'pricing' ? 700 : 500,
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sliders size={16} /> Pricing & Tier Multipliers
        </button>

        <button
          onClick={() => setActiveTab('inquiries')}
          style={{
            padding: '0.65rem 1.25rem',
            border: 'none',
            borderBottom: activeTab === 'inquiries' ? '2px solid var(--brand-primary)' : '2px solid transparent',
            backgroundColor: 'transparent',
            color: activeTab === 'inquiries' ? 'var(--brand-primary)' : 'var(--text-secondary)',
            fontWeight: activeTab === 'inquiries' ? 700 : 500,
            fontSize: 'var(--font-size-sm)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Sparkles size={16} /> Custom Submissions ({customTripInquiries.length})
        </button>
      </div>

      {/* ── TAB 1: DESTINATIONS CATALOG ── */}
      {activeTab === 'destinations' && (
        <div>
          <DataTable columns={destinationColumns} data={customDestinations} keyExtractor={(item) => item.id} />
        </div>
      )}

      {/* ── TAB 2: PRICING MULTIPLIERS ── */}
      {activeTab === 'pricing' && (
        <div style={{ maxWidth: '800px' }}>
          <form onSubmit={handleSavePricing}>
            <Card glass style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Building size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Accommodation Tier Multipliers</h3>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Multipliers applied to the baseline daily rate based on customer lodge selection.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                <Input
                  label="✨ Luxury Eco-Lodge (1.4x)"
                  type="number"
                  step="0.05"
                  min={1.0}
                  max={3.0}
                  value={luxuryMultiplier}
                  onChange={(e) => setLuxuryMultiplier(Number(e.target.value))}
                  required
                />
                <Input
                  label="🏨 4-Star Boutique (1.0x)"
                  type="number"
                  step="0.05"
                  min={0.5}
                  max={2.0}
                  value={standardMultiplier}
                  onChange={(e) => setStandardMultiplier(Number(e.target.value))}
                  required
                />
                <Input
                  label="🏕️ Trekking / Safari Camp (0.8x)"
                  type="number"
                  step="0.05"
                  min={0.3}
                  max={1.5}
                  value={budgetMultiplier}
                  onChange={(e) => setBudgetMultiplier(Number(e.target.value))}
                  required
                />
              </div>
            </Card>

            <Card glass style={{ padding: '2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <Car size={18} style={{ color: 'var(--brand-primary)' }} />
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Transport & Fleet Charter Rates (USD)</h3>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                Vehicles and logistics pricing added across the expedition group.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }}>
                <Input
                  label="🚘 4x4 Land Cruiser ($/day)"
                  type="number"
                  min={0}
                  value={landcruiserRate}
                  onChange={(e) => setLandcruiserRate(Number(e.target.value))}
                  required
                />
                <Input
                  label="✈️ Domestic Flight Legs ($ fixed)"
                  type="number"
                  min={0}
                  value={flightRate}
                  onChange={(e) => setFlightRate(Number(e.target.value))}
                  required
                />
                <Input
                  label="🚌 Coaster Bus ($ fixed)"
                  type="number"
                  min={0}
                  value={busRate}
                  onChange={(e) => setBusRate(Number(e.target.value))}
                  required
                />
              </div>
            </Card>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <Button variant="primary" size="lg" type="submit">
                Save Pricing Formula Settings
              </Button>
              {pricingSaved && (
                <span style={{ color: 'var(--status-success)', fontSize: 'var(--font-size-sm)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <CheckCircle size={16} /> Saved successfully! Public builder updated.
                </span>
              )}
            </div>
          </form>
        </div>
      )}

      {/* ── TAB 3: CUSTOM INQUIRIES & SUBMISSIONS ── */}
      {activeTab === 'inquiries' && (
        <div>
          <DataTable columns={inquiryColumns} data={customTripInquiries} keyExtractor={(item) => item.id} />
        </div>
      )}

      {/* Add / Edit Destination Modal */}
      <Modal
        isOpen={isDestModalOpen}
        onClose={() => setIsDestModalOpen(false)}
        title={editingDest ? `Edit Destination: ${editingDest.name}` : 'Add New Custom Trip Destination'}
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsDestModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveDest}>
              {editingDest ? 'Save Destination' : 'Add to Builder'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSaveDest} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Destination Name"
            placeholder="e.g. Wenchi Crater Lake"
            value={destName}
            onChange={(e) => setDestName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Region / State"
              placeholder="e.g. Oromia, Amhara, Afar"
              value={destRegion}
              onChange={(e) => setDestRegion(e.target.value)}
              required
            />
            <Input
              label="Estimated Base Rate ($ USD / Day)"
              type="number"
              min={10}
              max={2000}
              value={destPricePerDay}
              onChange={(e) => setDestPricePerDay(Number(e.target.value))}
              required
            />
          </div>

          <Input
            label="Image URL"
            value={destImage}
            onChange={(e) => setDestImage(e.target.value)}
            required
          />

          <div className="tms-input-group">
            <label className="tms-input-label">Short Highlight / Description</label>
            <textarea
              className="tms-input"
              rows={3}
              placeholder="Key attractions, activities, and scenery..."
              value={destDescription}
              onChange={(e) => setDestDescription(e.target.value)}
            />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            <input
              type="checkbox"
              checked={destIsActive}
              onChange={(e) => setDestIsActive(e.target.checked)}
            />
            Enable and show destination on Public Custom Trip Builder
          </label>
        </form>
      </Modal>
    </div>
  );
};

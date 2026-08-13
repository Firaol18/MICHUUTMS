import React, { useState } from 'react';
import { Modal } from '@/components/common/Modal';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import {
  UserCheck, Compass, Bus, Printer, Search, CheckCircle2, AlertTriangle, Check,
} from 'lucide-react';

export interface ManifestGuest {
  id: string;
  index: number;
  name: string;
  country: string;
  countryCode: string;
  flag: string;
  passportNumber: string;
  email: string;
  phone: string;
  emergencyContact: string;
  specialRequests?: string;
  roomAssignment?: string;
  pickupLocation: string;
  isCheckedIn: boolean;
}

interface TourManifestModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourTitle?: string;
  dateRange?: string;
  tourLeader?: string;
  guideName?: string;
  driverName?: string;
  vehicleInfo?: string;
  guests?: ManifestGuest[];
}

const DEFAULT_GUESTS: ManifestGuest[] = [
  {
    id: 'g-1',
    index: 1,
    name: 'John Smith',
    country: 'United States',
    countryCode: 'USA',
    flag: '🇺🇸',
    passportNumber: 'US-9918230',
    email: 'john.smith@example.com',
    phone: '+1 202-555-0143',
    emergencyContact: 'Mary Smith (+1 202-555-0199)',
    specialRequests: 'Vegetarian meal plan required',
    roomAssignment: 'Villa 101 — Wenchi Eco-Lodge',
    pickupLocation: 'Bole International Airport (Gate 2)',
    isCheckedIn: true,
  },
  {
    id: 'g-2',
    index: 2,
    name: 'Sarah Jones',
    country: 'United Kingdom',
    countryCode: 'UK',
    flag: '🇬🇧',
    passportNumber: 'UK-4820194',
    email: 'sarah.j@example.co.uk',
    phone: '+44 20 7946 0912',
    emergencyContact: 'Peter Jones (+44 20 7946 0888)',
    specialRequests: 'Gluten-free diet',
    roomAssignment: 'Villa 102 — Wenchi Eco-Lodge',
    pickupLocation: 'Hilton Hotel Addis Ababa',
    isCheckedIn: true,
  },
  {
    id: 'g-3',
    index: 3,
    name: 'David Brown',
    country: 'Germany',
    countryCode: 'GERMANY',
    flag: '🇩🇪',
    passportNumber: 'DE-8830129',
    email: 'david.brown@example.de',
    phone: '+49 30 1234567',
    emergencyContact: 'Helga Brown (+49 30 7654321)',
    specialRequests: 'Photographer — requires front seat',
    roomAssignment: 'Villa 103 — Wenchi Eco-Lodge',
    pickupLocation: 'Sheraton Addis Luxury Collection',
    isCheckedIn: true,
  },
  {
    id: 'g-4',
    index: 4,
    name: 'Eleanor Vance',
    country: 'United States',
    countryCode: 'USA',
    flag: '🇺🇸',
    passportNumber: 'US-4401928',
    email: 'eleanor.vance@example.com',
    phone: '+1 415-555-2671',
    emergencyContact: 'Arthur Vance (+1 415-555-9011)',
    specialRequests: 'Prefers quiet room near garden',
    roomAssignment: 'Villa 104 — Wenchi Eco-Lodge',
    pickupLocation: 'Skylight Hotel Addis Ababa',
    isCheckedIn: true,
  },
  {
    id: 'g-5',
    index: 5,
    name: 'Sophia Rossi',
    country: 'Italy',
    countryCode: 'ITALY',
    flag: '🇮🇹',
    passportNumber: 'IT-5509218',
    email: 'sophia.r@example.it',
    phone: '+39 06 6987654',
    emergencyContact: 'Marco Rossi (+39 06 1234567)',
    specialRequests: 'No special requests',
    roomAssignment: 'Villa 105 — Wenchi Eco-Lodge',
    pickupLocation: 'Bole International Airport (Gate 2)',
    isCheckedIn: false,
  },
  {
    id: 'g-6',
    index: 6,
    name: 'Mohammed Ahmed',
    country: 'United Arab Emirates',
    countryCode: 'UAE',
    flag: '🇦🇪',
    passportNumber: 'AE-3392019',
    email: 'm.ahmed@example.ae',
    phone: '+971 4 321 4321',
    emergencyContact: 'Fatima Ahmed (+971 4 987 6543)',
    specialRequests: 'Halal gourmet catering',
    roomAssignment: 'Villa 106 — Wenchi Eco-Lodge',
    pickupLocation: 'Radisson Blu Hotel Addis Ababa',
    isCheckedIn: true,
  },
  {
    id: 'g-7',
    index: 7,
    name: 'Tigist Haile',
    country: 'Ethiopia',
    countryCode: 'ETHIOPIA',
    flag: '🇪🇹',
    passportNumber: 'ET-1029384',
    email: 'tigist.h@example.et',
    phone: '+251 911 223 344',
    emergencyContact: 'Haile Selassie (+251 911 556 677)',
    specialRequests: 'Local guide liaison',
    roomAssignment: 'Villa 107 — Wenchi Eco-Lodge',
    pickupLocation: 'Meskel Square Meeting Point',
    isCheckedIn: true,
  },
];

export const TourManifestModal: React.FC<TourManifestModalProps> = ({
  isOpen,
  onClose,
  tourTitle = 'Historic Ethiopia & Wenchi Crater Expedition',
  dateRange = 'Aug 20 – 27, 2026',
  tourLeader = 'Abebe Bekele (Senior Ranger)',
  guideName = 'Mohammed Ahmed',
  driverName = 'Tesfaye Tadesse',
  vehicleInfo = 'Toyota Land Cruiser 4x4 (#ET-3902)',
  guests = DEFAULT_GUESTS,
}) => {
  const [manifestGuests, setManifestGuests] = useState<ManifestGuest[]>(guests);
  const [searchQuery, setSearchQuery] = useState('');

  const toggleCheckIn = (id: string) => {
    setManifestGuests((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isCheckedIn: !g.isCheckedIn } : g))
    );
  };

  const checkedInCount = manifestGuests.filter((g) => g.isCheckedIn).length;

  const filteredGuests = manifestGuests.filter(
    (g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      g.passportNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📋 Tour Operational Passenger Manifest`}
      footer={
        <div className="flex-between" style={{ width: '100%' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-muted)' }}>
            Boarded Check-In Progress: <span style={{ color: 'var(--status-success)' }}>{checkedInCount} of {manifestGuests.length} Guests</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={handlePrint} icon={<Printer size={14} />}>
              Print Manifest
            </Button>
            <Button variant="primary" size="sm" onClick={onClose} icon={<CheckCircle2 size={14} />}>
              Done & Close
            </Button>
          </div>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        
        {/* Expedition Header Banner */}
        <Card glass style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', borderLeft: '4px solid var(--brand-primary)' }}>
          <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                EXPEDITION OPERATIONAL MANIFEST
              </div>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 900, color: 'var(--text-primary)', margin: '0.15rem 0' }}>
                {tourTitle}
              </h2>
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                📅 Schedule: <strong>{dateRange}</strong>
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <Badge variant="success" style={{ fontSize: 'var(--font-size-sm)', padding: '0.4rem 0.875rem' }}>
                👥 Total Guests: {manifestGuests.length}
              </Badge>
            </div>
          </div>

          {/* Assigned Personnel Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.875rem', marginTop: '1rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(37,99,235,0.12)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <UserCheck size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Tour Leader</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)' }}>{tourLeader}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(16,185,129,0.12)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Compass size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Licensed Guide</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)' }}>{guideName}</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
              <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(245,158,11,0.12)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={18} />
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Fleet Driver & 4x4 Vehicle</div>
                <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)' }}>{driverName}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{vehicleInfo}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filter Search Bar */}
        <div style={{ position: 'relative', width: '100%' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter manifest by guest name, nationality, or passport number..."
            style={{
              width: '100%',
              padding: '0.5rem 0.875rem 0.5rem 2.25rem',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: 'var(--font-size-xs)',
              outline: 'none',
            }}
          />
        </div>

        {/* Guest Manifest Table matching user prompt format */}
        <Card glass style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-tertiary)', borderBottom: '2px solid var(--border-color)' }}>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800, width: 45 }}>#</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800 }}>GUEST NAME</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800 }}>NATIONALITY</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800 }}>PASSPORT / ID</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800 }}>SPECIAL REQUESTS / DIET</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'left', fontWeight: 800 }}>ROOM & PICKUP</th>
                <th style={{ padding: '0.75rem 0.875rem', textAlign: 'center', fontWeight: 800, width: 130 }}>BOARDED</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr
                  key={guest.id}
                  style={{
                    borderBottom: '1px solid var(--border-color)',
                    backgroundColor: guest.isCheckedIn ? 'transparent' : 'rgba(239, 68, 68, 0.04)',
                  }}
                >
                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 800, color: 'var(--text-muted)' }}>
                    {guest.index}.
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}>
                      {guest.name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      {guest.email} · {guest.phone}
                    </div>
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem', fontWeight: 700 }}>
                    <span style={{ fontSize: '1rem', marginRight: 4 }}>{guest.flag}</span>
                    <span>{guest.country}</span>
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem', fontFamily: 'monospace', color: 'var(--brand-primary)', fontWeight: 700 }}>
                    {guest.passportNumber}
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem', color: 'var(--text-secondary)' }}>
                    {guest.specialRequests ? (
                      <span style={{ color: '#b45309', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <AlertTriangle size={12} /> {guest.specialRequests}
                      </span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>—</span>
                    )}
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem', fontSize: 11 }}>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{guest.roomAssignment}</div>
                    <div style={{ color: 'var(--text-muted)', marginTop: 2 }}>📍 {guest.pickupLocation}</div>
                  </td>

                  <td style={{ padding: '0.75rem 0.875rem', textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => toggleCheckIn(guest.id)}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: 'var(--radius-full)',
                        border: 'none',
                        backgroundColor: guest.isCheckedIn ? 'rgba(22,163,74,0.12)' : 'var(--bg-tertiary)',
                        color: guest.isCheckedIn ? '#16a34a' : 'var(--text-muted)',
                        fontSize: 11,
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        transition: 'all 0.15s ease',
                      }}
                    >
                      {guest.isCheckedIn ? <><Check size={12} /> Boarded</> : 'Not Checked-In'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

      </div>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Badge } from '@tms/shared/components/common/Badge';
import { Bus, Plus, Search, Edit2, Trash2, Calendar, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';

export interface DriverScheduleItem {
  date: string;
  time: string;
  route: string;
}

export interface DriverItem {
  id: string;
  name: string;
  licenseNumber: string;
  licenseExpiry: string;
  licenseCategory: string;
  assignedVehicle: string;
  phone: string;
  email: string;
  experienceYears: number;
  dailyRate: number;
  availability: 'Available' | 'On Trip' | 'Off Duty';
  status: 'Active' | 'In Maintenance Duty' | 'Inactive';
  schedule: DriverScheduleItem[];
}

const INITIAL_DRIVERS: DriverItem[] = [
  {
    id: 'drv-1',
    name: 'Tesfaye Tadesse',
    licenseNumber: 'ETH-DRV-99182',
    licenseExpiry: '2028-11-30',
    licenseCategory: 'Heavy Commercial Commercial Grade A',
    assignedVehicle: 'Toyota Land Cruiser V8 4x4 (#ET-3902)',
    phone: '+251 911 334 455',
    email: 'tesfaye.t@michuutours.et',
    experienceYears: 12,
    dailyRate: 50,
    availability: 'On Trip',
    status: 'Active',
    schedule: [
      { date: 'Aug 20', time: '08:00', route: 'Airport → Hotel Check-in' },
      { date: 'Aug 21', time: '09:00', route: 'Hotel → Lalibela Rock Churches' },
      { date: 'Aug 22', time: '07:30', route: 'Lalibela → Gonder Castles Transfer' },
    ],
  },
  {
    id: 'drv-2',
    name: 'Kassahun Worku',
    licenseNumber: 'ETH-DRV-88201',
    licenseExpiry: '2027-09-15',
    licenseCategory: 'Passenger Bus Commercial Grade B',
    assignedVehicle: 'Toyota Coaster Executive Bus (#ET-8812)',
    phone: '+251 912 667 788',
    email: 'kassahun.w@michuutours.et',
    experienceYears: 9,
    dailyRate: 45,
    availability: 'Available',
    status: 'Active',
    schedule: [
      { date: 'Aug 24', time: '08:30', route: 'Addis HQ → Wenchi Crater Lake' },
      { date: 'Aug 25', time: '16:00', route: 'Wenchi → Addis Return Transfer' },
    ],
  },
  {
    id: 'drv-3',
    name: 'Girma Alemayehu',
    licenseNumber: 'ETH-DRV-44192',
    licenseExpiry: '2029-04-20',
    licenseCategory: 'Heavy All-Terrain 4x4 Certified',
    assignedVehicle: 'Nissan Patrol Super Safari (#ET-1029)',
    phone: '+251 918 223 311',
    email: 'girma.a@michuutours.et',
    experienceYears: 15,
    dailyRate: 60,
    availability: 'Available',
    status: 'Active',
    schedule: [
      { date: 'Aug 28', time: '06:00', route: 'Semera → Danakil Erta Ale Expedition Base' },
    ],
  },
  {
    id: 'drv-4',
    name: 'Yared Mamo',
    licenseNumber: 'ETH-DRV-11029',
    licenseExpiry: '2026-12-10',
    licenseCategory: 'Light Commercial VIP Minivan',
    assignedVehicle: 'Ford Transit Expedition Custom (#ET-4402)',
    phone: '+251 911 990 011',
    email: 'yared.m@michuutours.et',
    experienceYears: 7,
    dailyRate: 40,
    availability: 'Off Duty',
    status: 'Active',
    schedule: [],
  },
  {
    id: 'drv-5',
    name: 'Berhanu Haile',
    licenseNumber: 'ETH-DRV-77012',
    licenseExpiry: '2028-06-18',
    licenseCategory: 'Heavy Commercial Commercial Grade A',
    assignedVehicle: 'Toyota Land Cruiser Prado 4x4 (#ET-5501)',
    phone: '+251 913 445 566',
    email: 'berhanu.h@michuutours.et',
    experienceYears: 10,
    dailyRate: 48,
    availability: 'Available',
    status: 'Active',
    schedule: [
      { date: 'Sep 01', time: '07:00', route: 'Addis Ababa → Simien Mountains Park Gate' },
    ],
  },
];

const VEHICLE_OPTIONS = [
  'Toyota Land Cruiser V8 4x4 (#ET-3902)',
  'Toyota Coaster Executive Bus (#ET-8812)',
  'Nissan Patrol Super Safari (#ET-1029)',
  'Ford Transit Expedition Custom (#ET-4402)',
  'Toyota Land Cruiser Prado 4x4 (#ET-5501)',
  'Unassigned (Fleet Reserve)',
];

export const AdminDriversPage: React.FC = () => {
  const [drivers, setDrivers] = useState<DriverItem[]>(INITIAL_DRIVERS);
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiry, setLicenseExpiry] = useState('2028-12-31');
  const [licenseCategory, setLicenseCategory] = useState('Heavy Commercial Grade A');
  const [assignedVehicle, setAssignedVehicle] = useState(VEHICLE_OPTIONS[0]);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [experienceYears, setExperienceYears] = useState(8);
  const [dailyRate, setDailyRate] = useState(50);
  const [availability, setAvailability] = useState<DriverItem['availability']>('Available');

  // Schedule Inspector Modal State
  const [selectedDriverSchedule, setSelectedDriverSchedule] = useState<DriverItem | null>(null);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName('');
    setLicenseNumber(`ETH-DRV-${Math.floor(10000 + Math.random() * 90000)}`);
    setLicenseExpiry('2028-12-31');
    setLicenseCategory('Heavy Commercial Grade A');
    setAssignedVehicle(VEHICLE_OPTIONS[0]);
    setPhone('+251 911 000 000');
    setEmail('');
    setExperienceYears(8);
    setDailyRate(50);
    setAvailability('Available');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (drv: DriverItem) => {
    setEditingId(drv.id);
    setName(drv.name);
    setLicenseNumber(drv.licenseNumber);
    setLicenseExpiry(drv.licenseExpiry);
    setLicenseCategory(drv.licenseCategory);
    setAssignedVehicle(drv.assignedVehicle);
    setPhone(drv.phone);
    setEmail(drv.email);
    setExperienceYears(drv.experienceYears);
    setDailyRate(drv.dailyRate);
    setAvailability(drv.availability);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingId) {
      setDrivers((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? {
                ...d,
                name,
                licenseNumber,
                licenseExpiry,
                licenseCategory,
                assignedVehicle,
                phone,
                email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@michuutours.et`,
                experienceYears,
                dailyRate,
                availability,
              }
            : d
        )
      );
    } else {
      const newDrv: DriverItem = {
        id: `drv-${Date.now()}`,
        name,
        licenseNumber: licenseNumber || 'ETH-DRV-90000',
        licenseExpiry: licenseExpiry || '2028-12-31',
        licenseCategory: licenseCategory || 'Heavy Commercial Grade A',
        assignedVehicle: assignedVehicle || VEHICLE_OPTIONS[0],
        phone: phone || '+251 911 000 000',
        email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@michuutours.et`,
        experienceYears,
        dailyRate,
        availability,
        status: 'Active',
        schedule: [
          { date: 'Upcoming', time: '08:00', route: 'HQ Dispatch → Assigned Expedition Route' },
        ],
      };
      setDrivers([newDrv, ...drivers]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  };

  // Filtered & Paginated List
  const filteredDrivers = drivers.filter(
    (d) =>
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.assignedVehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredDrivers.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentDriversPage = filteredDrivers.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bus style={{ color: '#034ea2' }} /> Expedition Drivers & Vehicle Chauffeurs
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage commercial driver licenses, vehicle connections, trip schedules, daily stipends, and fleet dispatches
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAddModal} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
            + Create Driver
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 450 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search driver name, license #, assigned vehicle, or phone..."
            style={{ width: '100%', padding: '0.45rem 0.875rem 0.45rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Rows Per Page:</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
          >
            <option value={5}>5 Rows</option>
            <option value={10}>10 Rows</option>
            <option value={25}>25 Rows</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <Card glass style={{ padding: 0, overflowX: 'auto', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}># ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 200, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>DRIVER NAME ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 160, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>LICENSE NO. & EXPIRY ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 200, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>CONNECTED VEHICLE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 150, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>DRIVER SCHEDULE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 120, minWidth: 120, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>AVAILABILITY ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 160, minWidth: 160, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentDriversPage.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No driver records match your search criteria.
                </td>
              </tr>
            ) : (
              currentDriversPage.map((drv, idx) => (
                <tr key={drv.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-secondary)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{drv.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: '0.15rem', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600 }}>{drv.phone}</span> · {drv.experienceYears} Yrs Exp · ${drv.dailyRate}/day
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800 }}>{drv.licenseNumber}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Valid until {drv.licenseExpiry}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    🚐 {drv.assignedVehicle}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', whiteSpace: 'nowrap' }}>
                    <button
                      type="button"
                      onClick={() => setSelectedDriverSchedule(drv)}
                      style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--brand-primary)',
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Calendar size={12} /> {drv.schedule.length} Trips Scheduled
                    </button>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <Badge variant={drv.availability === 'On Trip' ? 'info' : drv.availability === 'Available' ? 'success' : 'danger'}>
                      {drv.availability}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(drv)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(37,99,235,0.3)',
                          backgroundColor: 'rgba(37,99,235,0.08)',
                          color: 'var(--brand-primary)',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Edit2 size={12} /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(drv.id)}
                        style={{
                          padding: '0.3rem 0.65rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid rgba(239,68,68,0.3)',
                          backgroundColor: 'rgba(239,68,68,0.08)',
                          color: '#ef4444',
                          fontSize: 11,
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* ── PAGINATION FOOTER ── */}
        <div className="flex-between" style={{ padding: '0.875rem 1rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-secondary)', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
            Showing <strong>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> drivers
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              <ChevronLeft size={14} /> Previous
            </Button>

            <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, padding: '0 0.5rem' }}>
              Page {currentPage} of {totalPages}
            </span>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11 }}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Driver Schedule Inspector Modal */}
      <Modal isOpen={!!selectedDriverSchedule} onClose={() => setSelectedDriverSchedule(null)} title={`Driver Schedule — ${selectedDriverSchedule?.name}`}>
        {selectedDriverSchedule && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
              <div><strong>License:</strong> {selectedDriverSchedule.licenseNumber} ({selectedDriverSchedule.licenseCategory})</div>
              <div><strong>Connected Vehicle:</strong> 🚐 {selectedDriverSchedule.assignedVehicle}</div>
              <div><strong>Phone:</strong> {selectedDriverSchedule.phone}</div>
            </div>

            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: '#034ea2' }}>
              🗓️ Assigned Expedition Dispatch Schedule:
            </div>

            {selectedDriverSchedule.schedule.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No active trip dispatches scheduled currently.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {selectedDriverSchedule.schedule.map((sch, i) => (
                  <div key={i} className="flex-between" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <MapPin size={14} style={{ color: '#034ea2' }} /> {sch.route}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        Departure Time: {sch.time} HRS
                      </div>
                    </div>
                    <Badge variant="info">{sch.date}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Driver Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Driver Profile' : 'Add New Driver Profile'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Driver Full Name *" value={name} onChange={(e) => setName(e.target.value)} required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Commercial License Number *" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
            <Input label="License Expiry Date *" type="date" value={licenseExpiry} onChange={(e) => setLicenseExpiry(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Phone Number *" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            <Input label="Daily Rate Stipend ($ USD) *" type="number" value={dailyRate} onChange={(e) => setDailyRate(Number(e.target.value))} required />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Connect Directly To Fleet Vehicle *
            </label>
            <select
              value={assignedVehicle}
              onChange={(e) => setAssignedVehicle(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
            >
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Experience (Years)" type="number" value={experienceYears} onChange={(e) => setExperienceYears(Number(e.target.value))} />
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Availability Status *
              </label>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value as DriverItem['availability'])}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="Available">Available</option>
                <option value="On Trip">On Trip</option>
                <option value="Off Duty">Off Duty</option>
              </select>
            </div>
          </div>

          <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700, marginTop: '0.5rem' }}>
            {editingId ? 'Save Changes' : 'Save Driver Profile'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

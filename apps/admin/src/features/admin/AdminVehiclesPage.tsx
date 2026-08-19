import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Badge } from '@tms/shared/components/common/Badge';
import { http } from '@tms/shared/services/apiClient';
import { Car, Plus, Search, Edit2, Trash2, Wrench, ChevronLeft, ChevronRight } from 'lucide-react';


export type VehicleStatus = 'Available' | 'Assigned' | 'In Maintenance' | 'Unavailable';

export interface MaintenanceLog {
  date: string;
  serviceType: string;
  mileageKm: number;
  costUsd: number;
  technician: string;
}

export interface VehicleItem {
  id: string;
  vehicleName: string;
  plateNumber: string;
  model: string;
  year: number;
  type: '4x4 Cruiser' | 'Coaster Bus' | 'Luxury Minivan' | 'Helicopter';
  capacity: number;
  assignedDriver: string;
  status: VehicleStatus;
  nextServiceKm: number;
  currentMileageKm: number;
  lastServiceCostUsd: number;
  insuranceExpiry: string;
  inspectionExpiry: string;
  maintenanceHistory: MaintenanceLog[];
}

const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: 'veh-1',
    vehicleName: 'Toyota Land Cruiser V8 4x4',
    plateNumber: 'AA-39021',
    model: 'Land Cruiser V8 Expedition Grade',
    year: 2024,
    type: '4x4 Cruiser',
    capacity: 7,
    assignedDriver: 'Tesfaye Tadesse',
    status: 'Assigned',
    nextServiceKm: 15000,
    currentMileageKm: 12400,
    lastServiceCostUsd: 340,
    insuranceExpiry: '2026-12-31',
    inspectionExpiry: '2026-11-15',
    maintenanceHistory: [
      { date: '2026-08-01', serviceType: '5,000km Engine Oil & Filter Change', mileageKm: 10000, costUsd: 180, technician: 'Toyota Addis Service Center' },
      { date: '2026-06-15', serviceType: 'Brake Pads & Suspension Bushing Replacement', mileageKm: 7500, costUsd: 340, technician: 'Expedition Fleet Garage' },
    ],
  },
  {
    id: 'veh-2',
    vehicleName: 'Toyota Coaster Executive Bus',
    plateNumber: 'AA-12345',
    model: 'Coaster Tourist Bus 28-Seater',
    year: 2023,
    type: 'Coaster Bus',
    capacity: 25,
    assignedDriver: 'Kassahun Worku',
    status: 'Available',
    nextServiceKm: 15000,
    currentMileageKm: 11200,
    lastServiceCostUsd: 520,
    insuranceExpiry: 'Valid until Dec 2026',
    inspectionExpiry: '2026-12-20',
    maintenanceHistory: [
      { date: '2026-07-15', serviceType: 'Air Conditioning System Flush & Tires Alignment', mileageKm: 11000, costUsd: 520, technician: 'Addis Commercial Bus Motors' },
    ],
  },
  {
    id: 'veh-3',
    vehicleName: 'Nissan Patrol Super Safari',
    plateNumber: 'AA-10293',
    model: 'Nissan Patrol Y61 Extreme 4x4',
    year: 2022,
    type: '4x4 Cruiser',
    capacity: 6,
    assignedDriver: 'Girma Alemayehu',
    status: 'Available',
    nextServiceKm: 20000,
    currentMileageKm: 18500,
    lastServiceCostUsd: 290,
    insuranceExpiry: '2027-02-28',
    inspectionExpiry: '2027-01-10',
    maintenanceHistory: [
      { date: '2026-07-28', serviceType: 'Snorkel Air Intake & Shock Absorbers Inspection', mileageKm: 18000, costUsd: 290, technician: 'Safari 4x4 Tuning' },
    ],
  },
  {
    id: 'veh-4',
    vehicleName: 'Ford Transit Expedition Custom',
    plateNumber: 'AA-44029',
    model: 'Ford Transit VIP Luxury 12-Seat',
    year: 2023,
    type: 'Luxury Minivan',
    capacity: 12,
    assignedDriver: 'Yared Mamo',
    status: 'In Maintenance',
    nextServiceKm: 12000,
    currentMileageKm: 12050,
    lastServiceCostUsd: 680,
    insuranceExpiry: '2026-10-31',
    inspectionExpiry: '2026-09-30',
    maintenanceHistory: [
      { date: '2026-08-10', serviceType: 'Transmission Fluid & Clutch Overhaul', mileageKm: 12000, costUsd: 680, technician: 'Ford Central Garage' },
    ],
  },
  {
    id: 'veh-5',
    vehicleName: 'Toyota Land Cruiser Prado',
    plateNumber: 'AA-55012',
    model: 'Prado 150 VX Offroad',
    year: 2024,
    type: '4x4 Cruiser',
    capacity: 7,
    assignedDriver: 'Berhanu Haile',
    status: 'Available',
    nextServiceKm: 10000,
    currentMileageKm: 6500,
    lastServiceCostUsd: 210,
    insuranceExpiry: '2027-05-15',
    inspectionExpiry: '2027-04-10',
    maintenanceHistory: [
      { date: '2026-05-20', serviceType: 'Initial 5,000km Factory Warranty Maintenance', mileageKm: 5000, costUsd: 210, technician: 'Toyota Motors Ethiopia' },
    ],
  },
];

const DRIVER_OPTIONS = [
  'Tesfaye Tadesse',
  'Kassahun Worku',
  'Girma Alemayehu',
  'Yared Mamo',
  'Berhanu Haile',
  'Unassigned (Fleet Pool)',
];

export const AdminVehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [vehicleName, setVehicleName] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState(2024);
  const [type, setType] = useState<VehicleItem['type']>('4x4 Cruiser');
  const [capacity, setCapacity] = useState(7);
  const [assignedDriver, setAssignedDriver] = useState(DRIVER_OPTIONS[0]);
  const [status, setStatus] = useState<VehicleStatus>('Available');
  const [nextServiceKm, setNextServiceKm] = useState(15000);
  const [currentMileageKm, setCurrentMileageKm] = useState(12000);
  const [insuranceExpiry, setInsuranceExpiry] = useState('Valid until Dec 2026');

  // Maintenance Log Inspector Modal State
  const [selectedVehicleLog, setSelectedVehicleLog] = useState<VehicleItem | null>(null);

  const fetchVehicles = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await http.get('/vehicles');
      setVehicles(
        Array.isArray(res.data)
          ? res.data.map((v: any) => ({
              id: String(v.id),
              vehicleName: v.vehicleName || v.model || '',
              plateNumber: v.plateNumber || '',
              model: v.model || '',
              year: Number(v.year) || 2024,
              type: (v.type as any) || '4x4 Cruiser',
              capacity: Number(v.capacity) || 7,
              assignedDriver: v.assignedDriver || 'Unassigned',
              status: (v.status as any) || 'Available',
              nextServiceKm: Number(v.nextServiceKm) || 0,
              currentMileageKm: Number(v.currentMileageKm) || 0,
              lastServiceCostUsd: Number(v.lastServiceCostUsd) || 0,
              insuranceExpiry: v.insuranceExpiry || '',
              inspectionExpiry: v.inspectionExpiry || '',
              maintenanceHistory: v.maintenanceHistory || [],
            }))
          : []
      );
    } catch (err: any) {
      setApiError('Failed to load vehicles from server.');
      setVehicles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setVehicleName('');
    setPlateNumber(`AA-${Math.floor(10000 + Math.random() * 90000)}`);
    setModel('Toyota Land Cruiser 4x4');
    setYear(2024);
    setType('4x4 Cruiser');
    setCapacity(7);
    setAssignedDriver(DRIVER_OPTIONS[0]);
    setStatus('Available');
    setNextServiceKm(15000);
    setCurrentMileageKm(10000);
    setInsuranceExpiry('Valid until Dec 2026');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (v: VehicleItem) => {
    setEditingId(v.id);
    setVehicleName(v.vehicleName);
    setPlateNumber(v.plateNumber);
    setModel(v.model);
    setYear(v.year);
    setType(v.type);
    setCapacity(v.capacity);
    setAssignedDriver(v.assignedDriver);
    setStatus(v.status);
    setNextServiceKm(v.nextServiceKm);
    setCurrentMileageKm(v.currentMileageKm);
    setInsuranceExpiry(v.insuranceExpiry);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plateNumber.trim()) return;

    const payload = {
      vehicleName: vehicleName || model,
      plateNumber,
      model,
      year,
      type,
      capacity,
      assignedDriver,
      status,
      nextServiceKm,
      currentMileageKm,
      lastServiceCostUsd: 300,
      insuranceExpiry,
      inspectionExpiry: 'Valid until Nov 2026',
      maintenanceHistory: [],
    };

    if (editingId) {
      await http.patch(`/vehicles/${editingId}`, payload);
    } else {
      await http.post('/vehicles', payload);
    }
    await fetchVehicles();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await http.delete(`/vehicles/${id}`);
    await fetchVehicles();
  };

  // Filtered & Paginated List
  const filteredVehicles = vehicles.filter(
    (v) =>
      v.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.vehicleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.assignedDriver.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEntries = filteredVehicles.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage) || 1;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalEntries);
  const currentVehiclesPage = filteredVehicles.slice(startIndex, endIndex);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Car style={{ color: '#034ea2' }} /> Expedition Transportation Fleet
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage 4x4 cruisers, tourist buses, passenger seat limits, driver assignments, service history, and insurance validity
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAddModal} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
            + Create Vehicle
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
            placeholder="Search plate #, model, vehicle name, or driver..."
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
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 200, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>REGISTRATION / PLATE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 180, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>MODEL & CAPACITY ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 180, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>SERVICE & INSURANCE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, minWidth: 180, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>ASSIGNED DRIVER ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 120, minWidth: 120, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>STATUS ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 160, minWidth: 160, color: 'var(--text-secondary)', borderBottom: '1px solid var(--border-color)', whiteSpace: 'nowrap' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {currentVehiclesPage.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No vehicle records match your search criteria.
                </td>
              </tr>
            ) : (
              currentVehiclesPage.map((veh, idx) => (
                <tr key={veh.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{startIndex + idx + 1}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#034ea2', fontSize: 'var(--font-size-sm)' }}>{veh.plateNumber}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{veh.year} Model</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{veh.model}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', gap: 6, marginTop: 2 }}>
                      <span>👥 {veh.capacity} Seats</span> · <Badge variant="info" style={{ fontSize: 9 }}>{veh.type}</Badge>
                    </div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 11 }}>
                      🛠️ Next Service: <strong>{veh.nextServiceKm.toLocaleString()} km</strong>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                      🛡️ Insurance: {veh.insuranceExpiry}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedVehicleLog(veh)}
                      style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--brand-primary)',
                        fontSize: 10,
                        fontWeight: 700,
                        cursor: 'pointer',
                        marginTop: 4,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Wrench size={10} /> View Service History ({veh.maintenanceHistory.length})
                    </button>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                    👤 {veh.assignedDriver}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <Badge variant={veh.status === 'Available' ? 'success' : veh.status === 'Assigned' ? 'info' : veh.status === 'In Maintenance' ? 'warning' : 'danger'}>
                      {veh.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(veh)}
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
                        onClick={() => handleDelete(veh.id)}
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
            Showing <strong>{totalEntries === 0 ? 0 : startIndex + 1}</strong> to <strong>{endIndex}</strong> of <strong>{totalEntries}</strong> vehicles
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

      {/* Maintenance History Log Modal */}
      <Modal isOpen={!!selectedVehicleLog} onClose={() => setSelectedVehicleLog(null)} title={`Maintenance & Service Log — ${selectedVehicleLog?.vehicleName} (${selectedVehicleLog?.plateNumber})`}>
        {selectedVehicleLog && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.875rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
              <div><strong>Plate Number:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{selectedVehicleLog.plateNumber}</span></div>
              <div><strong>Current Odometer:</strong> {selectedVehicleLog.currentMileageKm.toLocaleString()} km</div>
              <div><strong>Next Service Threshold:</strong> {selectedVehicleLog.nextServiceKm.toLocaleString()} km</div>
              <div><strong>Insurance Expiry:</strong> {selectedVehicleLog.insuranceExpiry}</div>
            </div>

            <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: '#034ea2' }}>
              🛠️ Historical Maintenance Work Orders ({selectedVehicleLog.maintenanceHistory.length}):
            </div>

            {selectedVehicleLog.maintenanceHistory.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No historical service records logged yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {selectedVehicleLog.maintenanceHistory.map((m, i) => (
                  <div key={i} className="flex-between" style={{ padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)' }}>
                    <div>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{m.serviceType}</div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {m.date} · Odometer: {m.mileageKm.toLocaleString()} km · Tech: {m.technician}
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: '#ef4444' }}>
                      -${m.costUsd} USD
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Add / Edit Vehicle Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Vehicle Details' : 'Add New Expedition Vehicle'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Vehicle Name *" value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} placeholder="e.g. Toyota Coaster Executive Bus" required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Registration / Plate Number *" value={plateNumber} onChange={(e) => setPlateNumber(e.target.value)} placeholder="e.g. AA-12345" required />
            <Input label="Make & Model *" value={model} onChange={(e) => setModel(e.target.value)} placeholder="e.g. Coaster Tourist Bus 28-Seater" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Vehicle Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as VehicleItem['type'])}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="4x4 Cruiser">4x4 Cruiser</option>
                <option value="Coaster Bus">Coaster Bus</option>
                <option value="Luxury Minivan">Luxury Minivan</option>
                <option value="Helicopter">Helicopter</option>
              </select>
            </div>

            <Input label="Passenger Capacity (Seats) *" type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
            <Input label="Manufacturing Year" type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Assigned Driver *
            </label>
            <select
              value={assignedDriver}
              onChange={(e) => setAssignedDriver(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
            >
              {DRIVER_OPTIONS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Vehicle Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as VehicleStatus)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="Available">Available</option>
                <option value="Assigned">Assigned</option>
                <option value="In Maintenance">In Maintenance</option>
                <option value="Unavailable">Unavailable</option>
              </select>
            </div>

            <Input label="Insurance Expiry *" value={insuranceExpiry} onChange={(e) => setInsuranceExpiry(e.target.value)} placeholder="e.g. Valid until Dec 2026" required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Current Odometer (km)" type="number" value={currentMileageKm} onChange={(e) => setCurrentMileageKm(Number(e.target.value))} />
            <Input label="Next Service Threshold (km)" type="number" value={nextServiceKm} onChange={(e) => setNextServiceKm(Number(e.target.value))} />
          </div>

          <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700, marginTop: '0.5rem' }}>
            {editingId ? 'Save Changes' : 'Save Vehicle Details'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

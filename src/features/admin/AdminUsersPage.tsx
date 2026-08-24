import React from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { tourismService } from '@/services/tourismService';
import type { Booking } from '@/types/booking';
import type { CustomerProfile, CommunicationEntry, LoyaltyTier } from '@/types/customer';
import { getLoyaltyTier, getNextTierThreshold, LOYALTY_META } from '@/types/customer';
import {
  RefreshCw, UserPlus, Edit, Trash2, CheckCircle2, Eye,
  ShieldAlert, User, FileText, Heart, MessageSquare, Award,
  PlusCircle, Phone, Plane,
} from 'lucide-react';

const INITIAL_CUSTOMERS: CustomerProfile[] = [
  {
    id: 'usr-1', name: 'Eleanor Vance', email: 'eleanor.vance@example.com',
    mobile: '+1 (555) 321-7890', role: 'Tourist', regDate: '2026-07-15',
    status: 'active', totalBookings: 4, totalSpend: 3600, loyaltyTier: 'silver',
    passport: { documentType: 'passport', documentNumber: 'US-7712341', issuingCountry: 'United States', expiryDate: '2029-04-20', nationality: 'American' },
    emergencyContact: { name: 'Robert Vance', relationship: 'Spouse', phone: '+1 (555) 987-6543', email: 'robert.vance@example.com' },
    travelPreferences: { preferredTourTypes: ['cultural', 'luxury'], dietaryNeeds: 'Vegetarian, no shellfish', languages: ['English', 'French'], accessibilityNeeds: '', preferredCurrency: 'USD ($)', accommodationPreference: 'Luxury Lodge' },
    communicationHistory: [
      { id: 'cm-1', date: '2026-08-01', channel: 'email', subject: 'Booking Confirmation', summary: 'Sent booking confirmation for Wenchi Crater Lake tour.', staffName: 'Alex Morgan' },
      { id: 'cm-2', date: '2026-08-05', channel: 'phone', subject: 'Dietary Query', summary: 'Customer called about vegetarian meal options. Confirmed with kitchen.', staffName: 'Tigist Assefa' },
    ],
  },
  {
    id: 'usr-4', name: 'Sophia Rossi', email: 'sophia.r@example.it',
    mobile: '+39 06 6987 1234', role: 'Tourist', regDate: '2026-08-01',
    status: 'active', totalBookings: 2, totalSpend: 2500, loyaltyTier: 'bronze',
    passport: { documentType: 'passport', documentNumber: 'IT-AA1234567', issuingCountry: 'Italy', expiryDate: '2028-11-30', nationality: 'Italian' },
    emergencyContact: { name: 'Marco Rossi', relationship: 'Brother', phone: '+39 06 1111 2222' },
    travelPreferences: { preferredTourTypes: ['cultural', 'mountain'], dietaryNeeds: '', languages: ['Italian', 'English'], accessibilityNeeds: '', preferredCurrency: 'EUR (€)', accommodationPreference: 'Luxury Lodge' },
    communicationHistory: [
      { id: 'cm-3', date: '2026-08-08', channel: 'email', subject: 'Danakil Tour Details', summary: 'Emailed safety briefing for Erta Ale expedition.', staffName: 'Alex Morgan' },
    ],
  },
  {
    id: 'usr-6', name: 'Liam Hemsworth', email: 'liam.h@example.co.uk',
    mobile: '+44 20 7946 0912', role: 'Tourist', regDate: '2026-08-03',
    status: 'active', totalBookings: 9, totalSpend: 11400, loyaltyTier: 'gold',
    passport: { documentType: 'passport', documentNumber: 'GB-500219631', issuingCountry: 'United Kingdom', expiryDate: '2031-06-15', nationality: 'British' },
    emergencyContact: { name: 'Anna Hemsworth', relationship: 'Wife', phone: '+44 20 7946 1111', email: 'anna.h@example.co.uk' },
    travelPreferences: { preferredTourTypes: ['safari', 'mountain', 'cultural'], dietaryNeeds: 'No pork', languages: ['English'], accessibilityNeeds: 'Mild altitude sensitivity', preferredCurrency: 'GBP (£)', accommodationPreference: 'Luxury Lodge' },
    communicationHistory: [
      { id: 'cm-4', date: '2026-07-20', channel: 'whatsapp', subject: 'Gold Tier Welcome', summary: 'Sent Gold member welcome and exclusive offer brochure.', staffName: 'Tigist Assefa' },
    ],
  },
  {
    id: 'usr-5', name: 'Alex Morgan', email: 'alex.m@tmslogistics.com',
    mobile: '+1 (555) 998-1122', role: 'Administrator', regDate: '2026-05-01',
    status: 'active', totalBookings: 0, totalSpend: 0, loyaltyTier: 'bronze',
    communicationHistory: [],
  },
  {
    id: 'usr-2', name: 'Juma Mwangi', email: 'juma.m@tourismsystem.com',
    mobile: '+255 712 345 678', role: 'Tour Guide', regDate: '2026-06-10',
    status: 'active', totalBookings: 0, totalSpend: 0, loyaltyTier: 'bronze',
    emergencyContact: { name: 'Aisha Mwangi', relationship: 'Sister', phone: '+255 713 000 111' },
    travelPreferences: { preferredTourTypes: ['safari', 'mountain'], dietaryNeeds: 'Halal', languages: ['English', 'Swahili', 'Amharic'], accessibilityNeeds: '', preferredCurrency: 'USD ($)', accommodationPreference: 'Mid-range Hotel' },
    communicationHistory: [],
  },
];

const STORAGE_KEY = 'michuu_customers_v2';
function loadCustomers(): CustomerProfile[] {
  try { const d = localStorage.getItem(STORAGE_KEY); return d ? JSON.parse(d) : INITIAL_CUSTOMERS; } catch { return INITIAL_CUSTOMERS; }
}
function saveCustomers(data: CustomerProfile[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
}

const Section: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '0.5rem' }}>
    {icon}{label}
  </div>
);

const LoyaltyBadge: React.FC<{ tier: LoyaltyTier; size?: 'sm' | 'md' }> = ({ tier, size = 'sm' }) => {
  const m = LOYALTY_META[tier];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: size === 'sm' ? '0.2rem 0.6rem' : '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: m.bg, color: m.color, fontWeight: 700, fontSize: size === 'sm' ? 11 : 'var(--font-size-xs)' }}>
      {m.emoji} {m.label}
    </span>
  );
};

const CHANNEL_LABELS: Record<CommunicationEntry['channel'], string> = {
  email: '📧 Email', phone: '📞 Phone', whatsapp: '💬 WhatsApp', 'in-app': '🌐 In-App', 'walk-in': '🚶 Walk-in',
};

export const AdminUsersPage: React.FC = () => {
  const [customers, setCustomers] = React.useState<CustomerProfile[]>(loadCustomers);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const [detailCustomer, setDetailCustomer] = React.useState<CustomerProfile | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<{ id: string; name: string } | null>(null);
  const [customerBookings, setCustomerBookings] = React.useState<Booking[]>([]);
  const [activeTab, setActiveTab] = React.useState<'overview' | 'passport' | 'preferences' | 'comms' | 'bookings' | 'loyalty'>('overview');

  const [newCommSubject, setNewCommSubject] = React.useState('');
  const [newCommSummary, setNewCommSummary] = React.useState('');
  const [newCommChannel, setNewCommChannel] = React.useState<CommunicationEntry['channel']>('email');

  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newMobile, setNewMobile] = React.useState('');
  const [newRole, setNewRole] = React.useState('Tourist');

  const [editCustomer, setEditCustomer] = React.useState<CustomerProfile | null>(null);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editMobile, setEditMobile] = React.useState('');
  const [editRole, setEditRole] = React.useState('Tourist');
  const [editStatus, setEditStatus] = React.useState<'active' | 'blocked'>('active');
  const [editPassportType, setEditPassportType] = React.useState<'passport' | 'national_id' | 'other'>('passport');
  const [editPassportNum, setEditPassportNum] = React.useState('');
  const [editPassportCountry, setEditPassportCountry] = React.useState('');
  const [editPassportExpiry, setEditPassportExpiry] = React.useState('');
  const [editPassportNat, setEditPassportNat] = React.useState('');
  const [editEcName, setEditEcName] = React.useState('');
  const [editEcRel, setEditEcRel] = React.useState('');
  const [editEcPhone, setEditEcPhone] = React.useState('');
  const [editEcEmail, setEditEcEmail] = React.useState('');
  const [editDietary, setEditDietary] = React.useState('');
  const [editLanguages, setEditLanguages] = React.useState('');
  const [editAccessibility, setEditAccessibility] = React.useState('');
  const [editCurrency, setEditCurrency] = React.useState('USD ($)');
  const [editAccomm, setEditAccomm] = React.useState('');

  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'blocked'>('all');

  const mapBackendUserToProfile = (u: any, bookings: Booking[] = []): CustomerProfile => {
    const userBookings = bookings.filter(
      (b) => b.traveler?.email?.toLowerCase() === u.email?.toLowerCase() || (b.userId && String(b.userId) === String(u.id))
    );
    const totalBookings = userBookings.length;
    const totalSpend = userBookings.reduce((sum, b) => sum + (Number(b.totalPrice) || 0), 0);
    const loyaltyTier = getLoyaltyTier(totalBookings);

    const passport = (u.passportNumber || u.passportType || u.passportCountry || u.nationality) ? {
      documentType: (u.passportType === 'national_id' || u.passportType === 'other') ? u.passportType : 'passport',
      documentNumber: u.passportNumber || '',
      issuingCountry: u.passportCountry || u.nationality || 'Ethiopia',
      expiryDate: u.passportExpiry || '',
      nationality: u.nationality || u.passportCountry || 'Ethiopian',
    } : undefined;

    const emergencyContact = (u.ecName || u.ecPhone || u.ecEmail) ? {
      name: u.ecName || '',
      relationship: u.ecRelationship || 'Emergency Contact',
      phone: u.ecPhone || '',
      email: u.ecEmail || undefined,
    } : undefined;

    const languagesList = Array.isArray(u.languages)
      ? u.languages
      : (typeof u.languages === 'string' && u.languages ? u.languages.split(',').map((s: string) => s.trim()) : ['English', 'Amharic']);

    const tourTypesList = Array.isArray(u.tourTypes)
      ? u.tourTypes
      : (typeof u.tourTypes === 'string' && u.tourTypes ? u.tourTypes.split(',').map((s: string) => s.trim()) : []);

    const travelPreferences = {
      preferredTourTypes: tourTypesList,
      dietaryNeeds: u.dietaryNeeds || '',
      languages: languagesList,
      accessibilityNeeds: u.accessibility || '',
      preferredCurrency: u.preferredCurrency || 'USD ($)',
      accommodationPreference: u.accommodation || 'Eco-Lodge / 4-Star Boutique',
    };

    return {
      id: String(u.id),
      name: u.name || 'Anonymous Traveler',
      email: u.email,
      mobile: u.phone || '+251 911 000 000',
      role: u.role?.name || (typeof u.role === 'string' ? u.role : 'Tourist'),
      regDate: typeof u.createdAt === 'string' ? u.createdAt.split('T')[0] : '2026-08-19',
      status: u.isActive !== false ? 'active' : 'blocked',
      passport,
      emergencyContact,
      travelPreferences,
      totalBookings,
      totalSpend,
      loyaltyTier,
      communicationHistory: u.communicationHistory || [],
    };
  };

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const [usersRes, allBookings] = await Promise.all([
        tourismService.getUsers().catch(() => ({ data: [] })),
        tourismService.getBookings('all').catch(() => []),
      ]);
      const list = Array.isArray(usersRes.data) ? usersRes.data : (Array.isArray(usersRes) ? usersRes : []);
      if (list.length > 0) {
        setCustomers(list.map((u: any) => mapBackendUserToProfile(u, allBookings)));
      }
    } catch {
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, []);

  const save = (list: CustomerProfile[]) => { setCustomers(list); saveCustomers(list); };

  const filtered = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = async (c: CustomerProfile) => {
    setDetailCustomer(c);
    setActiveTab('overview');
    setIsDetailOpen(true);
    try {
      const allBookings = await tourismService.getBookings('all').catch(() => []);
      const userBookings = allBookings.filter(
        (b) => b.traveler?.email?.toLowerCase() === c.email?.toLowerCase() || (b.userId && String(b.userId) === String(c.id))
      );
      setCustomerBookings(userBookings);
      const mapped = mapBackendUserToProfile(c, allBookings);
      setDetailCustomer(mapped);
    } catch {
      setDetailCustomer(c);
    }
  };

  const openEdit = (c: CustomerProfile) => {
    setEditCustomer(c);
    setEditName(c.name); setEditEmail(c.email); setEditMobile(c.mobile);
    setEditRole(c.role); setEditStatus(c.status);
    setEditPassportType(c.passport?.documentType || 'passport');
    setEditPassportNum(c.passport?.documentNumber || '');
    setEditPassportCountry(c.passport?.issuingCountry || '');
    setEditPassportExpiry(c.passport?.expiryDate || '');
    setEditPassportNat(c.passport?.nationality || '');
    setEditEcName(c.emergencyContact?.name || '');
    setEditEcRel(c.emergencyContact?.relationship || '');
    setEditEcPhone(c.emergencyContact?.phone || '');
    setEditEcEmail(c.emergencyContact?.email || '');
    setEditDietary(c.travelPreferences?.dietaryNeeds || '');
    setEditLanguages(c.travelPreferences?.languages?.join(', ') || '');
    setEditAccessibility(c.travelPreferences?.accessibilityNeeds || '');
    setEditCurrency(c.travelPreferences?.preferredCurrency || 'USD ($)');
    setEditAccomm(c.travelPreferences?.accommodationPreference || '');
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCustomer) return;
    const tier = getLoyaltyTier(editCustomer.totalBookings);
    const updated = customers.map((c) => c.id === editCustomer.id ? {
      ...c, name: editName, email: editEmail, mobile: editMobile, role: editRole, status: editStatus, loyaltyTier: tier,
      passport: { documentType: editPassportType, documentNumber: editPassportNum, issuingCountry: editPassportCountry, expiryDate: editPassportExpiry, nationality: editPassportNat },
      emergencyContact: { name: editEcName, relationship: editEcRel, phone: editEcPhone, email: editEcEmail },
      travelPreferences: { preferredTourTypes: c.travelPreferences?.preferredTourTypes || [], dietaryNeeds: editDietary, languages: editLanguages.split(',').map((s) => s.trim()).filter(Boolean), accessibilityNeeds: editAccessibility, preferredCurrency: editCurrency, accommodationPreference: editAccomm },
    } : c);
    save(updated); setIsEditOpen(false); setEditCustomer(null);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newC: CustomerProfile = {
      id: `usr-${Date.now()}`, name: newName, email: newEmail, mobile: newMobile,
      role: newRole, regDate: new Date().toISOString().split('T')[0],
      status: 'active', totalBookings: 0, totalSpend: 0, loyaltyTier: 'bronze', communicationHistory: [],
    };
    save([newC, ...customers]);
    setIsAddOpen(false); setNewName(''); setNewEmail(''); setNewMobile('');
  };

  const handleAddCommNote = () => {
    if (!detailCustomer || !newCommSubject || !newCommSummary) return;
    const entry: CommunicationEntry = {
      id: `cm-${Date.now()}`, date: new Date().toISOString().split('T')[0],
      channel: newCommChannel, subject: newCommSubject, summary: newCommSummary, staffName: 'Admin',
    };
    const updated = customers.map((c) => c.id === detailCustomer.id
      ? { ...c, communicationHistory: [...(c.communicationHistory || []), entry] } : c);
    save(updated);
    setDetailCustomer((prev) => prev ? { ...prev, communicationHistory: [...(prev.communicationHistory || []), entry] } : null);
    setNewCommSubject(''); setNewCommSummary('');
  };

  const columns: Column<CustomerProfile>[] = [
    {
      header: 'Customer',
      minWidth: '220px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 200 }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
            {row.name.charAt(0)}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3 }}>{row.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Mobile',
      minWidth: '150px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-xs)', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {row.mobile || '—'}
        </span>
      ),
    },
    {
      header: 'Role',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => <Badge variant="info">{row.role}</Badge>,
    },
    {
      header: 'Loyalty',
      minWidth: '120px',
      noWrap: true,
      cell: (row) => <LoyaltyBadge tier={row.loyaltyTier} />,
    },
    {
      header: 'Bookings / Spend',
      minWidth: '140px',
      noWrap: true,
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{row.totalBookings} trips</div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>${row.totalSpend.toLocaleString()} total</div>
        </div>
      ),
    },
    {
      header: 'Joined',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => <span style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>{row.regDate}</span>,
    },
    {
      header: 'Status',
      minWidth: '100px',
      noWrap: true,
      cell: (row) => <Badge variant={row.status === 'active' ? 'success' : 'danger'}>{row.status.toUpperCase()}</Badge>,
    },
    {
      header: 'Actions',
      minWidth: '160px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" icon={<Eye size={13} />} onClick={() => openDetail(row)}>View</Button>
          <PermissionGuard resource="users" action="update">
            <Button variant="outline" size="sm" icon={<Edit size={13} />} onClick={() => openEdit(row)}>Edit</Button>
            <Button variant={row.status === 'active' ? 'ghost' : 'outline'} size="sm"
              style={row.status === 'active' ? { color: '#ef4444' } : {}}
              icon={<ShieldAlert size={13} />}
              onClick={() => save(customers.map((c) => c.id === row.id ? { ...c, status: c.status === 'active' ? 'blocked' : 'active' } : c))}>
              {row.status === 'active' ? 'Block' : 'Unblock'}
            </Button>
          </PermissionGuard>
          <PermissionGuard resource="users" action="delete">
            <Button variant="ghost" size="sm" style={{ color: '#ef4444' }} icon={<Trash2 size={13} />}
              onClick={() => { setDeleteTarget({ id: row.id, name: row.name }); }} />
          </PermissionGuard>
        </div>
      ),
    },
  ];

  const TAB_STYLE = (active: boolean): React.CSSProperties => ({
    padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
    fontWeight: active ? 700 : 500, cursor: 'pointer',
    color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
    backgroundColor: active ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
    border: '1px solid var(--border-color)', whiteSpace: 'nowrap',
  });

  return (
    <div>
      <PageHeader
        title="Customer & Traveler Profiles"
        description="Manage traveler profiles, passport documents, emergency contacts, loyalty tiers, preferences, and communication history."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={() => setIsLoading(false)}>Refresh</Button>
            <PermissionGuard resource="users" action="create">
              <Button variant="primary" size="sm" icon={<UserPlus size={14} />} onClick={() => setIsAddOpen(true)}>Add Customer</Button>
            </PermissionGuard>
          </>
        }
      />
      <DataTable
        columns={columns}
        data={filtered}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search customer name, email, or role..."
        entityName="customers"
      />

      {/* DETAIL MODAL */}
      {isDetailOpen && detailCustomer && (
        <Modal isOpen={isDetailOpen} onClose={() => setIsDetailOpen(false)} title={`${detailCustomer.name} — Full Profile`}
          footer={<Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>Close</Button>}>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {(['overview','passport','preferences','comms','bookings','loyalty'] as const).map((t) => {
              const LABELS = { overview: '👤 Overview', passport: '🛂 Documents', preferences: '❤️ Preferences', comms: '💬 Comms', bookings: '🎫 Bookings', loyalty: '🏆 Loyalty' };
              return <button key={t} onClick={() => setActiveTab(t)} style={TAB_STYLE(activeTab === t)}>{LABELS[t]}</button>;
            })}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: 'var(--font-size-sm)', minHeight: 280 }}>
            {activeTab === 'overview' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--brand-primary-light)', color: 'var(--brand-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 22 }}>{detailCustomer.name.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>{detailCustomer.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>{detailCustomer.role} · Joined {detailCustomer.regDate}</div>
                    <LoyaltyBadge tier={detailCustomer.loyaltyTier} size="md" />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Email</span>{detailCustomer.email}</div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Mobile</span>{detailCustomer.mobile}</div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Total Trips</span><strong>{detailCustomer.totalBookings}</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Total Spend</span><strong style={{ color: 'var(--status-success)' }}>${detailCustomer.totalSpend.toLocaleString()}</strong></div>
                </div>
                {detailCustomer.emergencyContact && (
                  <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)' }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: '#dc2626', marginBottom: '0.4rem' }}>🚨 Emergency Contact</div>
                    <div><strong>{detailCustomer.emergencyContact.name}</strong> ({detailCustomer.emergencyContact.relationship})</div>
                    <div style={{ color: 'var(--text-muted)' }}>{detailCustomer.emergencyContact.phone}{detailCustomer.emergencyContact.email ? ` · ${detailCustomer.emergencyContact.email}` : ''}</div>
                  </div>
                )}
              </>
            )}
            {activeTab === 'passport' && (
              <>
                <Section icon={<Plane size={14} />} label="Travel Document" />
                {detailCustomer.passport ? (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Type</span><strong>{detailCustomer.passport.documentType.replace('_',' ').toUpperCase()}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Number</span><strong style={{ fontFamily: 'monospace' }}>{detailCustomer.passport.documentNumber}</strong></div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Issuing Country</span>{detailCustomer.passport.issuingCountry}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Nationality</span>{detailCustomer.passport.nationality}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Expiry</span>
                      <span style={{ color: new Date(detailCustomer.passport.expiryDate) < new Date(Date.now() + 6*30*24*3600*1000) ? '#ef4444' : '#16a34a', fontWeight: 700 }}>{detailCustomer.passport.expiryDate}</span>
                    </div>
                  </div>
                ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No document recorded. Click Edit to add.</div>}
              </>
            )}
            {activeTab === 'preferences' && (
              <>
                <Section icon={<Heart size={14} />} label="Travel Preferences" />
                {detailCustomer.travelPreferences ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Tour Types</span>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                        {(detailCustomer.travelPreferences.preferredTourTypes || []).length ? detailCustomer.travelPreferences.preferredTourTypes.map((t) => <Badge key={t} variant="info">{t}</Badge>) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                      </div>
                    </div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Dietary Needs</span>{detailCustomer.travelPreferences.dietaryNeeds || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Languages</span>{detailCustomer.travelPreferences.languages?.join(', ') || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Accessibility</span>{detailCustomer.travelPreferences.accessibilityNeeds || 'None'}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Preferred Currency</span>{detailCustomer.travelPreferences.preferredCurrency || '—'}</div>
                    <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Accommodation</span>{detailCustomer.travelPreferences.accommodationPreference || '—'}</div>
                  </div>
                ) : <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No preferences recorded.</div>}
              </>
            )}
            {activeTab === 'comms' && (
              <>
                <Section icon={<MessageSquare size={14} />} label="Communication History" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  {!(detailCustomer.communicationHistory?.length) ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No history yet.</div>
                    : [...(detailCustomer.communicationHistory || [])].reverse().map((entry) => (
                      <div key={entry.id} style={{ padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                          <span style={{ fontWeight: 700 }}>{CHANNEL_LABELS[entry.channel]} — {entry.subject}</span>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{entry.date} · {entry.staffName}</span>
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{entry.summary}</div>
                      </div>
                    ))
                  }
                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)' }}>ADD NOTE</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      <Input label="Subject" value={newCommSubject} onChange={(e) => setNewCommSubject(e.target.value)} placeholder="e.g. Tour inquiry" />
                      <div className="tms-input-group"><label className="tms-input-label">Channel</label>
                        <select className="tms-input" value={newCommChannel} onChange={(e) => setNewCommChannel(e.target.value as CommunicationEntry['channel'])}>
                          <option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option><option value="in-app">In-App</option><option value="walk-in">Walk-in</option>
                        </select>
                      </div>
                    </div>
                    <Input label="Summary" value={newCommSummary} onChange={(e) => setNewCommSummary(e.target.value)} placeholder="What was discussed..." />
                    <Button variant="primary" size="sm" icon={<PlusCircle size={13} />} onClick={handleAddCommNote} disabled={!newCommSubject || !newCommSummary}>Add Note</Button>
                  </div>
                </div>
              </>
            )}
            {activeTab === 'bookings' && (
              <>
                <Section icon={<FileText size={14} />} label="Booking History" />
                {!customerBookings.length ? <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No bookings found.</div>
                  : customerBookings.map((b) => (
                    <div key={b.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{b.tourTitle}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ref #{b.bookingReference} · {b.travelDate}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'danger' : 'warning'}>{b.status.toUpperCase()}</Badge>
                        <div style={{ fontWeight: 700, color: 'var(--status-success)', fontSize: 'var(--font-size-xs)', marginTop: 2 }}>${b.totalPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  ))
                }
              </>
            )}
            {activeTab === 'loyalty' && (
              <>
                <Section icon={<Award size={14} />} label="Loyalty Program" />
                <div style={{ textAlign: 'center', padding: '1.25rem', backgroundColor: LOYALTY_META[detailCustomer.loyaltyTier].bg, borderRadius: 'var(--radius-md)', border: `1px solid ${LOYALTY_META[detailCustomer.loyaltyTier].color}40` }}>
                  <div style={{ fontSize: 40 }}>{LOYALTY_META[detailCustomer.loyaltyTier].emoji}</div>
                  <div style={{ fontWeight: 800, fontSize: 'var(--font-size-xl)', color: LOYALTY_META[detailCustomer.loyaltyTier].color }}>{LOYALTY_META[detailCustomer.loyaltyTier].label}</div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '0.25rem' }}>{detailCustomer.totalBookings} trips · ${detailCustomer.totalSpend.toLocaleString()} spend</div>
                </div>
                {detailCustomer.loyaltyTier !== 'platinum' && (() => {
                  const next = getNextTierThreshold(detailCustomer.loyaltyTier);
                  const pct = Math.min(100, (detailCustomer.totalBookings / next) * 100);
                  return (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: '0.35rem' }}><span>Progress to next tier</span><span>{detailCustomer.totalBookings}/{next} trips</span></div>
                      <div style={{ height: 8, backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', backgroundColor: LOYALTY_META[detailCustomer.loyaltyTier].color, borderRadius: 'var(--radius-full)', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })()}
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', listStyle: 'none' }}>
                  {LOYALTY_META[detailCustomer.loyaltyTier].benefits.map((b) => (
                    <li key={b} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <CheckCircle2 size={14} style={{ color: LOYALTY_META[detailCustomer.loyaltyTier].color, flexShrink: 0 }} />{b}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </Modal>
      )}

      {/* ADD MODAL */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add New Customer Account"
        footer={<div className="flex-between" style={{ width: '100%' }}><Button variant="ghost" size="sm" onClick={() => setIsAddOpen(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={handleAddUser} icon={<UserPlus size={14} />}>Create Account</Button></div>}>
        <form onSubmit={handleAddUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Full Name *" placeholder="e.g. John Doe" value={newName} onChange={(e) => setNewName(e.target.value)} required />
          <Input label="Email Address *" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required />
          <Input label="Mobile Number" placeholder="+1 (555) 123-4567" value={newMobile} onChange={(e) => setNewMobile(e.target.value)} />
          <div className="tms-input-group"><label className="tms-input-label">User Role</label>
            <select className="tms-input" value={newRole} onChange={(e) => setNewRole(e.target.value)}>
              <option value="Tourist">Tourist / Traveler</option><option value="Tour Guide">Tour Guide</option><option value="Tour Operator">Tour Operator</option><option value="Administrator">Administrator</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* EDIT MODAL */}
      {isEditOpen && editCustomer && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Profile — ${editCustomer.name}`}
          footer={<div className="flex-between" style={{ width: '100%' }}><Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button><Button variant="primary" size="sm" onClick={handleSaveEdit} icon={<CheckCircle2 size={14} />}>Save Changes</Button></div>}>
          <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <Section icon={<User size={14} />} label="Basic Info" />
            <Input label="Full Name *" value={editName} onChange={(e) => setEditName(e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email *" type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              <Input label="Mobile" value={editMobile} onChange={(e) => setEditMobile(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tms-input-group"><label className="tms-input-label">Role</label>
                <select className="tms-input" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                  <option value="Tourist">Tourist</option><option value="Tour Guide">Tour Guide</option><option value="Tour Operator">Tour Operator</option><option value="Administrator">Administrator</option>
                </select>
              </div>
              <div className="tms-input-group"><label className="tms-input-label">Status</label>
                <select className="tms-input" value={editStatus} onChange={(e) => setEditStatus(e.target.value as 'active' | 'blocked')}>
                  <option value="active">Active</option><option value="blocked">Blocked</option>
                </select>
              </div>
            </div>
            <Section icon={<Plane size={14} />} label="Travel Document" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="tms-input-group"><label className="tms-input-label">Document Type</label>
                <select className="tms-input" value={editPassportType} onChange={(e) => setEditPassportType(e.target.value as 'passport' | 'national_id' | 'other')}>
                  <option value="passport">Passport</option><option value="national_id">National ID</option><option value="other">Other</option>
                </select>
              </div>
              <Input label="Document Number" value={editPassportNum} onChange={(e) => setEditPassportNum(e.target.value)} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Issuing Country" value={editPassportCountry} onChange={(e) => setEditPassportCountry(e.target.value)} />
              <Input label="Nationality" value={editPassportNat} onChange={(e) => setEditPassportNat(e.target.value)} />
              <Input label="Expiry Date" type="date" value={editPassportExpiry} onChange={(e) => setEditPassportExpiry(e.target.value)} />
            </div>
            <Section icon={<Phone size={14} />} label="Emergency Contact" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Contact Name" value={editEcName} onChange={(e) => setEditEcName(e.target.value)} />
              <Input label="Relationship" value={editEcRel} onChange={(e) => setEditEcRel(e.target.value)} placeholder="e.g. Spouse, Parent" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Phone" value={editEcPhone} onChange={(e) => setEditEcPhone(e.target.value)} />
              <Input label="Email (optional)" type="email" value={editEcEmail} onChange={(e) => setEditEcEmail(e.target.value)} />
            </div>
            <Section icon={<Heart size={14} />} label="Travel Preferences" />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Dietary Needs" value={editDietary} onChange={(e) => setEditDietary(e.target.value)} placeholder="e.g. Vegetarian, Halal" />
              <Input label="Languages (comma-separated)" value={editLanguages} onChange={(e) => setEditLanguages(e.target.value)} placeholder="e.g. English, Amharic" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Accessibility Needs" value={editAccessibility} onChange={(e) => setEditAccessibility(e.target.value)} />
              <Input label="Preferred Accommodation" value={editAccomm} onChange={(e) => setEditAccomm(e.target.value)} />
            </div>
            <div className="tms-input-group"><label className="tms-input-label">Preferred Currency</label>
              <select className="tms-input" value={editCurrency} onChange={(e) => setEditCurrency(e.target.value)}>
                <option value="USD ($)">USD ($)</option><option value="EUR (€)">EUR (€)</option><option value="GBP (£)">GBP (£)</option><option value="ETB (Br)">ETB (Br)</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Customer Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          save(customers.filter((c) => c.id !== deleteTarget.id));
          setDeleteTarget(null);
        }}
        title="Delete Customer Profile"
        message={`Are you sure you want to permanently delete the profile for "${deleteTarget?.name}"?`}
        confirmText="Delete Profile"
        variant="danger"
      />
    </div>
  );
};

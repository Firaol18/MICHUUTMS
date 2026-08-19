import React, { useEffect, useState } from 'react';
import { PageHeader } from '@tms/shared/components/layout/PageHeader';
import type { Column } from '@tms/shared/components/data-display/DataTable';
import { DataTable } from '@tms/shared/components/data-display/DataTable';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { PermissionGuard } from '@tms/shared/components/common/PermissionGuard';
import { tourismService } from '@tms/shared/services/tourismService';
import type { TourGuide, GuideStatus, GuideAvailability } from '@tms/shared/types/guide';
import type { Booking } from '@tms/shared/types/booking';
import {
  RefreshCw, UserPlus, Edit, Trash2, Eye, Award, Calendar, DollarSign,
  Compass, CheckCircle2, Plus, Globe,
} from 'lucide-react';

function statusVariant(st: GuideStatus): 'success' | 'in-transit' | 'danger' {
  if (st === 'available') return 'success';
  if (st === 'on_tour') return 'in-transit';
  return 'danger';
}

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  padding: '0.4rem 0.875rem', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)',
  fontWeight: active ? 700 : 500, cursor: 'pointer',
  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
  backgroundColor: active ? 'var(--brand-primary-light)' : 'var(--bg-secondary)',
  border: '1px solid var(--border-color)', whiteSpace: 'nowrap',
});

const Section: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginTop: '0.5rem', marginBottom: '0.75rem' }}>
    {icon}{label}
  </div>
);

export const AdminGuidesPage: React.FC = () => {
  const [guides, setGuides] = useState<TourGuide[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStatus, setActiveStatus] = useState<GuideStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Detail Modal State
  const [detailGuide, setDetailGuide] = useState<TourGuide | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'certs' | 'availability' | 'tours' | 'payments'>('profile');
  const [guideBookings, setGuideBookings] = useState<Booking[]>([]);

  // Add Cert form
  const [certName, setCertName] = useState('');
  const [certIssuer, setCertIssuer] = useState('');
  const [certIssueDate, setCertIssueDate] = useState('');
  const [certExpiryDate, setCertExpiryDate] = useState('');

  // Add Payment form
  const [payTitle, setPayTitle] = useState('');
  const [payRef, setPayRef] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payStatus, setPayStatus] = useState<'paid' | 'pending' | 'withheld'>('paid');

  // Add Availability form
  const [availDate, setAvailDate] = useState('');
  const [availIsAvailable, setAvailIsAvailable] = useState(true);
  const [availNote, setAvailNote] = useState('');

  // Create / Edit Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editGuide, setEditGuide] = useState<TourGuide | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Form fields for Create/Edit
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formNationality, setFormNationality] = useState('Ethiopian');
  const [formBio, setFormBio] = useState('');
  const [formExpYears, setFormExpYears] = useState(5);
  const [formFee, setFormFee] = useState(100);
  const [formLanguages, setFormLanguages] = useState('Amharic, English');
  const [formSpecs, setFormSpecs] = useState('Eco-Trekking, Flora & Fauna');
  const [formAvatar, setFormAvatar] = useState('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
  const [formStatus, setFormStatus] = useState<GuideStatus>('available');

  const fetchGuides = async () => {
    setIsLoading(true);
    try {
      const data = await tourismService.getGuides();
      setGuides(data);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchGuides(); }, []);

  const openDetail = async (guide: TourGuide) => {
    setDetailGuide(guide);
    setActiveTab('profile');
    setIsDetailOpen(true);
    const allBookings = await tourismService.getBookings('all');
    const matched = allBookings.filter(
      (b) => b.assignedGuideName === guide.name || (guide.assignedTourIds && guide.assignedTourIds.includes(b.tourPackageId))
    );
    setGuideBookings(matched);
  };

  const handleStartCreate = () => {
    setFormName(''); setFormEmail(''); setFormPhone(''); setFormBio('');
    setFormNationality('Ethiopian'); setFormExpYears(5); setFormFee(100);
    setFormLanguages('Amharic, English'); setFormSpecs('Eco-Trekking, Cultural Tours');
    setFormAvatar('https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150');
    setFormStatus('available');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await tourismService.createGuide({
      name: formName,
      email: formEmail,
      phone: formPhone,
      nationality: formNationality,
      bio: formBio,
      experienceYears: Number(formExpYears),
      tourFee: Number(formFee),
      languages: formLanguages.split(',').map((s) => s.trim()).filter(Boolean),
      specializations: formSpecs.split(',').map((s) => s.trim()).filter(Boolean),
      avatarUrl: formAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
      status: formStatus,
      rating: 5.0,
      toursGuidedCount: 0,
    });
    setIsCreateOpen(false);
    fetchGuides();
  };

  const handleStartEdit = (g: TourGuide) => {
    setEditGuide(g);
    setFormName(g.name); setFormEmail(g.email); setFormPhone(g.phone);
    setFormNationality(g.nationality || 'Ethiopian'); setFormBio(g.bio || '');
    setFormExpYears(g.experienceYears || 5); setFormFee(g.tourFee || 100);
    setFormLanguages(g.languages ? g.languages.join(', ') : '');
    setFormSpecs(g.specializations ? g.specializations.join(', ') : '');
    setFormAvatar(g.avatarUrl || ''); setFormStatus(g.status);
    setIsEditOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuide) return;
    await tourismService.updateGuide(editGuide.id, {
      name: formName,
      email: formEmail,
      phone: formPhone,
      nationality: formNationality,
      bio: formBio,
      experienceYears: Number(formExpYears),
      tourFee: Number(formFee),
      languages: formLanguages.split(',').map((s) => s.trim()).filter(Boolean),
      specializations: formSpecs.split(',').map((s) => s.trim()).filter(Boolean),
      avatarUrl: formAvatar,
      status: formStatus,
    });
    setIsEditOpen(false);
    setEditGuide(null);
    fetchGuides();
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete guide "${name}"?`)) {
      await tourismService.deleteGuide(id);
      fetchGuides();
    }
  };

  const handleAddCert = async () => {
    if (!detailGuide || !certName || !certIssuer) return;
    const updated = await tourismService.addGuideCertification(detailGuide.id, {
      name: certName,
      issuedBy: certIssuer,
      issueDate: certIssueDate || new Date().toISOString().split('T')[0],
      expiryDate: certExpiryDate || '2028-12-31',
    });
    if (updated) setDetailGuide(updated);
    setCertName(''); setCertIssuer(''); setCertIssueDate(''); setCertExpiryDate('');
    fetchGuides();
  };

  const handleAddPayment = async () => {
    if (!detailGuide || !payTitle || !payAmount) return;
    const updated = await tourismService.addGuidePayment(detailGuide.id, {
      tourTitle: payTitle,
      bookingReference: payRef || `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().split('T')[0],
      amount: Number(payAmount),
      status: payStatus,
    });
    if (updated) setDetailGuide(updated);
    setPayTitle(''); setPayRef(''); setPayAmount('');
    fetchGuides();
  };

  const handleToggleAvailability = async () => {
    if (!detailGuide || !availDate) return;
    const existing = detailGuide.availability || [];
    const idx = existing.findIndex((a) => a.date === availDate);
    let newAvail: GuideAvailability[];
    if (idx >= 0) {
      newAvail = [...existing];
      newAvail[idx] = { date: availDate, isAvailable: availIsAvailable, note: availNote };
    } else {
      newAvail = [...existing, { date: availDate, isAvailable: availIsAvailable, note: availNote }];
    }
    const updated = await tourismService.updateGuideAvailability(detailGuide.id, newAvail);
    if (updated) setDetailGuide(updated);
    setAvailDate(''); setAvailNote('');
    fetchGuides();
  };

  const filteredGuides = guides.filter((g) => {
    const matchesStatus = activeStatus === 'all' || g.status === activeStatus;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      g.name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.languages.some((l) => l.toLowerCase().includes(q)) ||
      g.specializations.some((s) => s.toLowerCase().includes(q));
    return matchesStatus && matchesSearch;
  });

  const columns: Column<TourGuide>[] = [
    {
      header: 'Guide Roster',
      minWidth: '240px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 220 }}>
          <img src={row.avatarUrl} alt={row.name} style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-color)', flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)' }}>{row.name}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.specializations.join(' • ')}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Languages',
      minWidth: '150px',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {row.languages.map((l) => <Badge key={l} variant="info">{l}</Badge>)}
        </div>
      ),
    },
    {
      header: 'Exp & Daily Fee',
      minWidth: '130px',
      noWrap: true,
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>${row.tourFee || 100}/day</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.experienceYears || 5} Years Exp</div>
        </div>
      ),
    },
    {
      header: 'Tours & Rating',
      minWidth: '120px',
      noWrap: true,
      cell: (row) => (
        <div>
          <div style={{ fontWeight: 700, color: '#f59e0b', fontSize: 'var(--font-size-sm)' }}>★ {row.rating} / 5.0</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{row.toursGuidedCount} Guided</div>
        </div>
      ),
    },
    {
      header: 'Status',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => (
        <Badge variant={statusVariant(row.status)}>
          {row.status.replace('_', ' ').toUpperCase()}
        </Badge>
      ),
    },
    {
      header: 'Actions',
      minWidth: '150px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => openDetail(row)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#0284c7', padding: 2, display: 'inline-flex', alignItems: 'center' }}
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <PermissionGuard resource="guides" action="update">
            <button
              type="button"
              onClick={() => handleStartEdit(row)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#16a34a', padding: 2, display: 'inline-flex', alignItems: 'center' }}
              title="Edit Guide"
            >
              <Edit size={16} />
            </button>
          </PermissionGuard>
          <PermissionGuard resource="guides" action="delete">
            <button
              type="button"
              onClick={() => handleDelete(row.id, row.name)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: 2, display: 'inline-flex', alignItems: 'center' }}
              title="Delete Guide"
            >
              <Trash2 size={16} />
            </button>
          </PermissionGuard>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Certified Tour Guides & Eco-Rangers"
        description="Manage tour guide profiles, language capabilities, availability schedules, certifications, payments, and tour assignments."
        actions={
          <>
            <Button variant="secondary" size="sm" icon={<RefreshCw size={14} />} onClick={fetchGuides}>
              Refresh Roster
            </Button>
            <PermissionGuard resource="guides" action="create">
              <Button variant="primary" size="sm" icon={<UserPlus size={14} />} onClick={handleStartCreate}>
                Add New Guide
              </Button>
            </PermissionGuard>
          </>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex-between" style={{ marginBottom: '1.25rem', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {(['all', 'available', 'on_tour', 'off_duty'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setActiveStatus(st)}
              style={TAB_STYLE(activeStatus === st)}
            >
              {st.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredGuides}
        keyExtractor={(item) => item.id}
        isLoading={isLoading}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search guide name, language, or specialization..."
        entityName="guides"
      />

      {/* ─── GUIDE DETAIL MODAL ────────────────────────────────────── */}
      {isDetailOpen && detailGuide && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Guide Profile — ${detailGuide.name}`}
          footer={<Button variant="ghost" size="sm" onClick={() => setIsDetailOpen(false)}>Close</Button>}
        >
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
            {(['profile', 'certs', 'availability', 'tours', 'payments'] as const).map((t) => {
              const LABELS = { profile: '👤 Profile', certs: '📜 Certifications', availability: '📅 Availability', tours: '🗺️ Assigned Tours', payments: '💵 Payments & Payouts' };
              return <button key={t} onClick={() => setActiveTab(t)} style={TAB_STYLE(activeTab === t)}>{LABELS[t]}</button>;
            })}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: 'var(--font-size-sm)', minHeight: 300 }}>

            {/* TAB: PROFILE */}
            {activeTab === 'profile' && (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <img src={detailGuide.avatarUrl} alt={detailGuide.name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }} />
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)' }}>{detailGuide.name}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: 2 }}>
                      <Badge variant={statusVariant(detailGuide.status)}>{detailGuide.status.replace('_', ' ').toUpperCase()}</Badge>
                      <span>★ {detailGuide.rating} / 5.0 rating</span>
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-muted)', marginBottom: '0.25rem' }}>BIO / OVERVIEW</div>
                  <div style={{ color: 'var(--text-secondary)' }}>{detailGuide.bio || 'Professional tour guide specializing in Ethiopian expeditions.'}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Email</span>{detailGuide.email}</div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Phone</span>{detailGuide.phone}</div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Daily Rate</span><strong style={{ color: 'var(--status-success)' }}>${detailGuide.tourFee || 100} / day</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Experience</span><strong>{detailGuide.experienceYears || 5} Years</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Total Guided</span><strong>{detailGuide.toursGuidedCount} Expeditions</strong></div>
                  <div><span style={{ color: 'var(--text-muted)', display: 'block', fontSize: 11 }}>Nationality</span>{detailGuide.nationality || 'Ethiopian'}</div>
                </div>

                <Section icon={<Globe size={14} />} label="Languages & Skills" />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Spoken Languages</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {detailGuide.languages.map((l) => <Badge key={l} variant="info">{l}</Badge>)}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Specializations</span>
                    <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                      {detailGuide.specializations.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* TAB: CERTIFICATIONS */}
            {activeTab === 'certs' && (
              <>
                <Section icon={<Award size={14} />} label="Licenses & Certifications" />
                {!(detailGuide.certifications?.length) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No certifications recorded yet.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {detailGuide.certifications.map((c) => {
                      const isExpired = new Date(c.expiryDate) < new Date();
                      return (
                        <div key={c.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 700 }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Issued by: {c.issuedBy} · Valid until: {c.expiryDate}</div>
                          </div>
                          <Badge variant={isExpired ? 'danger' : 'success'}>
                            {isExpired ? 'EXPIRED' : 'VALID'}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)' }}>ADD NEW CERTIFICATION</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Input label="Cert Title *" value={certName} onChange={(e) => setCertName(e.target.value)} placeholder="e.g. First Aid Badge" />
                    <Input label="Issuing Authority *" value={certIssuer} onChange={(e) => setCertIssuer(e.target.value)} placeholder="e.g. Red Cross" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Input label="Issue Date" type="date" value={certIssueDate} onChange={(e) => setCertIssueDate(e.target.value)} />
                    <Input label="Expiry Date" type="date" value={certExpiryDate} onChange={(e) => setCertExpiryDate(e.target.value)} />
                  </div>
                  <Button variant="primary" size="sm" icon={<Plus size={14} />} onClick={handleAddCert} disabled={!certName || !certIssuer}>Add Certification</Button>
                </div>
              </>
            )}

            {/* TAB: AVAILABILITY */}
            {activeTab === 'availability' && (
              <>
                <Section icon={<Calendar size={14} />} label="Availability Schedule" />
                {!(detailGuide.availability?.length) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No specific availability dates configured. Default is available.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {detailGuide.availability.map((a, idx) => (
                      <div key={idx} style={{ padding: '0.625rem 0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 700 }}>{a.date}</span>
                          {a.note && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>({a.note})</span>}
                        </div>
                        <Badge variant={a.isAvailable ? 'success' : 'danger'}>
                          {a.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)' }}>SET DATE AVAILABILITY</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Input label="Target Date *" type="date" value={availDate} onChange={(e) => setAvailDate(e.target.value)} />
                    <div className="tms-input-group">
                      <label className="tms-input-label">Status</label>
                      <select className="tms-input" value={availIsAvailable ? 'yes' : 'no'} onChange={(e) => setAvailIsAvailable(e.target.value === 'yes')}>
                        <option value="yes">Available</option>
                        <option value="no">Unavailable / Off-duty</option>
                      </select>
                    </div>
                  </div>
                  <Input label="Note / Reason (Optional)" value={availNote} onChange={(e) => setAvailNote(e.target.value)} placeholder="e.g. Assigned to Lalibela group" />
                  <Button variant="primary" size="sm" icon={<Calendar size={14} />} onClick={handleToggleAvailability} disabled={!availDate}>Save Date Slot</Button>
                </div>
              </>
            )}

            {/* TAB: ASSIGNED TOURS */}
            {activeTab === 'tours' && (
              <>
                <Section icon={<Compass size={14} />} label="Assigned Tours & Passenger Manifests" />
                {guideBookings.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No active bookings currently assigned to this guide.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                    {guideBookings.map((b) => (
                      <div key={b.id} style={{ padding: '0.875rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{b.tourTitle}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
                            Ref #{b.bookingReference} · Departure: <strong>{b.travelDate}</strong> · Guests: {b.numberOfTravelers} ({b.traveler.name})
                          </div>
                        </div>
                        <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : 'warning'}>
                          {b.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* TAB: PAYMENTS */}
            {activeTab === 'payments' && (
              <>
                <Section icon={<DollarSign size={14} />} label="Payout & Earnings History" />
                {!(detailGuide.paymentHistory?.length) ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>No payment records found.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {detailGuide.paymentHistory.map((p) => (
                      <div key={p.id} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{p.tourTitle}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ref: {p.bookingReference} · Paid Date: {p.date}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: 'var(--font-size-md)' }}>${p.amount}</div>
                          <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status.toUpperCase()}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ fontWeight: 700, fontSize: 11, color: 'var(--text-secondary)' }}>RECORD GUIDE PAYOUT</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Input label="Tour Title *" value={payTitle} onChange={(e) => setPayTitle(e.target.value)} placeholder="e.g. Simien Mountains Trek" />
                    <Input label="Booking Ref" value={payRef} onChange={(e) => setPayRef(e.target.value)} placeholder="e.g. MCH-BKG-101" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                    <Input label="Amount ($USD) *" type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} placeholder="e.g. 350" />
                    <div className="tms-input-group">
                      <label className="tms-input-label">Payout Status</label>
                      <select className="tms-input" value={payStatus} onChange={(e) => setPayStatus(e.target.value as 'paid' | 'pending' | 'withheld')}>
                        <option value="paid">Paid</option>
                        <option value="pending">Pending</option>
                        <option value="withheld">Withheld</option>
                      </select>
                    </div>
                  </div>
                  <Button variant="primary" size="sm" icon={<DollarSign size={14} />} onClick={handleAddPayment} disabled={!payTitle || !payAmount}>Record Payout</Button>
                </div>
              </>
            )}

          </div>
        </Modal>
      )}

      {/* ─── CREATE GUIDE MODAL ─────────────────────────────────────── */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="Register New Certified Tour Guide"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit} icon={<UserPlus size={14} />}>Save & Register</Button>
          </div>
        }>
        <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Full Name *" value={formName} onChange={(e) => setFormName(e.target.value)} required />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Email Address *" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
            <Input label="Phone Number *" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            <Input label="Nationality" value={formNationality} onChange={(e) => setFormNationality(e.target.value)} />
            <Input label="Years Experience" type="number" value={formExpYears} onChange={(e) => setFormExpYears(Number(e.target.value))} />
            <Input label="Daily Fee ($USD)" type="number" value={formFee} onChange={(e) => setFormFee(Number(e.target.value))} />
          </div>
          <Input label="Spoken Languages (comma-separated) *" value={formLanguages} onChange={(e) => setFormLanguages(e.target.value)} placeholder="Amharic, English, French" required />
          <Input label="Specializations (comma-separated) *" value={formSpecs} onChange={(e) => setFormSpecs(e.target.value)} placeholder="Trekking, Wildlife, History" required />
          <Input label="Bio / Overview" value={formBio} onChange={(e) => setFormBio(e.target.value)} placeholder="Brief description of guide experience..." />
          <Input label="Avatar Image URL" value={formAvatar} onChange={(e) => setFormAvatar(e.target.value)} />
        </form>
      </Modal>

      {/* ─── EDIT GUIDE MODAL ───────────────────────────────────────── */}
      {isEditOpen && editGuide && (
        <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title={`Edit Guide — ${editGuide.name}`}
          footer={
            <div className="flex-between" style={{ width: '100%' }}>
              <Button variant="ghost" size="sm" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit} icon={<CheckCircle2 size={14} />}>Save Changes</Button>
            </div>
          }>
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Input label="Full Name *" value={formName} onChange={(e) => setFormName(e.target.value)} required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input label="Email Address *" type="email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
              <Input label="Phone Number *" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} required />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <Input label="Nationality" value={formNationality} onChange={(e) => setFormNationality(e.target.value)} />
              <Input label="Years Exp" type="number" value={formExpYears} onChange={(e) => setFormExpYears(Number(e.target.value))} />
              <Input label="Daily Fee ($USD)" type="number" value={formFee} onChange={(e) => setFormFee(Number(e.target.value))} />
            </div>
            <div className="tms-input-group">
              <label className="tms-input-label">Availability Status</label>
              <select className="tms-input" value={formStatus} onChange={(e) => setFormStatus(e.target.value as GuideStatus)}>
                <option value="available">Available</option>
                <option value="on_tour">On Tour</option>
                <option value="off_duty">Off Duty</option>
              </select>
            </div>
            <Input label="Languages (comma-separated)" value={formLanguages} onChange={(e) => setFormLanguages(e.target.value)} />
            <Input label="Specializations (comma-separated)" value={formSpecs} onChange={(e) => setFormSpecs(e.target.value)} />
            <Input label="Bio / Overview" value={formBio} onChange={(e) => setFormBio(e.target.value)} />
          </form>
        </Modal>
      )}

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { tourismService } from '@/services/tourismService';
import { useAuthStore } from '@/store/useAuthStore';
import type { TourGuide, GuideStatus, GuideAvailability } from '@/types/guide';
import type { Booking } from '@/types/booking';
import {
  Compass, Calendar, Award, DollarSign, User,
  ShieldCheck, MapPin, Users,
} from 'lucide-react';

const TAB_STYLE = (active: boolean): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.75rem 1.25rem',
  borderBottom: active ? '2px solid var(--brand-primary)' : '2px solid transparent',
  fontWeight: active ? 700 : 500,
  cursor: 'pointer',
  fontSize: 'var(--font-size-sm)',
  color: active ? 'var(--brand-primary)' : 'var(--text-secondary)',
  backgroundColor: 'transparent',
  transition: 'all 0.15s',
  whiteSpace: 'nowrap',
});

function statusVariant(st: GuideStatus): 'success' | 'in-transit' | 'danger' {
  if (st === 'available') return 'success';
  if (st === 'on_tour') return 'in-transit';
  return 'danger';
}

export const GuideDashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [guide, setGuide] = useState<TourGuide | null>(null);
  const [assignedBookings, setAssignedBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'tours' | 'schedule' | 'certs' | 'earnings' | 'profile'>('tours');

  // Availability add state
  const [newAvailDate, setNewAvailDate] = useState('');
  const [newAvailStatus, setNewAvailStatus] = useState(true);
  const [newAvailNote, setNewAvailNote] = useState('');

  const loadGuideData = async () => {
    setIsLoading(true);
    try {
      const allGuides = await tourismService.getGuides();
      // Match logged in user or pick first guide as active demo
      const matched = allGuides.find((g) => g.email === user?.email) || allGuides[0];
      setGuide(matched);

      if (matched) {
        const allBookings = await tourismService.getBookings('all');
        const matchedBkg = allBookings.filter(
          (b) => b.assignedGuideName === matched.name || (matched.assignedTourIds && matched.assignedTourIds.includes(b.tourPackageId))
        );
        setAssignedBookings(matchedBkg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadGuideData(); }, [user?.email]);

  const handleStatusChange = async (newStatus: GuideStatus) => {
    if (!guide) return;
    const updated = await tourismService.updateGuide(guide.id, { status: newStatus });
    if (updated) setGuide(updated);
  };

  const handleAddAvailability = async () => {
    if (!guide || !newAvailDate) return;
    const existing = guide.availability || [];
    const idx = existing.findIndex((a) => a.date === newAvailDate);
    let updatedSchedule: GuideAvailability[];
    if (idx >= 0) {
      updatedSchedule = [...existing];
      updatedSchedule[idx] = { date: newAvailDate, isAvailable: newAvailStatus, note: newAvailNote };
    } else {
      updatedSchedule = [...existing, { date: newAvailDate, isAvailable: newAvailStatus, note: newAvailNote }];
    }
    const updated = await tourismService.updateGuideAvailability(guide.id, updatedSchedule);
    if (updated) setGuide(updated);
    setNewAvailDate(''); setNewAvailNote('');
  };

  if (isLoading) return <LoadingSpinner label="Loading Ranger Guide Dashboard..." />;
  if (!guide) return <div>No guide profile found.</div>;

  const totalPaid = (guide.paymentHistory || [])
    .filter((p) => p.status === 'paid')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalPending = (guide.paymentHistory || [])
    .filter((p) => p.status === 'pending')
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem 1.5rem' }}>

      {/* Hero / Profile Header */}
      <Card glass style={{ padding: '1.75rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <img
              src={guide.avatarUrl}
              alt={guide.name}
              style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--brand-primary)' }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {guide.name}
                </h1>
                <Badge variant={statusVariant(guide.status)}>
                  {guide.status.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                Certified Eco-Ranger & Trekking Guide · {guide.experienceYears || 5} Years Experience
              </p>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', fontSize: 'var(--font-size-xs)' }}>
                <span style={{ fontWeight: 700, color: '#f59e0b' }}>★ {guide.rating} Rating</span>
                <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>🏆 {guide.toursGuidedCount} Expeditions Guided</span>
                <span style={{ fontWeight: 700, color: 'var(--status-success)' }}>💵 ${guide.tourFee || 100} / day</span>
              </div>
            </div>
          </div>

          {/* Quick Status Switcher */}
          <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              SET MY CURRENT STATUS
            </label>
            <select
              value={guide.status}
              onChange={(e) => handleStatusChange(e.target.value as GuideStatus)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-secondary)',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                color: 'var(--text-primary)',
              }}
            >
              <option value="available">🟢 AVAILABLE FOR ASSIGNMENT</option>
              <option value="on_tour">🛺 ON TOUR / EXPEDITION</option>
              <option value="off_duty">🔴 OFF DUTY / RESTING</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Main Tabbed Container */}
      <Card glass style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
          {[
            { key: 'tours', label: `My Expeditions (${assignedBookings.length})`, icon: <Compass size={15} /> },
            { key: 'schedule', label: 'Availability Calendar', icon: <Calendar size={15} /> },
            { key: 'certs', label: `Licenses & Certs (${(guide.certifications || []).length})`, icon: <Award size={15} /> },
            { key: 'earnings', label: 'Earnings & Payouts', icon: <DollarSign size={15} /> },
            { key: 'profile', label: 'Guide Bio & Skills', icon: <User size={15} /> },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as typeof activeTab)}
              style={TAB_STYLE(activeTab === t.key)}
            >
              {t.icon}{t.label}
            </button>
          ))}
        </div>

        <div style={{ padding: '2rem' }}>

          {/* TAB 1: ASSIGNED EXPEDITIONS */}
          {activeTab === 'tours' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Assigned Tour Expeditions & Passenger Manifests</h3>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Assigned by Tour Operations Team</span>
              </div>

              {assignedBookings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  <Compass size={40} style={{ margin: '0 auto 0.75rem auto', opacity: 0.5 }} />
                  <h4>No upcoming tour assignments found.</h4>
                  <p style={{ fontSize: 'var(--font-size-xs)' }}>
                    When tour operators assign you to lead a group expedition, details will appear here.
                  </p>
                </div>
              ) : (
                assignedBookings.map((b) => (
                  <Card key={b.id} style={{ padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                    <div className="flex-between" style={{ flexWrap: 'wrap', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
                      <div>
                        <div style={{ fontSize: 11, color: 'var(--brand-primary)', fontWeight: 700 }}>
                          Booking Ref #{b.bookingReference}
                        </div>
                        <h4 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, marginTop: 2 }}>{b.tourTitle}</h4>
                      </div>
                      <Badge variant={b.status === 'confirmed' || b.status === 'completed' ? 'success' : 'warning'}>
                        {b.status.toUpperCase()}
                      </Badge>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '0.875rem', fontSize: 'var(--font-size-xs)' }}>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Destination</span>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <MapPin size={13} style={{ color: 'var(--brand-primary)' }} />{b.destinationName}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Departure Date</span>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Calendar size={13} style={{ color: 'var(--brand-primary)' }} />{b.travelDate}
                        </span>
                      </div>
                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block' }}>Passenger Group</span>
                        <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                          <Users size={13} style={{ color: 'var(--brand-primary)' }} />{b.numberOfTravelers} Guests ({b.numberOfAdults ?? b.numberOfTravelers}A / {b.numberOfChildren ?? 0}C)
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)', marginTop: '0.875rem', fontSize: 'var(--font-size-xs)' }}>
                      <div>Lead Traveler: <strong>{b.traveler.name}</strong> ({b.traveler.email} · {b.traveler.phone})</div>
                      {b.traveler.specialRequests && (
                        <div style={{ marginTop: 4, color: '#b45309', fontWeight: 600 }}>
                          ⚠ Special Request: {b.traveler.specialRequests}
                        </div>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}

          {/* TAB 2: SCHEDULE */}
          {activeTab === 'schedule' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>My Availability Calendar & Off-Duty Requests</h3>

              {!(guide.availability?.length) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                  No specific date restrictions set. You are listed as available by default.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {guide.availability.map((a, idx) => (
                    <div key={idx} style={{ padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontWeight: 700 }}>{a.date}</span>
                        {a.note && <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: '0.75rem' }}>({a.note})</span>}
                      </div>
                      <Badge variant={a.isAvailable ? 'success' : 'danger'}>
                        {a.isAvailable ? 'AVAILABLE' : 'UNAVAILABLE / OFF-DUTY'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  UPDATE MY AVAILABILITY FOR A SPECIFIC DATE
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <Input label="Date *" type="date" value={newAvailDate} onChange={(e) => setNewAvailDate(e.target.value)} />
                  <div className="tms-input-group">
                    <label className="tms-input-label">Status</label>
                    <select className="tms-input" value={newAvailStatus ? 'yes' : 'no'} onChange={(e) => setNewAvailStatus(e.target.value === 'yes')}>
                      <option value="yes">Available for Booking</option>
                      <option value="no">Unavailable / Off-Duty</option>
                    </select>
                  </div>
                </div>
                <Input label="Reason / Note (Optional)" placeholder="e.g. Off-duty for training, Personal leave" value={newAvailNote} onChange={(e) => setNewAvailNote(e.target.value)} />
                <Button variant="primary" size="sm" icon={<Calendar size={14} />} onClick={handleAddAvailability} disabled={!newAvailDate}>
                  Save Availability Slot
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: CERTIFICATIONS */}
          {activeTab === 'certs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>My Professional Licenses & Ranger Certifications</h3>

              {!(guide.certifications?.length) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>No certifications listed.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {guide.certifications.map((c) => {
                    const isExpired = new Date(c.expiryDate) < new Date();
                    return (
                      <div key={c.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <ShieldCheck size={24} style={{ color: isExpired ? '#ef4444' : 'var(--brand-primary)' }} />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>{c.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Authority: {c.issuedBy} · Issued: {c.issueDate} · Expires: {c.expiryDate}
                            </div>
                          </div>
                        </div>
                        <Badge variant={isExpired ? 'danger' : 'success'}>
                          {isExpired ? 'EXPIRED' : 'VALID & CERTIFIED'}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EARNINGS */}
          {activeTab === 'earnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div style={{ padding: '1.25rem', backgroundColor: 'rgba(22,163,74,0.08)', border: '1px solid rgba(22,163,74,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>TOTAL PAID OUT</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#16a34a', marginTop: 4 }}>${totalPaid.toLocaleString()}</div>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#b45309' }}>PENDING PAYOUTS</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: '#b45309', marginTop: 4 }}>${totalPending.toLocaleString()}</div>
                </div>
                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>DAILY RATE</div>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>${guide.tourFee || 100} / day</div>
                </div>
              </div>

              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Payout History</h4>
              {!(guide.paymentHistory?.length) ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>No payout records available yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {guide.paymentHistory.map((p) => (
                    <div key={p.id} style={{ padding: '0.875rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontWeight: 700 }}>{p.tourTitle}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ref: {p.bookingReference} · Date: {p.date}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 800, color: 'var(--status-success)', fontSize: 'var(--font-size-md)' }}>${p.amount}</div>
                        <Badge variant={p.status === 'paid' ? 'success' : 'warning'}>{p.status.toUpperCase()}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: PROFILE & SKILLS */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>Guide Profile Details</h3>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>BIOGRAPHY & OVERVIEW</div>
                <div>{guide.bio || 'Experienced tour guide.'}</div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-xs)' }}>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Email</span>{guide.email}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Phone</span>{guide.phone}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Nationality</span>{guide.nationality || 'Ethiopian'}</div>
                <div><span style={{ color: 'var(--text-muted)', display: 'block' }}>Years Experience</span>{guide.experienceYears || 5} Years</div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>SPOKEN LANGUAGES</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {guide.languages.map((l) => <Badge key={l} variant="info">{l}</Badge>)}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>SPECIALIZATIONS</div>
                <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                  {guide.specializations.map((s) => <Badge key={s} variant="success">{s}</Badge>)}
                </div>
              </div>
            </div>
          )}

        </div>
      </Card>
    </div>
  );
};

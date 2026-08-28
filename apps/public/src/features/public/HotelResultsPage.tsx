import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import type { HotelResult, HotelSearchParams, HotelRoom } from '@tms/shared/types/corporate';
import { generateMockHotels } from '@tms/shared/services/mockHotelData';
import { corporateService } from '@tms/shared/services/corporateService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import {
  Hotel,
  MapPin,
  Star,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Wifi,
  Coffee,
  Calendar,
  Users,
  Building,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { isCorporateRole } from '@tms/shared/types/rbac';

export const HotelResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const isCorporate = user && isCorporateRole(user.role);
  const isManager = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';

  // Company employees for booking selection (live from real API)
  const [companyEmployees, setCompanyEmployees] = useState<any[]>([]);

  useEffect(() => {
    if (!isCorporate || !user?.companyId) return;
    corporateService.getMembers(user.companyId, { limit: 100 })
      .then((res) => {
        if (res?.items?.length) {
          setCompanyEmployees(res.items.map((m) => ({
            id: m.id,
            name: m.userName || (m as any).user?.name || 'Employee',
            email: m.userEmail || (m as any).user?.email || '',
            department: m.department?.name || 'General',
            corporateRole: m.corporateRole,
          })));
        } else {
          setCompanyEmployees([{ id: user.id, name: user.name, email: user.email, department: user.departmentName || 'General', corporateRole: user.role }]);
        }
      })
      .catch(() => {
        setCompanyEmployees([{ id: user.id, name: user.name, email: user.email, department: user.departmentName || 'General', corporateRole: user.role }]);
      });
  }, [isCorporate, user?.companyId, user?.id, user?.name, user?.email, user?.departmentName, user?.role]);

  const searchParams = useMemo<HotelSearchParams>(() => {
    const query = new URLSearchParams(location.search);
    return (
      (location.state as any)?.params || {
        destination: query.get('destination') || 'Addis Ababa',
        destinationCity: query.get('destinationCity') || 'Addis Ababa',
        checkIn: query.get('checkIn') || new Date().toISOString().split('T')[0],
        checkOut: query.get('checkOut') || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
        rooms: Number(query.get('rooms')) || 1,
        guests: Number(query.get('guests')) || 1,
      }
    );
  }, [location]);

  const allHotels = useMemo(() => generateMockHotels(searchParams), [searchParams]);

  // Filters & State
  const [minStarRating, setMinStarRating] = useState<number | 'ALL'>('ALL');
  const [policyFilter, setPolicyFilter] = useState<'ALL' | 'WITHIN' | 'APPROVAL'>('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_ASC' | 'PRICE_DESC' | 'RATING'>('PRICE_ASC');
  const [expandedHotelId, setExpandedHotelId] = useState<string | null>(null);

  // Booking Modal
  const [selectedHotel, setSelectedHotel] = useState<HotelResult | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<HotelRoom | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>(user?.id || 'c-usr-4');
  const [travelerName, setTravelerName] = useState(user?.name || 'Mekdes Girma');
  const [travelerEmail, setTravelerEmail] = useState(user?.email || 'mekdes.girma@ethiopianairlines.com');
  const [department, setDepartment] = useState(user?.departmentName || user?.department || 'Sales & BD');
  const [businessJustification, setBusinessJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSelectEmployee = (empId: string) => {
    setSelectedEmployeeId(empId);
    const emp = companyEmployees.find((e) => e.id === empId);
    if (emp) {
      setTravelerName(emp.name);
      setTravelerEmail(emp.email);
      setDepartment(emp.departmentName || emp.department || 'Operations');
    }
  };

  const filteredHotels = useMemo(() => {
    return allHotels
      .filter((h) => {
        if (minStarRating !== 'ALL' && h.starRating < minStarRating) return false;
        if (policyFilter === 'WITHIN' && h.policyStatus !== 'WITHIN_POLICY') return false;
        if (policyFilter === 'APPROVAL' && h.policyStatus === 'OUT_OF_POLICY') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.lowestPricePerNight - b.lowestPricePerNight;
        if (sortBy === 'PRICE_DESC') return b.lowestPricePerNight - a.lowestPricePerNight;
        if (sortBy === 'RATING') return b.reviewScore - a.reviewScore;
        return 0;
      });
  }, [allHotels, minStarRating, policyFilter, sortBy]);

  const handleOpenBooking = (hotel: HotelResult, room?: HotelRoom) => {
    setSelectedHotel(hotel);
    setSelectedRoom(room || hotel.rooms[0]);
    setIsBookingModalOpen(true);
    setBookingSuccess(false);
    if (user) {
      setTravelerName(user.name);
      setTravelerEmail(user.email);
      setDepartment(user.departmentName || user.department || 'Operations');
    }
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedHotel || !selectedRoom) return;
    setIsSubmitting(true);
    try {
      const isApprovalNeeded = selectedHotel.policyStatus !== 'WITHIN_POLICY';
      const totalAmount = selectedRoom.pricePerNight * (selectedHotel.nights || 2);
      const companyId = user?.companyId || 'comp-1';
      const companyName = user?.companyName || 'Ethiopian Airlines Group';

      await corporateService.addCorporateBooking({
        type: 'HOTEL',
        status: isApprovalNeeded ? 'PENDING_APPROVAL' : 'CONFIRMED',
        companyId,
        companyName,
        travelerId: isManager ? selectedEmployeeId : (user?.id || 'usr-sample'),
        travelerName,
        travelerEmail,
        departmentName: department,
        totalAmount,
        currency: selectedHotel.currency,
        policyStatus: selectedHotel.policyStatus || 'WITHIN_POLICY',
        businessPurpose: businessJustification || `${selectedHotel.name} (${selectedRoom.name}) in ${selectedHotel.city}`,
        policyViolationReason: isApprovalNeeded ? (selectedHotel.policyNote || `Nightly rate $${selectedRoom.pricePerNight} exceeds hotel cap`) : undefined,
        hotelData: {
          hotelName: selectedHotel.name,
          roomType: selectedRoom.name,
          checkIn: searchParams.checkIn,
          checkOut: searchParams.checkOut,
          nights: selectedHotel.nights || 3,
        },
        notes: `${selectedHotel.name} (${selectedRoom.name}) in ${selectedHotel.city}. Reason: ${businessJustification || 'Business Stay'}`,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setIsBookingModalOpen(false);
        setBookingSuccess(false);
        if (isCorporate) {
          navigate('/corporate/bookings');
        } else {
          navigate('/my-bookings');
        }
      }, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem', minHeight: '85vh' }}>
      {/* ── Top Summary Strip ── */}
      <Card
        glass
        style={{
          padding: '1.25rem 2rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.06) 0%, rgba(6,182,212,0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: '#059669',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(5,150,105,0.25)',
            }}
          >
            <Hotel size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
              Hotel Stays in {searchParams.destinationCity || searchParams.destination}
            </h2>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Check-in: {searchParams.checkIn}</span>
              <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Check-out: {searchParams.checkOut}</span>
              <span><Building size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {searchParams.rooms} Room(s)</span>
              <span><Users size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {searchParams.guests} Guest(s)</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/hotels')}>
          Modify Search
        </Button>
      </Card>

      {/* ── Main Layout: Sidebar Filters + Hotel Results ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Filter Sidebar */}
        <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} /> Filters
            </span>
            <button
              onClick={() => {
                setMinStarRating('ALL');
                setPolicyFilter('ALL');
              }}
              style={{ background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* Policy Compliance */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Corporate Rate Policy
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { id: 'ALL', label: 'All Hotels' },
                { id: 'WITHIN', label: '✓ Within Rate Cap ($200)' },
                { id: 'APPROVAL', label: 'In-Policy & Approvals' },
              ].map((opt) => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="hotelPolicyFilter"
                    checked={policyFilter === opt.id}
                    onChange={() => setPolicyFilter(opt.id as any)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Star Rating */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Hotel Class
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 'ALL', label: 'Any Star Class' },
                { val: 5, label: '5-Star Luxury Hotels' },
                { val: 4, label: '4-Star & Up Premium' },
              ].map((s) => (
                <label key={String(s.val)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="minStarRating"
                    checked={minStarRating === s.val}
                    onChange={() => setMinStarRating(s.val as any)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Hotel Cards List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Showing {filteredHotels.length} Partner Hotels
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="PRICE_ASC">Lowest Nightly Rate</option>
                <option value="PRICE_DESC">Highest Nightly Rate</option>
                <option value="RATING">Guest Review Rating</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {filteredHotels.map((hotel) => {
              const isWithin = hotel.policyStatus === 'WITHIN_POLICY';
              const isApproval = hotel.policyStatus === 'REQUIRES_APPROVAL';
              const isExpanded = expandedHotelId === hotel.id;

              return (
                <Card
                  key={hotel.id}
                  glass
                  style={{
                    padding: 0,
                    overflow: 'hidden',
                    border: isWithin
                      ? '1px solid rgba(22,163,74,0.3)'
                      : isApproval
                        ? '1px solid rgba(245,158,11,0.3)'
                        : '1px solid rgba(239,68,68,0.3)',
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr auto', gap: '1.5rem', padding: '1.5rem', alignItems: 'center' }}>
                    {/* Hotel Image */}
                    <div
                      style={{
                        height: '160px',
                        borderRadius: '12px',
                        backgroundImage: `url(${hotel.imageUrl})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        position: 'relative',
                      }}
                    >
                      <div style={{ position: 'absolute', top: 8, left: 8 }}>
                        <span style={{ backgroundColor: 'rgba(0,0,0,0.7)', color: '#fbbf24', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                          {'★'.repeat(hotel.starRating)}
                        </span>
                      </div>
                    </div>

                    {/* Hotel Info */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                          {hotel.name}
                        </h3>
                        {isWithin && (
                          <Badge variant="success" icon={<ShieldCheck size={12} />}>
                            Within Rate Policy
                          </Badge>
                        )}
                        {isApproval && (
                          <Badge variant="warning" icon={<AlertTriangle size={12} />}>
                            Approval Needed
                          </Badge>
                        )}
                      </div>

                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.6rem' }}>
                        <MapPin size={13} style={{ color: '#059669' }} /> {hotel.address}
                      </div>

                      {/* Amenities pills */}
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                        {hotel.amenities.slice(0, 4).map((a) => (
                          <span
                            key={a.name}
                            style={{
                              fontSize: '10px',
                              backgroundColor: 'var(--bg-tertiary)',
                              color: 'var(--text-secondary)',
                              padding: '0.2rem 0.5rem',
                              borderRadius: '4px',
                              fontWeight: 600,
                            }}
                          >
                            ✓ {a.name}
                          </span>
                        ))}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <strong style={{ color: 'var(--brand-primary)' }}>{hotel.reviewScore}/10</strong> ({hotel.reviewLabel}) • {hotel.reviewCount.toLocaleString()} verified traveler reviews
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div style={{ textAlign: 'right', paddingLeft: '1rem', borderLeft: '1px solid var(--border-color)', minWidth: '160px' }}>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>From / Night</div>
                      <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#059669' }}>
                        ${hotel.lowestPricePerNight}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Total: ${hotel.totalPrice} ({hotel.nights} Nights)
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <Button
                          variant={isWithin ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleOpenBooking(hotel)}
                          style={{ width: '100%', backgroundColor: isWithin ? '#059669' : undefined, borderColor: isWithin ? '#059669' : undefined }}
                        >
                          {isWithin ? 'Book Hotel' : 'Request Approval'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedHotelId(isExpanded ? null : hotel.id)}
                          icon={isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          style={{ fontSize: '11px', padding: '0.25rem' }}
                        >
                          {isExpanded ? 'Hide Rooms' : 'View Rooms'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Rooms breakdown */}
                  {isExpanded && (
                    <div style={{ padding: '1.25rem 1.5rem', backgroundColor: 'var(--bg-tertiary)', borderTop: '1px solid var(--border-color)' }}>
                      <h4 style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Available Corporate Room Rates
                      </h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {hotel.rooms.map((room) => (
                          <div
                            key={room.id}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '0.75rem 1rem',
                              backgroundColor: 'var(--bg-primary)',
                              borderRadius: '8px',
                              border: '1px solid var(--border-color)',
                            }}
                          >
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                                {room.name}
                              </div>
                              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                                Bed: <strong>{room.bedType}</strong> • Max {room.maxGuests} Guests • {room.breakfastIncluded ? '✓ Breakfast Included' : 'Room Only'}
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                              <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: '#059669' }}>
                                  ${room.pricePerNight} <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>/ night</span>
                                </div>
                              </div>
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenBooking(hotel, room)}
                                style={{ backgroundColor: '#059669', borderColor: '#059669', fontSize: '11px' }}
                              >
                                Select Room
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Booking Modal ── */}
      {isBookingModalOpen && selectedHotel && selectedRoom && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
        >
          <Card
            glass
            style={{
              width: '100%',
              maxWidth: '560px',
              padding: '2rem',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: '16px',
              boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
            }}
          >
            {bookingSuccess ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(5,150,105,0.15)', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                  {selectedHotel.policyStatus === 'WITHIN_POLICY' ? 'Hotel Stay Reserved!' : 'Approval Request Submitted'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                  {selectedHotel.policyStatus === 'WITHIN_POLICY'
                    ? `Your stay at ${selectedHotel.name} has been confirmed.`
                    : 'Your manager has received the hotel reservation request for approval.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                    {selectedHotel.policyStatus === 'WITHIN_POLICY' ? 'Confirm Hotel Reservation' : 'Submit Hotel Approval Request'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsBookingModalOpen(false)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem', color: 'var(--text-muted)' }}
                  >
                    ✕
                  </button>
                </div>

                <div style={{ padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: 'var(--bg-secondary)', marginBottom: '1.25rem', fontSize: 'var(--font-size-xs)' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                    {selectedHotel.name} — {selectedRoom.name}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    ${selectedRoom.pricePerNight}/night • Total: <strong>${selectedRoom.pricePerNight * (selectedHotel.nights || 2)} USD</strong> ({selectedHotel.nights} Nights)
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
                  {isManager && companyEmployees.length > 0 && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(5,150,105,0.06)', border: '1px solid rgba(5,150,105,0.2)' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: '#059669', display: 'block', marginBottom: '0.35rem' }}>
                        👤 Booking For Employee (Company Directory)
                      </label>
                      <select
                        value={selectedEmployeeId}
                        onChange={(e) => handleSelectEmployee(e.target.value)}
                        style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                      >
                        {companyEmployees.map((emp) => (
                          <option key={emp.id} value={emp.id}>
                            {emp.name} — {emp.jobTitle || emp.department} ({emp.corporateRole.replace('_', ' ')})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Primary Guest Name
                    </label>

                    <input
                      type="text"
                      value={travelerName}
                      onChange={(e) => setTravelerName(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Corporate Email
                    </label>
                    <input
                      type="email"
                      value={travelerEmail}
                      onChange={(e) => setTravelerEmail(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      required
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, display: 'block', marginBottom: '0.3rem' }}>
                      Business Purpose / Notes
                    </label>
                    <textarea
                      rows={3}
                      value={businessJustification}
                      onChange={(e) => setBusinessJustification(e.target.value)}
                      placeholder="e.g. Executive meetings, client on-site inspection..."
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" type="button" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: '#059669', borderColor: '#059669' }}
                  >
                    {isSubmitting
                      ? 'Processing...'
                      : selectedHotel.policyStatus === 'WITHIN_POLICY'
                        ? 'Confirm Stay'
                        : 'Submit for Manager Approval'}
                  </Button>
                </div>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card } from '@tms/shared/components/common/Card';
import { Badge } from '@tms/shared/components/common/Badge';
import { Button } from '@tms/shared/components/common/Button';
import type { FlightResult, FlightSearchParams } from '@tms/shared/types/corporate';
import { generateMockFlights, AIRPORTS } from '@tms/shared/services/mockFlightData';
import { corporateService } from '@tms/shared/services/corporateService';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import {
  Plane,
  ArrowRight,
  Clock,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Filter,
  SlidersHorizontal,
  Luggage,
  Calendar,
  Users,
  Building,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

import { isCorporateRole } from '@tms/shared/types/rbac';
import { INITIAL_CORPORATE_USERS } from '@tms/shared/services/corporateService';

export const FlightResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const isCorporate = user && isCorporateRole(user.role);
  const isManager = user?.role === 'CORPORATE_ADMIN' || user?.role === 'TRAVEL_MANAGER';

  // Company employees for booking selection
  const companyEmployees = useMemo(() => {
    const cid = user?.companyId || 'comp-1';
    return INITIAL_CORPORATE_USERS.filter((u) => u.companyId === cid);
  }, [user]);

  const searchParams = useMemo<FlightSearchParams>(() => {
    const query = new URLSearchParams(location.search);
    return (
      (location.state as any)?.params || {
        tripType: (query.get('tripType') as any) || 'ROUND_TRIP',
        origin: query.get('origin') || 'ADD',
        destination: query.get('destination') || 'DXB',
        departureDate: query.get('departureDate') || new Date().toISOString().split('T')[0],
        returnDate: query.get('returnDate') || undefined,
        passengers: Number(query.get('passengers')) || 1,
        cabinClass: (query.get('cabinClass') as any) || 'ECONOMY',
      }
    );
  }, [location]);

  const allFlights = useMemo(() => generateMockFlights(searchParams), [searchParams]);

  // Filters & Sorting
  const [selectedAirline, setSelectedAirline] = useState<string>('ALL');
  const [maxStops, setMaxStops] = useState<number | 'ALL'>('ALL');
  const [policyFilter, setPolicyFilter] = useState<'ALL' | 'WITHIN' | 'APPROVAL'>('ALL');
  const [sortBy, setSortBy] = useState<'PRICE_ASC' | 'PRICE_DESC' | 'DURATION'>('PRICE_ASC');

  // Booking Modal
  const [selectedFlight, setSelectedFlight] = useState<FlightResult | null>(null);
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

  const getCity = (code: string) => {
    const a = AIRPORTS.find((x) => x.code === code);
    return a ? `${a.city} (${a.code})` : code;
  };

  const filteredFlights = useMemo(() => {
    return allFlights
      .filter((f) => {
        if (selectedAirline !== 'ALL' && f.outbound.airline !== selectedAirline) return false;
        if (maxStops !== 'ALL' && f.outbound.stops > maxStops) return false;
        if (policyFilter === 'WITHIN' && f.policyStatus !== 'WITHIN_POLICY') return false;
        if (policyFilter === 'APPROVAL' && f.policyStatus === 'OUT_OF_POLICY') return false;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'PRICE_ASC') return a.totalPrice - b.totalPrice;
        if (sortBy === 'PRICE_DESC') return b.totalPrice - a.totalPrice;
        return 0;
      });
  }, [allFlights, selectedAirline, maxStops, policyFilter, sortBy]);

  const handleOpenBooking = (flight: FlightResult) => {
    setSelectedFlight(flight);
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
    if (!selectedFlight) return;
    setIsSubmitting(true);
    try {
      const isApprovalNeeded = selectedFlight.policyStatus !== 'WITHIN_POLICY';
      const companyId = user?.companyId || 'comp-1';
      const companyName = user?.companyName || 'Ethiopian Airlines Group';

      await corporateService.addCorporateBooking({
        type: 'FLIGHT',
        status: isApprovalNeeded ? 'PENDING_APPROVAL' : 'CONFIRMED',
        companyId,
        companyName,
        travelerId: isManager ? selectedEmployeeId : (user?.id || 'usr-sample'),
        travelerName,
        travelerEmail,
        departmentName: department,
        totalAmount: selectedFlight.totalPrice,
        currency: selectedFlight.currency,
        policyStatus: selectedFlight.policyStatus || 'WITHIN_POLICY',
        businessPurpose: businessJustification || `${selectedFlight.outbound.airline} flight from ${searchParams.origin} to ${searchParams.destination}`,
        policyViolationReason: isApprovalNeeded ? (selectedFlight.policyNote || `Fare $${selectedFlight.totalPrice} exceeds policy threshold`) : undefined,
        flightData: {
          airline: selectedFlight.outbound.airline,
          origin: selectedFlight.outbound.origin,
          destination: selectedFlight.outbound.destination,
          cabinClass: selectedFlight.cabinClass,
          departureDate: searchParams.departureDate,
        },
        notes: businessJustification || `${selectedFlight.outbound.airline} Flight to ${searchParams.destination}`,
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
      {/* ── Top Search Summary Strip ── */}
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
          background: 'linear-gradient(135deg, rgba(37,99,235,0.06) 0%, rgba(6,182,212,0.08) 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              backgroundColor: 'var(--brand-primary)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(37,99,235,0.25)',
            }}
          >
            <Plane size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                {getCity(searchParams.origin)}
              </h2>
              <ArrowRight size={16} style={{ color: 'var(--brand-primary)' }} />
              <h2 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                {getCity(searchParams.destination)}
              </h2>
              <Badge variant="info">
                {searchParams.tripType === 'ROUND_TRIP' ? 'Round Trip' : 'One Way'}
              </Badge>
            </div>
            <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Depart: {searchParams.departureDate}</span>
              {searchParams.returnDate && (
                <span><Calendar size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Return: {searchParams.returnDate}</span>
              )}
              <span><Users size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> {searchParams.passengers} Passenger(s)</span>
              <span style={{ textTransform: 'capitalize' }}>Class: {searchParams.cabinClass.toLowerCase()}</span>
            </div>
          </div>
        </div>

        <Button variant="outline" size="sm" onClick={() => navigate('/flights')}>
          Modify Search
        </Button>
      </Card>

      {/* ── Main Layout: Sidebar Filters + Results ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '1.75rem', alignItems: 'start' }}>
        {/* Filter Sidebar */}
        <Card glass style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Filter size={15} /> Filters
            </span>
            <button
              onClick={() => {
                setSelectedAirline('ALL');
                setMaxStops('ALL');
                setPolicyFilter('ALL');
              }}
              style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
            >
              Reset
            </button>
          </div>

          {/* Policy Compliance Filter */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Corporate Travel Policy
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { id: 'ALL', label: 'All Fares' },
                { id: 'WITHIN', label: '✓ In-Policy Only' },
                { id: 'APPROVAL', label: 'In-Policy & Approvals' },
              ].map((opt) => (
                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="policyFilter"
                    checked={policyFilter === opt.id}
                    onChange={() => setPolicyFilter(opt.id as any)}
                  />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {/* Airline Filter */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Airlines
            </label>
            <select
              value={selectedAirline}
              onChange={(e) => setSelectedAirline(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
            >
              <option value="ALL">All Available Airlines</option>
              <option value="Ethiopian Airlines">Ethiopian Airlines</option>
              <option value="Emirates">Emirates</option>
              <option value="Qatar Airways">Qatar Airways</option>
              <option value="Kenya Airways">Kenya Airways</option>
              <option value="Turkish Airlines">Turkish Airlines</option>
            </select>
          </div>

          {/* Stops */}
          <div>
            <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: '0.5rem' }}>
              Stops
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {[
                { val: 'ALL', label: 'Any number of stops' },
                { val: 0, label: 'Direct Flights Only' },
                { val: 1, label: 'Up to 1 stop' },
              ].map((s) => (
                <label key={String(s.val)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: 'var(--font-size-xs)', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="maxStops"
                    checked={maxStops === s.val}
                    onChange={() => setMaxStops(s.val as any)}
                  />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
        </Card>

        {/* Results List */}
        <div>
          {/* Top Sort Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
              Showing {filteredFlights.length} Flight Offers
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
              >
                <option value="PRICE_ASC">Lowest Price First</option>
                <option value="PRICE_DESC">Highest Price First</option>
              </select>
            </div>
          </div>

          {filteredFlights.length === 0 ? (
            <Card glass style={{ padding: '3.5rem 2rem', textAlign: 'center' }}>
              <Plane size={40} style={{ color: 'var(--text-muted)', margin: '0 auto 1rem auto' }} />
              <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700 }}>No matching flight offers found</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)', marginTop: '0.5rem' }}>
                Try adjusting your filter criteria or dates to see more flight options.
              </p>
            </Card>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {filteredFlights.map((flight) => {
                const isWithin = flight.policyStatus === 'WITHIN_POLICY';
                const isApproval = flight.policyStatus === 'REQUIRES_APPROVAL';

                return (
                  <Card
                    key={flight.id}
                    glass
                    style={{
                      padding: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '1.25rem',
                      border: isWithin
                        ? '1px solid rgba(22,163,74,0.3)'
                        : isApproval
                        ? '1px solid rgba(245,158,11,0.3)'
                        : '1px solid rgba(239,68,68,0.3)',
                    }}
                  >
                    {/* Top Airline & Policy Tag */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--text-primary)' }}>
                          {flight.outbound.airline}
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-secondary)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                          Flight #{flight.outbound.flightNumber}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--brand-primary)', fontWeight: 600 }}>
                          {flight.fareFamily}
                        </span>
                      </div>

                      {/* Policy Badge */}
                      <div>
                        {isWithin && (
                          <Badge variant="success" icon={<ShieldCheck size={13} />}>
                            Within Travel Policy
                          </Badge>
                        )}
                        {isApproval && (
                          <Badge variant="warning" icon={<AlertTriangle size={13} />}>
                            Requires Approval
                          </Badge>
                        )}
                        {flight.policyStatus === 'OUT_OF_POLICY' && (
                          <Badge variant="danger">
                            Exceeds Policy
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Flight Schedule Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: '1.5rem' }}>
                      {/* Departure */}
                      <div>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                          {flight.outbound.departureTime}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {flight.outbound.originCity} ({flight.outbound.origin})
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {searchParams.departureDate}
                        </div>
                      </div>

                      {/* Flight Path Graphic */}
                      <div style={{ textAlign: 'center', minWidth: '140px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                          <Clock size={11} style={{ display: 'inline', verticalAlign: 'middle' }} /> {flight.outbound.duration}
                        </div>
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <div style={{ height: '2px', width: '100%', backgroundColor: 'var(--border-color)' }} />
                          <Plane size={16} style={{ position: 'absolute', color: 'var(--brand-primary)', transform: 'rotate(90deg)' }} />
                        </div>
                        <div style={{ fontSize: '10px', color: flight.outbound.stops === 0 ? '#16a34a' : 'var(--text-muted)', fontWeight: 600, marginTop: '0.2rem' }}>
                          {flight.outbound.stops === 0 ? 'Direct Non-Stop' : `${flight.outbound.stops} Stop (${flight.outbound.stopDetails?.[0]?.airport || 'Transfer'})`}
                        </div>
                      </div>

                      {/* Arrival */}
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                          {flight.outbound.arrivalTime}
                        </div>
                        <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {flight.outbound.destinationCity} ({flight.outbound.destination})
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {searchParams.departureDate}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Amenities & Price Action */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)' }}>
                      <div style={{ display: 'flex', gap: '1.25rem', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        <span><Luggage size={13} style={{ display: 'inline', verticalAlign: 'middle' }} /> Check-in: <strong>{flight.baggageAllowance}</strong></span>
                        <span>Cabin Bag: <strong>{flight.handBaggage}</strong></span>
                        <span>Refundable: <strong>{flight.isRefundable ? 'Yes' : 'No'}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Fare</div>
                          <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, color: 'var(--brand-primary)' }}>
                            ${flight.totalPrice.toLocaleString()} {flight.currency}
                          </div>
                        </div>

                        <Button
                          variant={isWithin ? 'primary' : 'secondary'}
                          size="sm"
                          onClick={() => handleOpenBooking(flight)}
                        >
                          {isWithin ? 'Book Itinerary' : 'Request Approval'}
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Booking & Approval Modal ── */}
      {isBookingModalOpen && selectedFlight && (
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
                <div style={{ width: 60, height: 60, borderRadius: '50%', backgroundColor: 'rgba(22,163,74,0.15)', color: '#16a34a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                  <CheckCircle2 size={36} />
                </div>
                <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800 }}>
                  {selectedFlight.policyStatus === 'WITHIN_POLICY' ? 'Flight Booking Confirmed!' : 'Approval Request Submitted'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginTop: '0.5rem' }}>
                  {selectedFlight.policyStatus === 'WITHIN_POLICY'
                    ? 'Your reservation has been generated under your corporate travel account.'
                    : 'Your travel manager and approver have received the itinerary review dispatch.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, margin: 0 }}>
                    {selectedFlight.policyStatus === 'WITHIN_POLICY' ? 'Confirm Corporate Booking' : 'Submit Travel Approval Request'}
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
                    {selectedFlight.outbound.airline} — {selectedFlight.outbound.origin} to {selectedFlight.outbound.destination}
                  </div>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Total: <strong>${selectedFlight.totalPrice} USD</strong> • {searchParams.departureDate}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.5rem' }}>
                  {isManager && companyEmployees.length > 0 && (
                    <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.2)' }}>
                      <label style={{ fontSize: '11px', fontWeight: 800, color: 'var(--brand-primary)', display: 'block', marginBottom: '0.35rem' }}>
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
                      Traveler Full Name
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
                      Work Email
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
                      Business Purpose / Justification
                    </label>
                    <textarea
                      rows={3}
                      value={businessJustification}
                      onChange={(e) => setBusinessJustification(e.target.value)}
                      placeholder="e.g. Attending international conference, client meeting..."
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-sm)', boxSizing: 'border-box', fontFamily: 'inherit' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                  <Button variant="ghost" type="button" onClick={() => setIsBookingModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting
                      ? 'Processing...'
                      : selectedFlight.policyStatus === 'WITHIN_POLICY'
                      ? 'Confirm Reservation'
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

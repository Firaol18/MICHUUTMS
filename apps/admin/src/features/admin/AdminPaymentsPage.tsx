import React, { useState, useEffect } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { Modal } from '@tms/shared/components/common/Modal';
import { Badge } from '@tms/shared/components/common/Badge';
import { http } from '@tms/shared/services/apiClient';
import { CreditCard, Search, Download, Plus, Filter, Clock, Trash2, Edit2 } from 'lucide-react';


export type PaymentMethod = 'Cash' | 'Bank Transfer' | 'Credit/Debit Card' | 'Mobile Money' | 'Online Payment';

export type PaymentStatus = 'Pending' | 'Paid' | 'Partially Paid' | 'Failed' | 'Refunded' | 'Partially Refunded';

export type PaymentType = 'Deposit' | 'Partial Payment' | 'Full Payment' | 'Refund';

export interface PaymentTransaction {
  id: string;
  txRef: string;
  receiptNo: string;
  bookingRef: string;
  customerName: string;
  type: PaymentType;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  date: string;
  notes?: string;
}

interface BookingLedger {
  bookingRef: string;
  tourTitle: string;
  customerName: string;
  totalAmount: number;
  paidAmount: number;
  status: PaymentStatus;
  history: {
    id: string;
    amount: number;
    date: string;
    method: PaymentMethod;
    receiptNo: string;
    type: PaymentType;
  }[];
}

const INITIAL_BOOKING_LEDGERS: BookingLedger[] = [
  {
    bookingRef: 'BK-00125',
    tourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    customerName: 'John Smith',
    totalAmount: 2400,
    paidAmount: 1500,
    status: 'Partially Paid',
    history: [
      { id: 'h-1', amount: 500, date: '2026-08-01', method: 'Mobile Money', receiptNo: 'RCP-88120', type: 'Deposit' },
      { id: 'h-2', amount: 1000, date: '2026-08-10', method: 'Credit/Debit Card', receiptNo: 'RCP-91024', type: 'Partial Payment' },
    ],
  },
  {
    bookingRef: 'BK-00126',
    tourTitle: 'Danakil Depression & Erta Ale Volcano Expedition',
    customerName: 'Sarah Jones',
    totalAmount: 3800,
    paidAmount: 3800,
    status: 'Paid',
    history: [
      { id: 'h-3', amount: 1200, date: '2026-07-25', method: 'Bank Transfer', receiptNo: 'RCP-77102', type: 'Deposit' },
      { id: 'h-4', amount: 2600, date: '2026-08-05', method: 'Online Payment', receiptNo: 'RCP-88291', type: 'Full Payment' },
    ],
  },
  {
    bookingRef: 'BK-00127',
    tourTitle: 'Simien Mountains Gelada Baboon Trek',
    customerName: 'David Brown',
    totalAmount: 1800,
    paidAmount: 500,
    status: 'Partially Paid',
    history: [
      { id: 'h-5', amount: 500, date: '2026-08-08', method: 'Cash', receiptNo: 'RCP-66109', type: 'Deposit' },
    ],
  },
  {
    bookingRef: 'BK-00128',
    tourTitle: 'Omo Valley Cultural Expeditions',
    customerName: 'Eleanor Vance',
    totalAmount: 2200,
    paidAmount: 0,
    status: 'Pending',
    history: [],
  },
  {
    bookingRef: 'BK-00129',
    tourTitle: 'Bale Mountains Wildlife Safari',
    customerName: 'Marcus Vance',
    totalAmount: 1600,
    paidAmount: 1600,
    status: 'Refunded',
    history: [
      { id: 'h-6', amount: 1600, date: '2026-07-10', method: 'Credit/Debit Card', receiptNo: 'RCP-44102', type: 'Full Payment' },
      { id: 'h-7', amount: -1600, date: '2026-07-15', method: 'Bank Transfer', receiptNo: 'REF-10029', type: 'Refund' },
    ],
  },
];

const INITIAL_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 'tx-1',
    txRef: 'TX-2026-9918',
    receiptNo: 'RCP-88120',
    bookingRef: 'BK-00125',
    customerName: 'John Smith',
    type: 'Deposit',
    amount: 500,
    currency: 'USD',
    method: 'Mobile Money',
    status: 'Partially Paid',
    date: '2026-08-01',
    notes: 'Initial 20% deposit received via Telebirr',
  },
  {
    id: 'tx-2',
    txRef: 'TX-2026-9102',
    receiptNo: 'RCP-91024',
    bookingRef: 'BK-00125',
    customerName: 'John Smith',
    type: 'Partial Payment',
    amount: 1000,
    currency: 'USD',
    method: 'Credit/Debit Card',
    status: 'Partially Paid',
    date: '2026-08-10',
    notes: 'Second installment card payment settled',
  },
  {
    id: 'tx-3',
    txRef: 'TX-2026-7710',
    receiptNo: 'RCP-77102',
    bookingRef: 'BK-00126',
    customerName: 'Sarah Jones',
    type: 'Deposit',
    amount: 1200,
    currency: 'USD',
    method: 'Bank Transfer',
    status: 'Paid',
    date: '2026-07-25',
    notes: 'CBE Wire Transfer deposit confirmed',
  },
  {
    id: 'tx-4',
    txRef: 'TX-2026-8829',
    receiptNo: 'RCP-88291',
    bookingRef: 'BK-00126',
    customerName: 'Sarah Jones',
    type: 'Full Payment',
    amount: 2600,
    currency: 'USD',
    method: 'Online Payment',
    status: 'Paid',
    date: '2026-08-05',
    notes: 'Final balance settlement via Chapa Online Checkout',
  },
  {
    id: 'tx-5',
    txRef: 'TX-2026-6610',
    receiptNo: 'RCP-66109',
    bookingRef: 'BK-00127',
    customerName: 'David Brown',
    type: 'Deposit',
    amount: 500,
    currency: 'USD',
    method: 'Cash',
    status: 'Partially Paid',
    date: '2026-08-08',
    notes: 'Cash deposit paid at HQ counter',
  },
  {
    id: 'tx-6',
    txRef: 'TX-2026-4410',
    receiptNo: 'REF-10029',
    bookingRef: 'BK-00129',
    customerName: 'Marcus Vance',
    type: 'Refund',
    amount: 1600,
    currency: 'USD',
    method: 'Bank Transfer',
    status: 'Refunded',
    date: '2026-07-15',
    notes: '100% full booking refund processed due to schedule cancellation',
  },
];

const METHODS_LIST: PaymentMethod[] = ['Cash', 'Bank Transfer', 'Credit/Debit Card', 'Mobile Money', 'Online Payment'];
const STATUSES_LIST: PaymentStatus[] = ['Pending', 'Paid', 'Partially Paid', 'Failed', 'Refunded', 'Partially Refunded'];

export const AdminPaymentsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBookingRef, setSelectedBookingRef] = useState<string>('BK-00125');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [bookingRef, setBookingRef] = useState('BK-00125');
  const [customerName, setCustomerName] = useState('John Smith');
  const [type, setType] = useState<PaymentType>('Partial Payment');
  const [amount, setAmount] = useState<number>(900);
  const [method, setMethod] = useState<PaymentMethod>('Credit/Debit Card');
  const [status, setStatus] = useState<PaymentStatus>('Paid');
  const [receiptNo, setReceiptNo] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayments = async () => {
    setIsLoading(true);
    setApiError('');
    try {
      const res = await http.get('/payments');
      setTransactions(
        Array.isArray(res.data)
          ? res.data.map((p: any) => ({
              id: String(p.id),
              txRef: p.transactionRef || p.txRef || `TX-${p.id}`,
              receiptNo: p.receiptNo || `RCP-${p.id}`,
              bookingRef: p.bookingRef || '',
              customerName: p.customerName || '',
              type: (p.type || 'Full Payment') as any,
              amount: Number(p.amount) || 0,
              currency: p.currency || 'USD',
              method: (p.paymentMethod || p.method || 'Credit/Debit Card') as any,
              status: (p.status || 'Paid') as any,
              date: p.paymentDate
                ? new Date(p.paymentDate).toISOString().split('T')[0]
                : p.date
                ? String(p.date).split('T')[0]
                : new Date().toISOString().split('T')[0],
              notes: p.description || p.notes || '',
            }))
          : []
      );
    } catch (err: any) {
      setApiError('Failed to load payments from server.');
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  // Selected Booking Ledger Calculation
  const activeBooking = INITIAL_BOOKING_LEDGERS.find((b) => b.bookingRef === selectedBookingRef) || INITIAL_BOOKING_LEDGERS[0];
  const totalAmount = activeBooking.totalAmount;
  
  // Calculate total paid dynamically from transaction list for this booking
  const bookingTxns = transactions.filter((t) => t.bookingRef === selectedBookingRef && t.status !== 'Failed');
  const totalPaidCalculated = bookingTxns.reduce((sum, t) => (t.type === 'Refund' ? sum - t.amount : sum + t.amount), 0);
  const remainingBalance = Math.max(0, totalAmount - totalPaidCalculated);

  let calculatedStatus: PaymentStatus = 'Pending';
  if (totalPaidCalculated <= 0) {
    calculatedStatus = 'Pending';
  } else if (totalPaidCalculated >= totalAmount) {
    calculatedStatus = 'Paid';
  } else {
    calculatedStatus = 'Partially Paid';
  }

  // Aggregate Totals
  const grandTotalInflow = transactions
    .filter((t) => (t.status === 'Paid' || t.status === 'Partially Paid') && t.type !== 'Refund')
    .reduce((sum, t) => sum + t.amount, 0);

  const grandTotalRefunds = transactions
    .filter((t) => t.type === 'Refund' || t.status === 'Refunded')
    .reduce((sum, t) => sum + t.amount, 0);

  const netCollected = grandTotalInflow - grandTotalRefunds;

  const handleOpenAddModal = () => {
    setEditingId(null);
    setBookingRef(selectedBookingRef);
    setCustomerName(activeBooking.customerName);
    setType('Partial Payment');
    setAmount(remainingBalance > 0 ? remainingBalance : 500);
    setMethod('Credit/Debit Card');
    setStatus('Paid');
    setReceiptNo(`RCP-${Math.floor(10000 + Math.random() * 90000)}`);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: PaymentTransaction) => {
    setEditingId(item.id);
    setBookingRef(item.bookingRef);
    setCustomerName(item.customerName);
    setType(item.type);
    setAmount(item.amount);
    setMethod(item.method);
    setStatus(item.status);
    setReceiptNo(item.receiptNo);
    setNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const payload = {
      transactionRef: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      bookingRef,
      customerName,
      type,
      amount,
      currency: 'USD',
      paymentMethod: method,
      status,
      description: notes || `${type} — ${bookingRef}`,
    };

    if (editingId) {
      await http.patch(`/payments/${editingId}`, payload);
    } else {
      await http.post('/payments', payload);
    }
    await fetchPayments();
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    await http.delete(`/payments/${id}`);
    await fetchPayments();
  };

  const filteredTransactions = transactions.filter((t) => {
    const matchesMethod = methodFilter === 'ALL' || t.method === methodFilter;
    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    const matchesSearch =
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.bookingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.txRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.receiptNo.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesMethod && matchesStatus && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CreditCard style={{ color: '#034ea2' }} /> Customer Payments & Booking Revenue Ledger
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Manage incoming customer deposits, partial installments, full tour settlements, receipts, and refunds
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAddModal} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
              + Record Payment
            </Button>
            <Button variant="outline" size="sm" icon={<Download size={16} />}>
              Export Ledger
            </Button>
          </div>
        </div>
      </div>

      {/* ── VERY IMPORTANT: BOOKING PAYMENT LEDGER & HISTORY INSPECTOR CARD ── */}
      <Card glass style={{ borderLeft: '4px solid #10b981', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              💳 BOOKING BALANCE & PAYMENT HISTORY INSPECTOR
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Inspect Partial Installments & Outstanding Balances Per Booking
            </div>
          </div>
          <select
            value={selectedBookingRef}
            onChange={(e) => {
              setSelectedBookingRef(e.target.value);
              const b = INITIAL_BOOKING_LEDGERS.find((x) => x.bookingRef === e.target.value);
              if (b) {
                setBookingRef(b.bookingRef);
                setCustomerName(b.customerName);
              }
            }}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid #10b981',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
            }}
          >
            {INITIAL_BOOKING_LEDGERS.map((b) => (
              <option key={b.bookingRef} value={b.bookingRef}>
                {b.bookingRef} — {b.customerName} ({b.tourTitle.slice(0, 28)}...)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Booking Summary Box matching exact user blueprint */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div className="flex-between" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <div style={{ fontWeight: 800, color: '#034ea2', fontSize: 'var(--font-size-md)' }}>
                Booking: <span style={{ fontFamily: 'monospace' }}>{activeBooking.bookingRef}</span>
              </div>
              <Badge variant={calculatedStatus === 'Paid' ? 'success' : calculatedStatus === 'Partially Paid' ? 'warning' : 'info'}>
                {calculatedStatus}
              </Badge>
            </div>

            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 600 }}>
              👤 Customer: <strong>{activeBooking.customerName}</strong>
              <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>🗺️ {activeBooking.tourTitle}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', backgroundColor: 'var(--bg-secondary)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL COST</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 900, color: 'var(--text-primary)' }}>${totalAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>PAID AMOUNT</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 900, color: '#10b981' }}>${totalPaidCalculated.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)' }}>REMAINING</div>
                <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 900, color: remainingBalance > 0 ? '#ef4444' : '#10b981' }}>${remainingBalance.toLocaleString()}</div>
              </div>
            </div>

            {remainingBalance > 0 && (
              <div className="flex-between" style={{ backgroundColor: 'rgba(245, 158, 11, 0.08)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.3)', fontSize: 11, color: '#d97706', fontWeight: 700 }}>
                <span>⚠️ Remaining Balance Due: ${remainingBalance.toLocaleString()} USD</span>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setBookingRef(activeBooking.bookingRef);
                    setCustomerName(activeBooking.customerName);
                    setAmount(remainingBalance);
                    setType('Partial Payment');
                    setIsModalOpen(true);
                  }}
                  style={{ padding: '0.2rem 0.5rem', fontSize: 10, backgroundColor: '#d97706', borderColor: '#d97706' }}
                >
                  + Pay ${remainingBalance}
                </Button>
              </div>
            )}
          </div>

          {/* Payment History Timeline matching user blueprint */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Clock size={16} style={{ color: '#034ea2' }} /> Chronological Payment History ({bookingTxns.length} Transactions)
            </div>

            {bookingTxns.length === 0 ? (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic', padding: '1rem 0' }}>
                No payment transactions recorded yet for this booking.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {bookingTxns.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex-between"
                    style={{
                      padding: '0.6rem 0.75rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      fontSize: 11,
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 800, color: tx.type === 'Refund' ? '#ef4444' : '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                        {tx.type === 'Refund' ? '-' : '+'}${tx.amount.toLocaleString()} USD
                        <Badge variant={tx.type === 'Refund' ? 'danger' : 'info'} style={{ fontSize: 9 }}>{tx.type}</Badge>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>
                        {tx.date} · via {tx.method} · Receipt: <span style={{ fontFamily: 'monospace' }}>{tx.receiptNo}</span>
                      </div>
                    </div>
                    <Badge variant={tx.status === 'Paid' ? 'success' : tx.status === 'Partially Paid' ? 'warning' : 'danger'} style={{ fontSize: 9 }}>
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL SETTLED INFLOW</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#10b981', marginTop: 4 }}>+${grandTotalInflow.toLocaleString()} USD</div>
        </Card>

        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL REFUNDS PAID OUT</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#ef4444', marginTop: 4 }}>-${grandTotalRefunds.toLocaleString()} USD</div>
        </Card>

        <Card glass style={{ padding: '1.25rem', borderLeft: '4px solid #034ea2' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL TRANSACTIONS</div>
          <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 900, color: '#034ea2', marginTop: 4 }}>{transactions.length} Records</div>
        </Card>
      </div>

      {/* Filters & Search */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 450 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tx reference, customer name, receipt #, or booking ref..."
            style={{ width: '100%', padding: '0.45rem 0.875rem 0.45rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <Filter size={15} style={{ color: 'var(--text-muted)' }} />
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
            >
              <option value="ALL">All Methods</option>
              {METHODS_LIST.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
            >
              <option value="ALL">All Statuses</option>
              {STATUSES_LIST.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <Card glass style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: '#034ea2', color: '#ffffff' }}>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50 }}># ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>TX / RECEIPT REF ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>BOOKING REF ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>CUSTOMER ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>PAYMENT TYPE ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>METHOD ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800 }}>AMOUNT ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800 }}>STATUS ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 150 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No payment transaction records match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx, idx) => (
                <tr key={tx.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#034ea2' }}>{tx.txRef}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Receipt: {tx.receiptNo}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    📋 {tx.bookingRef}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700 }}>
                    👤 {tx.customerName}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant={tx.type === 'Full Payment' ? 'success' : tx.type === 'Deposit' ? 'info' : tx.type === 'Refund' ? 'danger' : 'warning'}>
                      {tx.type}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                    💳 {tx.method}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: tx.type === 'Refund' ? '#ef4444' : '#10b981' }}>
                    {tx.type === 'Refund' ? '-' : '+'}${tx.amount.toLocaleString()} USD
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <Badge variant={tx.status === 'Paid' ? 'success' : tx.status === 'Partially Paid' ? 'warning' : tx.status === 'Pending' ? 'info' : 'danger'}>
                      {tx.status}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(tx)}
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
                        onClick={() => handleDelete(tx.id)}
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
      </Card>

      {/* Modal for Recording / Editing Payment */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Payment Record' : 'Record Incoming Payment Transaction'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Booking Reference *
              </label>
              <select
                value={bookingRef}
                onChange={(e) => {
                  setBookingRef(e.target.value);
                  const b = INITIAL_BOOKING_LEDGERS.find((x) => x.bookingRef === e.target.value);
                  if (b) setCustomerName(b.customerName);
                }}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                {INITIAL_BOOKING_LEDGERS.map((b) => (
                  <option key={b.bookingRef} value={b.bookingRef}>
                    {b.bookingRef} ({b.customerName})
                  </option>
                ))}
              </select>
            </div>

            <Input label="Customer Name *" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Payment Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PaymentType)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                <option value="Deposit">Deposit (Down Payment)</option>
                <option value="Partial Payment">Partial Payment (Installment)</option>
                <option value="Full Payment">Full Payment (Settlement)</option>
                <option value="Refund">Refund Outflow</option>
              </select>
            </div>

            <Input label="Amount (USD) *" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Payment Method *
              </label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                {METHODS_LIST.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Payment Status *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as PaymentStatus)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                {STATUSES_LIST.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Input label="Receipt / Voucher Reference No." value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />

          <Input label="Payment Notes / Transaction Remarks" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Telebirr Txn #99182 settled via mobile app..." />

          <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700, marginTop: '0.5rem' }}>
            {editingId ? 'Save Changes' : 'Record Transaction'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

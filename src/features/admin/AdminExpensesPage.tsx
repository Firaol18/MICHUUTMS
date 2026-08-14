import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { Badge } from '@/components/common/Badge';
import { Plus, Search, Receipt, Filter, Trash2, Edit2 } from 'lucide-react';

export type ExpenseCategory =
  | 'Transportation'
  | 'Accommodation'
  | 'Guide Salary'
  | 'Driver Salary'
  | 'Food'
  | 'Fuel'
  | 'Marketing'
  | 'Office'
  | 'Equipment'
  | 'Supplier'
  | 'Maintenance'
  | 'Other';

export interface ExpenseItem {
  id: string;
  voucherNo: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  date: string;
  supplier: string;
  relatedTourId?: string;
  relatedTourTitle?: string;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'Credit Card' | 'Mobile Money (Telebirr)';
  receiptNo: string;
  approvalStatus: 'Approved' | 'Pending Approval' | 'Rejected';
}

interface TourRevenueProfit {
  id: string;
  title: string;
  revenue: number;
  expenses: { category: ExpenseCategory; amount: number; description: string }[];
}

const INITIAL_TOURS_PROFIT: TourRevenueProfit[] = [
  {
    id: 'tour-101',
    title: 'Historic Route Ethiopia & Lalibela Churches',
    revenue: 8000,
    expenses: [
      { category: 'Accommodation', amount: 2000, description: 'Kuriftu Resort & Hotel Lodge Payout' },
      { category: 'Transportation', amount: 1200, description: '4x4 Cruiser & Bus Rental Fleet' },
      { category: 'Guide Salary', amount: 500, description: 'Senior Guide Abebe Bekele Stipend' },
      { category: 'Food', amount: 600, description: 'Traditional Cultural Dinners & Catering' },
      { category: 'Fuel', amount: 300, description: 'TotalEnergies Diesel Fuel Voucher' },
    ],
  },
  {
    id: 'tour-102',
    title: 'Danakil Depression & Erta Ale Volcano Expedition',
    revenue: 12500,
    expenses: [
      { category: 'Accommodation', amount: 3200, description: 'Afar Eco-Camp & Hotel Bookings' },
      { category: 'Transportation', amount: 2400, description: 'Heavy Patrol 4x4 Cruisers & Convoy Escort' },
      { category: 'Guide Salary', amount: 900, description: 'Volcano Certified Ranger Stipend' },
      { category: 'Food', amount: 850, description: 'Expedition Provisions & Desert Chef' },
      { category: 'Fuel', amount: 650, description: 'Semera-Danakil Fuel Refills' },
    ],
  },
  {
    id: 'tour-103',
    title: 'Simien Mountains Gelada Baboon Trek',
    revenue: 6400,
    expenses: [
      { category: 'Accommodation', amount: 1400, description: 'Simien Lodge & Mountain Campsite' },
      { category: 'Transportation', amount: 800, description: 'Gonder Pickup & Coaster Bus' },
      { category: 'Guide Salary', amount: 450, description: 'Mountain Trekking Guide Salary' },
      { category: 'Food', amount: 350, description: 'Trekking Ration Packs & Meal Box' },
      { category: 'Fuel', amount: 200, description: 'Vehicle Expedition Fuel' },
    ],
  },
];

const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp-1',
    voucherNo: 'EXP-2026-9001',
    category: 'Accommodation',
    description: 'Hotel accommodation 14 rooms payout for Historic Route group',
    amount: 2000,
    date: '2026-08-12',
    supplier: 'Kuriftu Resorts & Lodges',
    relatedTourId: 'tour-101',
    relatedTourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'RCP-98102',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-2',
    voucherNo: 'EXP-2026-9002',
    category: 'Transportation',
    description: 'Transport fleet convoy 4x4 Land Cruisers dispatch',
    amount: 1200,
    date: '2026-08-11',
    supplier: 'Highland Transport Logistics',
    relatedTourId: 'tour-101',
    relatedTourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'RCP-88123',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-3',
    voucherNo: 'EXP-2026-9003',
    category: 'Guide Salary',
    description: 'Lead ranger guide daily stipend & hazard allowance',
    amount: 500,
    date: '2026-08-10',
    supplier: 'Abebe Bekele (Lead Guide)',
    relatedTourId: 'tour-101',
    relatedTourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    paymentMethod: 'Mobile Money (Telebirr)',
    receiptNo: 'RCP-77102',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-4',
    voucherNo: 'EXP-2026-9004',
    category: 'Food',
    description: 'Traditional habesha cultural buffet dinners & wine tasting',
    amount: 600,
    date: '2026-08-09',
    supplier: 'Yod Abyssinia Cultural Restaurant',
    relatedTourId: 'tour-101',
    relatedTourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    paymentMethod: 'Cash',
    receiptNo: 'RCP-66109',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-5',
    voucherNo: 'EXP-2026-9005',
    category: 'Fuel',
    description: 'Diesel fuel refill for 4x4 expedition vehicles',
    amount: 300,
    date: '2026-08-08',
    supplier: 'TotalEnergies Station',
    relatedTourId: 'tour-101',
    relatedTourTitle: 'Historic Route Ethiopia & Lalibela Churches',
    paymentMethod: 'Mobile Money (Telebirr)',
    receiptNo: 'RCP-55102',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-6',
    voucherNo: 'EXP-2026-9006',
    category: 'Marketing',
    description: 'Digital tourism campaign & Google Search Ads promotion',
    amount: 850,
    date: '2026-08-05',
    supplier: 'Global Digital Media Corp',
    paymentMethod: 'Credit Card',
    receiptNo: 'RCP-44109',
    approvalStatus: 'Approved',
  },
  {
    id: 'exp-7',
    voucherNo: 'EXP-2026-9007',
    category: 'Office',
    description: 'Headquarters high-speed fiber broadband & cloud server hosting',
    amount: 420,
    date: '2026-08-02',
    supplier: 'Ethio Telecom Cloud Services',
    paymentMethod: 'Bank Transfer',
    receiptNo: 'RCP-33104',
    approvalStatus: 'Pending Approval',
  },
];

const CATEGORIES_LIST: ExpenseCategory[] = [
  'Transportation',
  'Accommodation',
  'Guide Salary',
  'Driver Salary',
  'Food',
  'Fuel',
  'Marketing',
  'Office',
  'Equipment',
  'Supplier',
  'Maintenance',
  'Other',
];

export const AdminExpensesPage: React.FC = () => {
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [selectedTourId, setSelectedTourId] = useState<string>('tour-101');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form Fields
  const [category, setCategory] = useState<ExpenseCategory>('Transportation');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(500);
  const [supplier, setSupplier] = useState('');
  const [relatedTourId, setRelatedTourId] = useState<string>('tour-101');
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('Bank Transfer');
  const [receiptNo, setReceiptNo] = useState('');

  // Selected Tour Profitability Analysis
  const activeTourObj = INITIAL_TOURS_PROFIT.find((t) => t.id === selectedTourId) || INITIAL_TOURS_PROFIT[0];
  
  // Calculate expenses connected to selected tour dynamically from expenses state
  const connectedExpenses = expenses.filter((e) => e.relatedTourId === selectedTourId);
  const tourTotalExpenses = connectedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const tourGrossRevenue = activeTourObj.revenue;
  const tourNetProfit = tourGrossRevenue - tourTotalExpenses;
  const profitMarginPercent = Math.round((tourNetProfit / tourGrossRevenue) * 100);

  // Overall Expenses Total
  const grandTotalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setCategory('Transportation');
    setDescription('');
    setAmount(500);
    setSupplier('');
    setRelatedTourId('tour-101');
    setPaymentMethod('Bank Transfer');
    setReceiptNo(`RCP-${Math.floor(10000 + Math.random() * 90000)}`);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: ExpenseItem) => {
    setEditingId(exp.id);
    setCategory(exp.category);
    setDescription(exp.description);
    setAmount(exp.amount);
    setSupplier(exp.supplier);
    setRelatedTourId(exp.relatedTourId || '');
    setPaymentMethod(exp.paymentMethod);
    setReceiptNo(exp.receiptNo);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;

    const tourMatch = INITIAL_TOURS_PROFIT.find((t) => t.id === relatedTourId);

    if (editingId) {
      setExpenses((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? {
                ...item,
                category,
                description,
                amount,
                supplier: supplier || 'Vendor Partner',
                relatedTourId: relatedTourId || undefined,
                relatedTourTitle: tourMatch ? tourMatch.title : undefined,
                paymentMethod,
                receiptNo,
              }
            : item
        )
      );
    } else {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        voucherNo: `EXP-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        category,
        description,
        amount,
        date: new Date().toISOString().split('T')[0],
        supplier: supplier || 'Vendor Partner',
        relatedTourId: relatedTourId || undefined,
        relatedTourTitle: tourMatch ? tourMatch.title : undefined,
        paymentMethod,
        receiptNo: receiptNo || `RCP-${Math.floor(10000 + Math.random() * 90000)}`,
        approvalStatus: 'Approved',
      };
      setExpenses([newExp, ...expenses]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== id));
  };

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchesSearch =
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.voucherNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.relatedTourTitle && e.relatedTourTitle.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header */}
      <div>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, color: 'var(--text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Receipt style={{ color: '#034ea2' }} /> Operational Expenses & Profitability Ledger
            </h1>
            <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Track cash outflows, supplier invoices, guide/driver payouts, and connected tour net margins
            </p>
          </div>
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={handleOpenAddModal} style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700 }}>
            + Log Expense Voucher
          </Button>
        </div>
      </div>

      {/* ── VERY IMPORTANT: TOUR PROFITABILITY CONNECTED ANALYSIS CARD ── */}
      <Card glass style={{ borderLeft: '4px solid #034ea2', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem' }}>
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              🎯 CONNECTED TOUR PROFITABILITY BREAKDOWN
            </div>
            <div style={{ fontSize: 'var(--font-size-lg)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Select a Tour to Analyze Operational Profit Margin
            </div>
          </div>
          <select
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: 'var(--radius-sm)',
              border: '1.5px solid #034ea2',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontWeight: 700,
              fontSize: 'var(--font-size-xs)',
              cursor: 'pointer',
            }}
          >
            {INITIAL_TOURS_PROFIT.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Revenue vs Expenses Summary Card */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: '#034ea2', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              Tour: <span style={{ color: 'var(--text-primary)' }}>{activeTourObj.title}</span>
            </div>

            <div className="flex-between">
              <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Gross Tour Revenue:</span>
              <span style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: '#16a34a' }}>+${tourGrossRevenue.toLocaleString()} USD</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', backgroundColor: 'rgba(239, 68, 68, 0.05)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>Connected Expenses Breakdown:</div>
              {connectedExpenses.length === 0 ? (
                <div style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>No expenses linked yet</div>
              ) : (
                connectedExpenses.map((exp) => (
                  <div key={exp.id} className="flex-between" style={{ fontSize: 11 }}>
                    <span style={{ color: 'var(--text-secondary)' }}>• {exp.category} ({exp.supplier})</span>
                    <span style={{ fontWeight: 700, color: '#ef4444' }}>-${exp.amount.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>

            <div style={{ borderTop: '1.5px dashed var(--border-color)', paddingTop: '0.75rem' }} className="flex-between">
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>TOTAL EXPENSES OUTFLOW</div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: '#ef4444' }}>-${tourTotalExpenses.toLocaleString()} USD</div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)' }}>NET TOUR PROFIT</div>
                <div style={{ fontSize: 'var(--font-size-xl)', fontWeight: 900, color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'flex-end' }}>
                  +${tourNetProfit.toLocaleString()} <Badge variant="success" style={{ fontSize: 10 }}>{profitMarginPercent}% Margin</Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Expense Categories Summary Bar */}
          <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 800, color: 'var(--text-primary)' }}>
              📊 Expense Category Distribution ({expenses.length} Records)
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              Overall ledger outflow across all operational categories
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>GRAND TOTAL OUTFLOW</div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: '#ef4444' }}>-${grandTotalExpenses.toLocaleString()} USD</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>ACTIVE CATEGORIES</div>
                <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 800, color: '#034ea2' }}>{CATEGORIES_LIST.length} Types</div>
              </div>
            </div>

            <div style={{ marginTop: '0.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
              {CATEGORIES_LIST.map((cat) => {
                const catCount = expenses.filter((e) => e.category === cat).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategoryFilter(categoryFilter === cat ? 'ALL' : cat)}
                    style={{
                      padding: '0.2rem 0.5rem',
                      borderRadius: 'var(--radius-sm)',
                      border: categoryFilter === cat ? '1.5px solid #034ea2' : '1px solid var(--border-color)',
                      backgroundColor: categoryFilter === cat ? 'rgba(3,78,162,0.1)' : 'var(--bg-secondary)',
                      color: categoryFilter === cat ? '#034ea2' : 'var(--text-secondary)',
                      fontSize: 10,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    {cat} ({catCount})
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Filter & Search Bar */}
      <div className="flex-between" style={{ flexWrap: 'wrap', gap: '1rem', backgroundColor: 'var(--bg-secondary)', padding: '0.875rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
        <div style={{ position: 'relative', minWidth: 280, flex: 1, maxWidth: 450 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search description, supplier vendor, voucher #, or related tour..."
            style={{ width: '100%', padding: '0.45rem 0.875rem 0.45rem 2.25rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', outline: 'none' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ padding: '0.4rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}
          >
            <option value="ALL">All 12 Categories</option>
            {CATEGORIES_LIST.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Data Table */}
      <Card glass style={{ padding: 0, overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-xs)' }}>
          <thead>
            <tr style={{ backgroundColor: '#034ea2', color: '#ffffff' }}>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800, width: 50 }}># ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>VOUCHER NO. ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>CATEGORY ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>RELATED TOUR ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>SUPPLIER VENDOR ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontWeight: 800 }}>PAYMENT METHOD ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800 }}>AMOUNT ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800 }}>STATUS ↕</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'center', fontWeight: 800, width: 150 }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No operational expense records match your search or filter criteria.
                </td>
              </tr>
            ) : (
              filteredExpenses.map((exp, idx) => (
                <tr key={exp.id} style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontFamily: 'monospace', fontWeight: 800, color: '#034ea2' }}>{exp.voucherNo}</div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>Receipt: {exp.receiptNo}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <Badge variant="warning">{exp.category}</Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    {exp.relatedTourTitle ? (
                      <div style={{ color: 'var(--brand-primary)', fontWeight: 700 }}>🗺️ {exp.relatedTourTitle}</div>
                    ) : (
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>General Operating Expense</span>
                    )}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-primary)', fontWeight: 600 }}>
                    🏢 {exp.supplier}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-secondary)' }}>
                    💳 {exp.paymentMethod}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 800, color: '#ef4444' }}>
                    -${exp.amount.toLocaleString()} USD
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <Badge variant={exp.approvalStatus === 'Approved' ? 'success' : exp.approvalStatus === 'Pending Approval' ? 'warning' : 'danger'}>
                      {exp.approvalStatus}
                    </Badge>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'center' }}>
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(exp)}
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
                        onClick={() => handleDelete(exp.id)}
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

      {/* Modal for Adding / Editing Expense Outflow */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Expense Voucher' : 'Log Operational Expense Voucher'}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Expense Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                {CATEGORIES_LIST.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
                Payment Method *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as ExpenseItem['paymentMethod'])}
                style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
                required
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Mobile Money (Telebirr)">Mobile Money (Telebirr)</option>
              </select>
            </div>
          </div>

          <Input label="Expense Description *" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Hotel lodging deposit, 4x4 diesel refill, guide stipend..." required />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input label="Amount (USD) *" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} required />
            <Input label="Supplier / Vendor Payee" value={supplier} onChange={(e) => setSupplier(e.target.value)} placeholder="e.g. Kuriftu Resort, TotalEnergies" />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '0.35rem', color: 'var(--text-primary)' }}>
              Connect to Specific Tour Package (For Profitability Tracking)
            </label>
            <select
              value={relatedTourId}
              onChange={(e) => setRelatedTourId(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 'var(--font-size-xs)' }}
            >
              <option value="">-- None (General Overhead Expense) --</option>
              {INITIAL_TOURS_PROFIT.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.title}
                </option>
              ))}
            </select>
          </div>

          <Input label="Receipt / Voucher Reference No." value={receiptNo} onChange={(e) => setReceiptNo(e.target.value)} />

          <Button variant="primary" size="sm" type="submit" style={{ backgroundColor: '#034ea2', borderColor: '#034ea2', fontWeight: 700, marginTop: '0.5rem' }}>
            {editingId ? 'Save Changes' : 'Save Expense Voucher'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Modal } from '@/components/common/Modal';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { ETicketModal } from '@/components/common/ETicketModal';
import { tourismService } from '@/services/tourismService';
import type { Booking } from '@/types/booking';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Building2,
  Tag,
  CreditCard,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Landmark,
  UploadCloud,
  Copy,
  Check,
} from 'lucide-react';

const PAYMENT_METHODS = [
  {
    id: 'telebirr',
    name: 'Telebirr',
    icon: '📱',
    badge: 'Instant / Birr',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '0930222784',
    instructions: 'Pay via Telebirr App or *127# to 0930222784, then upload the transaction confirmation screenshot below.',
  },
  {
    id: 'cbe_birr',
    name: 'Commercial Bank of Ethiopia (CBE / CBE Birr)',
    icon: '🏦',
    badge: 'CBE Mobile / *847#',
    accountName: 'MICHUU TOURISM & TRAVEL PLC',
    accountNumber: '1000299280164',
    instructions: 'Transfer to CBE account 1000299280164, enter the FT transaction reference code, and upload the transfer receipt screenshot.',
  },
  {
    id: 'bank_transfer',
    name: 'Awash / Dashen / BOA Bank Transfer',
    icon: '🏛️',
    badge: 'Direct Bank Wire',
    accountName: 'MICHUU TOURISM PLC',
    accountNumber: 'Awash Bank: 01320495839001 | Dashen: 504938291001',
    instructions: 'Transfer to our Awash/Dashen account, then attach a photo of your bank deposit slip or mobile screenshot.',
  },
  {
    id: 'credit_card',
    name: 'Credit / Debit Card (Visa / Mastercard)',
    icon: '💳',
    badge: 'Card Checkout',
    accountName: 'MICHUU Global Checkout',
    accountNumber: 'Encrypted 256-Bit SSL',
    instructions: 'Enter your card authorization reference or upload a screenshot of your successful transaction slip.',
  },
  {
    id: 'cash',
    name: 'Pay Cash on Arrival / Bole Office Hub',
    icon: '💵',
    badge: 'Pay in Person',
    accountName: 'MICHUU Hub — Bole Medhanialem',
    accountNumber: 'Bole Medhanialem Tower, 4th Floor',
    instructions: 'Your reservation is held. Please settle the remaining fee at our Bole hub or upon meeting your Ranger Guide.',
  },
];

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    promoCode,
    discountPercent,
    applyPromoCode,
    getSubtotal,
    getDiscountAmount,
    getTotalPrice,
  } = useCartStore();

  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  const [inputCode, setInputCode] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ success: boolean; text: string } | null>(null);

  // Checkout Form State
  const [isCheckoutStep, setIsCheckoutStep] = useState(false);
  const [leadName, setLeadName] = useState(user?.name || '');
  const [leadEmail, setLeadEmail] = useState(user?.email || '');
  const [leadPhone, setLeadPhone] = useState('+251 91 123 4567');
  const [leadNationality, setLeadNationality] = useState('Ethiopia');
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe_birr' | 'bank_transfer' | 'credit_card' | 'cash'>('telebirr');
  const [transactionReference, setTransactionReference] = useState('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [receiptFileName, setReceiptFileName] = useState('');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generated Booking for E-Ticket preview
  const [completedBooking, setCompletedBooking] = useState<Booking | null>(null);
  const [isETicketOpen, setIsETicketOpen] = useState(false);

  // Sync user info when user logs in
  useEffect(() => {
    if (user) {
      setLeadName(user.name);
      setLeadEmail(user.email);
    }
  }, [user]);

  const handleProceedToCheckout = () => {
    if (!isAuthenticated) {
      closeCart();
      navigate('/login?mode=signin');
      return;
    }
    setIsCheckoutStep(true);
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyPromoCode(inputCode);
    setPromoMessage({ success: res.success, text: res.message });
  };

  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      setCheckoutError('File size must be under 8MB.');
      return;
    }
    setCheckoutError('');
    setReceiptFileName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPaymentReceiptUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleCopyAccount = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCompleteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    if (!leadName.trim() || !leadEmail.trim()) {
      setCheckoutError('Please provide the lead traveler name and email.');
      return;
    }

    if (paymentMethod !== 'cash' && !paymentReceiptUrl && !transactionReference.trim()) {
      setCheckoutError('Please upload a screenshot of your payment receipt or enter the transaction reference code.');
      return;
    }

    setIsSubmitting(true);
    setCheckoutError('');

    try {
      const primaryTour = items.find((i) => i.type === 'tour') || items[0];
      const tourId = primaryTour.id.replace('-cart', '');
      const totalPrice = getTotalPrice();

      const combinedTitle = items.map((i) => `${i.title} (x${i.quantity})`).join(' + ');
      const destination = primaryTour?.details?.location || 'Ethiopia';

      const booking = await tourismService.createBooking(
        tourId,
        {
          name: leadName,
          email: leadEmail,
          phone: leadPhone,
          nationality: leadNationality,
          specialRequests,
        },
        primaryTour.date || '2026-09-20',
        primaryTour.quantity || 2,
        primaryTour.quantity || 2,
        0,
        {
          title: combinedTitle,
          destination,
          totalPrice,
          status: 'confirmed',
          paymentStatus: paymentReceiptUrl || transactionReference ? 'paid' : 'paid',
          paymentMethod,
          paymentReceiptUrl,
          transactionReference,
        }
      );

      setCompletedBooking(booking);
      setIsCheckoutStep(false);
      clearCart();
      closeCart();
      setIsETicketOpen(true);
    } catch (err: any) {
      console.error('Cart checkout failed:', err);
      setCheckoutError(err?.message || 'Failed to complete checkout on the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const totalPrice = getTotalPrice();
  const activePaymentOption = PAYMENT_METHODS.find((p) => p.id === paymentMethod) || PAYMENT_METHODS[0];

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={() => {
          closeCart();
          setIsCheckoutStep(false);
        }}
        title={isCheckoutStep ? 'Multi-Item Expedition Checkout' : `Shopping Cart (${items.length} Items)`}
        footer={
          items.length > 0 ? (
            isCheckoutStep ? (
              <div className="flex-between" style={{ width: '100%' }}>
                <Button variant="ghost" size="sm" onClick={() => setIsCheckoutStep(false)}>
                  ← Back to Cart
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleCompleteCheckout}
                  isLoading={isSubmitting}
                  icon={<ShieldCheck size={16} />}
                >
                  Confirm & Pay (${totalPrice.toLocaleString()})
                </Button>
              </div>
            ) : (
              <div className="flex-between" style={{ width: '100%' }}>
                <Button variant="ghost" size="sm" onClick={clearCart}>
                  Clear Cart
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleProceedToCheckout}
                  icon={<ArrowRight size={16} />}
                >
                  Proceed to Checkout (${totalPrice.toLocaleString()})
                </Button>
              </div>
            )
          ) : null
        }
      >
        {items.length === 0 ? (
          <div className="flex-center" style={{ flexDirection: 'column', gap: '1rem', padding: '3rem 1rem', textAlign: 'center' }}>
            <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
            <h3>Your travel cart is empty</h3>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>
              Explore Ethiopian tour packages, hotel stays, and festival passes to add to your expedition!
            </p>
            <Button variant="primary" size="sm" onClick={closeCart}>
              Continue Browsing
            </Button>
          </div>
        ) : isCheckoutStep ? (
          /* Checkout Step Form */
          <form onSubmit={handleCompleteCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {checkoutError && (
              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#dc2626', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                ⚠️ {checkoutError}
              </div>
            )}

            {/* Order Summary Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                Multi-Item Booking Summary ({items.length} items)
              </div>
              {items.map((item) => (
                <div key={item.id} className="flex-between" style={{ fontSize: 'var(--font-size-xs)', marginBottom: '0.35rem' }}>
                  <span>
                    {item.type === 'tour' && '🏕️ '}
                    {item.type === 'hotel' && '🏨 '}
                    {item.type === 'transport' && '🚘 '}
                    <strong>{item.title}</strong> (x{item.quantity})
                  </span>
                  <span>${(item.unitPrice * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px dashed var(--border-color)', marginTop: '0.5rem', paddingTop: '0.5rem' }} className="flex-between">
                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)' }}>Total Amount Due:</span>
                <span style={{ fontWeight: 800, fontSize: 'var(--font-size-md)', color: 'var(--brand-primary)' }}>
                  ${totalPrice.toLocaleString()} USD
                </span>
              </div>
            </div>

            {/* Lead Traveler Details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700 }}>Lead Traveler Information</h4>
              <Input label="Full Name *" value={leadName} onChange={(e) => setLeadName(e.target.value)} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input label="Email Address *" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required />
                <Input label="Phone / Telebirr Number *" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required />
              </div>
              <Input label="Nationality / Country *" value={leadNationality} onChange={(e) => setLeadNationality(e.target.value)} required />
              <Input label="Special Dietary or Accessibility Requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="e.g. Vegetarian meal plan, Airport pickup time" />
            </div>

            {/* ── PAYMENT METHOD SELECTION ── */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--text-primary)', display: 'block', marginBottom: '0.6rem' }}>
                💳 Select Payment Method *
              </label>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.625rem', marginBottom: '1rem' }}>
                {PAYMENT_METHODS.map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => {
                        setPaymentMethod(pm.id as any);
                        setCheckoutError('');
                      }}
                      style={{
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-md)',
                        border: isSelected ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
                        backgroundColor: isSelected ? 'rgba(37,99,235,0.06)' : 'var(--bg-secondary)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.25rem',
                      }}
                    >
                      <div className="flex-between">
                        <span style={{ fontSize: '1.25rem' }}>{pm.icon}</span>
                        <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: '4px', backgroundColor: isSelected ? 'var(--brand-primary)' : 'var(--bg-tertiary)', color: isSelected ? '#fff' : 'var(--text-muted)', fontWeight: 700 }}>
                          {pm.badge}
                        </span>
                      </div>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: isSelected ? 800 : 600, color: isSelected ? 'var(--brand-primary)' : 'var(--text-primary)' }}>
                        {pm.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Payment Instructions & Account Box */}
              <div style={{ padding: '0.875rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginBottom: '1rem', fontSize: 'var(--font-size-xs)' }}>
                <div style={{ color: 'var(--text-secondary)', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                  {activePaymentOption.instructions}
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-primary)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700 }}>TRANSFER ACCOUNT / TILL:</div>
                    <div style={{ fontWeight: 800, color: 'var(--brand-primary)', fontFamily: 'monospace', fontSize: 'var(--font-size-sm)' }}>
                      {activePaymentOption.accountNumber}
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Name: {activePaymentOption.accountName}</div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    icon={copiedAccount ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                    onClick={() => handleCopyAccount(activePaymentOption.accountNumber)}
                  >
                    {copiedAccount ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              {/* Transaction Reference & Screenshot Upload */}
              {paymentMethod !== 'cash' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                  <Input
                    label="Transaction Reference / Bank Confirmation Code (e.g. FT2609...)"
                    placeholder="Enter TXN ID / Reference Code"
                    value={transactionReference}
                    onChange={(e) => setTransactionReference(e.target.value)}
                  />

                  <div>
                    <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem', color: 'var(--text-secondary)' }}>
                      📸 Upload Screenshot / Photo of Payment Receipt
                    </label>

                    <div
                      style={{
                        border: '2px dashed var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        padding: '1rem',
                        textAlign: 'center',
                        backgroundColor: 'var(--bg-secondary)',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleReceiptUpload}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                      />
                      {paymentReceiptUrl ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem' }}>
                          <img
                            src={paymentReceiptUrl}
                            alt="Receipt Preview"
                            style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                          />
                          <div style={{ textAlign: 'left', fontSize: 'var(--font-size-xs)' }}>
                            <span style={{ fontWeight: 800, color: '#16a34a', display: 'block' }}>✓ Screenshot Attached</span>
                            <span style={{ color: 'var(--text-muted)' }}>{receiptFileName || 'payment_receipt.jpg'}</span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPaymentReceiptUrl('');
                              setReceiptFileName('');
                            }}
                            style={{ color: '#ef4444' }}
                          >
                            Remove
                          </Button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                          <UploadCloud size={24} style={{ color: 'var(--brand-primary)' }} />
                          <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700 }}>Click to browse or drop payment screenshot</span>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>JPEG, PNG, WebP up to 8MB</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        ) : (
          /* Itemized Cart List View */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Item List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '70px 1fr auto',
                    gap: '0.875rem',
                    alignItems: 'center',
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-secondary)',
                  }}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ width: 70, height: 70, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                  />

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.15rem' }}>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 800,
                          textTransform: 'uppercase',
                          padding: '0.15rem 0.4rem',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor:
                            item.type === 'tour'
                              ? 'rgba(37, 99, 235, 0.12)'
                              : item.type === 'hotel'
                              ? 'rgba(217, 119, 6, 0.12)'
                              : 'rgba(22, 163, 74, 0.12)',
                          color:
                            item.type === 'tour'
                              ? '#2563eb'
                              : item.type === 'hotel'
                              ? '#d97706'
                              : '#16a34a',
                        }}
                      >
                        {item.type}
                      </span>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>

                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      {item.subtitle}
                    </div>

                    <div style={{ fontSize: 'var(--font-size-xs)', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      ${item.unitPrice.toLocaleString()} / unit
                    </div>
                  </div>

                  {/* Quantity and Remove */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, minWidth: 18, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--status-danger)',
                        cursor: 'pointer',
                        padding: 0,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.2rem',
                        fontSize: '11px',
                      }}
                    >
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem' }}>
              <Input
                placeholder="PROMO CODE (e.g. MICHUU2026, EARLYBIRD)"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                style={{ flex: 1 }}
              />
              <Button variant="secondary" size="sm" type="submit" icon={<Tag size={14} />}>
                Apply
              </Button>
            </form>

            {promoMessage && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: promoMessage.success ? 'var(--status-success)' : 'var(--status-danger)',
                }}
              >
                {promoMessage.text}
              </div>
            )}

            {/* Pricing Breakdown */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
                <span style={{ fontWeight: 600 }}>${subtotal.toLocaleString()}</span>
              </div>

              {promoCode && (
                <div className="flex-between" style={{ color: 'var(--status-success)' }}>
                  <span>Discount ({promoCode} - {discountPercent}%):</span>
                  <span>-${discountAmount.toLocaleString()}</span>
                </div>
              )}

              <div
                className="flex-between"
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.5rem',
                  fontWeight: 800,
                  fontSize: 'var(--font-size-md)',
                }}
              >
                <span>Total Expedition Price:</span>
                <span style={{ color: 'var(--brand-primary)' }}>${totalPrice.toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* E-Ticket Modal preview after checkout */}
      {completedBooking && (
        <ETicketModal
          isOpen={isETicketOpen}
          onClose={() => {
            setIsETicketOpen(false);
            navigate('/my-bookings');
          }}
          booking={completedBooking}
        />
      )}
    </>
  );
};

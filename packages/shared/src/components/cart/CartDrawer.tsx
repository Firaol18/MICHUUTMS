import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useAuthStore } from '@tms/shared/store/useAuthStore';
import { Modal } from '@tms/shared/components/common/Modal';
import { Button } from '@tms/shared/components/common/Button';
import { Input } from '@tms/shared/components/common/Input';
import { ETicketModal } from '@tms/shared/components/common/ETicketModal';
import { tourismService } from '@tms/shared/services/tourismService';
import type { Booking } from '@tms/shared/types/booking';
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
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    clearCart,
    promoCode,
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
  const [paymentMethod, setPaymentMethod] = useState<'telebirr' | 'cbe' | 'card' | 'bank'>('telebirr');
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

  const handleCompleteCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const primaryTour = items.find((i) => i.type === 'tour') || items[0];
      const tourId = primaryTour.id.replace('-cart', '');

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
      );

      // Override calculated total price with complete cart total
      booking.totalPrice = getTotalPrice();

      setCompletedBooking(booking);
      setIsCheckoutStep(false);
      clearCart();
      closeCart();
      setIsETicketOpen(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const discountAmount = getDiscountAmount();
  const totalPrice = getTotalPrice();

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
                  Pay Now (${totalPrice.toLocaleString()})
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
              Explore Ethiopian tour packages, hotel stays, and 4x4 charters to add to your expedition!
            </p>
            <Button variant="primary" size="sm" onClick={closeCart}>
              Continue Browsing
            </Button>
          </div>
        ) : isCheckoutStep ? (
          /* Checkout Step Form */
          <form onSubmit={handleCompleteCheckout} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
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
              <Input label="Full Name" value={leadName} onChange={(e) => setLeadName(e.target.value)} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <Input label="Email Address" type="email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} required />
                <Input label="Phone / Telebirr Number" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} required />
              </div>
              <Input label="Nationality / Country" value={leadNationality} onChange={(e) => setLeadNationality(e.target.value)} required />
              <Input label="Special Dietary or Accessibility Requests" value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} placeholder="e.g. Vegetarian meal plan, Airport pickup time" />
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                Select Payment Method
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('telebirr')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'telebirr' ? '#16a34a' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'telebirr' ? 'rgba(22, 163, 74, 0.08)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: paymentMethod === 'telebirr' ? '#16a34a' : 'var(--text-secondary)',
                  }}
                >
                  <Smartphone size={18} />
                  Telebirr
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('cbe')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'cbe' ? '#2563eb' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'cbe' ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: paymentMethod === 'cbe' ? '#2563eb' : 'var(--text-secondary)',
                  }}
                >
                  <Landmark size={18} />
                  CBE Birr
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'card' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'card' ? 'var(--brand-primary-light)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: paymentMethod === 'card' ? 'var(--brand-primary)' : 'var(--text-secondary)',
                  }}
                >
                  <CreditCard size={18} />
                  Card / Visa
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  style={{
                    padding: '0.75rem 0.5rem',
                    borderRadius: 'var(--radius-md)',
                    border: `2px solid ${paymentMethod === 'bank' ? '#7c3aed' : 'var(--border-color)'}`,
                    backgroundColor: paymentMethod === 'bank' ? 'rgba(124, 58, 237, 0.08)' : 'var(--bg-primary)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '11px',
                    fontWeight: 700,
                    color: paymentMethod === 'bank' ? '#7c3aed' : 'var(--text-secondary)',
                  }}
                >
                  <Building2 size={18} />
                  Bank Transfer
                </button>
              </div>
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
                      {item.date && (
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          • {item.date}
                        </span>
                      )}
                    </div>

                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      {item.title}
                    </div>
                    {item.subtitle && (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                        {item.subtitle}
                      </div>
                    )}
                  </div>

                  {/* Quantity Controls & Delete */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                    <div style={{ fontWeight: 800, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>
                      ${(item.unitPrice * item.quantity).toLocaleString()}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '12px', fontWeight: 700, minWidth: 16, textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '4px',
                          border: '1px solid var(--border-color)',
                          backgroundColor: 'var(--bg-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={12} />
                      </button>

                      <button
                        onClick={() => removeItem(item.id)}
                        style={{
                          color: 'var(--status-danger)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          marginLeft: '0.25rem',
                        }}
                        title="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Promo Code Form */}
            <form onSubmit={handleApplyPromo} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder='Enter promo code (e.g. "MICHUU15")'
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  icon={<Tag size={15} />}
                />
              </div>
              <Button type="submit" variant="secondary" size="md">
                Apply
              </Button>
            </form>

            {promoMessage && (
              <div
                style={{
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  color: promoMessage.success ? '#16a34a' : 'var(--status-danger)',
                }}
              >
                {promoMessage.text}
              </div>
            )}

            {/* Subtotal & Totals Box */}
            <div
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                fontSize: 'var(--font-size-sm)',
              }}
            >
              <div className="flex-between">
                <span style={{ color: 'var(--text-muted)' }}>Items Subtotal:</span>
                <span>${subtotal.toLocaleString()} USD</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex-between" style={{ color: '#16a34a', fontWeight: 600 }}>
                  <span>Promo Discount ({promoCode}):</span>
                  <span>-${discountAmount.toLocaleString()} USD</span>
                </div>
              )}

              <div
                className="flex-between"
                style={{
                  borderTop: '1px solid var(--border-color)',
                  paddingTop: '0.5rem',
                  marginTop: '0.25rem',
                  fontSize: 'var(--font-size-md)',
                  fontWeight: 800,
                }}
              >
                <span>Total Amount:</span>
                <span style={{ color: 'var(--brand-primary)' }}>${totalPrice.toLocaleString()} USD</span>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Instant E-Ticket Confirmation Modal */}
      <ETicketModal
        isOpen={isETicketOpen}
        onClose={() => setIsETicketOpen(false)}
        booking={completedBooking}
        multiItems={items.map((i) => ({
          type: i.type,
          title: i.title,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))}
      />
    </>
  );
};

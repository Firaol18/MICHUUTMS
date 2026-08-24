import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCartStore } from '@tms/shared/store/useCartStore';
import { useNotificationStore } from '@tms/shared/store/useNotificationStore';
import { toast } from '@tms/shared/store/useToastStore';
import { newsletterService } from '@tms/shared/services/newsletterService';
import { Mail, CheckCircle2, Copy, ArrowRight } from 'lucide-react';

export const NewsletterSection: React.FC = () => {
  const navigate = useNavigate();
  const applyCartPromo = useCartStore((s) => s.applyPromoCode);
  const addNotification = useNotificationStore((s) => s.addNotification);

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    promoCode: string;
    discountPercent: number;
    singleUseRestriction: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.warning('Please enter a valid email address.', 'Newsletter');
      return;
    }

    setIsLoading(true);
    try {
      const res = await newsletterService.subscribe(email.trim());

      setSubscriptionData({
        promoCode: res.promoCode || 'MICHUU15',
        discountPercent: res.discountPercent || 15,
        singleUseRestriction:
          res.singleUseRestriction || 'Applies to 1 Tour Package or 1 Cultural Event.',
      });

      // Dispatch in-app notification offer to store
      await addNotification({
        userEmail: email.trim(),
        title: `🎉 15% Travel Offer Activated (${res.promoCode || 'MICHUU15'})`,
        message: `Your welcome voucher code ${res.promoCode || 'MICHUU15'} is active! 15% discount will be applied to 1 Tour Package or 1 Event.`,
        type: 'promotion',
        targetRole: 'customer',
        link: '/tours',
      });

      toast.success(
        `Welcome offer active! Promo Code: ${res.promoCode || 'MICHUU15'} (15% off 1 Tour/Event)`,
        'Offer Received 🎉'
      );
      setEmail('');
    } catch (err: any) {
      toast.warning(
        err?.message || 'This email address is already subscribed to the MICHUU newsletter.',
        'Already Subscribed'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyAndApply = () => {
    if (!subscriptionData) return;
    navigator.clipboard.writeText(subscriptionData.promoCode);
    applyCartPromo(subscriptionData.promoCode);
    setCopied(true);
    toast.success(
      `Copied & Applied ${subscriptionData.promoCode} to your booking checkout!`,
      'Promo Applied'
    );
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section
      className="tms-newsletter-section"
      style={{
        maxWidth: '800px',
        margin: 'clamp(2rem, 5vw, 4rem) auto 0 auto',
        padding: '0 clamp(1rem, 3vw, 1.5rem)',
        position: 'relative',
        zIndex: 2,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Minimalist Premium White Newsletter Card ── */}
      <div
        className="tms-newsletter-card"
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #E2E8F0',
          boxShadow: '0 12px 40px rgba(15, 23, 42, 0.06)',
          padding: 'clamp(2rem, 5vw, 3.25rem) clamp(1.25rem, 4vw, 2.75rem)',
          textAlign: 'center',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Eyebrow with Subtle Gold Spark Detail ── */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            fontSize: 'clamp(10px, 2.2vw, 11px)',
            fontWeight: 800,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#2563EB',
            marginBottom: '0.65rem',
          }}
        >
          <span style={{ color: '#F59E0B', fontSize: '13px' }}>✦</span>
          <span>Get Exclusive Travel Updates</span>
        </div>

        {/* ── Clean Travel Heading ── */}
        <h2
          style={{
            fontSize: 'clamp(1.4rem, 4.2vw, 2.15rem)',
            fontWeight: 800,
            color: '#0F172A',
            letterSpacing: '-0.025em',
            lineHeight: 1.25,
            margin: '0 auto 0.5rem auto',
          }}
        >
          Stay Inspired by Ethiopia
        </h2>

        {/* ── Subtitle in #526581 for High Legibility ── */}
        <p
          style={{
            fontSize: 'clamp(13px, 2.5vw, 14.5px)',
            color: '#526581',
            maxWidth: '520px',
            margin: '0 auto 1.85rem auto',
            lineHeight: 1.55,
          }}
        >
          Get new destinations, special offers, and expedition updates from MICHUU.
        </p>

        {/* ── Active Voucher View ── */}
        {subscriptionData ? (
          <div
            style={{
              maxWidth: '520px',
              margin: '0 auto',
              padding: '1.25rem clamp(1rem, 3vw, 1.5rem)',
              borderRadius: '14px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.45rem',
                color: '#16A34A',
                fontWeight: 700,
                fontSize: '13.5px',
                textAlign: 'center',
              }}
            >
              <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
              <span>Subscription Confirmed! 15% Travel Offer Ready</span>
            </div>

            <div
              className="tms-newsletter-voucher-box"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '0.65rem 1rem',
                backgroundColor: '#FFFFFF',
                border: '1px dashed #2563EB',
                borderRadius: '10px',
                gap: '0.75rem',
                boxSizing: 'border-box',
              }}
            >
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontSize: '10px', color: '#64748B', textTransform: 'uppercase', fontWeight: 700 }}>
                  Promo Code (1 Tour or Event)
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#2563EB', letterSpacing: '0.04em' }}>
                  {subscriptionData.promoCode}
                </div>
              </div>

              <button
                type="button"
                onClick={handleCopyAndApply}
                style={{
                  padding: '0.5rem 0.9rem',
                  borderRadius: '8px',
                  border: '1px solid #2563EB',
                  backgroundColor: copied ? '#2563EB' : 'transparent',
                  color: copied ? '#FFFFFF' : '#2563EB',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                {copied ? <CheckCircle2 size={13} /> : <Copy size={13} />}
                <span>{copied ? 'Applied ✓' : 'Copy & Apply'}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                handleCopyAndApply();
                navigate('/tours');
              }}
              style={{
                width: '100%',
                padding: '0.75rem 1.25rem',
                borderRadius: '10px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13px',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#1D4ED8')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#2563EB')}
            >
              <span>Explore Tours & Apply 15% Off</span>
              <ArrowRight size={14} />
            </button>
          </div>
        ) : (
          /* ── Clean Focused Email Form ── */
          <form
            onSubmit={handleSubmit}
            className="tms-newsletter-form"
            style={{
              display: 'flex',
              gap: '0.5rem',
              maxWidth: '520px',
              margin: '0 auto',
              width: '100%',
              justifyContent: 'center',
              alignItems: 'stretch',
              boxSizing: 'border-box',
            }}
          >
            {/* Clean Input with Mail Icon & Refined Focus Interaction */}
            <div
              className="tms-newsletter-input-wrap"
              style={{
                flex: 1,
                minWidth: '200px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                boxSizing: 'border-box',
              }}
            >
              <Mail
                size={16}
                style={{
                  position: 'absolute',
                  left: '1rem',
                  color: '#94A3B8',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="email"
                placeholder="Enter your email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '0.8rem 1rem 0.8rem 2.6rem',
                  borderRadius: '12px',
                  border: '1px solid #DCE3ED',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  fontSize: '13.5px',
                  fontWeight: 500,
                  outline: 'none',
                  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
                  transition: 'all 0.18s ease',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563EB';
                  e.target.style.boxShadow = '0 0 0 3px rgba(37, 99, 235, 0.12)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#DCE3ED';
                  e.target.style.boxShadow = 'inset 0 1px 2px rgba(0,0,0,0.02)';
                }}
              />
            </div>

            {/* Focused Primary Blue Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="tms-newsletter-btn"
              style={{
                padding: '0.8rem 1.5rem',
                borderRadius: '12px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                fontWeight: 700,
                fontSize: '13.5px',
                border: 'none',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 14px rgba(37, 99, 235, 0.22)',
                transition: 'all 0.18s ease',
                opacity: isLoading ? 0.75 : 1,
                boxSizing: 'border-box',
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#1D4ED8';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 18px rgba(37, 99, 235, 0.28)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#2563EB';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.22)';
                }
              }}
            >
              <span>{isLoading ? 'Subscribing...' : 'Subscribe →'}</span>
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

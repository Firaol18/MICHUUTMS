import React from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Mail,
  Phone,
  MapPin,
  ArrowRight,
  Send,
  MessageCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';

const FacebookIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const InstagramIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
);

const YoutubeIcon: React.FC<{ size?: number }> = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
  </svg>
);

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: '#070d18',
        color: '#e2e8f0',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        marginTop: '4rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ── Background Subtle Ethiopian Highlands Mountain Contour Silhouette ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          opacity: 0.035,
          zIndex: 0,
        }}
      >
        <svg width="100%" height="100%" viewBox="0 0 1440 380" fill="none" preserveAspectRatio="none">
          <path
            d="M0 240L80 210L160 250L260 170L380 230L520 120L640 190L780 90L920 180L1060 110L1200 200L1340 140L1440 210V380H0V240Z"
            fill="#38bdf8"
          />
          <path
            d="M0 280L120 250L240 290L360 220L480 270L600 180L720 240L860 150L980 220L1120 170L1260 230L1380 190L1440 240V380H0V280Z"
            fill="#2563eb"
          />
        </svg>
      </div>

      {/* ── MAIN 4-COLUMN CORE ── */}
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '3.5rem 1.5rem 2.75rem 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
            gap: '2.5rem',
            marginBottom: '2.5rem',
          }}
        >
          {/* Col 1: Brand & Socials */}
          <div>
            <Link
              to="/"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.65rem',
                textDecoration: 'none',
                marginBottom: '0.85rem',
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                <Compass size={20} style={{ color: '#ffffff' }} />
              </div>
              <span
                style={{
                  fontWeight: 900,
                  fontSize: '1.2rem',
                  letterSpacing: '-0.02em',
                  color: '#ffffff',
                }}
              >
                MICHUU <span style={{ color: '#38bdf8' }}>TMS</span>
              </span>
            </Link>

            <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.25rem' }}>
              Discover Ethiopia through authentic local experiences, unforgettable journeys, and expert-guided adventures across the Horn of Africa.
            </p>

            {/* Social Media Links */}
            <div>
              <div
                style={{
                  fontSize: '10.5px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: '#64748b',
                  marginBottom: '0.6rem',
                }}
              >
                Follow Our Journey
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                {[
                  { icon: <FacebookIcon size={15} />, label: 'Facebook', url: 'https://facebook.com' },
                  { icon: <InstagramIcon size={15} />, label: 'Instagram', url: 'https://instagram.com' },
                  { icon: <Send size={15} />, label: 'Telegram', url: 'https://t.me' },
                  { icon: <MessageCircle size={15} />, label: 'WhatsApp', url: 'https://whatsapp.com' },
                  { icon: <YoutubeIcon size={15} />, label: 'YouTube', url: 'https://youtube.com' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.label}
                    title={s.label}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.09)',
                      color: '#94a3b8',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
                      textDecoration: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.2)';
                      e.currentTarget.style.color = '#38bdf8';
                      e.currentTarget.style.borderColor = 'rgba(56, 189, 248, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                      e.currentTarget.style.color = '#94a3b8';
                      e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.09)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {s.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Col 2: Top Destinations with Adjacent Arrow Animation */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.04em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Destinations
            </h4>
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                fontSize: '13px',
              }}
            >
              {[
                { name: 'Wenchi Crater Lake', to: '/tours?category=mountain' },
                { name: 'Lalibela Rock-Hewn Churches', to: '/tours?category=cultural' },
                { name: 'Simien Mountains', to: '/tours?category=wildlife' },
                { name: 'Danakil Depression', to: '/tours?category=adventure' },
                { name: 'Bale Mountains & Sanetti', to: '/tours?category=wildlife' },
              ].map((dest) => (
                <li key={dest.name}>
                  <Link
                    to={dest.to}
                    style={{
                      color: '#94a3b8',
                      textDecoration: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      transition: 'all 0.15s ease',
                      padding: '0.1rem 0',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = '#38bdf8';
                      const arrow = e.currentTarget.querySelector('.dest-arrow') as HTMLElement | null;
                      if (arrow) arrow.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = '#94a3b8';
                      const arrow = e.currentTarget.querySelector('.dest-arrow') as HTMLElement | null;
                      if (arrow) arrow.style.transform = 'translateX(0)';
                    }}
                  >
                    <span>{dest.name}</span>
                    <span
                      className="dest-arrow"
                      style={{
                        fontSize: '12px',
                        color: '#60a5fa',
                        transition: 'transform 0.18s ease',
                        display: 'inline-block',
                      }}
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Concierge Support */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.04em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Concierge Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '13px', color: '#94a3b8' }}>
              <div>
                <a
                  href="tel:+251920443110"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#ffffff',
                    fontWeight: 600,
                    textDecoration: 'none',
                    marginBottom: '0.15rem',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#ffffff')}
                >
                  <Phone size={14} style={{ color: '#38bdf8' }} />
                  <span>+251 (0) 911 000 000</span>
                </a>
                <div style={{ fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.35rem', paddingLeft: '1.4rem' }}>
                  <Clock size={11} /> Daily 8:00 AM – 8:00 PM (EAT)
                </div>
              </div>

              <div>
                <a
                  href="mailto:concierge@michuutours.et"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#94a3b8',
                    textDecoration: 'none',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#38bdf8')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                >
                  <Mail size={14} style={{ color: '#38bdf8' }} />
                  <span>concierge@michuutours.et</span>
                </a>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', lineHeight: 1.4 }}>
                <MapPin size={14} style={{ color: '#38bdf8', flexShrink: 0, marginTop: '2px' }} />
                <span>Bole Road, Tourism Plaza, Addis Ababa</span>
              </div>

              <div style={{ marginTop: '0.2rem' }}>
                <Link
                  to="/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#38bdf8',
                    textDecoration: 'none',
                  }}
                >
                  <span>Need help planning? Contact us</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </div>

          {/* Col 4: Trust & Confidence Card */}
          <div>
            <h4
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: '#ffffff',
                letterSpacing: '0.04em',
                marginBottom: '1rem',
                textTransform: 'uppercase',
              }}
            >
              Travel With Confidence
            </h4>
            <div
              style={{
                padding: '0.9rem 1rem',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.035)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.55rem',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.1rem' }}>
                Why travel with us?
              </div>
              {[
                'Licensed Ethiopian Tour Operator',
                'Experienced Local Guides',
                'Secure Local & Global Booking',
                'Transparent Direct Pricing',
                '24/7 On-Trip Assistance',
              ].map((item) => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '12px', color: '#cbd5e1' }}>
                  <CheckCircle2 size={13} style={{ color: '#10b981', flexShrink: 0 }} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── BOTTOM LEGAL BAR ── */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          backgroundColor: '#050912',
          padding: '1.25rem 1.5rem',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '0.85rem',
            fontSize: '12px',
            color: '#64748b',
          }}
        >
          <div>
            © 2026 <span style={{ color: '#cbd5e1', fontWeight: 600 }}>MICHUU TMS</span> · Built for unforgettable Ethiopian journeys
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1.25rem',
              flexWrap: 'wrap',
            }}
          >
            <Link to="/faq" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
              Help & FAQ
            </Link>
            <span>·</span>
            <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/contact" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
              Terms of Service
            </Link>
            <span>·</span>
            <Link to="/tours" style={{ color: '#94a3b8', textDecoration: 'none', transition: 'color 0.15s ease' }} onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')} onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}>
              Expeditions Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

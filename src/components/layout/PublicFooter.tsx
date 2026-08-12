import React from 'react';
import { Compass, Mail, Phone, MapPin, ShieldCheck } from 'lucide-react';

export const PublicFooter: React.FC = () => {
  return (
    <footer
      style={{
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border-color)',
        marginTop: '4rem',
        padding: '4rem 1.5rem 2rem 1.5rem',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
          {/* Brand Col */}
          <div>
            <div className="flex-center" style={{ gap: '0.75rem', justifyContent: 'flex-start', marginBottom: '1rem' }}>
              <div
                className="flex-center text-gradient"
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary-light)',
                }}
              >
                <Compass size={24} style={{ color: 'var(--brand-primary)' }} />
              </div>
              <span style={{ fontWeight: 800, fontSize: 'var(--font-size-lg)', letterSpacing: '-0.02em' }}>
                MICHUU <span style={{ color: 'var(--brand-primary)' }}>TMS</span>
              </span>
            </div>
            <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              Ethiopia's premier tourism & travel portal. Crafting extraordinary expeditions to Wenchi Crater Lake, Lalibela, Simien Mountains, and Danakil Depression.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Top Ethiopian Destinations
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              <li>Wenchi Crater Lake, Oromia</li>
              <li>Lalibela Rock-Hewn Churches, Amhara</li>
              <li>Simien Mountains National Park</li>
              <li>Danakil Depression & Erta Ale, Afar</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Concierge Support
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                <Phone size={16} style={{ color: 'var(--brand-primary)' }} /> +251 (0) 911 000 000
              </div>
              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                <Mail size={16} style={{ color: 'var(--brand-primary)' }} /> concierge@michuutours.et
              </div>
              <div className="flex-center" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--brand-primary)' }} /> Bole Road, Tourism Plaza, Addis Ababa, Ethiopia
              </div>
            </div>
          </div>

          {/* Guarantee */}
          <div>
            <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>
              Travel Protection
            </h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={28} style={{ color: 'var(--status-success)' }} />
              <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                100% Certified Ethiopian Wildlife Conservation & Licensed Rangers
              </div>
            </div>
          </div>
        </div>

        <div
          className="flex-between"
          style={{
            borderTop: '1px solid var(--border-color)',
            paddingTop: '1.5rem',
            fontSize: 'var(--font-size-xs)',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div>© 2026 MICHUU Tourism & Travel Management System. All Rights Reserved.</div>
          <div className="flex-center" style={{ gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Sitemap</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

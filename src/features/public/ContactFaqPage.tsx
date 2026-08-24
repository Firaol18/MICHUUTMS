import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useLanguageStore } from '@/store/useLanguageStore';
import { tourismService } from '@/services/tourismService';
import {
  HelpCircle,
  Phone,
  MapPin,
  ChevronDown,
  ChevronUp,
  Send,
  CheckCircle2,
  MessageSquare,
  Bell,
} from 'lucide-react';

interface FAQItem {
  id: string;
  category: 'general' | 'visa' | 'payment' | 'safety';
  question: string;
  answer: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'faq-1',
    category: 'general',
    question: 'When is the best season to visit Ethiopia’s tourist destinations?',
    answer: 'The ideal travel window for most Ethiopian highland destinations (Lalibela, Gondar, Simien Mountains, Wenchi) and the Danakil Depression is October through February (the dry season). June through September brings the main rainy season, turning mountain slopes lush green.',
  },
  {
    id: 'faq-2',
    category: 'visa',
    question: 'How do I obtain an Ethiopian Tourist Visa?',
    answer: 'Most international travelers can easily obtain an official Ethiopian Tourist E-Visa online via evisa.gov.et. E-visas are typically processed within 24 to 48 hours. Visitors from certain countries may also receive a visa on arrival at Bole International Airport (ADD).',
  },
  {
    id: 'faq-3',
    category: 'payment',
    question: 'What payment methods does MICHUU TMS accept?',
    answer: 'We accept Telebirr, CBE Birr, Visa / Mastercard credit cards, and direct Ethiopian Bank Transfers. Payments can be processed in ETB (Birr) or USD ($).',
  },
  {
    id: 'faq-4',
    category: 'safety',
    question: 'Are ranger guides included with high-altitude and volcano expeditions?',
    answer: 'Yes! All MICHUU expeditions (including Simien trekking, Danakil volcano climbs, and Wenchi crater lake tours) include certified, multilingual Ethiopian Eco-Ranger Guides fluent in Amharic, Oromo, and English.',
  },
  {
    id: 'faq-5',
    category: 'general',
    question: 'Can I request custom private charters or group discounts?',
    answer: 'Absolutely. We offer private 4x4 Toyota Land Cruiser charters, helicopter transfers to Danakil/Erta Ale, and specialized group rates for corporate or family bookings.',
  },
];

export const ContactFaqPage: React.FC = () => {
  const { t } = useLanguageStore();

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<string | null>('faq-1');
  const [faqCategory, setFaqCategory] = useState<'all' | 'general' | 'visa' | 'payment' | 'safety'>('all');

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactSubject, setContactSubject] = useState('Custom Ethiopian Expedition Inquiry');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isContactSuccess, setIsContactSuccess] = useState(false);

  // Newsletter State
  const [newsEmail, setNewsEmail] = useState('');
  const [newsSuccess, setNewsSuccess] = useState(false);

  const filteredFaqs = FAQ_ITEMS.filter(
    (item) => faqCategory === 'all' || item.category === faqCategory
  );

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await tourismService.createEnquiry({
        name: contactName || 'Traveler Customer',
        email: contactEmail || 'traveler@example.com',
        mobile: contactPhone || '+251 91 123 4567',
        subject: contactSubject || 'Custom Ethiopian Expedition Inquiry',
        message: contactMessage,
      });
      setIsContactSuccess(true);
      setContactMessage('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsEmail) return;
    setNewsSuccess(true);
    setNewsEmail('');
    setTimeout(() => setNewsSuccess(false), 4000);
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header Banner */}
      <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.875rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 700,
            marginBottom: '1rem',
          }}
        >
          <HelpCircle size={14} /> Help Center & Contact Concierge
        </div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          Frequently Asked Questions & <span className="text-gradient">Contact Us</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem', maxWidth: '700px', margin: '0.25rem auto 0 auto' }}>
          Have questions about travel visas, customized 4x4 charters, or payment options? Contact our Addis Ababa concierge team anytime.
        </p>
      </div>

      {/* Main Grid: Contact Form & Info on Left, FAQ Accordion on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '2.5rem', marginBottom: '3.5rem' }}>
        {/* Left Column: Contact Form & Office Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Card glass style={{ padding: '2rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={20} style={{ color: 'var(--brand-primary)' }} /> Send Us an Inquiry
            </h3>

            {isContactSuccess && (
              <div
                style={{
                  padding: '0.875rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'rgba(22, 163, 74, 0.1)',
                  color: '#16a34a',
                  fontWeight: 700,
                  fontSize: 'var(--font-size-xs)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                <CheckCircle2 size={16} /> Thank you! Our travel concierge will reply to your email within 2 hours.
              </div>
            )}

            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                label="Full Name"
                placeholder="e.g. Eleanor Vance"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="e.g. eleanor@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  required
                />
                <Input
                  label="Phone / WhatsApp"
                  placeholder="e.g. +251 91 123 4567"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Inquiry Topic
                </label>
                <select
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontSize: 'var(--font-size-xs)',
                  }}
                >
                  <option value="Custom Expedition">Custom Tour & Private Charter</option>
                  <option value="Payment / Voucher">Payment or Voucher Clarification</option>
                  <option value="Ranger Guide">Certified Eco-Ranger Guide Request</option>
                  <option value="Corporate / Group">Corporate / Group Booking</option>
                </select>
              </div>

              <div>
                <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, display: 'block', marginBottom: '0.4rem' }}>
                  Your Message
                </label>
                <textarea
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Tell us your travel dates, number of guests, and desired destinations (e.g. Wenchi, Lalibela, Simien)..."
                  style={{
                    width: '100%',
                    padding: '0.625rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-primary)',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: 'var(--font-size-xs)',
                  }}
                  required
                />
              </div>

              <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} icon={<Send size={16} />}>
                Submit Inquiry
              </Button>
            </form>
          </Card>

          {/* Office Contact Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Card glass style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.35rem' }}>
                <MapPin size={16} /> Main Headquarters
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                Tourism Plaza, 4th Floor<br />
                Bole Road, Addis Ababa, Ethiopia
              </p>
            </Card>

            <Card glass style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a', fontWeight: 700, fontSize: 'var(--font-size-sm)', marginBottom: '0.35rem' }}>
                <Phone size={16} /> 24/7 Support Hotline
              </div>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                +251 911 00 22 33<br />
                concierge@michuutours.et
              </p>
            </Card>
          </div>
        </div>

        {/* Right Column: FAQ Accordion */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('faq_title')}
            </h3>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
              {(['all', 'general', 'visa', 'payment', 'safety'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFaqCategory(cat)}
                  style={{
                    padding: '0.3rem 0.65rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: faqCategory === cat ? 700 : 500,
                    backgroundColor: faqCategory === cat ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: faqCategory === cat ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${faqCategory === cat ? 'var(--brand-primary)' : 'var(--border-color)'}`,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredFaqs.map((faq) => {
              const isExpanded = openFaq === faq.id;
              return (
                <Card
                  key={faq.id}
                  glass
                  style={{
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'border-color 0.2s ease',
                    border: isExpanded ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-color)',
                  }}
                  onClick={() => setOpenFaq(isExpanded ? null : faq.id)}
                >
                  <div className="flex-between">
                    <h4 style={{ fontSize: 'var(--font-size-sm)', fontWeight: 700, color: 'var(--text-primary)', paddingRight: '1rem' }}>
                      {faq.question}
                    </h4>
                    <div style={{ color: 'var(--brand-primary)', flexShrink: 0 }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {isExpanded && (
                    <p style={{ marginTop: '0.875rem', paddingTop: '0.875rem', borderTop: '1px solid var(--border-color)', fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {faq.answer}
                    </p>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

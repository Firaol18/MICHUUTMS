import React, { useState } from 'react';
import { Card } from '@/components/common/Card';
import { ETHIOPIAN_EVENTS } from '@/services/mockEventsData';
import type { EthiopianEvent } from '@/services/mockEventsData';
import { CalendarDays, MapPin, Tag, ChevronRight, Info } from 'lucide-react';

const CATEGORY_LABELS: Record<EthiopianEvent['category'], string> = {
  religious: 'Religious',
  cultural: 'Cultural',
  nature: 'Nature',
  music: 'Music & Arts',
  food: 'Food & Drink',
  sport: 'Sport',
};

const CATEGORY_COLORS: Record<EthiopianEvent['category'], string> = {
  religious: '#7c3aed',
  cultural: '#0284c7',
  nature: '#16a34a',
  music: '#db2777',
  food: '#d97706',
  sport: '#dc2626',
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const EventsCalendarPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<EthiopianEvent['category'] | 'all'>('all');
  const [selected, setSelected] = useState<EthiopianEvent | null>(null);

  const filtered = ETHIOPIAN_EVENTS.filter(
    (e) => selectedCategory === 'all' || e.category === selectedCategory,
  );

  const getMonthFromDate = (dateStr: string) => {
    return new Date(dateStr).getMonth(); // 0-indexed
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1rem' }}>
          <CalendarDays size={14} /> Ethiopian Events & Festivals
        </div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Festivals & <span className="text-gradient">Events Calendar</span>
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Plan your visit around Ethiopia's vibrant religious, cultural, and sporting events.
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        {['all', ...Object.keys(CATEGORY_LABELS)].map((cat) => {
          const isActive = selectedCategory === cat;
          const color = cat === 'all' ? 'var(--brand-primary)' : CATEGORY_COLORS[cat as EthiopianEvent['category']];
          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat as EthiopianEvent['category'] | 'all')}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#fff' : 'var(--text-secondary)',
                backgroundColor: isActive ? color : 'var(--bg-secondary)',
                border: `1px solid ${isActive ? color : 'var(--border-color)'}`,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {cat === 'all' ? '🌍 All Events' : CATEGORY_LABELS[cat as EthiopianEvent['category']]}
            </button>
          );
        })}
      </div>

      {/* Calendar Timeline */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '0' }}>
        {MONTH_NAMES.map((month, monthIndex) => {
          const monthEvents = filtered.filter((e) => getMonthFromDate(e.date) === monthIndex);
          if (monthEvents.length === 0) return null;
          return (
            <div key={month} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '2rem' }}>
              {/* Month Label */}
              <div style={{ width: '80px', flexShrink: 0, textAlign: 'right', paddingTop: '0.25rem' }}>
                <span style={{ fontSize: 'var(--font-size-xs)', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{month}</span>
              </div>

              {/* Timeline line + events */}
              <div style={{ flex: 1, position: 'relative', paddingLeft: '1.5rem', borderLeft: '2px solid var(--border-color)' }}>
                <div style={{ position: 'absolute', left: -6, top: 8, width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--brand-primary)', border: '2px solid var(--bg-primary)' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {monthEvents.map((event) => (
                    <Card
                      key={event.id}
                      glass
                      
                      style={{ padding: 0, overflow: 'hidden', cursor: 'pointer', border: selected?.id === event.id ? `2px solid ${CATEGORY_COLORS[event.category]}` : '1px solid var(--border-color)' }}
                      onClick={() => setSelected(selected?.id === event.id ? null : event)}
                    >
                      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', minHeight: '140px' }}>
                        {/* Image */}
                        <div style={{ backgroundImage: `url(${event.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                          {event.isFeatured && (
                            <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', backgroundColor: '#f59e0b', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
                              ⭐ FEATURED
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div style={{ padding: '1.25rem' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '11px', fontWeight: 700, color: CATEGORY_COLORS[event.category], backgroundColor: `${CATEGORY_COLORS[event.category]}18`, padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                              <Tag size={10} /> {CATEGORY_LABELS[event.category]}
                            </span>
                          </div>

                          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.375rem' }}>
                            {event.title}
                          </h3>

                          <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <CalendarDays size={12} />
                              {new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                              {event.endDate && ` — ${new Date(event.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                            </span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                              <MapPin size={12} /> {event.location}
                            </span>
                          </div>

                          <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                            {event.description.slice(0, 160)}...
                          </p>

                          {selected?.id === event.id && (
                            <div style={{ marginTop: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: '0.5rem' }}>
                              <Info size={14} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: 2 }} />
                              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600 }}>
                                Visitor Tip: {event.tipForVisitors}
                              </p>
                            </div>
                          )}

                          <button
                            style={{ marginTop: '0.5rem', fontSize: 'var(--font-size-xs)', color: 'var(--brand-primary)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}
                            onClick={(e) => { e.stopPropagation(); setSelected(selected?.id === event.id ? null : event); }}
                          >
                            {selected?.id === event.id ? 'Show less' : 'Visitor tips'} <ChevronRight size={12} />
                          </button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

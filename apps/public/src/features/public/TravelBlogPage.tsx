import React, { useState } from 'react';
import { Card } from '@tms/shared/components/common/Card';
import { Button } from '@tms/shared/components/common/Button';
import { useContentStore } from '@tms/shared/store/useContentStore';
import type { BlogArticle } from '@tms/shared/services/mockEventsData';
import { BookOpen, Clock, Tag, ArrowRight, Search } from 'lucide-react';

const BLOG_CATEGORIES: { label: string; value: BlogArticle['category'] | 'all'; emoji: string }[] = [
  { label: 'All Articles', value: 'all', emoji: '📚' },
  { label: 'Itineraries', value: 'itinerary', emoji: '🗺️' },
  { label: 'Travel Tips', value: 'tips', emoji: '💡' },
  { label: 'Culture', value: 'culture', emoji: '🏛️' },
  { label: 'Nature & Wildlife', value: 'nature', emoji: '🦁' },
  { label: 'Food & Coffee', value: 'food', emoji: '☕' },
  { label: 'Destination Guides', value: 'guide', emoji: '📍' },
];

export const TravelBlogPage: React.FC = () => {
  const { articles, fetchArticles } = useContentStore();
  const [selectedCat, setSelectedCat] = useState<BlogArticle['category'] | 'all'>('all');
  const [search, setSearch] = useState('');
  const [openArticle, setOpenArticle] = useState<BlogArticle | null>(null);

  React.useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);


  const filtered = articles.filter((a) => {
    if (selectedCat !== 'all' && a.category !== selectedCat) return false;
    if (search && !a.title.toLowerCase().includes(search.toLowerCase()) && !a.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()))) return false;
    return true;
  });

  const featuredArticle = articles[0];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '2.5rem 1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: 'var(--font-size-xs)', fontWeight: 700, marginBottom: '1rem' }}>
          <BookOpen size={14} /> MICHUU Travel Blog
        </div>
        <h1 style={{ fontSize: 'var(--font-size-3xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Ethiopia <span className="text-gradient">Travel Guides</span> & Itineraries
        </h1>
        <p style={{ fontSize: 'var(--font-size-md)', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
          Expert tips, curated itineraries, and cultural deep-dives written by certified MICHUU guides.
        </p>
      </div>

      {/* If an article is open, show full article view */}
      {openArticle ? (
        <div>
          <button onClick={() => setOpenArticle(null)} style={{ fontSize: 'var(--font-size-sm)', color: 'var(--brand-primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
            ← Back to all articles
          </button>

          <div style={{ maxWidth: '820px', margin: '0 auto' }}>
            {/* Cover Image */}
            <div style={{ height: '380px', backgroundImage: `url(${openArticle.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-lg)', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 55%)' }} />
              <div style={{ position: 'absolute', bottom: '1.5rem', left: '1.5rem', right: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  {openArticle.tags.slice(0, 4).map((t) => (
                    <span key={t} style={{ fontSize: '11px', backgroundColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(4px)', color: '#fff', padding: '0.2rem 0.5rem', borderRadius: 'var(--radius-full)', fontWeight: 600 }}>
                      {t}
                    </span>
                  ))}
                </div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', lineHeight: 1.25, textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}>{openArticle.title}</h2>
              </div>
            </div>

            {/* Author & Meta */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <img src={openArticle.authorAvatar} alt={openArticle.author} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', color: 'var(--text-primary)' }}>{openArticle.author}</div>
                <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                  <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {openArticle.readMinutes} min read</span>
                  <span>Published {new Date(openArticle.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Article Content */}
            <div style={{ lineHeight: 1.85, color: 'var(--text-secondary)', fontSize: 'var(--font-size-md)' }}>
              {openArticle.content.split('\n\n').map((para, i) => (
                <p key={i} style={{ marginBottom: '1.5rem' }}>{para}</p>
              ))}
            </div>

            {/* CTA */}
            <div style={{ marginTop: '2.5rem', padding: '2rem', background: 'linear-gradient(135deg, var(--brand-primary-light) 0%, rgba(6,182,212,0.1) 100%)', borderRadius: 'var(--radius-lg)', textAlign: 'center' }}>
              <h3 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700, marginBottom: '0.75rem' }}>Ready to explore Ethiopia?</h3>
              <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: 'var(--font-size-sm)' }}>Browse our curated tour packages and book your next adventure.</p>
              <Button variant="primary" size="lg" icon={<ArrowRight size={16} />} onClick={() => window.location.href = '/tours'}>
                Browse Tour Packages
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Featured Article */}
          <Card glass style={{ padding: 0, overflow: 'hidden', marginBottom: '2.5rem', cursor: 'pointer' }} onClick={() => setOpenArticle(featuredArticle)}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
              <div style={{ minHeight: '260px', height: '100%', backgroundImage: `url(${featuredArticle.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              <div style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '11px', fontWeight: 700, color: '#f59e0b', backgroundColor: '#fffbeb', padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', marginBottom: '1rem', width: 'fit-content' }}>
                  ⭐ FEATURED ARTICLE
                </div>
                <h2 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: '0.75rem', lineHeight: 1.3 }}>
                  {featuredArticle.title}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
                  {featuredArticle.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <img src={featuredArticle.authorAvatar} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', fontWeight: 600 }}>{featuredArticle.author}</span>
                  <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>· {featuredArticle.readMinutes} min read</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Filter + Search */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {BLOG_CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setSelectedCat(c.value)}
                  style={{
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-full)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: selectedCat === c.value ? 700 : 500,
                    backgroundColor: selectedCat === c.value ? 'var(--brand-primary)' : 'var(--bg-secondary)',
                    color: selectedCat === c.value ? '#ffffff' : 'var(--text-secondary)',
                    border: '1px solid var(--border-color)',
                    cursor: 'pointer',
                  }}
                >
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
            <div style={{ position: 'relative', marginLeft: 'auto', width: '100%', maxWidth: '240px' }}>
              <Search size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search articles..."
                style={{ paddingLeft: '2.25rem', paddingRight: '1rem', paddingTop: '0.5rem', paddingBottom: '0.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-xs)', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', width: '100%' }}
              />
            </div>
          </div>

          {/* Articles Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {filtered.map((article) => (
              <Card key={article.id} glass style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenArticle(article)}>
                <div style={{ height: '200px', backgroundImage: `url(${article.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)' }} />
                  <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', backgroundColor: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: '10px', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={10} /> {article.readMinutes} min
                  </div>
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {article.tags.slice(0, 3).map((t) => (
                      <span key={t} style={{ fontSize: '10px', fontWeight: 600, color: 'var(--brand-primary)', backgroundColor: 'var(--brand-primary-light)', padding: '0.15rem 0.5rem', borderRadius: 'var(--radius-full)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                        <Tag size={9} /> {t}
                      </span>
                    ))}
                  </div>
                  <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.35 }}>
                    {article.title}
                  </h3>
                  <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1rem' }}>
                    {article.excerpt.slice(0, 120)}...
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <img src={article.authorAvatar} alt="" style={{ width: 26, height: 26, borderRadius: '50%', objectFit: 'cover' }} />
                      <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)' }}>{article.author}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {new Date(article.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

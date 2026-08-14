import React, { useState } from 'react';
import { PageHeader } from '@/components/layout/PageHeader';
import type { Column } from '@/components/data-display/DataTable';
import { DataTable } from '@/components/data-display/DataTable';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Modal } from '@/components/common/Modal';
import { useContentStore } from '@/store/useContentStore';
import type { BlogArticle } from '@/services/mockEventsData';
import {
  BookOpen,
  Plus,
  Search,
  Edit2,
  Trash2,
  Clock,
  User,
  Eye,
} from 'lucide-react';

const CATEGORIES: { label: string; value: BlogArticle['category']; color: string }[] = [
  { label: 'Itineraries', value: 'itinerary', color: '#0284c7' },
  { label: 'Travel Tips', value: 'tips', color: '#16a34a' },
  { label: 'Culture', value: 'culture', color: '#7c3aed' },
  { label: 'Nature & Wildlife', value: 'nature', color: '#059669' },
  { label: 'Food & Coffee', value: 'food', color: '#d97706' },
  { label: 'Destination Guides', value: 'guide', color: '#db2777' },
];

export const AdminBlogPage: React.FC = () => {
  const { articles, addArticle, updateArticle, deleteArticle } = useContentStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
  const [previewArticle, setPreviewArticle] = useState<BlogArticle | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [category, setCategory] = useState<BlogArticle['category']>('guide');
  const [author, setAuthor] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [readMinutes, setReadMinutes] = useState(6);
  const [coverImage, setCoverImage] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');

  const openCreateModal = () => {
    setEditingArticle(null);
    setTitle('');
    setSlug('');
    setCategory('guide');
    setAuthor('Tigist Haile');
    setAuthorAvatar('https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100');
    setReadMinutes(6);
    setCoverImage('https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200');
    setTagsInput('Ethiopia, Travel Guide, Culture');
    setExcerpt('');
    setContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (art: BlogArticle) => {
    setEditingArticle(art);
    setTitle(art.title);
    setSlug(art.slug);
    setCategory(art.category);
    setAuthor(art.author);
    setAuthorAvatar(art.authorAvatar);
    setReadMinutes(art.readMinutes);
    setCoverImage(art.coverImage);
    setTagsInput(art.tags.join(', '));
    setExcerpt(art.excerpt);
    setContent(art.content);
    setIsModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingArticle) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
      );
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !excerpt || !content) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingArticle) {
      updateArticle(editingArticle.id, {
        title,
        slug: generatedSlug,
        category,
        author,
        authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
        readMinutes: Number(readMinutes) || 5,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200',
        tags,
        excerpt,
        content,
      });
    } else {
      addArticle({
        title,
        slug: generatedSlug,
        category,
        author,
        authorAvatar: authorAvatar || 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100',
        publishedAt: new Date().toISOString().split('T')[0],
        readMinutes: Number(readMinutes) || 5,
        coverImage: coverImage || 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=1200',
        tags,
        excerpt,
        content,
      });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete article "${name}"?`)) {
      deleteArticle(id);
    }
  };

  const filteredArticles = articles.filter((art) => {
    const matchesSearch =
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = categoryFilter === 'all' || art.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const columns: Column<BlogArticle>[] = [
    {
      header: 'Article Title & Author',
      minWidth: '280px',
      cell: (row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 260 }}>
          <img
            src={row.coverImage}
            alt={row.title}
            style={{ width: 50, height: 44, borderRadius: 'var(--radius-sm)', objectFit: 'cover', flexShrink: 0 }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: '0.2rem' }}>
              {row.title}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>✍️ {row.author}</span>
              <span>•</span>
              <span>📅 {row.publishedAt}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      header: 'Category',
      minWidth: '110px',
      noWrap: true,
      cell: (row) => {
        const catObj = CATEGORIES.find((c) => c.value === row.category);
        return (
          <Badge variant="outline" style={{ borderColor: catObj?.color, color: catObj?.color, fontWeight: 700 }}>
            {catObj?.label || row.category}
          </Badge>
        );
      },
    },
    {
      header: 'Read Time',
      minWidth: '100px',
      noWrap: true,
      cell: (row) => (
        <span style={{ fontSize: 'var(--font-size-xs)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', color: 'var(--text-secondary)' }}>
          <Clock size={12} /> {row.readMinutes} min
        </span>
      ),
    },
    {
      header: 'Tags',
      minWidth: '140px',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {row.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: '10px',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-full)',
                padding: '0.1rem 0.4rem',
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Actions',
      minWidth: '120px',
      noWrap: true,
      align: 'center',
      cell: (row) => (
        <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'center' }}>
          <Button variant="ghost" size="sm" icon={<Eye size={14} />} onClick={() => setPreviewArticle(row)} title="Preview Article" />
          <Button variant="ghost" size="sm" icon={<Edit2 size={14} />} onClick={() => openEditModal(row)} title="Edit Article" />
          <Button variant="ghost" size="sm" icon={<Trash2 size={14} style={{ color: 'var(--status-danger)' }} />} onClick={() => handleDelete(row.id, row.title)} title="Delete Article" />
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Manage Travel Blog & Articles"
        description="Publish guides, travel tips, cultural highlights, and itineraries to engage visitors and boost SEO."
        actions={
          <Button variant="primary" size="sm" icon={<Plus size={16} />} onClick={openCreateModal}>
            Write New Article
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ maxWidth: '320px', width: '100%' }}>
          <Input
            placeholder="Search articles by title, author or tag..."
            icon={<Search size={16} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCategoryFilter('all')}
            style={{
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${categoryFilter === 'all' ? 'var(--brand-primary)' : 'var(--border-color)'}`,
              backgroundColor: categoryFilter === 'all' ? 'var(--brand-primary-light)' : 'transparent',
              color: categoryFilter === 'all' ? 'var(--brand-primary)' : 'var(--text-secondary)',
              fontSize: 'var(--font-size-xs)',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All Categories ({articles.length})
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setCategoryFilter(cat.value)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: 'var(--radius-full)',
                border: `1px solid ${categoryFilter === cat.value ? cat.color : 'var(--border-color)'}`,
                backgroundColor: categoryFilter === cat.value ? `${cat.color}15` : 'transparent',
                color: categoryFilter === cat.value ? cat.color : 'var(--text-secondary)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <DataTable columns={columns} data={filteredArticles} keyExtractor={(item) => item.id} />

      {/* Create / Edit Article Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingArticle ? `Edit Article: ${editingArticle.title}` : 'Write New Travel Blog Post'}
        size="lg"
        footer={
          <div className="flex-between" style={{ width: '100%' }}>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSave}>
              {editingArticle ? 'Save Article Changes' : 'Publish Article'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input
            label="Article Title"
            placeholder="e.g. 7-Day Ethiopian Highlands Itinerary"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="URL Slug"
              placeholder="e.g. 7-day-ethiopian-highlands"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
            />
            <div className="tms-input-group">
              <label className="tms-input-label">Category</label>
              <select
                className="tms-input"
                value={category}
                onChange={(e) => setCategory(e.target.value as BlogArticle['category'])}
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px', gap: '1rem' }}>
            <Input
              label="Author Name"
              placeholder="e.g. Tigist Haile"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              required
            />
            <Input
              label="Author Avatar URL"
              value={authorAvatar}
              onChange={(e) => setAuthorAvatar(e.target.value)}
            />
            <Input
              label="Read (min)"
              type="number"
              min={1}
              max={60}
              value={readMinutes}
              onChange={(e) => setReadMinutes(Number(e.target.value))}
            />
          </div>

          <Input
            label="Cover Image URL"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            required
          />

          <Input
            label="Tags (Comma separated)"
            placeholder="Lalibela, UNESCO, Culture, History"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />

          <div className="tms-input-group">
            <label className="tms-input-label">Excerpt / Summary (Shown on Cards)</label>
            <textarea
              className="tms-input"
              rows={2}
              placeholder="Catchy 2-sentence hook..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
            />
          </div>

          <div className="tms-input-group">
            <label className="tms-input-label">Full Article Content</label>
            <textarea
              className="tms-input"
              rows={8}
              placeholder="Write the full comprehensive guide or narrative here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
          </div>
        </form>
      </Modal>

      {/* Preview Article Modal */}
      {previewArticle && (
        <Modal
          isOpen={true}
          onClose={() => setPreviewArticle(null)}
          title={`Article Preview: ${previewArticle.title}`}
          size="lg"
          footer={
            <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button variant="primary" size="sm" onClick={() => setPreviewArticle(null)}>
                Close Preview
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ height: 220, backgroundImage: `url(${previewArticle.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center', borderRadius: 'var(--radius-md)' }} />
            <div>
              <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 800, color: 'var(--text-primary)' }}>{previewArticle.title}</h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.5rem', color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                <span>✍️ {previewArticle.author}</span>
                <span>•</span>
                <span>📅 {previewArticle.publishedAt}</span>
                <span>•</span>
                <span>⏱️ {previewArticle.readMinutes} min read</span>
              </div>
            </div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-secondary)', borderLeft: '3px solid var(--brand-primary)', paddingLeft: '0.75rem' }}>
              {previewArticle.excerpt}
            </p>
            <div style={{ fontSize: 'var(--font-size-sm)', lineHeight: 1.7, color: 'var(--text-primary)', whiteSpace: 'pre-line' }}>
              {previewArticle.content}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

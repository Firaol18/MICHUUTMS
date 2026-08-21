import { http } from './apiClient';

export interface CmsPage {
  id: string;
  title: string;
  type: string;
  slug: string;
  content: string;
  status: 'published' | 'draft';
  updatedAt: string;
}

function mapPage(p: any): CmsPage {
  return {
    id: String(p.id),
    title: p.title,
    type: p.type,
    slug: p.slug,
    content: p.content ?? '',
    status: p.status ?? 'published',
    updatedAt: typeof p.updatedAt === 'string'
      ? p.updatedAt.split('T')[0]
      : new Date(p.updatedAt).toISOString().split('T')[0],
  };
}

export const cmsService = {
  async getAll(): Promise<CmsPage[]> {
    const res = await http.get('/cms');
    const raw = Array.isArray(res.data) ? res.data : [];
    return raw.map(mapPage);
  },

  async getBySlug(slug: string): Promise<CmsPage> {
    const res = await http.get('/cms/by-slug', { params: { slug } });
    return mapPage(res.data);
  },

  async update(id: string, data: Partial<Pick<CmsPage, 'title' | 'content' | 'status'>>): Promise<CmsPage> {
    const res = await http.patch(`/cms/${id}`, data);
    return mapPage(res.data);
  },
};

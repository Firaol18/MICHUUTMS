import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { BlogPost } from './entities/blog-post.entity';
import { CreateBlogPostDto } from '../common/dto/shared.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(BlogPost)
    private readonly repo: Repository<BlogPost>,
  ) {}

  async findAll(query?: { category?: string; search?: string; tag?: string }) {
    const { category, search, tag } = query || {};
    const qb = this.repo.createQueryBuilder('b').where('b.isPublished = :pub', { pub: true });

    if (category && category !== 'all') {
      qb.andWhere('b.category = :category', { category });
    }
    if (search) {
      qb.andWhere('(b.title ILIKE :s OR b.excerpt ILIKE :s OR b.content ILIKE :s)', { s: `%${search}%` });
    }
    if (tag) {
      qb.andWhere(':tag = ANY(b.tags)', { tag });
    }

    qb.orderBy('b.publishedAt', 'DESC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const post = await this.repo.findOneBy({ id });
    if (!post) throw new NotFoundException(`Blog post #${id} not found`);
    return post;
  }

  async findBySlug(slug: string) {
    const post = await this.repo.findOne({
      where: { slug },
    });
    if (!post) throw new NotFoundException(`Blog post "${slug}" not found`);
    // increment view count
    await this.repo.update(post.id, { viewCount: post.viewCount + 1 });
    return post;
  }

  async create(dto: CreateBlogPostDto) {
    const post = this.repo.create(dto);
    return this.repo.save(post);
  }

  async update(id: string, dto: Partial<CreateBlogPostDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const post = await this.findOne(id);
    return this.repo.remove(post);
  }
}

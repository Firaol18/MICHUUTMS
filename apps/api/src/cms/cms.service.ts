import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CmsPage } from './entities/cms-page.entity';
import { CreateCmsPageDto, UpdateCmsPageDto } from './dto/cms-page.dto';

const DEFAULT_PAGES = [
  { title: 'About Us & Company History', type: 'aboutus', slug: '/about', content: '<h2>About MICHUU Tours</h2><p>We are Ethiopia\'s premier eco-tourism operator, dedicated to sustainable and authentic travel experiences since 2010.</p>', status: 'published' as const },
  { title: 'Terms & Conditions of Travel', type: 'terms', slug: '/terms', content: '<h2>Terms & Conditions</h2><p>By booking with MICHUU Tours you agree to our standard travel terms and conditions. All bookings are subject to availability.</p>', status: 'published' as const },
  { title: 'Privacy & Cookie Policy', type: 'privacy', slug: '/privacy', content: '<h2>Privacy Policy</h2><p>MICHUU Tours respects your privacy. We collect only data necessary to fulfill your booking and never sell personal information to third parties.</p>', status: 'published' as const },
  { title: 'Contact Us & Concierge Desk', type: 'contactus', slug: '/contact', content: '<h2>Contact MICHUU Tours</h2><p>Email: hello@michuutours.et | Phone: +251 11 234 5678 | Address: Bole Road, Addis Ababa, Ethiopia</p>', status: 'published' as const },
];

@Injectable()
export class CmsService implements OnModuleInit {
  constructor(
    @InjectRepository(CmsPage)
    private readonly repo: Repository<CmsPage>,
  ) {}

  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save(DEFAULT_PAGES.map((p) => this.repo.create(p)));
    }
  }

  async findAll(): Promise<CmsPage[]> {
    return this.repo.find({ order: { createdAt: 'ASC' } });
  }

  async findBySlug(slug: string): Promise<CmsPage> {
    const page = await this.repo.findOne({ where: { slug } });
    if (!page) throw new NotFoundException(`CMS page "${slug}" not found`);
    return page;
  }

  async create(dto: CreateCmsPageDto): Promise<CmsPage> {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCmsPageDto): Promise<CmsPage> {
    const page = await this.repo.findOneBy({ id });
    if (!page) throw new NotFoundException(`CMS page #${id} not found`);
    Object.assign(page, dto);
    return this.repo.save(page);
  }
}

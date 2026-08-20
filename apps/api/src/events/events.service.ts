import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from '../common/dto/shared.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  async findAll(query?: { category?: string; search?: string; status?: string }) {
    const { category, search } = query || {};
    const qb = this.repo.createQueryBuilder('e');

    if (category && category !== 'all') {
      qb.andWhere('e.category = :category', { category });
    }
    if (search) {
      qb.andWhere('(e.title ILIKE :s OR e.location ILIKE :s OR e.description ILIKE :s)', { s: `%${search}%` });
    }

    qb.orderBy('e.eventDate', 'ASC');
    const events = await qb.getMany();

    // today's date in YYYY-MM-DD (UTC) for pure date comparison
    const todayStr = new Date().toISOString().split('T')[0]; // e.g. "2026-08-20"

    const parseDate = (d: string | Date | null | undefined): string | null => {
      if (!d) return null;
      if (typeof d === 'string') return d.substring(0, 10);
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return null;
    };

    const withStatus = events.map((e) => {
      const startStr = parseDate(e.eventDate);
      const endStr = parseDate(e.endDate) ?? startStr ?? '';

      let computedStatus: string;
      if (!startStr) {
        computedStatus = 'upcoming';
      } else if (endStr < todayStr) {
        computedStatus = 'completed';
      } else if (startStr <= todayStr && endStr >= todayStr) {
        computedStatus = 'ongoing';
      } else {
        computedStatus = 'upcoming';
      }

      return { ...e, status: computedStatus };
    });

    // Apply status filter after computation
    if (query?.status) {
      return withStatus.filter((e) => e.status === query.status);
    }

    return withStatus;
  }

  async findOne(id: string) {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto) {
    const partial: Partial<Event> = {
      title: dto.title,
      description: dto.description,
      eventDate: dto.eventDate,
      endDate: dto.endDate,
      location: dto.location,
      category: dto.category,
      imageUrl: dto.imageUrl,
      isActive: (dto as any).isActive ?? true,
      status: 'upcoming',
      tags: (dto as any).tags ?? [],
      price: dto.price ?? 0,
      isFree: dto.isFree ?? (!dto.price || dto.price === 0),
      hasOffer: dto.hasOffer ?? false,
      offerTag: dto.offerTag ?? null,
      discountPercent: dto.discountPercent ?? null,
      originalPrice: dto.originalPrice ?? null,
    };
    const event = this.repo.create(partial);
    return this.repo.save(event);
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    await this.findOne(id);
    const updates = {
      ...dto,
      ...(dto.price !== undefined && { price: dto.price ?? 0 }),
    };
    await this.repo.update(id, updates);
    return this.findOne(id);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    return this.repo.remove(event);
  }
}

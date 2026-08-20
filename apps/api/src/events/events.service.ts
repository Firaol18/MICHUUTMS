import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Event } from './entities/event.entity';
import { CreateEventDto } from '../common/dto/shared.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  async findAll(query?: { category?: string; search?: string; status?: string }) {
    const { category, search, status } = query || {};
    const qb = this.repo.createQueryBuilder('e');

    if (category && category !== 'all') {
      qb.andWhere('e.category = :category', { category });
    }
    if (status) {
      qb.andWhere('e.status = :status', { status });
    }
    if (search) {
      qb.andWhere('(e.title ILIKE :s OR e.location ILIKE :s OR e.description ILIKE :s)', { s: `%${search}%` });
    }

    qb.orderBy('e.eventDate', 'ASC');
    return qb.getMany();
  }

  async findOne(id: string) {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return event;
  }

  async create(dto: CreateEventDto) {
    const event = this.repo.create(dto);
    return this.repo.save(event);
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    const event = await this.findOne(id);
    return this.repo.remove(event);
  }
}

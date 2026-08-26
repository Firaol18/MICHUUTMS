import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { CreateEventDto } from '../common/dto/shared.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
  ) {}

  /**
   * Calculates live booked tickets and remaining available slots for an event
   */
  private async enrichEvent(event: Event): Promise<Event> {
    // Find active non-cancelled bookings for this event (matching id or title)
    const allBookings = await this.bookingsRepo.find();
    const eventBookings = allBookings.filter(
      (b) =>
        (b.tourId === event.id ||
          (b.tourTitle && event.title && b.tourTitle.toLowerCase().includes(event.title.toLowerCase())) ||
          (event.title && b.tourTitle && event.title.toLowerCase().includes(b.tourTitle.toLowerCase()))) &&
        b.status !== 'cancelled',
    );

    const bookedSeats = eventBookings.reduce(
      (sum, b) => sum + (Number(b.numberOfTravelers) || 1),
      0,
    );

    const capacity = Number(event.capacity) || 50;
    const availableSlots = Math.max(0, capacity - bookedSeats);
    const isSoldOut = capacity > 0 && availableSlots === 0;

    return {
      ...event,
      capacity,
      bookedSeats,
      availableSlots,
      status: isSoldOut && event.status === 'upcoming' ? 'sold_out' : event.status,
    } as Event;
  }

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
    const todayStr = new Date().toISOString().split('T')[0];

    const parseDate = (d: string | Date | null | undefined): string | null => {
      if (!d) return null;
      if (typeof d === 'string') return d.substring(0, 10);
      if (d instanceof Date) return d.toISOString().split('T')[0];
      return null;
    };

    // Enrich events with dates and real-time slot data
    const enrichedEvents = await Promise.all(
      events.map(async (e) => {
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

        const enriched = await this.enrichEvent({ ...e, status: computedStatus });
        return enriched;
      }),
    );

    // Apply status filter after computation
    if (query?.status) {
      return enrichedEvents.filter((e) => e.status === query.status);
    }

    return enrichedEvents;
  }

  async findOne(id: string) {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return this.enrichEvent(event);
  }

  async getAvailability(id: string) {
    const event = await this.findOne(id);
    return {
      eventId: event.id,
      eventTitle: event.title,
      capacity: event.capacity,
      bookedSeats: event.bookedSeats,
      availableSlots: event.availableSlots,
      isSoldOut: event.availableSlots === 0,
      status: event.status,
    };
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
      capacity: (dto as any).capacity ? Number((dto as any).capacity) : 50,
    };
    const event = this.repo.create(partial);
    const saved = await this.repo.save(event);
    return this.enrichEvent(saved);
  }

  async update(id: string, dto: Partial<CreateEventDto>) {
    await this.findOne(id);
    const updates: any = {
      ...dto,
      ...(dto.price !== undefined && { price: dto.price ?? 0 }),
      ...((dto as any).capacity !== undefined && { capacity: Number((dto as any).capacity) }),
    };
    await this.repo.update(id, updates);
    return this.findOne(id);
  }

  async remove(id: string) {
    const event = await this.repo.findOneBy({ id });
    if (!event) throw new NotFoundException(`Event #${id} not found`);
    return this.repo.remove(event);
  }
}

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tour, TourCategory, DifficultyLevel, TourStatus } from './entities/tour.entity';
import { CreateTourDto, QueryToursDto } from './dto/tour.dto';

@Injectable()
export class ToursService {
  constructor(@InjectRepository(Tour) private repo: Repository<Tour>) {}

  /**
   * Calculates real-time booked seats and remaining available slots for a tour
   */
  public enrichTour(tour: Tour, travelDate?: string): Tour {
    const allBookings = tour.bookings || [];
    // Only active (non-cancelled) bookings occupy slots
    const activeBookings = allBookings.filter((b) => b.status !== 'cancelled');

    // Total booked seats across all active bookings
    const bookedSeats = activeBookings.reduce(
      (sum, b) => sum + (Number(b.numberOfTravelers) || 1),
      0,
    );

    const maxGroupSize = Number(tour.maxGroupSize) || 0;
    const availableSlots = Math.max(0, maxGroupSize - bookedSeats);
    const isSoldOut = maxGroupSize > 0 && availableSlots === 0;

    // Optional date-specific calculation if travelDate is supplied
    let dateBookedSeats: number | undefined;
    let dateAvailableSlots: number | undefined;
    if (travelDate) {
      const dateBookings = activeBookings.filter((b) => String(b.travelDate).startsWith(travelDate));
      dateBookedSeats = dateBookings.reduce((sum, b) => sum + (Number(b.numberOfTravelers) || 1), 0);
      dateAvailableSlots = Math.max(0, maxGroupSize - dateBookedSeats);
    }

    return {
      ...tour,
      bookedSeats,
      availableSlots,
      status: isSoldOut && tour.status === 'active' ? ('sold_out' as TourStatus) : tour.status,
      ...(travelDate ? { dateBookedSeats, dateAvailableSlots } : {}),
    } as Tour;
  }

  async findAll(query: QueryToursDto) {
    const { category, search, page = 1, limit = 20, status, featured } = query;
    const skip = (page - 1) * limit;

    const where: any[] = [{}];

    if (status) where.forEach((w) => (w.status = status));
    else where.forEach((w) => (w.status = 'active')); // default: only active tours
    if (featured !== undefined) where.forEach((w) => (w.isFeatured = featured));
    if (category && category !== 'all') where.forEach((w) => (w.category = category));

    let finalWhere = where[0];
    if (search) {
      finalWhere = [
        { ...where[0], title: ILike(`%${search}%`) },
        { ...where[0], destinationName: ILike(`%${search}%`) },
        { ...where[0], summary: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.repo.findAndCount({
      where: finalWhere,
      relations: ['bookings'],
      skip,
      take: limit,
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
    });

    return {
      data: data.map((t) => this.enrichTour(t)),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string) {
    const tour = await this.repo.findOne({
      where: { id },
      relations: ['bookings'],
    });
    if (!tour) throw new NotFoundException(`Tour ${id} not found`);
    return this.enrichTour(tour);
  }

  async findBySlug(slug: string) {
    const tour = await this.repo.findOne({
      where: { slug },
      relations: ['bookings'],
    });
    if (!tour) throw new NotFoundException(`Tour "${slug}" not found`);
    return this.enrichTour(tour);
  }

  async getAvailability(idOrSlug: string, travelDate?: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const tour = uuidRegex.test(idOrSlug) ? await this.findOne(idOrSlug) : await this.findBySlug(idOrSlug);

    const enriched = this.enrichTour(tour, travelDate);
    return {
      tourId: enriched.id,
      tourTitle: enriched.title,
      maxGroupSize: enriched.maxGroupSize,
      bookedSeats: enriched.bookedSeats,
      availableSlots: enriched.availableSlots,
      isSoldOut: enriched.availableSlots === 0,
      status: enriched.status,
      travelDate: travelDate || null,
      dateBookedSeats: (enriched as any).dateBookedSeats ?? null,
      dateAvailableSlots: (enriched as any).dateAvailableSlots ?? null,
    };
  }

  async create(dto: CreateTourDto) {
    const tour = this.repo.create({
      ...dto,
      category: dto.category as TourCategory,
      difficulty: dto.difficulty as DifficultyLevel,
      status: (dto.status || 'active') as TourStatus,
    });
    return this.repo.save(tour);
  }

  async update(id: string, dto: Partial<CreateTourDto>) {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.category) updateData.category = dto.category as TourCategory;
    if (dto.difficulty) updateData.difficulty = dto.difficulty as DifficultyLevel;
    if (dto.status) updateData.status = dto.status as TourStatus;
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    const tour = await this.findOne(id);
    return this.repo.remove(tour);
  }
}

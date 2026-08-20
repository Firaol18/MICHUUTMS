import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, CancelBookingDto } from './dto/booking.dto';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private repo: Repository<Booking>,
    private readonly toursService: ToursService,
  ) { }

  private generateRef(): string {
    return `MCH-BKG-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async create(dto: CreateBookingDto, userId?: string): Promise<Booking> {
    this.logger.log(`Creating booking with tourId=${dto.tourId}`);

    // Validate required fields
    if (!dto.traveler?.name || !dto.traveler?.email) {
      throw new BadRequestException('Traveler name and email are required.');
    }
    if (!dto.travelDate) {
      throw new BadRequestException('Travel date is required.');
    }

    let tour: any = null;

    // Only look up tour if a UUID-looking tourId is provided
    if (dto.tourId) {
      const tourId = String(dto.tourId).trim();
      // UUID format check (basic)
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(tourId)) {
        try {
          tour = await this.toursService.findOne(tourId);
        } catch {
          this.logger.warn(`Tour with id ${tourId} not found in DB — proceeding without tour reference`);
        }
      } else {
        this.logger.warn(`tourId "${tourId}" is not a UUID, skipping tour lookup`);
      }
    }

    const numberOfTravelers = Number(dto.numberOfTravelers) || 1;
    if (tour && tour.maxGroupSize && numberOfTravelers > tour.maxGroupSize) {
      throw new BadRequestException(
        `This tour only has ${tour.maxGroupSize} spots available.`,
      );
    }

    const pricePerPerson = tour?.pricePerPerson ?? (dto.totalPrice ? dto.totalPrice / numberOfTravelers : 1500);
    const tourTitle = dto.tourTitle || tour?.title || 'Ethiopian Tour Expedition';
    const destinationName = dto.destinationName || tour?.destinationName || 'Ethiopia';
    const adults = dto.numberOfAdults ?? numberOfTravelers;
    const children = dto.numberOfChildren ?? 0;
    const totalPrice = dto.totalPrice ?? (pricePerPerson * numberOfTravelers);
    const assignedGuideName = dto.assignedGuideName ?? null;
    const status = (dto.status as any) || 'pending';

    const booking = this.repo.create({
      tourId: tour?.id ?? null,
      tourTitle,
      destinationName,
      bookingReference: this.generateRef(),
      traveler: {
        name: dto.traveler.name,
        email: dto.traveler.email,
        phone: dto.traveler.phone || '',
        nationality: dto.traveler.nationality || '',
        specialRequests: dto.traveler.specialRequests,
      },
      travelDate: dto.travelDate,
      numberOfTravelers,
      numberOfAdults: adults,
      numberOfChildren: children,
      totalPrice,
      status,
      paymentStatus: (dto.paymentStatus as any) || 'paid',
      refundStatus: 'none',
      assignedGuideName,
      userId: userId ?? null,
    });

    const saved = (await this.repo.save(booking)) as Booking;
    this.logger.log(`Booking created: ${saved.bookingReference} (id=${saved.id})`);
    return saved;
  }

  async findAll(filters?: { status?: string; search?: string; page?: number; limit?: number }) {
    const { status, search, page = 1, limit = 100 } = filters || {};
    const qb = this.repo.createQueryBuilder('b').leftJoinAndSelect('b.tour', 'tour');
    if (status && status !== 'all') {
      qb.andWhere('b.status = :status', { status });
    }
    if (search && search.trim() !== '') {
      const s = `%${search.trim()}%`;
      qb.andWhere(
        '(b.bookingReference ILIKE :s OR b.tourTitle ILIKE :s OR b.destinationName ILIKE :s OR CAST(b.traveler AS text) ILIKE :s)',
        { s },
      );
    }
    qb.skip((page - 1) * limit).take(limit).orderBy('b.bookingDate', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(userId: string) {
    return this.repo.find({
      where: { userId },
      order: { bookingDate: 'DESC' },
    });
  }

  async findOne(id: string) {
    const booking = await this.repo.findOne({ where: { id }, relations: ['tour'] });
    if (!booking) throw new NotFoundException(`Booking ${id} not found`);
    return booking;
  }

  async cancel(id: string, dto: CancelBookingDto) {
    const booking = await this.findOne(id);
    const wasAlreadyPaid = booking.paymentStatus === 'paid';
    booking.status = 'cancelled';
    booking.cancellationReason = dto.reason || 'Cancelled by admin';
    if (wasAlreadyPaid || dto.requestRefund) {
      booking.paymentStatus = 'refunded';
      booking.refundStatus = 'processed';
    }
    return this.repo.save(booking);
  }

  async updateStatus(id: string, status: string) {
    const booking = await this.findOne(id);
    booking.status = status as any;
    return this.repo.save(booking);
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const booking = await this.findOne(id);
    booking.paymentStatus = paymentStatus as any;
    return this.repo.save(booking);
  }

  async assignGuide(id: string, assignedGuideName: string, assignedGuideId?: string) {
    const booking = await this.findOne(id);
    booking.assignedGuideName = assignedGuideName;
    if (assignedGuideId) booking.assignedGuideId = assignedGuideId;
    return this.repo.save(booking);
  }
}

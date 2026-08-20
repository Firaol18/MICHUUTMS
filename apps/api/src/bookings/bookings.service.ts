import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto, CancelBookingDto } from './dto/booking.dto';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking) private repo: Repository<Booking>,
    private readonly toursService: ToursService,
  ) {}

  private generateRef(): string {
    return `MCH-BKG-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async create(dto: CreateBookingDto, userId?: number): Promise<Booking> {
    let tour: any = null;
    if (dto.tourId) {
      const parsedId = typeof dto.tourId === 'number' ? dto.tourId : parseInt(String(dto.tourId).replace(/\D/g, ''), 10);
      if (!isNaN(parsedId)) {
        try {
          tour = await this.toursService.findOne(parsedId);
        } catch {
          // Tour id not in database, continue with DTO info
        }
      }
    }

    const numberOfTravelers = Number(dto.numberOfTravelers) || 1;
    if (tour && tour.maxGroupSize && numberOfTravelers > tour.maxGroupSize) {
      throw new BadRequestException(
        `This tour only has ${tour.maxGroupSize} spots available.`,
      );
    }

    const pricePerPerson = tour?.pricePerPerson || 1500;
    const tourTitle = dto.tourTitle || (tour ? tour.title : 'Ethiopian Tour Expedition');
    const destinationName = dto.destinationName || (tour ? (tour.destinationName || 'Ethiopia') : 'Ethiopia');
    const adults = dto.numberOfAdults ?? numberOfTravelers;
    const children = dto.numberOfChildren ?? 0;
    const totalPrice = pricePerPerson * numberOfTravelers;

    const booking = this.repo.create({
      tourId: tour ? tour.id : undefined,
      tourTitle,
      destinationName,
      bookingReference: this.generateRef(),
      traveler: dto.traveler || {
        name: 'Guest Traveler',
        email: 'guest@example.com',
        phone: '+251 91 123 4567',
        nationality: 'Ethiopia',
      },
      travelDate: dto.travelDate || new Date().toISOString().split('T')[0],
      numberOfTravelers,
      numberOfAdults: adults,
      numberOfChildren: children,
      totalPrice,
      status: 'pending',
      paymentStatus: 'unpaid',
      refundStatus: 'none',
      userId: userId ? Number(userId) : undefined,
    });
    return this.repo.save(booking);
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
        '(b.bookingReference ILIKE :s OR b.tourTitle ILIKE :s OR b.destinationName ILIKE :s OR b.traveler ::text ILIKE :s)',
        { s },
      );
    }
    qb.skip((page - 1) * limit).take(limit).orderBy('b.bookingDate', 'DESC');
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findByUser(userId: number) {
    return this.repo.find({
      where: { userId },
      order: { bookingDate: 'DESC' },
    });
  }

  async findOne(id: number) {
    const booking = await this.repo.findOne({ where: { id }, relations: ['tour'] });
    if (!booking) throw new NotFoundException(`Booking #${id} not found`);
    return booking;
  }

  async cancel(id: number, dto: CancelBookingDto) {
    const booking = await this.findOne(id);
    const wasAlreadyPaid = booking.paymentStatus === 'paid';
    booking.status = 'cancelled';
    booking.cancellationReason = dto.reason || 'Cancelled by user';
    if (wasAlreadyPaid && dto.requestRefund) {
      booking.paymentStatus = 'refunded';
      booking.refundStatus = 'pending';
    }
    return this.repo.save(booking);
  }

  async updateStatus(id: number, status: string) {
    await this.findOne(id);
    await this.repo.update(id, { status } as any);
    return this.findOne(id);
  }

  async updatePaymentStatus(id: number, paymentStatus: string) {
    await this.findOne(id);
    await this.repo.update(id, { paymentStatus } as any);
    return this.findOne(id);
  }

  async assignGuide(id: number, assignedGuideName: string, assignedGuideId?: string) {
    await this.findOne(id);
    await this.repo.update(id, { assignedGuideName, assignedGuideId } as any);
    return this.findOne(id);
  }
}


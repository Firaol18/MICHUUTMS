import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { Event } from '../events/entities/event.entity';
import { CreateBookingDto, CancelBookingDto } from './dto/booking.dto';
import { ToursService } from '../tours/tours.service';

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

  constructor(
    @InjectRepository(Booking) private repo: Repository<Booking>,
    @InjectRepository(Event) private eventsRepo: Repository<Event>,
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
    let event: any = null;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    // Look up tour or event
    if (dto.tourId) {
      const targetId = String(dto.tourId).trim();
      if (uuidRegex.test(targetId)) {
        try {
          tour = await this.toursService.findOne(targetId);
        } catch {
          try {
            event = await this.eventsRepo.findOneBy({ id: targetId });
          } catch {}
        }
      } else {
        // Not a UUID: try slug or search by destination / title
        try {
          tour = await this.toursService.findBySlug(targetId);
        } catch {
          try {
            const allTours = await this.toursService.findAll({ limit: 100 });
            tour = allTours.data?.find(
              (t) =>
                t.id === targetId ||
                t.slug === targetId ||
                (t.title && t.title.toLowerCase().includes(targetId.toLowerCase())),
            );
          } catch {}
        }
        if (!tour) {
          try {
            const allEvents = await this.eventsRepo.find();
            event = allEvents.find(
              (e) =>
                e.id === targetId ||
                (e.title && e.title.toLowerCase().includes(targetId.toLowerCase())),
            );
          } catch {}
        }
      }
    }

    // Fallback: match by tourTitle if still unresolved
    if (!tour && !event && dto.tourTitle) {
      const titleToMatch = dto.tourTitle;
      try {
        const matchingTours = await this.toursService.findAll({ search: titleToMatch, limit: 10 });
        tour = matchingTours.data?.find(
          (t) =>
            t.title.toLowerCase().includes(titleToMatch.toLowerCase()) ||
            titleToMatch.toLowerCase().includes(t.title.toLowerCase()),
        );
      } catch {}
      if (!tour) {
        try {
          const allEvents = await this.eventsRepo.find();
          event = allEvents.find(
            (e) =>
              (e.title && e.title.toLowerCase().includes(titleToMatch.toLowerCase())) ||
              (e.title && titleToMatch.toLowerCase().includes(e.title.toLowerCase())),
          );
        } catch {}
      }
    }

    const numberOfTravelers = Number(dto.numberOfTravelers) || 1;

    // Strict slot availability check for Tours
    if (tour && tour.maxGroupSize) {
      const existingBookings = await this.repo.find({
        where: { tourId: tour.id },
      });

      const activeBookings = existingBookings.filter((b) => b.status !== 'cancelled');
      const bookedSeats = activeBookings.reduce(
        (sum, b) => sum + (Number(b.numberOfTravelers) || 1),
        0,
      );

      const availableSlots = Math.max(0, Number(tour.maxGroupSize) - bookedSeats);

      if (availableSlots <= 0) {
        throw new BadRequestException(
          `Sorry, "${tour.title}" is completely sold out (${tour.maxGroupSize}/${tour.maxGroupSize} seats already booked).`,
        );
      }

      if (numberOfTravelers > availableSlots) {
        throw new BadRequestException(
          `Only ${availableSlots} seat${availableSlots > 1 ? 's are' : ' is'} available for "${tour.title}" (${bookedSeats} of ${tour.maxGroupSize} booked). You requested ${numberOfTravelers}.`,
        );
      }
    }

    // Strict slot availability check for Events
    if (event && event.capacity) {
      const existingBookings = await this.repo.find({
        where: { tourId: event.id },
      });

      const activeBookings = existingBookings.filter((b) => b.status !== 'cancelled');
      const bookedSeats = activeBookings.reduce(
        (sum, b) => sum + (Number(b.numberOfTravelers) || 1),
        0,
      );

      const availableSlots = Math.max(0, Number(event.capacity) - bookedSeats);

      if (availableSlots <= 0) {
        throw new BadRequestException(
          `Sorry, tickets for event "${event.title}" are completely sold out (${event.capacity}/${event.capacity} passes reserved).`,
        );
      }

      if (numberOfTravelers > availableSlots) {
        throw new BadRequestException(
          `Only ${availableSlots} pass${availableSlots > 1 ? 'es are' : ' is'} available for "${event.title}" (${bookedSeats} of ${event.capacity} reserved). You requested ${numberOfTravelers}.`,
        );
      }
    }

    const travelerEmail = (dto.traveler.email || '').toLowerCase().trim();
    const resolvedTourId = tour?.id || event?.id || (dto.tourId && uuidRegex.test(String(dto.tourId)) ? String(dto.tourId) : null);
    const resolvedTitle = dto.tourTitle || tour?.title || event?.title || '';

    // Enforce 1 active booking per customer for each tour or event
    if (travelerEmail || userId) {
      const allActiveBookings = await this.repo.find();
      const existingUserBooking = allActiveBookings.find(
        (b) =>
          b.status !== 'cancelled' &&
          ((b.traveler?.email && b.traveler.email.toLowerCase().trim() === travelerEmail) ||
            (userId && b.userId && b.userId === userId)) &&
          ((resolvedTourId && b.tourId && b.tourId === resolvedTourId) ||
            (resolvedTitle &&
              b.tourTitle &&
              (b.tourTitle.toLowerCase().includes(resolvedTitle.toLowerCase()) ||
                resolvedTitle.toLowerCase().includes(b.tourTitle.toLowerCase())))),
      );

      if (existingUserBooking) {
        throw new BadRequestException(
          `You already have an active reservation (Ref #${existingUserBooking.bookingReference}) for "${existingUserBooking.tourTitle || resolvedTitle}". Each customer can only book once per tour or event experience.`,
        );
      }
    }

    const pricePerPerson = tour?.pricePerPerson ?? event?.price ?? (dto.totalPrice ? dto.totalPrice / numberOfTravelers : 1500);
    const tourTitle = dto.tourTitle || tour?.title || event?.title || 'Ethiopian Expedition';
    const destinationName = dto.destinationName || tour?.destinationName || event?.location || 'Ethiopia';
    const adults = dto.numberOfAdults ?? numberOfTravelers;
    const children = dto.numberOfChildren ?? 0;
    const totalPrice = dto.totalPrice ?? (pricePerPerson * numberOfTravelers);
    const assignedGuideName = dto.assignedGuideName ?? null;
    const isCashPayment = dto.paymentMethod === 'cash';
    const status = isCashPayment ? 'pending' : ((dto.status as any) || 'confirmed');
    const paymentStatus = isCashPayment ? 'unpaid' : ((dto.paymentStatus as any) || (dto.paymentReceiptUrl || dto.transactionReference ? 'paid' : 'paid'));

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
      paymentStatus,
      refundStatus: 'none',
      paymentMethod: dto.paymentMethod || 'telebirr',
      paymentReceiptUrl: dto.paymentReceiptUrl || null,
      transactionReference: dto.transactionReference || null,
      assignedGuideName,
      userId: userId ?? null,
    });

    const saved = (await this.repo.save(booking)) as Booking;
    this.logger.log(`Booking created: ${saved.bookingReference} (id=${saved.id}, status=${saved.status}, paymentStatus=${saved.paymentStatus})`);
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
    if (status === 'paid') {
      booking.paymentStatus = 'paid';
      booking.status = 'confirmed';
    } else if (status === 'cancelled' && booking.paymentStatus === 'paid') {
      booking.refundStatus = 'pending';
    }
    return this.repo.save(booking);
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const booking = await this.findOne(id);
    booking.paymentStatus = paymentStatus as any;
    if (paymentStatus === 'paid' && booking.status === 'pending') {
      booking.status = 'confirmed';
    } else if (paymentStatus === 'refunded') {
      booking.refundStatus = 'processed';
    }
    return this.repo.save(booking);
  }

  async assignGuide(id: string, assignedGuideName: string, assignedGuideId?: string) {
    const booking = await this.findOne(id);
    booking.assignedGuideName = assignedGuideName;
    if (assignedGuideId) booking.assignedGuideId = assignedGuideId;
    return this.repo.save(booking);
  }
}

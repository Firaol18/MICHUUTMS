import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/review.dto';

@Injectable()
export class ReviewsService implements OnModuleInit {
  constructor(
    @InjectRepository(Review)
    private readonly repo: Repository<Review>,
  ) {}

  /** Seed 4 starter reviews on first boot if table is empty */
  async onModuleInit() {
    const count = await this.repo.count();
    if (count === 0) {
      await this.repo.save([
        {
          tourId: null,
          tourTitle: 'Wenchi Crater Lake & Thermal Springs Expedition',
          bookingRef: 'MCH-BKG-8819',
          authorName: 'Eleanor Vance',
          authorEmail: 'eleanor.vance@example.com',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
          overallRating: 5, guideRating: 5, guideName: 'Abebe Bekele',
          transportRating: 4, accommodationRating: 5,
          comment: 'An absolutely magical experience! The crater lake boat ride and thermal hot springs were unforgettable. Ranger Abebe was super knowledgeable!',
          isVerifiedBooking: true,
        },
        {
          tourId: null,
          tourTitle: 'Wenchi Crater Lake & Thermal Springs Expedition',
          bookingRef: 'MCH-BKG-4412',
          authorName: 'Sophia Rossi',
          authorEmail: 'sophia.r@example.com',
          overallRating: 5, guideRating: 5, guideName: 'Abebe Bekele',
          transportRating: 5, accommodationRating: 4,
          comment: 'The lush greenery and volcanic lake view were breathtaking. 4x4 Cruiser transport was comfortable on mountain roads. Highly recommend!',
          isVerifiedBooking: true,
        },
        {
          tourId: null,
          tourTitle: 'Danakil Depression & Erta Ale Volcano Expedition',
          bookingRef: 'MCH-BKG-7721',
          authorName: 'Mohammed Ahmed',
          authorEmail: 'm.ahmed@example.com',
          overallRating: 5, guideRating: 5, guideName: 'Mohammed Ahmed',
          transportRating: 5, accommodationRating: 4,
          comment: 'Standing on the rim of Erta Ale lava lake at midnight is something I will tell my grandkids about. Outstanding desert logistics by MICHUU!',
          isVerifiedBooking: true,
        },
        {
          tourId: null,
          tourTitle: 'Lalibela Monolithic Rock Churches Pilgrimage',
          bookingRef: 'MCH-BKG-3301',
          authorName: 'James Okonkwo',
          authorEmail: 'j.okonkwo@example.ng',
          overallRating: 5, guideRating: 5, guideName: 'Tigist Haile',
          transportRating: 4, accommodationRating: 5,
          comment: 'The architectural genius of Biete Ghiorgis is astounding. Tigist gave us deep historical and spiritual insights throughout our stay.',
          isVerifiedBooking: true,
        },
      ]);
    }
  }

  async findAll(tourId?: string): Promise<Review[]> {
    const qb = this.repo.createQueryBuilder('r').orderBy('r.createdAt', 'DESC');
    if (tourId) qb.where('r.tourId = :tourId', { tourId });
    return qb.getMany();
  }

  async create(dto: CreateReviewDto): Promise<Review> {
    const review = this.repo.create({
      ...dto,
      tourId: dto.tourId ?? null,
      bookingRef: dto.bookingRef ?? null,
      guideName: dto.guideName ?? null,
      avatarUrl: dto.avatarUrl ?? null,
      isVerifiedBooking: dto.isVerifiedBooking ?? false,
    });
    return this.repo.save(review);
  }

  async remove(id: string): Promise<void> {
    const review = await this.repo.findOneBy({ id });
    if (!review) throw new NotFoundException(`Review #${id} not found`);
    await this.repo.remove(review);
  }

  async getAverageRatingsForTour(tourId: string) {
    const reviews = await this.repo.find({ where: { tourId } });
    if (reviews.length === 0) return { overall: 5.0, guide: 5.0, transport: 4.8, accommodation: 4.7, totalCount: 0 };
    const avg = (key: keyof Review) =>
      Number((reviews.reduce((s, r) => s + (Number(r[key]) || 0), 0) / reviews.length).toFixed(1));
    return {
      overall: avg('overallRating'),
      guide: avg('guideRating'),
      transport: avg('transportRating'),
      accommodation: avg('accommodationRating'),
      totalCount: reviews.length,
    };
  }
}

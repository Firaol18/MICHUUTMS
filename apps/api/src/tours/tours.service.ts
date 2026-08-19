import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Tour, TourCategory, DifficultyLevel, TourStatus } from './entities/tour.entity';
import { CreateTourDto, QueryToursDto } from './dto/tour.dto';

@Injectable()
export class ToursService {
  constructor(@InjectRepository(Tour) private repo: Repository<Tour>) {}

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
      skip,
      take: limit,
      order: { isFeatured: 'DESC', createdAt: 'DESC' },
    });

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number) {
    const tour = await this.repo.findOneBy({ id });
    if (!tour) throw new NotFoundException(`Tour #${id} not found`);
    return tour;
  }

  async findBySlug(slug: string) {
    const tour = await this.repo.findOne({ where: [{ slug }, { id: Number(slug) || -1 }] });
    if (!tour) throw new NotFoundException(`Tour "${slug}" not found`);
    return tour;
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

  async update(id: number, dto: Partial<CreateTourDto>) {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.category) updateData.category = dto.category as TourCategory;
    if (dto.difficulty) updateData.difficulty = dto.difficulty as DifficultyLevel;
    if (dto.status) updateData.status = dto.status as TourStatus;
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: number) {
    const tour = await this.findOne(id);
    return this.repo.remove(tour);
  }
}

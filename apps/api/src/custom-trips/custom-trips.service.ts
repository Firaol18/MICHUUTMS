import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomTrip } from './entities/custom-trip.entity';
import { CreateCustomTripDto } from '../common/dto/shared.dto';

@Injectable()
export class CustomTripsService {
  constructor(
    @InjectRepository(CustomTrip)
    private readonly repo: Repository<CustomTrip>,
  ) {}

  async create(dto: CreateCustomTripDto, userId?: number) {
    const trip = this.repo.create({
      ...dto,
      phone: dto.phone || '',
      budget: dto.budget || 'mid-range',
      interests: dto.interests || [],
      status: 'pending',
      userId: userId ? Number(userId) : dto.userId ? Number(dto.userId) : undefined,
    });
    return this.repo.save(trip);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByUser(userId: number) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: number) {
    const trip = await this.repo.findOneBy({ id });
    if (!trip) throw new NotFoundException(`Custom trip request #${id} not found`);
    return trip;
  }

  async updateStatus(id: number, status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'cancelled') {
    const trip = await this.findOne(id);
    trip.status = status;
    return this.repo.save(trip);
  }
}

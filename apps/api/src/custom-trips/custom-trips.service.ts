import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomTrip } from './entities/custom-trip.entity';
import { CustomDestination } from './entities/custom-destination.entity';
import { CustomPricingConfig } from './entities/custom-pricing-config.entity';
import { CreateCustomTripDto } from '../common/dto/shared.dto';

const INITIAL_DESTINATIONS = [
  { name: 'Wenchi Crater Lake', region: 'Oromia', pricePerDay: 150, image: 'https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?w=800', description: 'Emerald caldera lake with thermal hot springs and boat tours', isActive: true },
  { name: 'Lalibela Rock Churches', region: 'Amhara', pricePerDay: 180, image: 'https://images.unsplash.com/photo-1609137144813-7d9921338f24?w=800', description: '12th-century UNESCO subterranean monolithic rock-hewn cathedrals', isActive: true },
  { name: 'Simien Mountains Trekking', region: 'Amhara', pricePerDay: 160, image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', description: 'Jagged highland escarpments and endemic Gelada baboon safaris', isActive: true },
  { name: 'Danakil & Erta Ale Volcano', region: 'Afar', pricePerDay: 220, image: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=800', description: 'Active lava lake, neon hydrothermal sulfur pools, and salt pans', isActive: true },
  { name: 'Bale Mountains Safari', region: 'Oromia', pricePerDay: 140, image: 'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=800', description: 'Afro-alpine habitat of the endangered Ethiopian Red Wolf and Harenna cloud forest', isActive: true },
  { name: 'Harar Jugol City', region: 'Harari', pricePerDay: 130, image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', description: 'Historic 16th-century walled Islamic city and nocturnal wild hyena feeding', isActive: true },
];

@Injectable()
export class CustomTripsService {
  constructor(
    @InjectRepository(CustomTrip)
    private readonly repo: Repository<CustomTrip>,
    @InjectRepository(CustomDestination)
    private readonly destRepo: Repository<CustomDestination>,
    @InjectRepository(CustomPricingConfig)
    private readonly configRepo: Repository<CustomPricingConfig>,
  ) {}

  async create(dto: CreateCustomTripDto, userId?: string) {
    const trip = this.repo.create({
      ...dto,
      phone: dto.phone || '',
      budget: dto.budget || 'mid-range',
      interests: dto.interests || [],
      status: 'pending',
      userId: userId || dto.userId || undefined,
    });
    return this.repo.save(trip);
  }

  async findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findByUser(userId: string) {
    return this.repo.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const trip = await this.repo.findOneBy({ id });
    if (!trip) throw new NotFoundException(`Custom trip request #${id} not found`);
    return trip;
  }

  async updateStatus(id: string, status: 'pending' | 'reviewing' | 'quoted' | 'confirmed' | 'cancelled') {
    const trip = await this.findOne(id);
    trip.status = status;
    return this.repo.save(trip);
  }

  async remove(id: string) {
    const trip = await this.findOne(id);
    return this.repo.remove(trip);
  }

  // ── Custom Destinations ───────────────────────────────────────────────────

  async getDestinations() {
    const count = await this.destRepo.count();
    if (count === 0) {
      for (const dest of INITIAL_DESTINATIONS) {
        await this.destRepo.save(this.destRepo.create(dest));
      }
    }
    return this.destRepo.find({ order: { createdAt: 'ASC' } });
  }

  async createDestination(data: Partial<CustomDestination>) {
    const item = this.destRepo.create(data);
    return this.destRepo.save(item);
  }

  async updateDestination(id: string, data: Partial<CustomDestination>) {
    const item = await this.destRepo.findOneBy({ id });
    if (!item) throw new NotFoundException(`Destination #${id} not found`);
    Object.assign(item, data);
    return this.destRepo.save(item);
  }

  async deleteDestination(id: string) {
    const item = await this.destRepo.findOneBy({ id });
    if (item) await this.destRepo.remove(item);
    return true;
  }

  // ── Pricing Configuration ─────────────────────────────────────────────────

  async getPricingConfig() {
    const config = await this.configRepo.findOne({ where: {} });
    if (config) return config;

    // Create default config
    const def = this.configRepo.create({
      luxuryMultiplier: 1.4,
      standardMultiplier: 1.0,
      budgetMultiplier: 0.8,
      landcruiserPerDay: 120,
      flightFixedRate: 250,
      busFixedRate: 50,
    });
    return this.configRepo.save(def);
  }

  async updatePricingConfig(data: Partial<CustomPricingConfig>) {
    const config = await this.getPricingConfig();
    Object.assign(config, data);
    return this.configRepo.save(config);
  }
}

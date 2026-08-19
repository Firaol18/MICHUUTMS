import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vehicle } from './entities/vehicle.entity';

@Injectable()
export class VehiclesService {
  constructor(@InjectRepository(Vehicle) private repo: Repository<Vehicle>) {}

  async findAll() {
    return this.repo.find({ order: { vehicleName: 'ASC' } });
  }

  async findOne(id: number) {
    const vehicle = await this.repo.findOneBy({ id });
    if (!vehicle) throw new NotFoundException(`Vehicle #${id} not found`);
    return vehicle;
  }

  async create(data: Partial<Vehicle>) {
    const vehicle = this.repo.create(data);
    return this.repo.save(vehicle);
  }

  async update(id: number, data: Partial<Vehicle>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const vehicle = await this.findOne(id);
    return this.repo.remove(vehicle);
  }
}

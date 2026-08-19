import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Driver } from './entities/driver.entity';

@Injectable()
export class DriversService {
  constructor(@InjectRepository(Driver) private repo: Repository<Driver>) {}

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: number) {
    const driver = await this.repo.findOneBy({ id });
    if (!driver) throw new NotFoundException(`Driver #${id} not found`);
    return driver;
  }

  async create(data: Partial<Driver>) {
    const driver = this.repo.create(data);
    return this.repo.save(driver);
  }

  async update(id: number, data: Partial<Driver>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const driver = await this.findOne(id);
    return this.repo.remove(driver);
  }
}

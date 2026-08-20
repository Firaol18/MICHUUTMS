import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Guide } from './entities/guide.entity';

@Injectable()
export class GuidesService {
  constructor(@InjectRepository(Guide) private repo: Repository<Guide>) {}

  async findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const guide = await this.repo.findOneBy({ id });
    if (!guide) throw new NotFoundException(`Guide #${id} not found`);
    return guide;
  }

  async create(data: Partial<Guide>) {
    const guide = this.repo.create(data);
    return this.repo.save(guide);
  }

  async update(id: string, data: Partial<Guide>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string) {
    const guide = await this.findOne(id);
    return this.repo.remove(guide);
  }
}

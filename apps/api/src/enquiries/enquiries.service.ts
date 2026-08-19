import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enquiry } from './entities/enquiry.entity';
import { CreateEnquiryDto } from '../common/dto/shared.dto';

@Injectable()
export class EnquiriesService {
  constructor(
    @InjectRepository(Enquiry)
    private readonly repo: Repository<Enquiry>,
  ) {}

  async create(dto: CreateEnquiryDto) {
    const enquiry = this.repo.create({
      ...dto,
      mobile: dto.mobile || '',
      status: 'unread',
    });
    return this.repo.save(enquiry);
  }

  async findAll() {
    return this.repo.find({ order: { date: 'DESC' } });
  }

  async updateStatus(id: number, status: 'unread' | 'read' | 'replied') {
    const enq = await this.repo.findOneBy({ id });
    if (!enq) throw new NotFoundException(`Enquiry #${id} not found`);
    enq.status = status;
    return this.repo.save(enq);
  }

  async remove(id: number) {
    const enq = await this.repo.findOneBy({ id });
    if (!enq) throw new NotFoundException(`Enquiry #${id} not found`);
    return this.repo.remove(enq);
  }
}


import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  constructor(@InjectRepository(Payment) private repo: Repository<Payment>) {}

  async findAll() {
    return this.repo.find({ order: { paymentDate: 'DESC' } });
  }

  async findOne(id: string) {
    const payment = await this.repo.findOneBy({ id });
    if (!payment) throw new NotFoundException(`Payment #${id} not found`);
    return payment;
  }

  async create(data: Partial<Payment>) {
    const payment = this.repo.create({
      ...data,
      transactionRef: data.transactionRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    });
    return this.repo.save(payment);
  }

  async update(id: string, data: Partial<Payment>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }
}

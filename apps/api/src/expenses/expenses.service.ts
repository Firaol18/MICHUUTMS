import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(@InjectRepository(Expense) private repo: Repository<Expense>) {}

  private generateExpenseNumber(): string {
    return `EXP-${Math.floor(1000 + Math.random() * 9000)}`;
  }

  async findAll() {
    return this.repo.find({ order: { expenseDate: 'DESC' } });
  }

  async findOne(id: number) {
    const expense = await this.repo.findOneBy({ id });
    if (!expense) throw new NotFoundException(`Expense #${id} not found`);
    return expense;
  }

  async create(data: Partial<Expense>) {
    const expense = this.repo.create({
      ...data,
      expenseNumber: this.generateExpenseNumber(),
    });
    return this.repo.save(expense);
  }

  async update(id: number, data: Partial<Expense>) {
    await this.findOne(id);
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: number) {
    const expense = await this.findOne(id);
    return this.repo.remove(expense);
  }
}

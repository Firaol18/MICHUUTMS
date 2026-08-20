import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Issue } from './entities/issue.entity';
import { CreateIssueDto } from '../common/dto/shared.dto';

@Injectable()
export class IssuesService {
  constructor(
    @InjectRepository(Issue)
    private readonly repo: Repository<Issue>,
  ) {}

  private generateTicketId(): string {
    return `ISS-${Math.floor(800 + Math.random() * 200)}`;
  }

  async create(dto: CreateIssueDto, userId?: string) {
    const issue = this.repo.create({
      ...dto,
      ticketId: this.generateTicketId(),
      status: 'open',
      userId: userId || dto.userId || undefined,
    });
    return this.repo.save(issue);
  }

  async findAll() {
    return this.repo.find({ order: { dateReported: 'DESC' } });
  }

  async findByEmailOrUser(email?: string, userId?: string) {
    const where: any[] = [];
    if (email) where.push({ email });
    if (userId) where.push({ userId });
    return this.repo.find({
      where: where.length ? where : {},
      order: { dateReported: 'DESC' },
    });
  }

  async findOne(id: string) {
    const issue = await this.repo.findOneBy({ id });
    if (!issue) throw new NotFoundException(`Issue #${id} not found`);
    return issue;
  }

  async updateStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'rejected',
    adminReason?: string,
    resolvedBy?: string,
  ) {
    const issue = await this.findOne(id);
    issue.status = status;
    if (adminReason !== undefined) issue.adminReason = adminReason;
    if (status === 'resolved' || status === 'rejected') {
      issue.resolvedAt = new Date();
      issue.resolvedBy = resolvedBy || 'Admin';
    }
    return this.repo.save(issue);
  }
}

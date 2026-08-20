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

  async findAll(filters?: { status?: string; category?: string; issueType?: string; branch?: string; search?: string }) {
    try {
      const qb = this.repo.createQueryBuilder('issue');

      if (filters?.status && filters.status !== 'all' && filters.status !== 'All Status') {
        qb.andWhere('issue.status = :status', { status: filters.status.toLowerCase() });
      }

      const cat = filters?.category || filters?.issueType;
      if (cat && cat !== 'all' && cat !== 'All Category') {
        qb.andWhere('issue.issueType ILIKE :cat', { cat: `%${cat}%` });
      }

      if (filters?.search && filters.search.trim()) {
        const s = `%${filters.search.trim()}%`;
        qb.andWhere(
          '(issue.ticketId ILIKE :s OR issue.reportedBy ILIKE :s OR issue.email ILIKE :s OR issue.description ILIKE :s OR issue.issueType ILIKE :s)',
          { s },
        );
      }

      qb.orderBy('issue.dateReported', 'DESC');
      return await qb.getMany();
    } catch (err) {
      // Fallback to find with in-memory filter if query builder hits dialect discrepancies
      const all = await this.repo.find({ order: { dateReported: 'DESC' } });
      return all.filter((item) => {
        if (filters?.status && filters.status !== 'all' && filters.status !== 'All Status') {
          if (item.status?.toLowerCase() !== filters.status.toLowerCase()) return false;
        }
        const cat = filters?.category || filters?.issueType;
        if (cat && cat !== 'all' && cat !== 'All Category') {
          if (!item.issueType?.toLowerCase().includes(cat.toLowerCase())) return false;
        }
        if (filters?.search && filters.search.trim()) {
          const s = filters.search.trim().toLowerCase();
          const matches =
            item.ticketId?.toLowerCase().includes(s) ||
            item.reportedBy?.toLowerCase().includes(s) ||
            item.email?.toLowerCase().includes(s) ||
            item.description?.toLowerCase().includes(s) ||
            item.issueType?.toLowerCase().includes(s);
          if (!matches) return false;
        }
        return true;
      });
    }
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

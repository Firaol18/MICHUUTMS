import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { CreateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
  ) {}

  async findByUser(userEmail: string): Promise<Notification[]> {
    return this.repo.find({
      where: { userEmail },
      order: { timestamp: 'DESC' },
    });
  }

  async findByRole(targetRole: 'customer' | 'admin' | 'all'): Promise<Notification[]> {
    return this.repo.find({
      where: { targetRole },
      order: { timestamp: 'DESC' },
    });
  }

  async create(dto: CreateNotificationDto): Promise<Notification> {
    const notif = this.repo.create({
      ...dto,
      type: dto.type as any,
      targetRole: dto.targetRole ?? 'all',
      link: dto.link ?? null,
      bookingRef: dto.bookingRef ?? null,
      isRead: false,
    });
    return this.repo.save(notif);
  }

  async markRead(id: string): Promise<Notification | null> {
    await this.repo.update(id, { isRead: true });
    return this.repo.findOneBy({ id });
  }

  async markAllReadForUser(userEmail: string): Promise<void> {
    await this.repo
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true })
      .where('userEmail = :userEmail', { userEmail })
      .execute();
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}

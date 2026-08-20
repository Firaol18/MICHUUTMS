import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messagesRepo: Repository<Message>,
  ) {}

  async createMessage(dto: CreateMessageDto): Promise<Message> {
    const msg = this.messagesRepo.create(dto);
    return await this.messagesRepo.save(msg);
  }

  async getMessagesForUser(userId: string): Promise<Message[]> {
    return this.messagesRepo.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      order: { createdAt: 'DESC' },
    });
  }

  async updateMessage(id: string, dto: UpdateMessageDto): Promise<Message> {
    const msg = await this.messagesRepo.findOneBy({ id });
    if (!msg) throw new NotFoundException('Message not found');
    Object.assign(msg, dto);
    return this.messagesRepo.save(msg);
  }

  async deleteMessage(id: string): Promise<void> {
    const msg = await this.messagesRepo.findOneBy({ id });
    if (!msg) throw new NotFoundException('Message not found');
    await this.messagesRepo.remove(msg);
  }
}

import { Injectable, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Booking } from '../bookings/entities/booking.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
    @InjectRepository(Booking)
    private readonly bookingsRepo: Repository<Booking>,
  ) {}

  getUsers() {
    return this.usersRepo.find({ relations: ['role'] });
  }

  async getUsersPaginated(
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    let where: any = {};

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (search) {
      where = [
        { ...where, name: ILike(`%${search}%`) },
        { ...where, email: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.usersRepo.findAndCount({
      where,
      skip,
      take: limit,
      relations: ['role'],
      order: { createdAt: 'ASC' },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    if (!id || typeof id !== 'string') {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      throw new NotFoundException(`Invalid user ID format: ${id}`);
    }
    try {
      const user = await this.usersRepo.findOne({
        where: { id },
        relations: ['role'],
      });
      if (!user) throw new NotFoundException(`User with id ${id} not found`);
      return user;
    } catch {
      throw new NotFoundException(`User with id ${id} not found`);
    }
  }

  async getUserByEmail(email: string) {
    const cleanEmail = email.trim();
    return this.usersRepo.findOne({
      where: [{ email: cleanEmail }, { email: ILike(cleanEmail) }],
      relations: ['role'],
      select: [
        'id', 'name', 'email', 'password', 'isActive', 'roleId',
        'phone', 'nationality', 'avatarUrl', 'ecName', 'ecRelationship', 'ecPhone', 'ecEmail',
        'passportType', 'passportNumber', 'passportCountry', 'passportExpiry',
        'dietaryNeeds', 'languages', 'accessibility', 'preferredCurrency', 'accommodation', 'tourTypes',
        'createdAt', 'updatedAt'
      ],
    });
  }

  async getProfileWithStats(userId: string) {
    const user = await this.getUserById(userId);

    // Count real user bookings from database
    const completedBookingsCount = await this.bookingsRepo
      .createQueryBuilder('booking')
      .where('booking.userId = :userId', { userId: user.id })
      .orWhere("booking.traveler ->> 'email' = :email", { email: user.email })
      .getCount();

    return {
      ...user,
      completedTripsCount: completedBookingsCount,
    };
  }

  async createUser(user: Partial<User>) {
    const userToCreate = { ...user };
    if (userToCreate.password) {
      userToCreate.password = await bcrypt.hash(userToCreate.password, 10);
    }
    const entity = this.usersRepo.create(userToCreate);
    return this.usersRepo.save(entity);
  }

  async updateUser(id: string, updates: Partial<User> & Record<string, any>) {
    const user = await this.getUserById(id);
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }

    const allowedKeys = [
      'name', 'email', 'password', 'phone', 'nationality', 'avatarUrl',
      'ecName', 'ecRelationship', 'ecPhone', 'ecEmail',
      'passportType', 'passportNumber', 'passportCountry', 'passportExpiry',
      'dietaryNeeds', 'languages', 'accessibility', 'preferredCurrency',
      'accommodation', 'tourTypes', 'isActive', 'roleId'
    ];

    const cleanUpdates: Record<string, any> = {};
    for (const key of allowedKeys) {
      if (updates[key] !== undefined) {
        cleanUpdates[key] = updates[key];
      }
    }

    if (cleanUpdates.password) {
      cleanUpdates.password = await bcrypt.hash(cleanUpdates.password, 10);
    }

    if (Object.keys(cleanUpdates).length > 0) {
      await this.usersRepo.update(id, cleanUpdates);
    }

    return this.getUserById(id);
  }

  async changePassword(userId: string, currentPass: string, newPass: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(currentPass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Current password does not match');
    }

    const hashedPassword = await bcrypt.hash(newPass, 10);
    await this.usersRepo.update(userId, { password: hashedPassword });

    return { success: true, message: 'Password updated successfully' };
  }

  async deleteUser(id: string) {
    const user = await this.getUserById(id);
    return this.usersRepo.remove(user);
  }
}

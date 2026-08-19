import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  getUsers() {
    return this.usersRepo.find();
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
      // search by name OR email with case-insensitive partial match
      where = [
        { ...where, name: ILike(`%${search}%`) },
        { ...where, email: ILike(`%${search}%`) },
      ];
    }

    const [data, total] = await this.usersRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { id: 'ASC' },
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

  async getUserById(id: number) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException(`User with id ${id} not found`);
    return user;
  }

  async getUserByEmail(email: string) {
    return this.usersRepo.findOne({
      where: { email },
      select: ['id', 'name', 'email', 'password', 'isActive', 'createdAt', 'updatedAt'],
    });
  }

  async createUser(user: Partial<User>) {
    const userToCreate = { ...user };
    if (userToCreate.password) {
      userToCreate.password = await bcrypt.hash(userToCreate.password, 10);
    }
    const entity = this.usersRepo.create(userToCreate);
    return this.usersRepo.save(entity);
  }

  async updateUser(id: number, updates: Partial<User>) {
    const userUpdates = { ...updates };
    if (userUpdates.password) {
      userUpdates.password = await bcrypt.hash(userUpdates.password, 10);
    }
    return this.usersRepo.save({ id, ...userUpdates });
  }

  async deleteUser(id: number) {
    const user = await this.getUserById(id);
    return this.usersRepo.remove(user);
  }
}

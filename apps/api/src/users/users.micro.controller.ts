import {
  Controller,
  Logger,
} from '@nestjs/common';
import {
  MessagePattern,
  Payload,
  RpcException,
} from '@nestjs/microservices';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller()
export class UsersMicroController {
  private readonly logger = new Logger(UsersMicroController.name);

  constructor(private readonly usersService: UsersService) {}

  // get all users
  @MessagePattern('get_users')
  async getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  // get single user
  @MessagePattern('get_user')
  async getUserById(
    @Payload() id: number,
  ): Promise<User> {
    if (typeof id !== 'number') {
      throw new RpcException('Invalid user id');
    }
    return this.usersService.getUserById(id);
  }

  // create user
  @MessagePattern('create_user')
  createUser(
    @Payload() dto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(dto);
  }

  // update user
  @MessagePattern('update_user')
  updateUser(
    @Payload()
    payload: { id: number; data: UpdateUserDto },
  ): Promise<User> {
    const { id, data } = payload;

    if (typeof id !== 'number') {
      throw new RpcException('Invalid user id');
    }

    return this.usersService.updateUser(id, data);
  }

  // delete user
  @MessagePattern('delete_user')
  deleteUser(
    @Payload() id: number,
  ): Promise<User> {
    if (typeof id !== 'number') {
      throw new RpcException('Invalid user id');
    }
    return this.usersService.deleteUser(id);
  }
}

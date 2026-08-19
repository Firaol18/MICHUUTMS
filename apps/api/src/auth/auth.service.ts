import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: CreateUserDto) {
    const existing = await this.usersService.getUserByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('User with this email already exists');
    }

    const user = await this.usersService.createUser(dto);
    
    // Remove password from returned user object
    const { password, ...userWithoutPassword } = user;

    const payload = { sub: user.id, email: user.email };
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.getUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const { password, ...userWithoutPassword } = user;
    const payload = { sub: user.id, email: user.email };
    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload),
    };
  }

  async logout() {
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }
}


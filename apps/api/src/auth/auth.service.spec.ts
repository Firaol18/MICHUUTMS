import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

describe('AuthService', () => {
  let service: AuthService;
  let usersServiceMock: any;
  let jwtServiceMock: any;

  beforeEach(async () => {
    usersServiceMock = {
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('should register a new user and return user + token', async () => {
      usersServiceMock.getUserByEmail.mockResolvedValue(null);
      const mockUser = { id: 1, email: 'test@example.com', password: 'hashedpassword' };
      usersServiceMock.createUser.mockResolvedValue(mockUser);

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const result = await service.register(dto);

      expect(usersServiceMock.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(usersServiceMock.createUser).toHaveBeenCalledWith(dto);
      expect(jwtServiceMock.sign).toHaveBeenCalled();
      expect(result).toEqual({
        user: { id: 1, email: 'test@example.com' },
        access_token: 'mock-jwt-token',
      });
    });

    it('should throw BadRequestException if email is already registered', async () => {
      usersServiceMock.getUserByEmail.mockResolvedValue({ id: 1, email: 'test@example.com' });

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      await expect(service.register(dto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('login', () => {
    it('should login and return user + token on correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { id: 1, email: 'test@example.com', password: hashedPassword };
      usersServiceMock.getUserByEmail.mockResolvedValue(mockUser);

      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await service.login(dto);

      expect(result).toEqual({
        user: { id: 1, email: 'test@example.com' },
        access_token: 'mock-jwt-token',
      });
    });

    it('should throw UnauthorizedException if user not found', async () => {
      usersServiceMock.getUserByEmail.mockResolvedValue(null);

      const dto = { email: 'test@example.com', password: 'password123' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const mockUser = { id: 1, email: 'test@example.com', password: hashedPassword };
      usersServiceMock.getUserByEmail.mockResolvedValue(mockUser);

      const dto = { email: 'test@example.com', password: 'wrongpassword' };
      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });
});

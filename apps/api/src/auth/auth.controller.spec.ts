import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authServiceMock: any;

  beforeEach(async () => {
    authServiceMock = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register and return the result', async () => {
      const mockResult = { user: { id: 1, email: 'test@example.com' }, access_token: 'token' };
      authServiceMock.register.mockResolvedValue(mockResult);

      const dto = { name: 'Test User', email: 'test@example.com', password: 'password123' };
      const result = await controller.register(dto);

      expect(authServiceMock.register).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });

  describe('login', () => {
    it('should call authService.login and return the result', async () => {
      const mockResult = { user: { id: 1, email: 'test@example.com' }, access_token: 'token' };
      authServiceMock.login.mockResolvedValue(mockResult);

      const dto = { email: 'test@example.com', password: 'password123' };
      const result = await controller.login(dto);

      expect(authServiceMock.login).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockResult);
    });
  });
});
